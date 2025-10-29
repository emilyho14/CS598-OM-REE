const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'script': './src/script.js'
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      stream: false,
      querystring: require.resolve('querystring-es3'),
      crypto: false, 
      buffer: false,
      util: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        type: 'javascript/esm',
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public' },
        { from: 'src/script.css', to: 'script.css' },
      ]
    })
  ],
  
  mode: 'development',
  devtool: 'source-map'
};
