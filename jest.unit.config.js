const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "Unit Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/application/"
    ],
    clearMocks: true,
    setupFilesAfterEnv: [],
    testMatch: [
      "**/*.unit.(spec|test).[jt]s?(x)"
    ]
  }
}
