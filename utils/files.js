const fs = require("fs");
const path = require('path');
var debug = require('debug')('app');

const FileAction = {
    fileTypeList: ['html', 'ts', 'js', 'css', 'less'],
    errorCount: 0,

    // 收集指定目录指定类型的所有文件
    collectFiles(fileType, dirPath = null) {
        const dir = dirPath || path.resolve();
        const fileList = new Map();
        fs.readdirSync(dir).forEach(function (file) {
            var pathname = path.join(dir, file);

            if (fs.statSync(pathname).isDirectory()) {
                // travel(pathname, callback);
                return;
            } else {
                if (fileType === FileAction.getFileType(pathname) || fileType === '*') {
                    fileList.set(file, pathname);
                }
            }
        });
        return fileList;
    },

    getFileType: function (filePath) {
        return filePath.split('/').pop().split('.').pop();
    },

    ensureFile: function (filePath, craeteIfNotExisted) {
        const rlt = fs.existsSync(filePath);
        if (!rlt && craeteIfNotExisted) {
            fs.appendFile(filePath, null);
        }
        return rlt;
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
module.exports = {
    collectFiles(fileType) {
        return FileAction.collectFiles(fileType);
    },
    ensureFile(filePath, craeteIfNotExisted) {
        return FileAction.ensureFile(filePath, craeteIfNotExisted);
    },
    getFileType(filePath) {
        return FileAction.getFileType(filePath);
    }
}