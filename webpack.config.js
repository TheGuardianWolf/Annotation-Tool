var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

// Webpack Config
var webpackConfig = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/main.renderer.ts'
    },

    output: {
        path: 'app',
    },

    plugins: [
        new ExtractTextPlugin("style.css"),
        new webpack.optimize.CommonsChunkPlugin({ name: ['app', 'vendor', 'polyfills'], minChunks: Infinity }),
        new webpack.ProvidePlugin({
            jQuery: "jquery"
        }),
        new HtmlWebpackPlugin({
            title: "UoA Annotation Tool",
            template: "./src/index.ejs",
            inject: "body",
        }),
        new CopyWebpackPlugin([
            { from: './src/main.electron.js', to: './electron.js' },
            { from: './src/package.electron.json', to: './package.json' },
            {
				context: './build',
                from: {
                    glob: 'CameraTool*',
                    dot: false
                },
                to: './native',
            }
        ],
            {
                copyUnmodified: false
            }
        )
    ],

    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader!angular2-template-loader?keepUrl=true'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!resolve-url!sass-loader?sourceMap')
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!resolve-url')
            },
            //{
            //    test: /\.(eot|woff|woff2|ttf|svg|png|jpg|jpeg|fs)$/,
            //    loader: "url-loader?limit=10000"
            //},
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader?name=./emitted/[name]-[hash].[ext]'
            },
        ]
    },

    sassLoader: {
        precision: 8
    },

    devServer: {
        contentBase: 'app',
        publicPath: '',
    },

    target: 'electron-renderer',

    resolve: {
        alias: {
            jquery: "jquery/src/jquery"
        }
    }
};


// Our Webpack Defaults
var defaultConfig = {
    devtool: 'source-map',
    cache: true,
    debug: true,
    output: {
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },

    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [
                    // these packages have problems with their sourcemaps
                    path.join(__dirname, 'node_modules', 'rxjs'),
                    path.join(__dirname, 'node_modules', '@angular2-material'),
                    path.join(__dirname, 'node_modules', 'bootstrap-material-design'),
                    path.join(__dirname, 'node_modules', 'paper'),
                ]
            }
        ],
        noParse: [
            path.join(__dirname, 'node_modules', 'zone.js', 'dist'),
            path.join(__dirname, 'node_modules', '@angular', 'bundles'),
            //path.join(__dirname, 'node_modules', 'bootstrap-material-design', 'dist'),
            path.join(__dirname, 'node_modules', 'paper', 'dist'),
        ]
    },

    resolve: {
        root: [path.join(__dirname, 'src')],
        extensions: ['', '.ts', '.js']
    },

    devServer: {
        historyApiFallback: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 }
    },

    node: {
        __filename: false,
        __dirname: false,
        global: true,
        crypto: 'empty',
        module: 0,
        Buffer: 0,
        clearImmediate: 0,
        setImmediate: 0
    },
}

var webpackMerge = require('webpack-merge');
module.exports = webpackMerge(defaultConfig, webpackConfig);
