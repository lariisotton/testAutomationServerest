class CadastroPage {
  elements = {
    nome: () => cy.get('[data-testid="nome"]'),
    email: () => cy.get('[data-testid="email"]'),
    senha: () => cy.get('[data-testid="password"]'),
    administrador: () => cy.get('[data-testid="checkbox"]'),
    cadastrar: () => cy.get('[data-testid="cadastrar"]'),
    entrar: () => cy.get('[data-testid="entrar"]'),
    alertaSucesso: () => cy.get('.alert-primary'),
    alertasErro: () => cy.get('.alert[role="alert"]'),
  }

  visitar() {
    cy.visit('/cadastrarusuarios')
  }

  preencher({ nome, email, password, administrador = false }) {
    if (nome) this.elements.nome().clear().type(nome)
    if (email) this.elements.email().clear().type(email)
    if (password) this.elements.senha().clear().type(password, { log: false })
    if (administrador) this.elements.administrador().check()
  }

  submeter() {
    this.elements.cadastrar().click()
  }

  cadastrar(usuario) {
    this.preencher(usuario)
    this.submeter()
  }

  validarAlertaErro(mensagem) {
    this.elements.alertasErro().should('contain.text', mensagem)
  }
}

export default new CadastroPage()
