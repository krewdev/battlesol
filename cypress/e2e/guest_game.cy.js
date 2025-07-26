describe('Guest Game Launch', () => {
  it('should allow a guest to launch a game and see the game board', () => {
    cy.visit('/');
    cy.contains(/play as guest/i).click();
    cy.contains(/launch battle|start game|play/i, { matchCase: false }).click({ force: true });
    // Wait for game board to appear
    cy.get('.game-board, [data-testid="game-board"], .board').should('exist');
    // Optionally check for ship placement phase
    cy.contains(/place your ships|placing ships/i, { matchCase: false }).should('exist');
  });
});