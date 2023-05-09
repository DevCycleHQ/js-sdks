console.log("BABEL RUNNING!");
module.exports = {
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
    ["@babel/plugin-proposal-decorators", { version: "legacy" }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-proposal-object-rest-spread",
  ],
};
