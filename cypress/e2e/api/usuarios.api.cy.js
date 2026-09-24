import { usuarios } from '../../support/api/serverest'

describe('API - Usuários', () => {
  let dados
  const idsCriados = []

  const cadastrarNovo = (sobrescrever = {}) =>
    cy.gerarUsuario().then((u) => {
      const body = { ...u, administrador: 'false', ...sobrescrever }
      return usuarios.cadastrar(body).then((resposta) => {
        if (resposta.body._id) idsCriados.push(resposta.body._id)
        return { body, resposta }
      })
    })

  before(() => {
    cy.fixture('api').then((fixture) => {
      dados = fixture
    })
  })

  after(() => {
    idsCriados.forEach((id) => cy.apiExcluirUsuario(id))
  })

  context('POST /usuarios', () => {
    it('deve cadastrar um usuário comum', () => {
      cadastrarNovo().then(({ resposta }) => {
        expect(resposta.status).to.eq(201)
        expect(resposta.body.message).to.eq(dados.mensagens.cadastroSucesso)
        expect(resposta.body._id).to.match(/^[a-zA-Z0-9]{16}$/)
      })
    })

    it('deve cadastrar um usuário administrador', () => {
      cadastrarNovo({ administrador: 'true' }).then(({ resposta }) => {
        expect(resposta.status).to.eq(201)
        usuarios.buscar(resposta.body._id).its('body.administrador').should('eq', 'true')
      })
    })

    it('não deve cadastrar com email já utilizado', () => {
      cadastrarNovo().then(({ body }) => {
        usuarios.cadastrar({ ...body, nome: 'Outro' }).then(({ status, body: resposta }) => {
          expect(status).to.eq(400)
          expect(resposta.message).to.eq(dados.mensagens.emailEmUso)
        })
      })
    })

    it('não deve cadastrar sem os campos obrigatórios', () => {
      usuarios.cadastrar({}).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.deep.eq({
          nome: 'nome é obrigatório',
          email: 'email é obrigatório',
          password: 'password é obrigatório',
          administrador: 'administrador é obrigatório',
        })
      })
    })

    it('não deve cadastrar com campos em branco', () => {
      usuarios.cadastrar({ nome: '', email: '', password: '', administrador: 'false' }).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.deep.eq({
          nome: 'nome não pode ficar em branco',
          email: 'email não pode ficar em branco',
          password: 'password não pode ficar em branco',
        })
      })
    })

    it('não deve cadastrar com email em formato inválido', () => {
      usuarios
        .cadastrar({ nome: 'QA', email: 'email-invalido', password: 'Senha@123', administrador: 'false' })
        .then(({ status, body }) => {
          expect(status).to.eq(400)
          expect(body.email).to.eq('email deve ser um email válido')
        })
    })

    it('não deve cadastrar com administrador diferente de true ou false', () => {
      cadastrarNovo({ administrador: 'sim' }).then(({ resposta }) => {
        expect(resposta.status).to.eq(400)
        expect(resposta.body.administrador).to.eq("administrador deve ser 'true' ou 'false'")
      })
    })
  })

  context('GET /usuarios', () => {
    it('deve buscar um usuário pelo id', () => {
      cadastrarNovo().then(({ body, resposta }) => {
        usuarios.buscar(resposta.body._id).then(({ status, body: usuario }) => {
          expect(status).to.eq(200)
          expect(usuario).to.deep.eq({ ...body, _id: resposta.body._id })
        })
      })
    })

    it('deve filtrar a listagem pelo email', () => {
      cadastrarNovo().then(({ body }) => {
        usuarios.listar({ email: body.email }).then(({ status, body: lista }) => {
          expect(status).to.eq(200)
          expect(lista.quantidade).to.eq(1)
          expect(lista.usuarios[0].email).to.eq(body.email)
        })
      })
    })

    it('deve retornar 400 ao buscar um id inexistente', () => {
      usuarios.buscar('AAAAAAAAAAAAAAAA').then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.message).to.eq(dados.mensagens.usuarioNaoEncontrado)
      })
    })

    it('deve retornar 400 ao buscar com id em formato inválido', () => {
      usuarios.buscar('abc').then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.id).to.eq('id deve ter exatamente 16 caracteres alfanuméricos')
      })
    })
  })

  context('PUT /usuarios/{_id}', () => {
    it('deve alterar os dados de um usuário', () => {
      cadastrarNovo().then(({ body, resposta }) => {
        const id = resposta.body._id
        usuarios.editar(id, { ...body, nome: 'QA Editado' }).then(({ status, body: edicao }) => {
          expect(status).to.eq(200)
          expect(edicao.message).to.eq(dados.mensagens.alteracaoSucesso)
        })
        usuarios.buscar(id).its('body.nome').should('eq', 'QA Editado')
      })
    })

    it('não deve alterar para um email já utilizado por outro usuário', () => {
      cadastrarNovo().then(({ body: primeiro }) => {
        cadastrarNovo().then(({ body: segundo, resposta }) => {
          usuarios.editar(resposta.body._id, { ...segundo, email: primeiro.email }).then(({ status, body }) => {
            expect(status).to.eq(400)
            expect(body.message).to.eq(dados.mensagens.emailEmUso)
          })
        })
      })
    })
  })

  context('DELETE /usuarios/{_id}', () => {
    it('deve excluir um usuário', () => {
      cadastrarNovo().then(({ resposta }) => {
        const id = resposta.body._id
        usuarios.excluir(id).then(({ status, body }) => {
          expect(status).to.eq(200)
          expect(body.message).to.eq(dados.mensagens.exclusaoSucesso)
        })
        usuarios.buscar(id).its('status').should('eq', 400)
      })
    })

    it('deve informar que nenhum registro foi excluído para id inexistente', () => {
      usuarios.excluir('AAAAAAAAAAAAAAAA').then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.message).to.eq(dados.mensagens.nenhumaExclusao)
      })
    })
  })
})
