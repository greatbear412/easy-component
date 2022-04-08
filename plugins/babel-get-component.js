const {
    declare
} = require('@babel/helper-plugin-utils');

const babel_get_component_plugin = (funcList) => {
    return declare((api) => {
        api.assertVersion('7');

        return {
            visitor: {
                Program: {
                    enter(path) {
                        path.traverse({
                            'ClassDeclaration|FunctionDeclaration'(curPath) {
                                funcList.push(curPath.node.id.name)
                            },
                        })
                        path.skip();
                    }
                }
            }
        }
    })
}

module.exports = babel_get_component_plugin;