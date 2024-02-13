const rootConfig = require("./jest.config.js");

module.exports = {
  ...rootConfig,
  ...{
    displayName: "e2e Tests",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "src/application/views"
    ],
    clearMocks: true,
    setupFilesAfterEnv: ["<rootDir>/src/application/setup_e2e_api.ts"],
    testMatch: [
      "<rootDir>src/application/routers/*.e2e.(spec|test).[jt]s?(x)"
    ]
  }
}
