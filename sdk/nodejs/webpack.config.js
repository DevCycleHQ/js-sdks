const path = require("path");

module.exports = (config) => {
  // Modify the existing configuration
  config.mode = "development";
  config.entry = {
    main: path.join(__dirname, "./src/index.ts"),
  };
  config.resolve.extensions.push(".ts", ".js");
  // Add a new rule for TypeScript files
  config.module.rules[0] = {
    test: /\.(js|ts)$/,
    loader: "babel-loader",
    // exclude: /node_modules/,
    exclude: /node_modules\/(core-js|@babel)/,
    options: {
      configFile: path.resolve(__dirname, "babel.config.js"),
    },
  };

  config.output.environment = {
    arrowFunction: false,
    const: false,
    destructuring: false,
    forOf: false,
    module: false,
  };

  console.log(config);

  return config;
};
