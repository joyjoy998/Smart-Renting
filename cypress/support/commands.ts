/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// 添加登录命令，可在所有测试文件中使用
Cypress.Commands.add(
  "login",
  (email = "bipic69888@daupload.com", password = "zhuyushuzhuyushu") => {
    // 访问应用首页
    cy.visit("/");

    // 等待页面加载
    cy.wait(2000);

    // 点击登录按钮打开登录模态框
    cy.contains("Sign In").click();

    // 等待登录模态框加载
    cy.wait(1000);

    // Clerk登录框一般在iframe中，需要先进入iframe
    cy.get('iframe[class*="cl-"]').then(($iframe) => {
      const $body = $iframe.contents().find("body");

      // 在iframe内操作 - 点击邮箱登录选项
      cy.wrap($body).find('button:contains("Email")').click({ force: true });

      // 输入邮箱
      cy.wrap($body).find('input[name="email"]').type(email);

      // 点击继续
      cy.wrap($body).find('button:contains("Continue")').click({ force: true });

      // 输入密码
      cy.wrap($body).find('input[name="password"]').type(password);

      // 点击登录
      cy.wrap($body).find('button[type="submit"]').click({ force: true });
    });

    // 等待登录成功并重定向
    cy.wait(5000);

    // 验证登录成功 - 侧边栏按钮应该可见
    cy.get("button:has(svg)").first().should("be.visible");
  }
);

// 辅助函数：打开侧边栏
Cypress.Commands.add("openSidebar", () => {
  cy.get("button:has(svg)").first().click();
  cy.wait(500); // 等待侧边栏打开
});

// 辅助函数：检查特定元素是否存在于侧边栏中
Cypress.Commands.add("assertSidebarContains", (selector) => {
  cy.openSidebar();
  cy.get(selector).should("be.visible");
});

declare global {
  namespace Cypress {
    interface Chainable {
      // 只声明已实现的命令
      login(email?: string, password?: string): Chainable<void>;
      openSidebar(): Chainable<void>;
      assertSidebarContains(selector: string): Chainable<void>;
    }
  }
}

export {};
