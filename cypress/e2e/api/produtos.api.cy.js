import { produtos } from '../../support/api/serverest'

describe('API - Produtos', () => {
  let dados
  let admin
  let tokenAdmin
  let cliente
  let tokenCliente
  const idsCriados = []

  const novoProduto = (sobrescrever = {}) => ({
    nome: `QA Produto API ${Date.now()}.${Cypress._.random(1e6)}`,
    preco: 120,
    descricao: 'Produto criado pelos testes de API',
    quantidade: 5,
    ...sobrescrever,
  })

  const cadastrar = (body, token = tokenAdmin) =>
    produtos.cadastrar(body, token).then((resposta) => {
      if (resposta.body._id) idsCriados.push(resposta.body._id)
      return resposta
    })

  before(() => {
    cy.fixture('api').then((fixture) => {
      dados = fixture
    })
    cy.apiCriarUsuario(true).then((u) => {
      admin = u
      cy.apiObterToken(u).then((t) => {
        tokenAdmin = t
      })
    })
    cy.apiCriarUsuario(false).then((u) => {
      cliente = u
      cy.apiObterToken(u).then((t) => {
        tokenCliente = t
      })
    })
  })

  after(() => {
    idsCriados.forEach((id) => cy.apiExcluirProduto(tokenAdmin, id))
    if (admin) cy.apiExcluirUsuario(admin._id)
    if (cliente) cy.apiExcluirUsuario(cliente._id)
  })

  context('POST /produtos', () => {
    it('deve cadastrar um produto com token de administrador', () => {
      const produto = novoProduto()
      cadastrar(produto).then(({ status, body }) => {
        expect(status).to.eq(201)
        expect(body.message).to.eq(dados.mensagens.cadastroSucesso)

        produtos.buscar(body._id).its('body').should('deep.eq', { ...produto, _id: body._id })
      })
    })

    it('deve aceitar quantidade zero', () => {
      cadastrar(novoProduto({ quantidade: 0 })).its('status').should('eq', 201)
    })

    it('deve retornar 401 sem token', () => {
      cadastrar(novoProduto(), null).then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body.message).to.eq(dados.mensagens.tokenInvalido)
      })
    })

    it('deve retornar 401 com token inválido', () => {
      cadastrar(novoProduto(), 'Bearer token.invalido').then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body.message).to.eq(dados.mensagens.tokenInvalido)
      })
    })

    it('deve retornar 403 com token de usuário comum', () => {
      const produto = novoProduto()
      cadastrar(produto, tokenCliente).then(({ status, body }) => {
        expect(status).to.eq(403)
        expect(body.message).to.eq(dados.mensagens.rotaAdmin)
      })
      produtos.listar({ nome: produto.nome }).its('body.quantidade').should('eq', 0)
    })

    it('não deve cadastrar produto com nome já existente', () => {
      const produto = novoProduto()
      cadastrar(produto)
      cadastrar(produto).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq(dados.mensagens.produtoDuplicado)
      })
    })

    it('não deve cadastrar sem os campos obrigatórios', () => {
      cadastrar({}).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.deep.eq({
          nome: 'nome é obrigatório',
          preco: 'preco é obrigatório',
          descricao: 'descricao é obrigatório',
          quantidade: 'quantidade é obrigatório',
        })
      })
    })

    const regrasInvalidas = [
      { cenario: 'preço zero', campos: { preco: 0 }, erro: { preco: 'preco deve ser um número positivo' } },
      { cenario: 'preço negativo', campos: { preco: -10 }, erro: { preco: 'preco deve ser um número positivo' } },
      { cenario: 'preço decimal', campos: { preco: 10.5 }, erro: { preco: 'preco deve ser um inteiro' } },
      {
        cenario: 'quantidade negativa',
        campos: { quantidade: -1 },
        erro: { quantidade: 'quantidade deve ser maior ou igual a 0' },
      },
      {
        cenario: 'nome e descrição em branco',
        campos: { nome: '', descricao: '' },
        erro: { nome: 'nome não pode ficar em branco', descricao: 'descricao não pode ficar em branco' },
      },
    ]

    regrasInvalidas.forEach(({ cenario, campos, erro }) => {
      it(`não deve cadastrar com ${cenario}`, () => {
        cadastrar(novoProduto(campos)).then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body).to.deep.eq(erro)
        })
      })
    })
  })

  context('GET /produtos', () => {
    it('deve filtrar a listagem pelo nome', () => {
      const produto = novoProduto()
      cadastrar(produto)
      produtos.listar({ nome: produto.nome }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.quantidade).to.eq(1)
        expect(body.produtos[0]).to.include(produto)
      })
    })

    it('deve retornar 400 ao buscar um id inexistente', () => {
      produtos.buscar('AAAAAAAAAAAAAAAA').then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq(dados.mensagens.produtoNaoEncontrado)
      })
    })
  })

  context('PUT /produtos/{_id}', () => {
    it('deve alterar um produto', () => {
      cadastrar(novoProduto()).then(({ body: { _id } }) => {
        const alterado = novoProduto({ preco: 999, quantidade: 1 })
        produtos.editar(_id, alterado, tokenAdmin).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body.message).to.eq(dados.mensagens.alteracaoSucesso)
        })
        produtos.buscar(_id).its('body').should('deep.eq', { ...alterado, _id })
      })
    })

    it('deve retornar 401 ao alterar sem token', () => {
      cadastrar(novoProduto()).then(({ body: { _id } }) => {
        produtos.editar(_id, novoProduto(), null).its('status').should('eq', 401)
      })
    })
  })

  context('DELETE /produtos/{_id}', () => {
    it('deve excluir um produto', () => {
      cadastrar(novoProduto()).then(({ body: { _id } }) => {
        produtos.excluir(_id, tokenAdmin).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body.message).to.eq(dados.mensagens.exclusaoSucesso)
        })
        produtos.buscar(_id).its('status').should('eq', 400)
      })
    })

    it('deve informar que nenhum registro foi excluído para id inexistente', () => {
      produtos.excluir('AAAAAAAAAAAAAAAA', tokenAdmin).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.message).to.eq(dados.mensagens.nenhumaExclusao)
      })
    })

    it('deve retornar 403 ao excluir com token de usuário comum', () => {
      cadastrar(novoProduto()).then(({ body: { _id } }) => {
        produtos.excluir(_id, tokenCliente).then(({ status, body }) => {
          expect(status).to.eq(403)
          expect(body.message).to.eq(dados.mensagens.rotaAdmin)
        })
      })
    })
  })
})
