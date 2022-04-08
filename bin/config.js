const chalk = require('chalk');
const {
    env
} = require('process');
const fs = require("fs");
const FileService = require('../utils/files')
const {
    transformSync
} = require("@babel/core");
const plugin = require('../plugins/babel-replace-config')
const spinner = require('ora')();

module.exports = (opts) => {
    if(opts.path) {
        const pathName = opts.path;
        env.CONFIG_PATH = pathName;
        spinner.start('设置配置文件');
        const {
            code
        } = transformSync(env.CONFIG_CONTENT, {
            plugins: [plugin],
            sourceType: 'unambiguous',
            ast: true
        });
    
        fs.writeFileSync(env.CONFIG_FILE_PATH, code);
    
        if (!FileService.ensureFile(pathName)) {
            spinner.info(chalk.yellow(`配置文件 '${pathName}' 还没有创建。`));
        }
    
        spinner.succeed('配置文件地址已更新!');
    } else {
        spinner.start('读取配置文件');
        const configPath = require(env.CONFIG_FILE_PATH);
        spinner.succeed(`配置文件地址：${configPath}`);
    }
}