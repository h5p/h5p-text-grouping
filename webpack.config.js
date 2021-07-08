const path = require('path');

const config = {
  entry: {
    dist: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'h5p-text-grouping.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test:/\.scss$/i,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'url-loader?limit=1000000',
      },
    ]
  }
};

module.exports = (env, argv) => {
  return config;
};
