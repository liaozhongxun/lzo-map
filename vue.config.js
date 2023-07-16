const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    proxy: {
      "/baiduApi": {
        target: "https://api.map.baidu.com",
        changeOrigin: true,
        pathRewrite: {
          "^/baiduApi": "",
        },
      },
    },
  },
});
