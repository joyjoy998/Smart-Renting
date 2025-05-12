describe("Home Page (not logged in)", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("should load the home page", () => {
    cy.get("body").should("be.visible");
  });

  it("should have a working search bar", () => {
    // Wait for the search input to be visible
    cy.get('input[role="combobox"]', { timeout: 10000 }).should("be.visible");

    // Simulate typing into the search box
    cy.get('input[role="combobox"]').type("sydney");

    // Add a wait to ensure search results have time to load
    cy.wait(1000);
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
    // Wait for the avatar button to be visible
    cy.get('[data-testid="avatar-button"]', { timeout: 10000 }).should(
      "be.visible"
    );

    // Click the avatar button
    cy.get('[data-testid="avatar-button"]').click();

    // Verify that the sign-in modal is visible
    cy.contains("Sign in to").should("be.visible");
  });

  it("should show sign in modal when clicking sidebar menu button", () => {
    cy.get('[data-testid="sidebar-menu-button"]').click();
    cy.contains("Sign in to").should("be.visible");
  });

  it("should not show recommendation button in sidebar", () => {
    // Click the sidebar menu button
    cy.get('[data-testid="sidebar-menu-button"]').click();

    // Verify that the recommendation button does not exist
    cy.get("#recommendation").should("not.exist");
  });
});
