const FileService = require('../utils/files')

/**
 * 1. 查询组件配置
 * 2. 生成模板
 * 3. 生成js
 * @param {*} component 组件名
 */
module.exports = (component) => {
        // const config = 
        // const filesList = Files.collectFiles(fileType);
        console.log(filesList.keys());
        // spinner.start('开始下载');
        // spinner.succeed(chalk.green(`下载成功`));
}

// 通过后缀判断类型
// 每一次问询，都包含两个配置：模板和逻辑。都是包含2部分：名称和初始值。
/**
 * Angular
 * 1. html
 * 2. ts: 属性和方法
 */

/**
 * React
 * 
 * import
 * Function: 
 *      模版放在return中；逻辑的初始值用const声明（属性和方法）
 * Class:
 *      模版放在render方法的return中；模板的初始值用this；逻辑的初始值放在constrctor中，方法需要绑定bind(this)
 */