import loginPage from '../support/pages/LoginPage'
import cadastroProdutoPage from '../support/pages/CadastroProdutoPage'
import listaProdutosAdminPage from '../support/pages/ListaProdutosAdminPage'

describe('Produtos (admin)', () => {
  let dados
  let admin
  let tokenAdmin
  let idsCriados = []

  const novoProduto = (sobrescrever = {}) => ({
    nome: `QA Headset ${Date.now()}`,
    ...dados.produto,
    ...sobrescrever,
  })

  // Guarda o _id do produto criado pela tela para excluir no final
  const aguardarCadastro = (statusEsperado) =>
    cy.wait('@cadastroProduto').then(({ response }) => {
      if (response.body._id) idsCriados.push(response.body._id)
      if (statusEsperado) expect(response.statusCode).to.eq(statusEsperado)
      return cy.wrap(response)
    })

  before(() => {
    cy.fixture('produtos').then((fixture) => {
      dados = fixture
    })
    cy.criarUsuario(true).then((u) => {
      admin = u
      cy.obterToken(admin).then((token) => {
        tokenAdmin = token
      })
    })
  })

  beforeEach(() => {
    cy.intercept('POST', `${Cypress.expose('apiUrl')}/produtos`).as('cadastroProduto')
  })

  after(() => {
    idsCriados.forEach((id) => cy.excluirProduto(tokenAdmin, id))
    if (admin) cy.excluirUsuario(admin._id)
  })

  context('Login como administrador', () => {
    it('deve logar como admin e acessar o cadastro de produtos pela home', () => {
      loginPage.visitar()
      loginPage.logar(admin.email, admin.password)

      cy.location('pathname').should('eq', '/admin/home')
      cy.contains('h1', `Bem Vindo ${admin.nome}`).should('be.visible')
      cy.get('[data-testid="cadastrarProdutos"]').click()

      cy.location('pathname').should('eq', '/admin/cadastrarprodutos')
      cadastroProdutoPage.elements.titulo().should('be.visible')
    })

    it('deve acessar o cadastro de produtos pelo menu de navegação', () => {
      cy.visitarAutenticado('/admin/home', admin)
      cy.get('[data-testid="cadastrar-produtos"]').click()

      cy.location('pathname').should('eq', '/admin/cadastrarprodutos')
      cadastroProdutoPage.elements.titulo().should('be.visible')
    })
  })

  context('Elementos da página', () => {
    beforeEach(() => {
      cy.visitarAutenticado('/admin/cadastrarprodutos', admin)
    })

    it('deve exibir o campo nome habilitado', () => {
      cadastroProdutoPage.elements
        .nome()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'text')
        .and('have.attr', 'placeholder', 'Digite o nome do produto')
    })

    it('deve exibir o campo preço habilitado e numérico', () => {
      cadastroProdutoPage.elements
        .preco()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'placeholder', 'Digite o valor do produto')
    })

    it('deve exibir o campo descrição como área de texto', () => {
      cadastroProdutoPage.elements
        .descricao()
        .should('be.visible')
        .and('be.enabled')
        .and('match', 'textarea')
        .and('have.attr', 'placeholder', 'Digite a descrição do produto')
    })

    it('deve exibir o campo quantidade habilitado e numérico', () => {
      cadastroProdutoPage.elements
        .quantidade()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'number')
    })

    it('deve exibir o campo imagem do tipo arquivo', () => {
      cadastroProdutoPage.elements
        .imagem()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'file')
    })

    it('não deve aceitar letras nos campos numéricos', () => {
      cadastroProdutoPage.elements.preco().type('abc').should('have.value', '')
      cadastroProdutoPage.elements.quantidade().type('abc').should('have.value', '')
    })

    it('deve exibir o botão Cadastrar habilitado', () => {
      cadastroProdutoPage.elements
        .cadastrar()
        .should('be.visible')
        .and('be.enabled')
        .and('have.attr', 'type', 'submit')
        .and('contain.text', 'Cadastrar')
    })
  })

  context('Caminho feliz', () => {
    beforeEach(() => {
      cy.visitarAutenticado('/admin/cadastrarprodutos', admin)
    })

    it('deve cadastrar um produto e exibi-lo na listagem', () => {
      const produto = novoProduto()
      cadastroProdutoPage.cadastrar(produto)

      aguardarCadastro(201).then(() => {
        cy.get('@cadastroProduto').its('request.body').should('deep.include', {
          nome: produto.nome,
          preco: String(produto.preco),
          descricao: produto.descricao,
          quantidade: String(produto.quantidade),
        })
      })

      cy.location('pathname').should('eq', '/admin/listarprodutos')
      listaProdutosAdminPage.elements.titulo().should('be.visible')
      listaProdutosAdminPage.validarProduto(produto)
    })

    it('deve cadastrar um produto com imagem', () => {
      const produto = novoProduto({ imagem: 'cypress/fixtures/produto.png' })
      cadastroProdutoPage.cadastrar(produto)

      aguardarCadastro(201)
      cy.get('@cadastroProduto').its('request.body.imagem').should('contain', 'produto.png')
      cy.location('pathname').should('eq', '/admin/listarprodutos')
      listaProdutosAdminPage.linhaDoProduto(produto.nome).should('contain.text', 'produto.png')
    })

    it('deve cadastrar um produto com quantidade zero', () => {
      const produto = novoProduto({ quantidade: 0 })
      cadastroProdutoPage.cadastrar(produto)

      aguardarCadastro(201)
      cy.location('pathname').should('eq', '/admin/listarprodutos')
      listaProdutosAdminPage.validarProduto(produto)
    })

    it('deve disponibilizar o produto cadastrado para o cliente', () => {
      const produto = novoProduto()
      cadastroProdutoPage.cadastrar(produto)
      aguardarCadastro(201)

      cy.request(`${Cypress.expose('apiUrl')}/produtos?nome=${encodeURIComponent(produto.nome)}`)
        .its('body.produtos')
        .should('have.length', 1)
    })
  })

  context('Caminho não feliz', () => {
    beforeEach(() => {
      cy.visitarAutenticado('/admin/cadastrarprodutos', admin)
    })

    it('deve exibir erros de todos os campos obrigatórios ao cadastrar vazio', () => {
      cadastroProdutoPage.submeter()

      aguardarCadastro(400)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.nomeObrigatorio)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.precoObrigatorio)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.descricaoObrigatoria)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.quantidadeObrigatoria)
      cadastroProdutoPage.elements.alertasErro().should('have.length', 4)
      cy.location('pathname').should('eq', '/admin/cadastrarprodutos')
    })

    const camposObrigatorios = [
      { campo: 'nome', mensagem: 'nomeObrigatorio' },
      { campo: 'preco', mensagem: 'precoObrigatorio' },
      { campo: 'descricao', mensagem: 'descricaoObrigatoria' },
      { campo: 'quantidade', mensagem: 'quantidadeObrigatoria' },
    ]

    camposObrigatorios.forEach(({ campo, mensagem }) => {
      it(`não deve cadastrar sem o campo ${campo}`, () => {
        const produto = novoProduto({ [campo]: undefined })
        cadastroProdutoPage.cadastrar(produto)

        aguardarCadastro(400)
        cadastroProdutoPage.validarAlertaErro(dados.mensagens[mensagem])
        cadastroProdutoPage.elements.alertasErro().should('have.length', 1)
      })
    })

    it('não deve cadastrar com preço zero', () => {
      cadastroProdutoPage.cadastrar(novoProduto({ preco: 0 }))

      aguardarCadastro(400)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.precoPositivo)
    })

    it('não deve cadastrar com preço negativo', () => {
      cadastroProdutoPage.cadastrar(novoProduto({ preco: -10 }))

      aguardarCadastro(400)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.precoPositivo)
    })

    it('não deve cadastrar com quantidade negativa', () => {
      cadastroProdutoPage.cadastrar(novoProduto({ quantidade: -1 }))

      aguardarCadastro(400)
      cadastroProdutoPage.validarAlertaErro(dados.mensagens.quantidadeMinima)
    })

    it('não deve enviar a requisição com preço decimal', () => {
      cadastroProdutoPage.cadastrar(novoProduto({ preco: '10.5' }))

      cadastroProdutoPage.elements.preco().then(($input) => {
        expect($input[0].checkValidity()).to.be.false
        expect($input[0].validity.stepMismatch).to.be.true
      })
      cy.get('@cadastroProduto.all').should('have.length', 0)
    })

    it('não deve cadastrar produto com nome já existente', () => {
      const produto = novoProduto()
      cy.criarProduto(tokenAdmin, produto).then(({ _id }) => {
        idsCriados.push(_id)

        cadastroProdutoPage.cadastrar(produto)

        aguardarCadastro(400)
        cadastroProdutoPage.validarAlertaErro(dados.mensagens.nomeDuplicado)
        cy.location('pathname').should('eq', '/admin/cadastrarprodutos')
      })
    })

    it('deve fechar a mensagem de erro ao clicar no X', () => {
      cadastroProdutoPage.submeter()
      aguardarCadastro(400)

      cadastroProdutoPage.elements.alertasErro().should('have.length', 4)
      cy.get('.btn-close-error-alert').first().click()
      cadastroProdutoPage.elements.alertasErro().should('have.length', 3)
    })
  })

  context('Controle de acesso', () => {
    it('deve redirecionar para o login ao acessar o cadastro sem estar autenticado', () => {
      cadastroProdutoPage.visitar()
      cy.location('pathname').should('eq', '/login')
    })

    it('não deve permitir que um usuário comum cadastre produtos', () => {
      cy.criarUsuario(false).then((cliente) => {
        cy.visitarAutenticado('/admin/cadastrarprodutos', cliente)
        const produto = novoProduto()
        cadastroProdutoPage.cadastrar(produto)

        aguardarCadastro(403)
        cadastroProdutoPage.validarAlertaErro(dados.mensagens.rotaAdmin)
        cy.request(`${Cypress.expose('apiUrl')}/produtos?nome=${encodeURIComponent(produto.nome)}`)
          .its('body.produtos')
          .should('have.length', 0)

        cy.excluirUsuario(cliente._id)
      })
    })
  })
})
