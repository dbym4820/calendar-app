const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

const src  = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'docs');

export default {
    mode: 'development',
    //mode: 'production',
    entry: {
	'index': src + '/index.jsx',
    },
    output: {
	path: dist,
	filename: 'bundle.js'
    },
    module: {
	rules: [
	    {
		test: /\.worker\.js$/,
		use: { loader: "worker-loader" },
	    },
	    {
		test: /\.(js|jsx)$/,
		exclude: /node_modules/,
		use: 'babel-loader',
	    },
	    
	    {
		test: /\.txt$/,
		exclude: /node_modules/,
		use: 'raw-loader'
	    },
	    /* {
	       test: /\.json$/,
	       use: 'json-loader'
	       }, */
	    {
		test: /\.css$/,
		use: [
		    'style-loader',
		    'css-loader'
		],
	    },
	    {
		test: /\.scss$/,
		use: [
		    'style-loader',
		    'css-loader',
 		    'sass-loader'
		],
	    },
	    {
		test: /\.(png|jpe?g|gif|ico)$/,
		use: [{
		    loader: 'url-loader',
		    options: {
			limit: 20000,
			name: '[name].[ext]'
		    }
		}]
	    },
	    {
		test: /\.(woff|woff2|eot|ttf|otf)$/,
		use: [{
		    loader: 'url-loader',
		    options: {
			limit: 10000,
			fallback: 'file-loader',
			name: 'fonts/[name].[ext]',
		    },
		}]
	    },
    ]},
    performance: {
	maxEntrypointSize: 50000000,
	maxAssetSize: 50000000,
    },
    
    resolve: {
	extensions: ['.js', '.jsx']
    },

    plugins: [
	new HtmlWebpackPlugin({
	    template: src + '/index.html',
	    filename: 'index.html'
	}),
    ],
    devServer: {
	static: {
	    directory: path.resolve(__dirname, "docs"),
	},

	historyApiFallback: true,
    },
    devtool: "eval-source-map",
}
