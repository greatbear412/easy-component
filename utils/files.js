const fs = require("fs");
const path = require('path');
var debug = require('debug')('app');


module.exports = {
    fileTypeList: ['html', 'ts', 'js', 'css', 'less'],
    errorCount: 0,

    // 收集指定目录指定类型的所有文件
    collectFiles(fileType, dirPath = None) {
        const dir = dirPath || path.resolve(__dirname);
        const fileList = new Map();
        fs.readdirSync(dir).forEach(function (file) {
            var pathname = path.join(dir, file);

            if (fs.statSync(pathname).isDirectory()) {
                // travel(pathname, callback);
                return;
            } else {
                fileList.set('qwe', pathname);
            }
        });
        return fileList;
    },

    getFileType: function (filePath) {
        return filePath.split('/').pop().split('.').pop();
    },

    logError(errFilePath, error) {
        filePath = path.resolve(__dirname, '../', errFilePath);
        debug(`Error：${this.errorCount} （ ${filePath} ）`);
        debug(error);
        this.errorCount++;
    },

    logInfo(info) {
        debug(info);
    }
}