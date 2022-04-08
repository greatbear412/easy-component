const chalk = require('chalk');
const {
    env
} = require('process');
const fs = require("fs");
const FileService = require('../utils/files')
const spinner = require('ora')();

module.exports = () => {
    const configPath = require(env.CONFIG_FILE_PATH);
    if (!FileService.ensureFile(configPath)) {
            spinner.fail(`配置文件${configPath}不存在。`);
            return;
    }
    const configAll = JSON.parse(fs.readFileSync(configPath).toString());
    for (const component in configAll) {
        if (Object.hasOwnProperty.call(configAll, component)) {
            const data = configAll[component];
            let des = chalk.green(component);
            if(data.description) {
                des += ` - ${data.description}`
            }
            console.log(des)
        }
    }
}