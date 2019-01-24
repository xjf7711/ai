const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}

/*eslint-disable no-undef*/

module.exports = {
  // 项目部署的基础路径
  publicPath: "./",
  // 输出文件目录。
  // "dist",
  // outputDir: "../../cordova/fsyApp/platforms/android/app/src/main/assets/www/",
  // 是否在保存的时候使用 `eslint-loader` 进行检查。
  // 有效的值：`ture` | `false` | `"error"`
  // 当设置为 `"error"` 时，检查出的错误会触发编译失败。
  lintOnSave: true,
  // webpack配置
  // 该对象将会被 webpack-merge 合并入最终的 webpack 配置。
  configureWebpack: {
    // 主要作用就是，不处理应用的某些依赖库，使用externals配置后，依旧可以在代码中通过CMD、AMD或者window/global全局的方式访问。
    externals: { AMap: "AMap" } // 有效
  },
  chainWebpack: config => {
    config.resolve.alias
      .set("@$", resolve("src"))
      .set("src", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("components", resolve("src/components"))
      .set("layout", resolve("src/views/layout"))
      .set("base", resolve("src/base"))
      .set("public", resolve("public"));
    // 使用 externals.
    // config.externals({ BMap: "BMap" });
    // svg rule loader
    const svgRule = config.module.rule("svg"); // 找到svg-loader
    svgRule.uses.clear(); // 清除已有的loader, 如果不这样做会添加在此loader之后
    svgRule.exclude.add(/node_modules/); // 正则匹配排除node_modules目录
    svgRule // 添加svg新的loader处理
      .test(/\.svg$/)
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]"
      });
    // 修改images loader 添加svg处理
    const imagesRule = config.module.rule("images");
    imagesRule.exclude.add(resolve("src/assets/icons"));
    config.module.rule("images").test(/\.(png|jpe?g|gif|svg)(\?.*)?$/);
  },
  // webpack-dev-server 相关配置
  devServer: {
    // open: process.platform === "darwin", //darwin苹果系统打开浏览器 Chrome
    host: "0.0.0.0",
    port: 8018,
    // https: false, // 启动https
    // hotOnly: false,
    proxy: {
      // 设置代理
      // proxy all requests starting with /api to jsonplaceholder
      "/api/getToken": {
        target: "https://openapi.baidu.com/oauth/2.0/token",
        changeOrigin: true,
        pathRewrite: {
          "/api/getToken": ""
        }
      },
      "/api/getAudio": {
        target: "http://tsn.baidu.com/text2audio",
        changeOrigin: true,
        pathRewrite: {
          "/api/getAudio": ""
        }
      },
      "/api/getText": {
        target: "http://vop.baidu.com/server_api",
        changeOrigin: true,
        pathRewrite: {
          "/api/getText": ""
        }
      },
      "/api/detectFace": {
        target: "https://aip.baidubce.com/rest/2.0/face/v3/detect",
        changeOrigin: true,
        pathRewrite: {
          "/api/detectFace": ""
        }
      }
    }
  }
};
