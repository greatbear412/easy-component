const {
    parseSync,
    transformSync
} = require("@babel/core");
const fs = require("fs");
const Path = require('path');

const plugin = require('./plugins/babel-replace-config')
const childPath = Path.resolve(__dirname, './es.config.js');

const sourceCode = fs.readFileSync(childPath).toString();
const {
    code,
    ast
} = transformSync(sourceCode, {
    plugins: [
        plugin
    ],
    sourceType: 'unambiguous',
    ast: true
});

console.log(code);