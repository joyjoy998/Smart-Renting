describe("Home Page (not logged in)", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should load the home page", () => {
    cy.get("body").should("be.visible");
  });

  it("should have a working search bar", () => {
    cy.get('[data-testid="search-input"]').should("be.visible");
    cy.get('[data-testid="search-input"]').type("Sydney");
    // Wait for search results with a longer timeout
    cy.wait(2000);
    // Verify that search results are visible
    cy.get(".MuiAutocomplete-popper").should("be.visible");
  });

  it("should toggle dark mode", () => {
    cy.get("#theme-toggle").should("be.visible");
    cy.get("html").then(($html) => {
      const initialTheme = $html.attr("class")?.includes("dark")
        ? "dark"
        : "light";
      cy.get("#theme-toggle").click();
      cy.get("html").should(($html2) => {
        const newTheme = $html2.attr("class")?.includes("dark")
          ? "dark"
          : "light";
        expect(newTheme).to.not.equal(initialTheme);
      });
    });
  });

  it("should show sign in modal when clicking avatar button", () => {
    cy.get('[data-testid="avatar-button"]').click();
    cy.contains("Sign in to Smart Renting").should("be.visible");
    cy.contains("Google").should("be.visible");
  });

  it("should show sign in modal when clicking sidebar menu button", () => {
    cy.get("#sidebar-menu-button").click();
    cy.contains("Sign in to Smart Renting").should("be.visible");
    cy.contains("Google").should("be.visible");
  });

  it("should not show recommendation button in sidebar", () => {
    // 点击侧边栏按钮
    cy.get("#sidebar-menu-button").click();

    // 验证推荐按钮不存在
    cy.get("#recommendation").should("not.exist");
  });
});
