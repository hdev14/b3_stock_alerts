const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "e2e Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/b3_stock_alerts/",
    ],
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/src/api/e2e_setup.ts"],
    testMatch: [
      "**/*.e2e.(spec|test).[jt]s?(x)"
    ]
  }
}
