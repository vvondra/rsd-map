// NOTE: To use this example standalone (e.g. outside of deck.gl repo)
// delete the local development overrides at the bottom of this file

// avoid destructuring for older Node version support
const resolve = require('path').resolve;
const webpack = require('webpack');

// Otherwise modules imported from outside this directory does not compile.
// Also needed if modules from this directory were imported elsewhere
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: [
    'es2015',
    'react',
    'stage-2'
  ].map(function configMap(name) {
    return require.resolve(`babel-preset-${name}`);
  })
};

const config = {
  entry: {
    app: resolve('./src/root.js')
  },

  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'dist')
  },

  devServer: {
    port: 9000,
    contentBase: [
      resolve(__dirname, 'dist'),
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // by convention the Spring Boot API
        secure: false
      }
    }
  },

  devtool: 'source-map',

  module: {
    rules: [{
      // Compile ES2015 using Babel
      test: /\.js$/,
      include: [resolve('.')],
      exclude: [/node_modules/],
      use: [{
        loader: 'babel-loader',
        options: BABEL_CONFIG
      }]
    },
    {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }
    ]
  },

  resolve: {
    alias: {
      // From mapbox-gl-js README. Required for non-browserify bundlers (e.g. webpack):
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  // Optional: Enables reading mapbox token from environment variable
  plugins: [
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};

// Enables bundling against src in this repo rather than the installed version
module.exports = env => config;
