const CracoLessPlugin = require('craco-less')

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1da57a',
              '@border-radius-base': '3px',
              '@border-width-base': '1px',
              '@font-size-base': '14px',
              '@height-base': '@font-size-base*2.5',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}
