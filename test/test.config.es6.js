const stuff = {

  output: {
    pathinfo: true
  },

  module: {
    preLoaders: [
      { test: /\.js$/, loader: 'isparta', include: /src/, exclude: 'index.js' },
      { test: /\.jsx$/, loader: 'isparta', include: /src/}
    ],
    loaders: [
      { test: /\.js/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
  },

  devtool: 'inline-source-map'
}

export default stuff
