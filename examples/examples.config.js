const path = require('path')
const webpack = require('webpack')

module.exports = {

  entry: path.join(__dirname, '../examples/index.js'),

  output: {
    path: path.join(__dirname, '../examples/'),
    filename: 'static/bundle.js',
    publicPath: '/static/'
  },

  resolve: {
    alias: {
      'react-selection-hoc': path.join(__dirname, '..', 'src'),
      './Selection.jsx': path.join(__dirname, '..', 'src', 'Selection.jsx'),
      './Selectable.jsx': path.join(__dirname, '..', 'src', 'Selectable.jsx'),
      './mouseMath.js': path.join(__dirname, '..', 'src', 'mouseMath.js'),
      './debug.js': path.join(__dirname, '..', 'src', 'debug.js')
    },
    extensions: ['', '.js', '.jsx']
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

  module: {
    loaders: [
      { test: /\.gif$/, loader: 'url-loader?mimetype=image/png' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=[name].[ext]' },
      { test: /\.less/, loader: 'style-loader!css-loader!less-loader', exclude: /node_modules/ },
      { test: /\.md/, loader: 'babel!markdown-jsx-loader'},
      { test: /\.js/, loaders: ['babel'], exclude: /node_modules/},
      { test: /\.js/, loaders: ['babel'], include: path.join(__dirname, '..', 'src')}
    ]
  }
};
