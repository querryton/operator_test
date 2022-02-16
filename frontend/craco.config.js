/* craco.config.js */
const CracoLessPlugin = require('craco-less');

module.exports = {
  "plugins": [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1890FF' },//主题颜色
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  babel: {
    plugins: [
       [
         "import", 
         {
           "libraryName": "antd",
           "libraryDirectory": "es",
            "style": true //设置为true即是less
          }
      ]
    ]
  }
}

