const path = require("path");
const webpack = require("webpack");

module.exports = (config) => {
  // Modify the existing configuration
  config.mode = "development";
  config.entry = {
    main: path.join(__dirname, "./src/index.ts"),
  };
  config.resolve.extensions.push(".ts", ".js");
  // remove es2015 from list of fields to resolve by in package.json to ignore class-validator es2015 build
  config.resolve.mainFields = ["module", "main"];
  // Add a new rule for TypeScript files
  config.module.rules[0] = {
    test: /\.(js|ts)$/,
    loader: "babel-loader",
    // exclude: /node_modules/,
    // exclude:
    // /node_modules\/(core-js|@babel|class-validator|class-transformer|reflect-metadata)/,
    exclude: {
      and: [/node_modules/],
      not: [
        /class-validator/,
        /class-transformer/,
        /debug/,
        /has-flag/,
        /iso-639-1/,
        /supports-color/,
        // /axios/,
      ],
    },
    options: {
      configFile: path.resolve(__dirname, "babel.config.js"),
    },
  };

  // config.plugins.push(
  //   new webpack.NormalModuleReplacementPlugin(/class-validator/, function (
  //     resource
  //   ) {
  //     resource.request = require.resolve("./empty.js");
  //   })
  // );
  //
  // config.plugins.push(
  //   new webpack.NormalModuleReplacementPlugin(/class-transformer/, function (
  //     resource
  //   ) {
  //     resource.request = require.resolve("./empty.js");
  //   })
  // );

  config.output.environment = {
    arrowFunction: false,
    const: false,
    destructuring: false,
    forOf: false,
    module: false,
  };

  config.output.libraryTarget = "window";

  console.log(config);

  return config;
};
