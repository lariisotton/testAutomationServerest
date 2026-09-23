class LoginPage {
  elements = {
    email: () => cy.get('[data-testid="email"]'),
    senha: () => cy.get('[data-testid="senha"]'),
    entrar: () => cy.get('[data-testid="entrar"]'),
    cadastrar: () => cy.get('[data-testid="cadastrar"]'),
    alertas: () => cy.get('.alert[role="alert"]'),
  }

  visitar() {
    cy.visit('/login')
  }

  preencherEmail(email) {
    this.elements.email().clear().type(email)
  }

  preencherSenha(senha) {
    this.elements.senha().clear().type(senha, { log: false })
  }

  submeter() {
    this.elements.entrar().click()
  }

  logar(email, senha) {
    this.preencherEmail(email)
    this.preencherSenha(senha)
    this.submeter()
  }

  validarAlerta(mensagem) {
    this.elements.alertas().should('contain.text', mensagem)
  }
}

export default new LoginPage()
