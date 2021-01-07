module.exports = [
	// Add support for native node modules
	{
		test: /\.node$/,
		use: 'node-loader',
	},
	{
		test: /\.(m?js|node)$/,
		parser: { amd: false },
		use: {
			loader: '@marshallofsound/webpack-asset-relocator-loader',
			options: {
				outputAssetBase: 'native_modules',
			},
		},
	},
	{
		test: /\.(scss)$/,
		use: [{
		  // inject CSS to page
		  loader: 'style-loader'
		}, {
		  // translates CSS into CommonJS modules
		  loader: 'css-loader'
		}, {
		  // Run postcss actions
		  loader: 'postcss-loader',
		  options: {
			// `postcssOptions` is needed for postcss 8.x;
			// if you use postcss 7.x skip the key
			postcssOptions: {
			  // postcss plugins, can be exported to postcss.config.js
			  plugins: function () {
				return [
				  require('autoprefixer')
				];
			  }
			}
		  }
		}, {
		  // compiles Sass to CSS
		  loader: 'sass-loader'
		}]
	  }
	// Put your webpack loader rules in this array.  This is where you would put
	// your ts-loader configuration for instance:
	/**
	 * Typescript Example:
	 *
	 * {
	 *   test: /\.tsx?$/,
	 *   exclude: /(node_modules|.webpack)/,
	 *   loaders: [{
	 *     loader: 'ts-loader',
	 *     options: {
	 *       transpileOnly: true
	 *     }
	 *   }]
	 * }
	 */
];
