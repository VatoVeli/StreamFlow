// const { ProvidePlugin } = require('webpack');

// module.exports = function (config, env) {
//     return {
//         ...config,
//         module: {
//             ...config.module,
//             rules: [
//                 ...config.module.rules,
//                 {
//                     test: /.(m?js|ts|tsx)$/,
//                     enforce: 'pre',
//                     use: ['source-map-loader'],
//                 },
//             ],
//         },
//         plugins: [
//             ...config.plugins,
//             new ProvidePlugin({
//                 process: 'process/browser',
//             }),
//         ],
//         resolve: {
//             ...config.resolve,
//             fallback: {
//                 assert: require.resolve('assert'),
//                 buffer: require.resolve('buffer'),
//             },
//         },
//         ignoreWarnings: [/Failed to parse source map/],
//     };
// };

const webpack = require("webpack")

module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
    }
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ]
    // console.log(config.resolve)
    // console.log(config.plugins)

    return config
}