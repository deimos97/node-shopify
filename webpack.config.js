const path = require('path');
module.exports = {
	entry: path.join(__dirname, '/src/index.js'),
	output: {
		filename: 'build.js',
		path: path.join(__dirname, '/public/javascripts/')
	},
	module: {
		rules:[
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	},
	mode: 'development',
	watch: true,
	resolve: {
		modules: ['node_modules']
	},
}