const apiUrl = () => Cypress.expose('apiUrl')

// Gera dados únicos de usuário (sem criar na API)
Cypress.Commands.add('gerarUsuario', (administrador = false) => {
  return cy.wrap({
    nome: 'QA Automação',
    email: `qa.${Date.now()}.${Cypress._.random(1e6)}@teste.com`,
    password: 'Senha@123',
    administrador,
  })
})

// Cria um usuário via API e devolve { nome, email, password, administrador, _id }
Cypress.Commands.add('criarUsuario', (administrador = false) => {
  return cy.gerarUsuario(administrador).then((usuario) =>
    cy
      .request('POST', `${apiUrl()}/usuarios`, { ...usuario, administrador: String(administrador) })
      .then(({ status, body }) => {
        expect(status).to.eq(201)
        return { ...usuario, _id: body._id }
      })
  )
})

Cypress.Commands.add('excluirUsuario', (id) => {
  cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/usuarios/${id}`,
    failOnStatusCode: false,
  })
})

