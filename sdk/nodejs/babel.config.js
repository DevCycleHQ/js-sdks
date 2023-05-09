console.log("BABEL RUNNING!");
module.exports = {
  sourceType: "unambiguous",
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          rhino: "1.7",
        },
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties"],
    ["@babel/plugin-proposal-private-property-in-object"],
    ["@babel/plugin-proposal-private-methods"],
    "@babel/plugin-proposal-object-rest-spread",
  ],
};
