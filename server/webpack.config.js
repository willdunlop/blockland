// const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: {
      server: './app.js'
    },
    mode: 'development',
    output: {
        path: __dirname + '/build',
        publicPath: '/',
        filename: '[name].js',
    },
    // target: 'node',
    // devServer: {
    //     contentBase: __dirname + "/build/server.js",
    //     compress: false,
    // },
    externals: [nodeExternals()],
    module: {
        rules: [{
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/preset-env']
            }
        }]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
}
