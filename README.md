# Introduce
`easy-component`是一个解决重复写组件代码问题的库。把日常常用的组件加入到配置文件里，通过简单的命令就可以自动插入代码到目标文件中。

# 
# Usage
## `l, list`
列出所有组件和描述

## `c, config`
查看配置文件地址
### `config -p, --path <filePath>`
设置配置文件地址。重新制定配置文件地址，方便多个项目切换。

## `g, generate <component-name>`
生成组件代码，插入到选择文件中。
写好配置文件后，使用`es g your-component`，选择要插入的文件，之后选择要生成的可选项，就ok了。
### `generate -y, --yes`
添加所有可选项。

# Config
可参考generate.config.json：
```
"es-form": {
        "description": 组件描述,
        // 模板
        "template": {
            "tag": 组件标签,
            "attrs": {
                "default": [{
                    // 默认属性
                    "data": 属性名,
                    "binding": 属性值,
                    "description": 描述
                }],
                "optional": [{
                    // 可选属性
                    "data": 属性名,
                    "binding": 属性值,
                    "description": 描述
                    }
                ]
            }
        },
        // js
        "script": {
            // 默认js
            "default": [{
                "data": js代码,
                "insert": 插入方式，可选"unshift" | "append"
            }],
            // 
            "optional": [{
                "data": js代码,
                "insert": 插入方式，可选"unshift" | "append"
            }]
        }
```
# Support
Angular，React