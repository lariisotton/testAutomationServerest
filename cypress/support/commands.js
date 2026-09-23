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

// Faz login via API e devolve o token (Bearer ...)
Cypress.Commands.add('obterToken', ({ email, password }) => {
  return cy
    .request('POST', `${apiUrl()}/login`, { email, password })
    .its('body.authorization')
})

// Visita uma rota já autenticado, injetando o token no localStorage
Cypress.Commands.add('visitarAutenticado', (rota, usuario) => {
  cy.obterToken(usuario).then((token) => {
    cy.visit(rota, {
      onBeforeLoad(win) {
        win.localStorage.setItem('serverest/userEmail', usuario.email)
        win.localStorage.setItem('serverest/userToken', token)
      },
    })
  })
})

// Cria um produto via API (requer token de administrador)
Cypress.Commands.add('criarProduto', (token, produto) => {
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

Cypress.Commands.add('excluirProduto', (token, id) => {
  cy.request({
    method: 'DELETE',
    url: `${apiUrl()}/produtos/${id}`,
    headers: { Authorization: token },
    failOnStatusCode: false,
  })
})
