const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

dotenv.config();
const MODE = process.env.NODE_ENV || 'development'; 

module.exports = {
    mode: MODE,
    entry: {
        main: { import: "./src/js/main.js", dependOn: "shared" },
        index: { import: "./src/js/index.js", dependOn: "shared" },
        profile: { import: "./src/js/profile.js", dependOn: "shared" },
        login: { import: "./src/js/login.js", dependOn: "shared" },
        register: { import: "./src/js/register.js", dependOn: "shared" },
        recipe: { import: "./src/js/recipe.js", dependOn: "shared" },
        search: { import: "./src/js/search.js", dependOn: "shared" },
        favourites: { import: "./src/js/favourites.js", dependOn: "shared" },
        shared: "lodash",
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    output: {
        filename: "js/[name].[contenthash].js",
        path: path.resolve(__dirname, 'dist'), 
        publicPath: '/', 
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html', 
            template: './src/html/index.html',
            inject: 'body',
            chunks: ['main', 'shared', 'index'],
        }),
        new HtmlWebpackPlugin({
            filename: 'profile.html', 
            template: './src/html/profile.html',
            inject: 'body',
            chunks: ['main', 'shared', 'profile'],
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html', 
            template: './src/html/login.html',
            inject: 'body',
            chunks: ['main', 'shared', 'login'],
        }),
        new HtmlWebpackPlugin({
            filename: 'register.html', 
            template: './src/html/register.html',
            inject: 'body',
            chunks: ['main', 'shared', 'register'],
        }),
        new HtmlWebpackPlugin({
            filename: 'search.html', 
            template: './src/html/search.html',
            inject: 'body',
            chunks: ['main', 'shared', 'search'],
        }),
        new HtmlWebpackPlugin({
            filename: 'recipe.html', 
            template: './src/html/recipe.html',
            inject: 'body',
            chunks: ['main', 'shared', 'recipe'],
        }),
        new HtmlWebpackPlugin({
            filename: 'favourites.html', 
            template: './src/html/favourites.html',
            inject: 'body',
            chunks: ['main', 'shared', 'favourites'],
        }),
        ...(MODE === 'production' ? [
            new MiniCssExtractPlugin({
                filename: "css/[name].[contenthash].css",
            }),
        ] : []),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/js/utils', to: 'js/utils' },
            ],
        }),
        new NodemonPlugin({
            script: './app.js',
            watch: [
                path.resolve('./dist'), 
                path.resolve('./app.js')
            ],
            verbose: true,
        }),
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                    encodeOptions: {
                        jpeg: { quality: 75 },
                        png: { compressionLevel: 8 },
                        webp: { quality: 75 },
                    },
                },
            },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    sources: {
                        list: [
                            {
                                tag: 'img',
                                attribute: 'src',
                                type: 'src',
                            },
                        ],
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    MODE === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 
                    'css-loader',
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MODE === 'production' ? MiniCssExtractPlugin.loader : 'style-loader', 
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: 'asset/resource',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024,
                    },
                },
                generator: {
                    filename: 'assets/[name].[hash][ext]', 
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource', 
                generator: {
                    filename: 'fonts/[name].[hash][ext]',
                },
            },
        ],
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 3001,
        open: true,
        historyApiFallback: false,
        watchFiles: [
            './src/**/*.html',
            './src/**/*.scss',
            './src/**/*.js',
        ],
    },
};