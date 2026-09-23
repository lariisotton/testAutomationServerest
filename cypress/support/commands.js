const apiUrl = () => Cypress.expose('apiUrl')

// Cria um usuário via API e devolve { nome, email, password, administrador, _id }
Cypress.Commands.add('criarUsuario', (administrador = false) => {
  const usuario = {
    nome: 'QA Automação',
    email: `qa.${Date.now()}.${Cypress._.random(1e6)}@teste.com`,
    password: 'Senha@123',
    administrador: String(administrador),
  }

  return cy
    .request('POST', `${apiUrl()}/usuarios`, usuario)
    .then(({ status, body }) => {
      expect(status).to.eq(201)
      return { ...usuario, _id: body._id }
    })
})

Cypress.Commands.add('excluirUsuario', (id) => {
  cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/usuarios/${id}`,
    failOnStatusCode: false,
  })
})
