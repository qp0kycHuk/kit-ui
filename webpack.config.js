const path = require('path');




module.exports = {
  entry: './src/index.js',
  resolve:{
    alias:{
      '@src': path.resolve(__dirname, 'src/')

    }
  },
  output: {
    path: path.resolve(__dirname, 'dist','js'),
    filename: 'index.js',
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    port: 9000,
    historyApiFallback: true,

  },

};
