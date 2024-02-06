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
    setupFilesAfterEnv: ["<rootDir>/src/application/e2e_setup.ts"],
    testMatch: [
      "<rootDir>src/application/routers/*.e2e.(spec|test).[jt]s?(x)"
    ]
  }
}
