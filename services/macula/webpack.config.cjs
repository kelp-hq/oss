'use strict';

const webpack = require('webpack');
const path = require('path');

const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV == 'production';

console.log('Webpack is running in %s mode', process.env.NODE_ENV);

const config = {
  entry: {
    macula: './src/start.ts'
  },
  output: {
    // library: 'signer',
    // libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
    // filename: '[name].js',
    clean: true
  },
  // the plugins are executed from last to first
  plugins: [
    // new webpack.BannerPlugin({
    //   banner: copyrightSnippet,
    //   raw: true
    // }),
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  optimization: {
    minimize: false
  },
  externalsPresets: {
    node: true
  },
  externals: {
    sharp: 'commonjs sharp'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true // https://github.com/TypeStrong/ts-loader#transpileonly
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map',
  ignoreWarnings: [(warning) => true],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
    // buildHttp: true,
    // layers: true,
    // lazyCompilation: true,
    // outputModule: true,
    // topLevelAwait: true,
  }
};

module.exports = config;
