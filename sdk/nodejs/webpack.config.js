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
    use: {
      loader: "babel-loader",
      options: {
        configFile: path.resolve(__dirname, "babel.config.js"),
      },
    },
  };

  console.log(config.module.rules);

  return config;
};
