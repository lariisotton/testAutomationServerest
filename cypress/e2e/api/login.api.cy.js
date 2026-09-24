import { login } from '../../support/api/serverest'

describe('API - Login', () => {
  let dados
  let usuario

  before(() => {
    cy.fixture('api').then((fixture) => {
      dados = fixture
    })
    cy.apiCriarUsuario(false).then((u) => {
      usuario = u
    })
  })

  after(() => {
    if (usuario) cy.apiExcluirUsuario(usuario._id)
  })

  context('Caminho feliz', () => {
    it('deve autenticar com credenciais válidas e retornar um token Bearer', () => {
      login({ email: usuario.email, password: usuario.password }).then(({ status, body }) => {
        expect(status).to.eq(200)
        expect(body.message).to.eq(dados.mensagens.loginSucesso)
        expect(body.authorization).to.match(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/)
      })
    })
  })

  context('Caminho não feliz', () => {
    it('deve retornar 401 com senha incorreta', () => {
      login({ email: usuario.email, password: 'SenhaErrada@1' }).then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body).to.deep.eq({ message: dados.mensagens.credenciaisInvalidas })
      })
    })

    it('deve retornar 401 com email não cadastrado', () => {
      login({ email: `inexistente.${Date.now()}@teste.com`, password: 'Senha@123' }).then(({ status, body }) => {
        expect(status).to.eq(401)
        expect(body.message).to.eq(dados.mensagens.credenciaisInvalidas)
      })
    })

    it('deve retornar 400 quando email e senha não são enviados', () => {
      login({}).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.deep.eq({
          email: 'email é obrigatório',
          password: 'password é obrigatório',
        })
      })
    })

    it('deve retornar 400 quando email e senha estão em branco', () => {
      login({ email: '', password: '' }).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body).to.deep.eq({
          email: 'email não pode ficar em branco',
          password: 'password não pode ficar em branco',
        })
      })
    })

    it('deve retornar 400 com email em formato inválido', () => {
      login({ email: 'email-invalido', password: 'Senha@123' }).then(({ status, body }) => {
        expect(status).to.eq(400)
        expect(body.email).to.eq('email deve ser um email válido')
      })
    })
  })
})
