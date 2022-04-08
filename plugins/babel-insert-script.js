const {
    declare
} = require('@babel/helper-plugin-utils');
const template = require('@babel/template').default
const t = require('@babel/types');

const babel_insert_script_plugin = (config, parseHtmlData) => {
    return declare((api, option, dirname) => {
        api.assertVersion('7');

        return {
            manipulateOptions(options, parserOptions) {
                parserOptions.plugins.push('jsx');
            },
            visitor: {
                Program: {
                    enter(path, state) {
                        state.script = false;
                        state.template = !!!parseHtmlData.tag;
                        const scriptList = config.optionalList;
                        switch (config.type) {
                            case 'ts':
                            case 'js':
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        insertScript(curPath, scriptList)
                                    }
                                });
                                break;

                            case 'jsx':
                            case 'tsx':
                                const func = config.func;
                                path.traverse({
                                    'ClassDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            // insert template
                                            if (parseHtmlData.tag) {
                                                // Make sure render() exists
                                                let renderPath = null;
                                                curPath.traverse({
                                                    'ClassMethod'(childPath) {
                                                        if (childPath.node.key.name === 'render') {
                                                            renderPath = childPath;
                                                        }
                                                    }
                                                })
                                                // If not exist, create new render() function
                                                if (!renderPath) {
                                                    const render = t.classMethod(
                                                        'method', 
                                                        t.identifier('render'),
                                                        [],
                                                        t.blockStatement([])
                                                    );
                                                    renderPath = curPath.get('body').pushContainer('body', render)[0];
                                                }

                                                // insert template
                                                const parseJsxELement = getParseJsxElement(parseHtmlData);
                                                inserParsedtJsxElement(renderPath, parseJsxELement);
                                            }
                                            // insert script
                                            insertScript(curPath, scriptList);
                                            curPath.skip();
                                        }
                                    },

                                    'FunctionDeclaration'(curPath) {
                                        if (func === curPath.node.id.name) {
                                            if (parseHtmlData.tag) {
                                                const parseJsxELement = getParseJsxElement(parseHtmlData);
                                                inserParsedtJsxElement(curPath, parseJsxELement);
                                            }
                                            insertScript(curPath, scriptList);
                                            curPath.skip();
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

function getParseJsxElement(parseHtmlData) {
    const {
        tag,
        attrs
    } = parseHtmlData;

    const JSXAttrs = attrs ? attrs.map(attr => {
        return t.jsxAttribute(t.JSXIdentifier(attr.data), t.stringLiteral(attr.binding))
    }) : [];
    return t.JSXElement(
        t.jsxOpeningElement(t.JSXIdentifier(tag), JSXAttrs),
        t.jsxClosingElement(t.JSXIdentifier(tag)),
        []
    )
}

function inserParsedtJsxElement(curPath, parseJsxELement) {
    let state = false;
    curPath.traverse({
        'ReturnStatement'(returnPath) {
            returnPath.traverse({
                // "Return" statement contains jsx element
                'JSXElement'(jsxPath) {
                    jsxPath.node.children.push(parseJsxELement);
                    state = true;
                    jsxPath.skip();
                }
            })
            // "Return" statement doesn't contain jsx element / is null 
            if (!state) {
                returnPath.node.argument = parseJsxELement;
                state = true;
                returnPath.skip();
            }
        },
    })
    // No Return statement
    if (state === false) {
        const returnNode = t.returnStatement(parseJsxELement);
        curPath.get('body').node.body.push(returnNode);
    }
}

function insertScript(path, data) {
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
