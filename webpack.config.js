var path = require("path")
	, webpack = require("webpack")
	, assetsPath = path.join(__dirname, "public", "assets")
	, serverAssetsPath = path.join(__dirname, "app", "server-assets")
	, publicPath = "assets/"

	, commonLoaders = [
//	{ test: /\.js$/, loader: "jsx-loader" },
//	{ test: /\.js$/, loader: "babel-loader" },
//*
	{
		test: /\.jsx?$/,
		exclude: /(node_modules|bower_components)/,
		loader: 'babel',
		query: {
			presets: ['es2015', 'react']
		}
    },
//*/
	{ test: /\.png$/, loader: "url-loader" },
	{ test: /\.jpg$/, loader: "file-loader" },
]

// nothing should be loaded from "external" for the vending gui! but here for reference:
	, externals = {
//		moment: "moment",
//		ioClient: "io",
//		react: "React"
	}

	;

module.exports = [
	{
		// The configuration for the client
		name: "appGui",
		//entry: "./app/entry-client.js",
		entry: "./app/Router.js",
		output: {
			path: assetsPath,
			filename: "CLIENT.js",
			publicPath: publicPath
		},
		module: {
			loaders: commonLoaders
		},
		externals: externals,
		plugins: [
			function(compiler) {
				this.plugin("done", function(stats) {
					require("fs").writeFileSync(path.join(__dirname, "app", "stats.generated.json"), JSON.stringify(stats.toJson()));
				});
			}
		]
	}
/*
// if we decide to have a separate admin components tree (probably will!)
	, {
		// The configuration for the admin client
		name: "admin",
		entry: "./app/AdminRouter.js",
		output: {
			path: assetsPath,
			filename: "ADMINCLIENT.js",
			publicPath: publicPath
		},
		module: {
			loaders: commonLoaders
		},
		externals: externals,
		plugins: [
			function(compiler) {
				this.plugin("done", function(stats) {
					require("fs").writeFileSync(path.join(__dirname, "app", "stats.generated.json"), JSON.stringify(stats.toJson()));
				});
			}
		]
	}
*/
];

