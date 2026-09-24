import loginPage from '../../support/pages/LoginPage'

describe('Login', () => {
  let dados

  before(() => {
    cy.fixture('login').then((fixture) => {
      dados = fixture
    })
  })

  beforeEach(() => {
    cy.intercept('POST', `${Cypress.expose('apiUrl')}/login`).as('login')
    loginPage.visitar()
  })

  context('Elementos da página', () => {
    it('deve exibir o campo de email habilitado e do tipo email', () => {
      loginPage.elements
        .email()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'email')
        .and('have.attr', 'placeholder', 'Digite seu email')
    })

    it('deve exibir o campo de senha habilitado e mascarado', () => {
      loginPage.elements
        .senha()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'password')
        .and('have.attr', 'placeholder', 'Digite sua senha')
    })

    it('deve exibir o botão Entrar habilitado', () => {
      loginPage.elements
        .entrar()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'submit')
        .and('contain.text', 'Entrar')
    })

    it('deve exibir o botão Cadastre-se ativo', () => {
      loginPage.elements
        .cadastrar()
        .should('be.visible')
        .and('contain.text', 'Cadastre-se')
        .and('not.have.class', 'disabled')
        .and('not.have.attr', 'disabled')
    })
  })

  context('Caminho feliz', () => {
    let usuario

    afterEach(() => {
      if (usuario) cy.apiExcluirUsuario(usuario._id)
    })

    it('deve logar um usuário comum e redirecionar para a home', () => {
      cy.apiCriarUsuario(false).then((u) => {
        usuario = u
        loginPage.logar(u.email, u.password)

        cy.wait('@login')
        cy.location('pathname').should('eq', '/home')
        cy.contains('h1', 'Serverest Store').should('be.visible')
        cy.get('[data-testid="logout"]').should('be.visible')
        cy.window().its('localStorage')
          .invoke('getItem', 'serverest/userToken')
          .should('match', /^Bearer /)
      })
    })

    it('deve logar um usuário administrador e redirecionar para a home admin', () => {
      cy.apiCriarUsuario(true).then((u) => {
        usuario = u
        loginPage.logar(u.email, u.password)

        cy.wait('@login')
        cy.location('pathname').should('eq', '/admin/home')
        cy.contains('h1', `Bem Vindo ${u.nome}`).should('be.visible')
        cy.get('[data-testid="logout"]').should('be.visible')
      })
    })

    it('deve submeter o login ao pressionar Enter no campo de senha', () => {
      cy.apiCriarUsuario(false).then((u) => {
        usuario = u
        loginPage.preencherEmail(u.email)
        loginPage.elements.senha().type(`${u.password}{enter}`, { log: false })

        cy.wait('@login')
        cy.location('pathname').should('eq', '/home')
      })
    })
  })

  context('Caminho não feliz', () => {
    it('não deve logar com email e senha em branco', () => {
      loginPage.submeter()

      cy.wait('@login')
      loginPage.validarAlerta(dados.mensagens.emailObrigatorio)
      loginPage.validarAlerta(dados.mensagens.senhaObrigatoria)
      cy.location('pathname').should('eq', '/login')
    })

    it('não deve logar com email em branco', () => {
      loginPage.preencherSenha(dados.senhaInvalida)
      loginPage.submeter()

      cy.wait('@login')
      loginPage.validarAlerta(dados.mensagens.emailObrigatorio)
      loginPage.elements.alertas().should('have.length', 1)
      cy.location('pathname').should('eq', '/login')
    })

    it('não deve logar com senha em branco', () => {
      loginPage.preencherEmail(dados.emailNaoCadastrado)
      loginPage.submeter()

      cy.wait('@login')
      loginPage.validarAlerta(dados.mensagens.senhaObrigatoria)
      loginPage.elements.alertas().should('have.length', 1)
      cy.location('pathname').should('eq', '/login')
    })

    it('não deve logar com email não cadastrado', () => {
      loginPage.logar(dados.emailNaoCadastrado, dados.senhaInvalida)

      cy.wait('@login')
      loginPage.validarAlerta(dados.mensagens.credenciaisInvalidas)
      cy.location('pathname').should('eq', '/login')
    })

    it('não deve logar com senha incorreta', () => {
      cy.apiCriarUsuario(false).then((u) => {
        loginPage.logar(u.email, dados.senhaInvalida)

        cy.wait('@login')
        loginPage.validarAlerta(dados.mensagens.credenciaisInvalidas)
        cy.location('pathname').should('eq', '/login')
        cy.apiExcluirUsuario(u._id)
      })
    })

    it('não deve enviar a requisição com email em formato inválido', () => {
      loginPage.logar('email-invalido', dados.senhaInvalida)

      loginPage.elements.email().then(($input) => {
        expect($input[0].checkValidity()).to.be.false
        expect($input[0].validationMessage).to.not.be.empty
      })
      cy.get('@login.all').should('have.length', 0)
      cy.location('pathname').should('eq', '/login')
    })

    it('deve fechar a mensagem de erro ao clicar no X', () => {
      loginPage.logar(dados.emailNaoCadastrado, dados.senhaInvalida)
      cy.wait('@login')

      loginPage.validarAlerta(dados.mensagens.credenciaisInvalidas)
      cy.get('.btn-close-error-alert').click()
      loginPage.elements.alertas().should('not.exist')
    })
  })

  context('Cadastro', () => {
    it('deve redirecionar para a página de cadastro ao clicar em Cadastre-se', () => {
      loginPage.elements.cadastrar().click()

      cy.location('pathname').should('eq', '/cadastrarusuarios')
      cy.get('[data-testid="nome"]').should('be.visible')
      cy.get('[data-testid="cadastrar"]').should('be.visible').and('contain.text', 'Cadastrar')
    })
  })
})
