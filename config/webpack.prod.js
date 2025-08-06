const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const paths = require('./paths')
const common = require('./webpack.common.js')

// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    output: {
        path: paths.build,
        publicPath: '',
        filename: 'js/[name].[contenthash].bundle.js',
    },
    plugins: [
        // Extracts CSS into separate files
        // Note: style-loader is for development, MiniCssExtractPlugin is for production
        new MiniCssExtractPlugin({
            filename: 'styles/[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: false,
                            modules: false,
                            // modules: true,
                        },
                    },
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ],
    },

    optimization: {
        minimize: true,
        runtimeChunk: {
            name: 'runtime',
        },
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
})