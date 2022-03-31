const {
    declare
} = require('@babel/helper-plugin-utils');

// TODO: writeHtml
const babel_insert_script_plugin = (config, parseHtml) => {
    return declare((api, option, dirname) => {
        api.assertVersion('7');

        return {
            visitor: {
                Program: {
                    enter(path, state) {
                        switch (config.type) {
                            case 'ts':
                            case 'js':
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        config.map(code => {
                                            const ast = api.template.ast(code.data);
                                            insert(ast, curPath, code.insert);
                                        })
                                    }
                                });
                                break;

                            case 'jsx':
                            case 'tsx':
                                const func = config.func;
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            curPath.traverse({
                                                'ClassMethod'(childPath) {
                                                    if (childPath.node.key.name === 'render') {
                                                        config.data.map(code => {
                                                            const ast = api.template.ast(code.data);
                                                            childPath.insertBefore(ast);
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    },
                                    'FunctionDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            curPath.traverse({
                                                'ReturnStatement'(childPath) {
                                                    config.data.map(code => {
                                                        const ast = api.template.ast(code.data);
                                                        childPath.insertBefore(ast);
                                                    })
                                                }
                                            })
                                        }
                                    }
                                });

                            case 'vue':
                                break;

                            default:
                                break;
                        }

                        path.skip();
                    }
                }
            }
        }
    })
}

function insert(ast, path, pos) {
    if (pos === 'unshift') {
        path.node.body.body.unshift(ast);
    } else {
        path.node.body.body.push(ast);
    }
}

module.exports = babel_insert_script_plugin;