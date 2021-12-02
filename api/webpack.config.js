var webpack = require('webpack')

module.exports = {
  // entry: {
  //    index: './src/index.js'
  // },
  // output: {
  //    path: './dist',
  //    filename: 'bundle.js'
  // },
  externals: {
    './config': 'config',
  },
}
