import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // 添加两个重要配置：
    testIsolation: false, // 禁用测试隔离，保持浏览器会话
    chromeWebSecurity: false, // 禁用Chrome的网络安全限制
  },

  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,

  // 默认使用Chrome浏览器
  defaultBrowser: "chrome",

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
