const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "Int Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/api/",
      "src/notification_worker",
      "src/stocks_job"
    ],
    clearMocks: true,
    setupFilesAfterEnv: [],
    testMatch: [
      "**/*.int.(spec|test).[jt]s?(x)"
    ]
  }
}
