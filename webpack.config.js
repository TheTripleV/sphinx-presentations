//webpack.config.js
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  // mode: "production",
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/present.ts",
  },
  output: {
    // path: path.resolve(__dirname, './sphinxext/presentations/static/js/'),
    path: path.resolve(__dirname, './lte/frc-docs/build/html/_static/js/'),
    filename: "present.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
};