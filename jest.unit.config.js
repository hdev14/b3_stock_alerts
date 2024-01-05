const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "Unit Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/api/",
      "src/notification_worker",
      "src/stocks_job"
    ],
    clearMocks: true,
    setupFilesAfterEnv: [],
    testMatch: [
      "**/__tests__/**/*.unit.(spec|test).[jt]s?(x)"
    ]
  }
}
