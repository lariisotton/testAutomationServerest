import cadastroPage from '../../support/pages/CadastroPage'

describe('Cadastro de usuários', () => {
  let dados
  let idCriado

  before(() => {
    cy.fixture('cadastro').then((fixture) => {
      dados = fixture
    })
  })

  beforeEach(() => {
    idCriado = null
    cy.intercept('POST', `${Cypress.expose('apiUrl')}/usuarios`).as('cadastro')
    cadastroPage.visitar()
  })

  afterEach(() => {
    if (idCriado) cy.apiExcluirUsuario(idCriado)
  })

  context('Elementos da página', () => {
    it('deve exibir o campo nome habilitado', () => {
      cadastroPage.elements
        .nome()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'text')
        .and('have.attr', 'placeholder', 'Digite seu nome')
    })

    it('deve exibir o campo email habilitado e do tipo email', () => {
      cadastroPage.elements
        .email()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'email')
        .and('have.attr', 'placeholder', 'Digite seu email')
    })

    it('deve exibir o campo senha habilitado e mascarado', () => {
      cadastroPage.elements
        .senha()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'password')
        .and('have.attr', 'placeholder', 'Digite sua senha')
    })

    it('deve exibir o checkbox de administrador desmarcado por padrão', () => {
      cadastroPage.elements
        .administrador()
        .should('be.visible')
        .and('be.enabled')
        .and('not.be.checked')
      cy.contains('label', 'Cadastrar como administrador?').should('be.visible')
    })

    it('deve permitir marcar e desmarcar o checkbox de administrador', () => {
      cadastroPage.elements.administrador().check().should('be.checked')
      cadastroPage.elements.administrador().uncheck().should('not.be.checked')
    })

    it('deve exibir o botão Cadastrar habilitado', () => {
      cadastroPage.elements
        .cadastrar()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'submit')
        .and('contain.text', 'Cadastrar')
    })
  })

  context('Caminho feliz', () => {
    it('deve cadastrar um usuário não administrador e redirecionar para a home', () => {
      cy.gerarUsuario(false).then((usuario) => {
        cadastroPage.cadastrar(usuario)

        cy.wait('@cadastro').then(({ request, response }) => {
          idCriado = response.body._id
          expect(request.body).to.deep.eq({
            nome: usuario.nome,
            email: usuario.email,
            password: usuario.password,
            administrador: 'false',
          })
        })

        cadastroPage.elements.alertaSucesso().should('contain.text', dados.mensagens.sucesso)
        cy.location('pathname', { timeout: 10000 }).should('eq', '/home')
        cy.contains('h1', 'Serverest Store').should('be.visible')
      })
    })

    it('deve cadastrar um usuário administrador e redirecionar para a home admin', () => {
      cy.gerarUsuario(true).then((usuario) => {
        cadastroPage.cadastrar(usuario)

        cy.wait('@cadastro').then(({ request, response }) => {
          idCriado = response.body._id
          expect(request.body.administrador).to.eq('true')
        })

        cadastroPage.elements.alertaSucesso().should('contain.text', dados.mensagens.sucesso)
        cy.location('pathname', { timeout: 10000 }).should('eq', '/admin/home')
        cy.contains('h1', `Bem Vindo ${usuario.nome}`).should('be.visible')
      })
    })
  })

  context('Caminho não feliz', () => {
    it('deve exibir erros de todos os campos obrigatórios ao salvar vazio', () => {
      cadastroPage.submeter()

      cy.wait('@cadastro')
      cadastroPage.validarAlertaErro(dados.mensagens.nomeObrigatorio)
      cadastroPage.validarAlertaErro(dados.mensagens.emailObrigatorio)
      cadastroPage.validarAlertaErro(dados.mensagens.senhaObrigatoria)
      cadastroPage.elements.alertasErro().should('have.length', 3)
      cy.location('pathname').should('eq', '/cadastrarusuarios')
    })

    it('não deve cadastrar sem nome', () => {
      cy.gerarUsuario().then(({ email, password }) => {
        cadastroPage.cadastrar({ email, password })

        cy.wait('@cadastro')
        cadastroPage.validarAlertaErro(dados.mensagens.nomeObrigatorio)
        cadastroPage.elements.alertasErro().should('have.length', 1)
      })
    })

    it('não deve cadastrar sem email', () => {
      cy.gerarUsuario().then(({ nome, password }) => {
        cadastroPage.cadastrar({ nome, password })

        cy.wait('@cadastro')
        cadastroPage.validarAlertaErro(dados.mensagens.emailObrigatorio)
        cadastroPage.elements.alertasErro().should('have.length', 1)
      })
    })

    it('não deve cadastrar sem senha', () => {
      cy.gerarUsuario().then(({ nome, email }) => {
        cadastroPage.cadastrar({ nome, email })

        cy.wait('@cadastro')
        cadastroPage.validarAlertaErro(dados.mensagens.senhaObrigatoria)
        cadastroPage.elements.alertasErro().should('have.length', 1)
      })
    })

    it('não deve cadastrar com email já utilizado', () => {
      cy.apiCriarUsuario(false).then((existente) => {
        cadastroPage.cadastrar({ nome: 'Outro Nome', email: existente.email, password: 'Outra@123' })

        cy.wait('@cadastro')
        cadastroPage.validarAlertaErro(dados.mensagens.emailEmUso)
        cy.location('pathname').should('eq', '/cadastrarusuarios')
        cy.apiExcluirUsuario(existente._id)
      })
    })

    it('não deve enviar a requisição com email em formato inválido', () => {
      cadastroPage.cadastrar({ nome: 'QA', email: 'email-invalido', password: 'Senha@123' })

      cadastroPage.elements.email().then(($input) => {
        expect($input[0].checkValidity()).to.be.false
        expect($input[0].validationMessage).to.not.be.empty
      })
      cy.get('@cadastro.all').should('have.length', 0)
      cy.location('pathname').should('eq', '/cadastrarusuarios')
    })

    it('deve fechar a mensagem de erro ao clicar no X', () => {
      cadastroPage.submeter()
      cy.wait('@cadastro')

      cadastroPage.elements.alertasErro().should('have.length', 3)
      cy.get('.btn-close-error-alert').first().click()
      cadastroPage.elements.alertasErro().should('have.length', 2)
    })
  })

  context('Navegação', () => {
    it('deve redirecionar para o login ao clicar em Entrar', () => {
      cadastroPage.elements.entrar().click()

      cy.location('pathname').should('eq', '/login')
      cy.get('[data-testid="senha"]').should('be.visible')
    })
  })
})
