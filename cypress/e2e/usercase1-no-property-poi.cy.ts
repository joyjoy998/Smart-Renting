describe("user case 1: no saved properties or pois", () => {
  before(() => {
    cy.visit("http://localhost:3000");

    // 点击 Sign In 按钮
    cy.get('[data-testid="avatar-button"]', { timeout: 15000 })
      .first()
      .click({ force: true });

    // 等待并输入邮箱（通过 id 定位 input）
    cy.get('[id="identifier-field"]', { timeout: 20000 })
      .should("be.visible")
      .type(Cypress.env("EMAIL"));

    cy.get("button.cl-formButtonPrimary", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    // 输入密码
    cy.get('input[name="password"]', { timeout: 15000 })
      .should("be.visible")
      .type(Cypress.env("PASSWORD"));

    cy.get("button.cl-formButtonPrimary", { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });

    // 登录成功验证
    cy.get('[data-testid="sidebar-menu-button"]', { timeout: 60000 }).should(
      "be.visible"
    );
    cy.log("login success");
  });

  it("open sidebar and see user specific features", () => {
    // 打开侧边栏
    cy.get('[data-testid="sidebar-menu-button"]').first().click();

    // 验证侧边栏中有登录用户特有的功能
    cy.contains("Group Management").should("be.visible");
    cy.contains("Recommendation").should("be.visible");
    cy.contains("Saved POI").should("be.visible");
    cy.contains("Saved Property").should("be.visible");
    cy.contains("Comparison Report").should("be.visible");
    cy.contains("Help/Guidance").should("be.visible");
    cy.contains("Settings").should("be.visible");
    //关闭侧边栏
    cy.get("button:has(.h-4.w-4)").click();
  });

  it("should be able to use recommendation feature", () => {
    // 打开侧边栏
    cy.get('[data-testid="sidebar-menu-button"]').first().click();
    // 点击推荐功能
    cy.contains("Recommendation").click();

    // 验证推荐弹窗出现
    cy.get('[role="dialog"]').should("be.visible");

    //关闭侧边栏
    cy.get("button:has(.h-4.w-4)").click();
  });

  it("should be able to use settings feature", () => {
    // 打开侧边栏
    cy.get('[data-testid="sidebar-menu-button"]').first().click();

    // 点击设置
    cy.contains("Settings").click();

    // 验证设置弹窗出现
    cy.get('[role="dialog"]').should("be.visible");

    //关闭侧边栏
    cy.get("button:has(.h-4.w-4)").click();
  });

  it("should open info window and save POI", () => {
    // Simulate a click on the map to open an info window
    cy.get('[data-testid="map"]').then(($map) => {
      const width = $map.width();
      const height = $map.height();
      if (width && height) {
        const randomX = Math.floor(Math.random() * width);
        const randomY = Math.floor(Math.random() * height);
        cy.wrap($map).click(randomX, randomY);
      }
    });

    // Verify the info window is visible
    cy.get("[role='dialog']").should("be.visible");

    // Click the save POI button
    cy.get("#savePOIButton").click();

    // Click a random POI type
    cy.get("#save-poi").within(() => {
      cy.get("li").then(($items) => {
        const randomIndex = Math.floor(Math.random() * $items.length);
        cy.wrap($items[randomIndex]).click();
      });
    });
  });

  it("should open info window and save property", () => {
    // Simulate a click on a random visible property marker
    cy.get('[data-testid^="property-marker-"]').then(($markers) => {
      const randomIndex = Math.floor(Math.random() * $markers.length);
      cy.wrap($markers[randomIndex]).click();
    });

    // Verify the info window is visible
    cy.get("[role='dialog']").should("be.visible");

    // Click the save property button
    cy.get("#savePropertyButton").click();
  });

  after(() => {
    // 打开侧边栏
    cy.get('[data-testid="sidebar-menu-button"]').first().click();

    // 点击 Sign Out
    cy.contains("Sign Out").click();

    // 验证用户已注销
    cy.get('[data-testid="avatar-button"]', { timeout: 15000 }).should(
      "be.visible"
    );
    cy.log("signout success");
  });
});
