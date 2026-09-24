const apiUrl = () => Cypress.expose('apiUrl')

Cypress.Commands.add('gerarUsuario', (administrador = false) => {
  return cy.wrap({
    nome: 'QA Automação',
    email: `qa.${Date.now()}.${Cypress._.random(1e6)}@teste.com`,
    password: 'Senha@123',
    administrador,
  })
})

Cypress.Commands.add('apiCriarUsuario', (administrador = false) => {
  return cy.gerarUsuario(administrador).then((usuario) =>
    cy
      .request('POST', `${apiUrl()}/usuarios`, { ...usuario, administrador: String(administrador) })
      .then(({ status, body }) => {
        expect(status).to.eq(201)
        return { ...usuario, _id: body._id }
      })
  )
})

Cypress.Commands.add('apiExcluirUsuario', (id) => {
  cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/usuarios/${id}`,
    failOnStatusCode: false,
  })
})

Cypress.Commands.add('apiObterToken', ({ email, password }) => {
  return cy
    .request('POST', `${apiUrl()}/login`, { email, password })
    .its('body.authorization')
})

Cypress.Commands.add('visitarAutenticado', (rota, usuario) => {
  cy.apiObterToken(usuario).then((token) => {
    cy.visit(rota, {
      onBeforeLoad(win) {
        win.localStorage.setItem('serverest/userEmail', usuario.email)
        win.localStorage.setItem('serverest/userToken', token)
      },
    })
  })
})

Cypress.Commands.add('apiCriarProduto', (token, produto) => {
  return cy
    .request({
      method: 'POST',
      url: `${apiUrl()}/produtos`,
      headers: { Authorization: token },
      body: produto,
    })
    .then(({ status, body }) => {
      expect(status).to.eq(201)
      return { ...produto, _id: body._id }
    })
})

Cypress.Commands.add('apiExcluirProduto', (token, id) => {
  cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/produtos/${id}`,
    headers: { Authorization: token },
    failOnStatusCode: false,
  })
})
