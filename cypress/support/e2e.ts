// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "cypress-localstorage-commands";

// 配置Cypress捕获JavaScript错误
Cypress.on("uncaught:exception", (err, runnable) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  console.error("Error stack:", err.stack);

  // 返回false阻止Cypress终止测试
  return false;
});
