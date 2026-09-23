class ListaProdutosPage {
  elements = {
    titulo: () => cy.contains('h1', 'Lista de Compras'),
    paginaInicial: () => cy.get('[data-testid="paginaInicial"]'),
    limparLista: () => cy.get('[data-testid="limparLista"]'),
    adicionarNoCarrinho: () => cy.get('[data-testid="adicionar carrinho"]'),
    mensagemVazia: () => cy.get('[data-testid="shopping-cart-empty-message"]'),
    nomes: () => cy.get('[data-testid="shopping-cart-product-name"]'),
  }

  visitar() {
    cy.visit('/minhaListaDeProdutos')
  }

  itemDoProduto(nome) {
    return cy.contains('[data-testid="shopping-cart-product-name"]', nome).parents('.card')
  }

  validarItem(nome, quantidade, precoUnitario) {
    this.itemDoProduto(nome).within(() => {
      cy.get('[data-testid="shopping-cart-product-quantity"]').should('contain.text', `Total: ${quantidade}`)
      cy.contains('p', 'Preço R$').should('contain.text', precoUnitario * quantidade)
    })
  }

  aumentar(nome) {
    this.itemDoProduto(nome).find('[data-testid="product-increase-quantity"]').click()
  }

  diminuir(nome) {
    this.itemDoProduto(nome).find('[data-testid="product-decrease-quantity"]').click()
  }
}

export default new ListaProdutosPage()
