class CadastroProdutoPage {
  elements = {
    titulo: () => cy.contains('h1', 'Cadastro de Produtos'),
    nome: () => cy.get('[data-testid="nome"]'),
    preco: () => cy.get('[data-testid="preco"]'),
    descricao: () => cy.get('[data-testid="descricao"]'),
    quantidade: () => cy.get('[data-testid="quantity"]'),
    imagem: () => cy.get('[data-testid="imagem"]'),
    cadastrar: () => cy.get('[data-testid="cadastarProdutos"]'),
    alertasErro: () => cy.get('.alert[role="alert"]'),
  }

  visitar() {
    cy.visit('/admin/cadastrarprodutos')
  }

  preencher({ nome, preco, descricao, quantidade, imagem }) {
    if (nome !== undefined) this.elements.nome().clear().type(nome)
    if (preco !== undefined) this.elements.preco().clear().type(preco)
    if (descricao !== undefined) this.elements.descricao().clear().type(descricao)
    if (quantidade !== undefined) this.elements.quantidade().clear().type(quantidade)
    if (imagem) this.elements.imagem().selectFile(imagem)
  }

  submeter() {
    this.elements.cadastrar().click()
  }

  cadastrar(produto) {
    this.preencher(produto)
    this.submeter()
  }

  validarAlertaErro(mensagem) {
    this.elements.alertasErro().should('contain.text', mensagem)
  }
}

export default new CadastroProdutoPage()
