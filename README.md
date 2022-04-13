# Introduce
`easy-component-cli`是一个解决<b>重复写组件代码</b>问题的命令行工具。把日常常用的组件加入到配置文件里，通过简单的命令就可以自动插入代码到目标文件中。

`easy-component-cli` is a cli tool that solves the problem of repeated writing component code. Add a daily commonly used component to the configuration file, you can automatically insert the code to the target file by simple commands.

具有上手简单，灵活性高，适配性强的优势，可以轻松融入到当前工作流程中。在团队工作中，一人写好配置文件后，全组共享，岂不美哉。

It has the advantages of simple, high flexibility, and strong adaptivity, and can easily integrate into the current workflow.In the team's work, after one person writing the configuration file, the group is shared.

![示例](https://github.com/greatbear412/easy-component/blob/master/example/Snipaste_2022-04-08_14-36-16.png)

# install
`npm install -g es-component-cli`
# Usage
## `es [options] [command]`
执行`easy-component`命令:`list`, `config`, `generate`

Execute `easy-component` command: `list`, `config`, `generate`
## `l, list`
列出所有组件和描述

List all components and profiles

## `c, config`
查看配置文件地址

Check current configuration file path.
### `config -p, --path <filePath>`
设置配置文件地址。重新制定配置文件地址，方便多个项目切换。

Set configuration file path. Easy to switch between multiple projects.

## `g, generate <component-name>`
生成组件代码，插入到当前目录的选择文件中。

Generates component code and inserts it into a selection file in the current directory.

写好配置文件后，使用`es g your-component`，选择要插入的文件，之后选择要生成的可选项，就ok了。

After finishing configuration file, use `es g your-component`, choose target files in the current directory and optional code to generate, and it's done.
### `generate -y, --yes`
添加所有可选项，不再询问。

Add all optinal code, no more inquires.

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

# Requirement
node >= 14.0.0

# End
Please Star if you like it!