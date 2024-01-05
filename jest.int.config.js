const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "Integration Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/b3_stock_alerts/",
    ],
    clearMocks: true,
    setupFilesAfterEnv: [],
    testMatch: [
      "**/__tests__/**/*.int.(spec|test).[jt]s?(x)"
    ]
  }
}
