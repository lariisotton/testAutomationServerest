const url = (rota) => `${Cypress.expose('apiUrl')}${rota}`

const requisicao = (method, rota, { body, token, qs } = {}) =>
  cy.api({
    method,
    url: url(rota),
    body,
    qs,
    headers: token ? { Authorization: token } : {},
    failOnStatusCode: false,
  })

export const login = (body) => requisicao('POST', '/login', { body })

export const usuarios = {
  listar: (qs) => requisicao('GET', '/usuarios', { qs }),
  buscar: (id) => requisicao('GET', `/usuarios/${id}`),
  cadastrar: (body) => requisicao('POST', '/usuarios', { body }),
  editar: (id, body) => requisicao('PUT', `/usuarios/${id}`, { body }),
  excluir: (id) => requisicao('DELETE', `/usuarios/${id}`),
}

export const produtos = {
  listar: (qs) => requisicao('GET', '/produtos', { qs }),
  buscar: (id) => requisicao('GET', `/produtos/${id}`),
  cadastrar: (body, token) => requisicao('POST', '/produtos', { body, token }),
  editar: (id, body, token) => requisicao('PUT', `/produtos/${id}`, { body, token }),
  excluir: (id, token) => requisicao('DELETE', `/produtos/${id}`, { token }),
}
