const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

module.exports = {
    mode: 'development',
    //mode: 'production',
    entry: path.resolve(__dirname, 'src/index.jsx'),
    output: {
	    path: path.resolve(__dirname, 'docs'),
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
	        template: path.resolve(__dirname, 'src/index.html'),
	    }),
    ],
    devServer: {
        host: "0.0.0.0",
        port: 5050,
        historyApiFallback: {
            rewrites: [{ from: /^\/*/, to: '/index.html' }],
        },
        static: {
            directory: path.resolve(__dirname, 'docs'),
        }
    },
    devtool: "inline-source-map",
}
