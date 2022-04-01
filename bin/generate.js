const chalk = require('chalk');
const {
        env
} = require('process');
const {
        parseSync,
        transformSync
} = require("@babel/core");
const os = require('os');
const fs = require('fs');
const inquirer = require('inquirer');
const spinner = require('ora')();

const FileService = require('../utils/files')
const insertPlugin = require('../plugins/babel-insert-script')
const getComponentPlugin = require('../plugins/babel-get-component')

/**
 * 1. 查询组件配置
 * 2. 生成模板
 * 3. 生成js
 * @param {*} component 组件名
 */
module.exports = async (component) => {
        spinner.start('读取配置文件');
        // read config
        const configPath = require(env.CONFIG_FILE_PATH);
        if (!FileService.ensureFile(configPath)) {
                spinner.fail(`文件${configPath}不存在。`);
                return;
        }
        const configAll = JSON.parse(fs.readFileSync(configPath).toString());
        const config = configAll[component];
        if (config == null) {
                spinner.fail(`组件 ${component} 的配置不存在。`);
                return;
        }

        spinner.stop();

        // File check: Confirm which file to work with.
        const filesList = FileService.collectFiles('*');
        const targetFile = await getParseConfig(filesList);

        const template = new Template(config.template, targetFile.template);
        const script = new Script(config.script, targetFile.script, FileService.getFileType(targetFile.script));

        // template-check
        if (template.check() === false) {
                spinner.fail(`${component}组件template配置错误：缺少"tag"或者不是字符串。`);
                return;
        }

        // Generation confirm: Confirm which code to insert
        if (template.config) {
                template.optionalList = await confirmOptionalList(template.config.attrs, 'template');
        }
        script.optionalList = await confirmOptionalList(script.config, 'script');

        const separate = !(script.type in ['jsx', 'tsx', 'vue']);
        console.log();

        // Component confirm: Confirm which component to work with for React/Vue.
        if (!separate) {
                const code = fs.readFileSync(script.path);
                script.func = (await getComponentsForReact(code)).func
        }

        console.log();

        // Parse and Transform and Generate.
        // Require parseHtml first in case working with React/Vue.
        template.parse();

        // In Angular, template and script are in different files.
        // But in react/vue, they are in the same file, so you can 
        // insert both of them in one parsing action.
        script.parse(template.result);

        // generate
        script.generate();
        if (separate) {
                template.generate();
        }
        spinner.succeed('组件已更新!');
        return;
}

class GenerateObject {
        config = {};
        path = '';
        optionalList = [];
        result = '';
}
class Template extends GenerateObject {
        constructor(config, path) {
                super();
                this.config = config;
                this.path = path;
        }

        check() {
                return this.config == null || (this.config.tag && typeof (this.config.tag) === 'string');
        }

        parse() {
                const attrs = this.optionalList;
                if (this.config) {
                        let parseHtml = attrs.reduce((pre, next) => {
                                return pre + addAttr(next['data'], next['binding'])
                        }, `<${this.config.tag}`);
                        parseHtml += `></${this.config.tag}>`;
                        this.result = parseHtml;
                }
        }

        generate() {
                if (this.result && checkPath(this.path)) {
                        fs.appendFileSync(this.path, os.EOL + this.result);
                }
        }
}

class Script extends GenerateObject {
        type = '';
        func = '';

        constructor(config, path, type) {
                super();
                this.config = config;
                this.path = path;
                this.type = type;
        }

        parse(parseHtml) {
                if (!checkPath(this.path) || this.config == null) return;
                const sourceCode = fs.readFileSync(this.path);
                const {
                        code
                } = transformSync(sourceCode, {
                        parserOpts: {
                                plugins: [
                                        ['decorators', {
                                                decoratorsBeforeExport: true
                                        }],
                                        ['typescript'],
                                        ['jsx']
                                ]
                        },
                        plugins: [
                                insertPlugin({
                                        type: this.type,
                                        func: this.func,
                                        optionalList: this.optionalList
                                }, parseHtml)
                        ],
                        generatorOpts: {
                                decoratorsBeforeExport: true
                        },
                        sourceType: 'unambiguous'
                });
                this.result = code;
        }

        generate() {
                if (this.result && checkPath(this.path)) {
                        fs.writeFileSync(this.path, this.result);
                }
        }
}

function getParseConfig(fileListMap) {
        questions = [{
                type: "list",
                message: `template代码添加到：`,
                name: 'template',
                choices: Array.from(fileListMap.keys()).concat('None')
        }, {
                type: "list",
                message: `script代码添加到：`,
                name: 'script',
                choices: Array.from(fileListMap.keys()).concat('None')
        }];
        return inquirer.prompt(questions).then(answers => {
                return answers;
        })
}

function confirmGenerateConfig(attrs) {
        const questions = [];
        attrs.map((attr, index) => {
                questions.push({
                        type: "confirm",
                        message: `是否添加 ${attr.data} ？（${attr.description || 'No description.'}）`,
                        name: index.toString(),
                        default: true
                });
        });
        return inquirer.prompt(questions).then(indexList => {
                return Object.values(indexList);
        })
}

function addAttr(data, binding) {
        return ` ${data}='${binding}'`
}

function getComponentsForReact(sourceCode) {
        const componentList = [];
        transformSync(sourceCode, {
                parserOpts: {
                        plugins: [
                                ['typescript'],
                                ['jsx']
                        ]
                },
                plugins: [
                        getComponentPlugin(componentList)
                ],
                sourceType: 'unambiguous'
        });
        if (componentList.length > 1) {
                const questions = {
                        type: "list",
                        message: '添加到哪个组件中？',
                        name: 'func',
                        choices: []
                };
                componentList.map((func, index) => {
                        questions.choices.push(func);
                });
                return inquirer.prompt([questions]).then(func => {
                        return func;
                })
        } else {
                return Promise.resolve({
                        func: componentList[0]
                })
        }
}

async function confirmOptionalList(attrs, type) {
        let optionalList = [];
        if (attrs && attrs.default && Array.isArray(attrs.default)) {
                optionalList.push(...attrs.default);
        }
        if (attrs && attrs.optional && Array.isArray(attrs.optional)) {
                chalk.green(console.log(`配置${type}可选项：`));
                const indexList = await confirmGenerateConfig(attrs.optional);
                optionalList.push(...attrs.optional.filter((_, i) => indexList[i]));
        }
        return optionalList;
}

function checkPath(path) {
        return path && path !== 'None';
}