class ListaProdutosAdminPage {
  elements = {
    titulo: () => cy.contains('h1', 'Lista dos Produtos'),
  }

  linhaDoProduto(nome) {
    return cy.contains('table tbody tr td:first-child', nome).parent('tr')
  }

  validarProduto({ nome, preco, descricao, quantidade }) {
    this.linhaDoProduto(nome)
      .should('be.visible')
      .find('td')
      .then(($colunas) => {
        expect($colunas.eq(0)).to.have.text(nome)
        expect($colunas.eq(1)).to.have.text(String(preco))
        expect($colunas.eq(2)).to.have.text(descricao)
        expect($colunas.eq(3)).to.have.text(String(quantidade))
      })
  }
}

export default new ListaProdutosAdminPage()
