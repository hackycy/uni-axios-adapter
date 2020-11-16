const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const path = require("path");

const config = [];

function generateConfig(name) {
  var uglify = name.indexOf("min") > -1;
  var config = {
    entry: "./index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: name + ".js",
      sourceMapFilename: name + ".map",
      library: "uni-axios-adapter",
      libraryTarget: "umd",
    },
    optimization: {
      minimize: uglify,
    },
    devtool: "source-map",
  };

  return config;
}

["uni-axios-adapter", "uni-axios-adapter.min"].forEach(function (key) {
  config.push(generateConfig(key));
});

module.exports = config;
