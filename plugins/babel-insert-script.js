const {
    declare
} = require('@babel/helper-plugin-utils');
const template = require('@babel/template').default

// TODO: writeHtml
const babel_insert_script_plugin = (config, parseHtml) => {
    return declare((api, option, dirname) => {
        api.assertVersion('7');

        return {
            manipulateOptions(options, parserOptions) {
                parserOptions.plugins.push('jsx');
                parserOptions.plugins.push('typescript')
            },
            visitor: {
                Program: {
                    enter(path, state) {
                        const optionalList = config.optionalList;
                        switch (config.type) {
                            case 'ts':
                            case 'js':
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        insert(curPath, optionalList)
                                    }
                                });
                                break;

                            case 'jsx':
                            case 'tsx':
                                const func = config.func;
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            // insert script
                                            insert(curPath, optionalList)

                                            // inset template
                                            curPath.traverse({
                                                'ClassMethod'(childPath) {
                                                    if (childPath.node.key.name === 'render') {
                                                        const bodyPath = childPath.get('body');
                                                        const ast = api.template.statement(`return (${parseHtml} PREV_BODY);`)({
                                                            PREV_BODY: bodyPath.node
                                                        });
                                                        bodyPath.replaceWith(ast);
                                                    }
                                                }
                                            })
                                        }
                                    },
                                    'FunctionDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            insert(curPath, optionalList)

                                            curPath.traverse({
                                                'ReturnStatement'(childPath) {
                                                    const bodyPath = childPath.get('body');
                                                    const ast = api.template.statement(`return (${parseHtml} PREV_BODY);`)({
                                                        PREV_BODY: bodyPath.node
                                                    });
                                                    bodyPath.replaceWith(ast);
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

function insert(path, data) {
    data.map(config => {
        if (config.data) {
            const ast = template(config.data)();
            const pos = config.insert;
            if (pos === 'unshift') {
                path.node.body.body.unshift(ast);
            } else {
                path.node.body.body.push(ast);
            }
        }
    })

}

module.exports = babel_insert_script_plugin;