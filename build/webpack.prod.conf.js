'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const env = require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
	mode: 'production',
	module: {
		rules: utils.styleLoaders({
			sourceMap: config.build.productionSourceMap,
			extract: true,
			usePostCSS: true
		})
	},
	devtool: config.build.productionSourceMap ? config.build.devtool : false,
	output: {
		path: config.build.assetsRoot,
		filename: utils.assetsPath('js/[name].js'),
		chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
	},
	plugins: [
		// http://vuejs.github.io/vue-loader/en/workflow/production.html
		new webpack.DefinePlugin({
			'process.env': env
		}),
		new MiniCssExtractPlugin({
			filename: utils.assetsPath('css/[name].[contenthash].css'),
			// Setting the following option to `false` will not extract CSS from codesplit chunks.
			// Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
			// It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
			// increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
			filename: "[name].css",
			allChunks: true
		}),
		// Compress extracted CSS. We are using this plugin so that possible
		// duplicated CSS from different components can be deduped.
		new OptimizeCSSPlugin({
			cssProcessorOptions: config.build.productionSourceMap
			? { safe: true, map: { inline: false } }
			: { safe: true }
		}),
		// generate dist index.html with correct asset hash for caching.
		// you can customize output by editing /index.html
		// see https://github.com/ampedandwired/html-webpack-plugin
		new HtmlWebpackPlugin({
			filename: config.build.index,
			template: 'index.html',
			inject: true,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true
				// more options:
				// https://github.com/kangax/html-minifier#options-quick-reference
			},
			// necessary to consistently work with multiple chunks via CommonsChunkPlugin
			chunksSortMode: 'dependency'
		}),
		// keep module.id stable when vendor modules does not change
		new webpack.HashedModuleIdsPlugin(),
		// enable scope hoisting
		new webpack.optimize.ModuleConcatenationPlugin(),
		// copy custom static assets
		new CopyWebpackPlugin(config.common.copyAssetsDir)
	],
	optimization: {
    minimizer: [new TerserPlugin()],
		splitChunks: {
			automaticNameDelimiter: '-',
			// common chunks are extracted from split files only here--which we need so
			// that our console.js entry file doesn't depend on anything else
			chunks: 'async',
			name: true,
			maxAsyncRequests: 3,
			cacheGroups: {
				// split vendor js into its own file
				vendor: {
					name: 'vendor',
					minChunks: 1,
				},
				// This instance extracts shared chunks from code splitted chunks and bundles them
				// in a separate chunk, similar to the vendor chunk
				// see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
				app: {
					name: 'app',
					minChunks: 3,
				},
				// extract webpack runtime and module manifest to its own file in order to
				// prevent vendor hash from being updated whenever app bundle is updated
				manifest: {
					name: 'manifest',
					minChunks: Infinity,
				},
			},
		},
	},
})

if (config.build.productionGzip) {
	const CompressionWebpackPlugin = require('compression-webpack-plugin')

	webpackConfig.plugins.push(
		new CompressionWebpackPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: new RegExp(
				'\\.(' +
				config.build.productionGzipExtensions.join('|') +
				')$'
			),
			threshold: 10240,
			minRatio: 0.8
		})
	)
}

if (config.build.bundleAnalyzerReport) {
	const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
	webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
