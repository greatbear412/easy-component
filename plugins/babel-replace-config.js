const {
    declare
} = require('@babel/helper-plugin-utils');
const t = require('@babel/types');
const {
    env
} = require('process');

const babel_replace_config_plugin = declare((api, option, dirname) => {
    api.assertVersion('7');

    return {
        visitor: {
            Program: {
                enter(path, state) {
                    path.traverse({
                        'VariableDeclaration'(curPath) {
                            const declaration = curPath.node.declarations.filter(d => d.id.name === 'CONFIG_JSON_FILE')[0];
                            if (declaration) {
                                curPath.replaceWith(t.variableDeclaration('const', [
                                    t.variableDeclarator(t.identifier('CONFIG_JSON_FILE'), t.StringLiteral(env.CONFIG_PATH))
                                ]));
                            }
                            curPath.skip();
                        }
                    });
                    path.skip();
                }
            }
        }
    }
})

module.exports = babel_replace_config_plugin;