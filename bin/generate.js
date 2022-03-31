const chalk = require('chalk');
const {
        env
} = require('process');
const {
        parseSync,
        transformSync
} = require("@babel/core");
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

        // template-check
        const template = config.template;
        if (template.tag == null || template === '') {
                spinner.fail(`${component}组件template配置错误：缺少"tag"。`);
                return;
        }

        // script-check
        const script = config.script;
        if (script && !Array.isArray(script)) {
                spinner.fail(`${component}组件script配置错误：请传入script list。`);
                return;
        }

        spinner.stop();

        // config
        const filesList = FileService.collectFiles('*');
        const answer = await getParseConfig(filesList);

        const parseConfig = {
                template: filesList.get(answer.template),
                script: {
                        path: filesList.get(answer.script),
                        type: FileService.getFileType(answer.script),
                        data: config.script
                }
        }
        const separate = !parseConfig.script.type in ['jsx', 'tsx', 'vue'];

        console.log();

        // Case react: Choose component function or class
        if (!separate) {
                const code = fs.readFileSync(parseConfig.script.path);
                parseConfig.script.func = (await getComponentsForReact(code)).func
        }

        console.log(parseConfig.script);
        console.log();

        // Parse and Generate
        const parseHtml = await getParseHTML(config.template);
        // Require parseHtml first in case working with React/Vue.
        const parseScript = await getParseScript(parseConfig.script, parseHtml);

        // write
        fs.writeFileSync(parseConfig.script.path, parseScript);
        if (separate) {
                fs.writeFileSync(parseConfig.template.path, parseHtml);
        }

        console.log();
        spinner.succeed('组件已更新!');
        return;
}

function getParseHTML(rawHtml) {
        const questions = [];
        let parseHtml = `<${rawHtml.tag}`;
        const attrs = rawHtml.attrs;
        if (attrs && Array.isArray(attrs) && attrs.length) {
                chalk.green(console.log('配置模板：'));
                attrs.map((attr, index) => {
                        questions.push({
                                type: "confirm",
                                message: `是否添加${attr.binding}？（${attr.description}）`,
                                name: index.toString(),
                                default: true
                        });
                });
                return inquirer.prompt(questions).then(answers => {
                        for (const i in answers) {
                                if (Object.hasOwnProperty.call(answers, i)) {
                                        if (answers[i]) {
                                                const k = parseInt(i);
                                                parseHtml += addAttr(attrs[k]['binding'], attrs[i]['data']);
                                        };
                                }
                        }
                        parseHtml += `></${rawHtml.tag}>`;
                        return parseHtml;
                }).catch((error) => {
                        if (error.isTtyError) {
                                // Prompt couldn't be rendered in the current environment
                                console.log('Something went wrong...');
                        } else {
                                // Something else went wrong
                                console.log(error);
                        }
                });
        } else {
                parseHtml += `></${rawHtml.tag}>`;
                return Promise.resolve(parseHtml);
        }
}

function addAttr(binding, data) {
        return ` ${binding}='${data}'`
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

function getParseScript(config, parseHtml) {
        const sourceCode = fs.readFileSync(config.path);
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
                        insertPlugin(config, parseHtml)
                ],
                generatorOpts: {
                        decoratorsBeforeExport: true
                },
                sourceType: 'unambiguous'
        });
        return code;
}

function getParseConfig(fileListMap) {
        questions = [{
                type: "list",
                message: `template代码添加到：`,
                name: 'template',
                choices: Array.from(fileListMap.keys())
        }, {
                type: "list",
                message: `script代码添加到：`,
                name: 'script',
                choices: Array.from(fileListMap.keys())
        }];
        return inquirer.prompt(questions).then(answers => {
                return answers;
        })
}

// 通过后缀判断类型
// 每一次问询，都包含两个配置：模板和逻辑。都是包含2部分：名称和初始值。
/**
 * Angular
 * 1. html
 * 2. ts: 属性和方法
 */

/**
 * React
 * 
 * import
 * Function: 
 *      模版放在return中；逻辑插入在return之前；
 * Class:
 *      模版放在render方法的return中；模板的初始值用this；逻辑的初始值放在constrctor中，方法需要绑定bind(this)
 */