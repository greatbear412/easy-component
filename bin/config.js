const chalk = require('chalk');
const {
    env
} = require('process');
const fs = require("fs");
const path = require("path");
const FileService = require('../utils/files')
const ConfigFilePath = path.resolve(__dirname, '../es.config.js');
const {
    transformSync
} = require("@babel/core");
const plugin = require('../plugins/babel-replace-config')
const spinner = require('ora')();

module.exports = (pathName) => {
    env.CONFIG_PATH = pathName;
    if (!FileService.ensureFile(ConfigFilePath)) {
        spinner.fail(`Easy-Component配置文件${ConfigFilePath}不存在，请去github重新获取。`);
        return;
    }
    spinner.start('设置配置文件');
    const sourceCode = fs.readFileSync(ConfigFilePath).toString();
    const {
        code
    } = transformSync(sourceCode, {
        plugins: [plugin],
        sourceType: 'unambiguous',
        ast: true
    });

    fs.writeFileSync(ConfigFilePath, code);

    if (!FileService.ensureFile(pathName)) {
        spinner.info(chalk.yellow(`配置文件 '${pathName}' 还没有创建。`));
    }

    spinner.succeed('配置文件地址已更新!');
}