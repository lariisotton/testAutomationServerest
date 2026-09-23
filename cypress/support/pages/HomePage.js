class HomePage {
  elements = {
    pesquisar: () => cy.get('[data-testid="pesquisar"]'),
    botaoPesquisar: () => cy.get('[data-testid="botaoPesquisar"]'),
    cards: () => cy.get('.card'),
    adicionarNaLista: () => cy.get('[data-testid="adicionarNaLista"]'),
    menuListaDeCompras: () => cy.get('[data-testid="lista-de-compras"]'),
    logout: () => cy.get('[data-testid="logout"]'),
  }

  pesquisarProduto(nome) {
    cy.intercept('GET', '**/produtos?nome=*').as('pesquisa')
    this.elements.pesquisar().clear().type(nome)
    this.elements.botaoPesquisar().click()
    cy.wait('@pesquisa')
  }

  cardDoProduto(nome) {
    return cy.contains('.card-title', nome).parents('.card')
  }

  adicionarProduto(nome) {
    this.pesquisarProduto(nome)
    this.cardDoProduto(nome).find('[data-testid="adicionarNaLista"]').click()
  }
}

export default new HomePage()
