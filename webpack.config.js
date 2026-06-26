const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);

module.exports = {
  entry: [
    path.resolve(appDirectory, 'index.js')
  ],
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        // Transpile react-native libraries that publish raw ES6/React Native code
        exclude: /node_modules\/(?!(react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-navigation|react-native-image-picker)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['module:@react-native/babel-preset'],
            plugins: ['react-native-web']
          }
        }
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@react-native-firebase/auth$': path.resolve(appDirectory, 'src/firebase/mockFirebase.js'),
      '@react-native-firebase/firestore$': path.resolve(appDirectory, 'src/firebase/mockFirebase.js'),
      '@react-native-firebase/storage$': path.resolve(appDirectory, 'src/firebase/mockFirebase.js'),
      'react-native-reanimated': path.resolve(appDirectory, 'src/firebase/mockFirebase.js'),
      'react-native-worklets': path.resolve(appDirectory, 'src/firebase/mockFirebase.js'),
    },
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 8085,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  }
};
