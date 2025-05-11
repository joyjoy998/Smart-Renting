describe("user case 1: no saved properties or pois", () => {
  beforeEach(() => {
    // 在每个测试前登录
    cy.login();
  });

  it("open sidebar and see user specific features", () => {
    // 打开侧边栏
    cy.openSidebar();

    // 验证侧边栏中有登录用户特有的功能
    cy.contains("Group Management").should("be.visible");
    cy.contains("Recommendation").should("be.visible");
    cy.contains("Settings").should("be.visible");
  });

  it("should be able to use recommendation feature", () => {
    // 打开侧边栏
    cy.openSidebar();

    // 点击推荐功能
    cy.contains("Recommendation").click();

    // 验证推荐弹窗出现
    cy.get('[role="dialog"]').should("be.visible");

    // 这里可以添加更多与推荐功能相关的测试...
  });

  it("should be able to use settings feature", () => {
    // 打开侧边栏
    cy.openSidebar();

    // 点击设置
    cy.contains("Settings").click();

    // 验证设置弹窗出现
    cy.get('[role="dialog"]').should("be.visible");
  });
});
