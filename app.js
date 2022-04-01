const {
    parseSync,
    transformSync
} = require("@babel/core");
const fs = require("fs");
const Path = require('path');
const inquirer = require('inquirer');
const {
    env
} = require('process');

const plugin = require('./plugins/babel-insert-script')
// const plugin = require('./plugins/babel-get-component')
// const childPath = '/Users/pc/Code/my-babel/app-component/angular/roles.component.ts';
const childPath = '/Users/pc/Code/my-babel/app-component/welcome.tsx';
const sourceCode = fs.readFileSync(childPath).toString();

// const configList = [{
//     "data": "myData:FormData = {}",
//     "description": "Adding form-data binding.",
//     "insert": "append"
// }, {
//     "data": "myFormData:FormData = []",
//     "description": "Adding form-data binding.",
//     "insert": "unshift"
// }, {
//     "data": "() => {console.log(123)}",
//     "description": "Adding form-data binding.",
//     "insert": "append"
// }];
const configList = {
    path: '/Users/pc/Code/my-babel/app-component/welcome.tsx',
    type: 'tsx',
    data: [{
            data: 'myData:FormData = {}',
            description: 'Adding form-data binding.',
            insert: 'append'
        },
        {
            data: 'myFormData:FormData = []',
            description: 'Adding form-data binding.',
            insert: 'unshift'
        },
        {
            data: '() => {console.log(123)}',
            description: 'Adding form-data binding.',
            insert: 'append'
        }
    ],
    func: 'Welcome'
}
const rawHtml = `<my-form-example [form-data]='myFormData' ([form-data])='myFormData' (form-value-change)='onFormValueChange'></my-form-example>`;
const {
    code
} = transformSync(sourceCode, {
    parserOpts: {
        plugins: [
            ['decorators', {
                decoratorsBeforeExport: true
            }],
            ['jsx'],
            ['typescript']
        ]
    },
    plugins: [
        plugin(configList, rawHtml)
    ],
    presets: [
        [
            "@babel/preset-react",
        ]
    ],
    generatorOpts: {
        decoratorsBeforeExport: true,
        plugins: [
            ['typescript'],
            ['jsx']
        ]
    },
    sourceType: 'unambiguous'
});

fs.writeFileSync('/Users/pc/Code/my-babel/app-component/test.ts', code);

// const rawHtml = {
//     "tag": "my-form-example",
//     "attrs": [{
//             "binding": "[form-data]",
//             "data": "myFormData",
//             "description": "Adding form-data binding?"
//         },
//         {
//             "binding": "(form-value-change)",
//             "data": "onFormValueChange",
//             "description": "Adding form value change event binding?"
//         }
//     ]
// }
// parseHTML(rawHtml);



// console.log(code);