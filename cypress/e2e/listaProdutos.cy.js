import loginPage from '../support/pages/LoginPage'
import homePage from '../support/pages/HomePage'
import listaPage from '../support/pages/ListaProdutosPage'

describe('Lista de produtos', () => {
  const sufixo = `${Date.now()}`
  const produtosBase = [
    { nome: `QA Teclado ${sufixo}`, preco: 150, descricao: 'Teclado mecânico', quantidade: 10 },
    { nome: `QA Mouse ${sufixo}`, preco: 80, descricao: 'Mouse sem fio', quantidade: 10 },
    { nome: `QA Monitor ${sufixo}`, preco: 900, descricao: 'Monitor 24"', quantidade: 10 },
  ]

  let admin
  let tokenAdmin
  let cliente
  let produtos = []

  before(() => {
    cy.criarUsuario(true).then((u) => {
      admin = u
      cy.obterToken(admin).then((token) => {
        tokenAdmin = token
        produtosBase.forEach((p) => {
          cy.criarProduto(tokenAdmin, p).then((criado) => produtos.push(criado))
        })
      })
    })
    cy.criarUsuario(false).then((u) => {
      cliente = u
    })
  })

  after(() => {
    produtos.forEach(({ _id }) => cy.excluirProduto(tokenAdmin, _id))
    if (cliente) cy.excluirUsuario(cliente._id)
    if (admin) cy.excluirUsuario(admin._id)
  })

  context('Caminho feliz', () => {
    it('deve logar, adicionar produtos pela home e exibir todos na lista', () => {
      loginPage.visitar()
      loginPage.logar(cliente.email, cliente.password)
      cy.location('pathname').should('eq', '/home')

      produtos.forEach((produto) => {
        homePage.adicionarProduto(produto.nome)
        cy.location('pathname').should('eq', '/minhaListaDeProdutos')
        listaPage.elements.paginaInicial().click()
        cy.location('pathname').should('eq', '/home')
      })

      homePage.elements.menuListaDeCompras().click()
      cy.location('pathname').should('eq', '/minhaListaDeProdutos')
      listaPage.elements.titulo().should('be.visible')
      listaPage.elements.nomes().should('have.length', produtos.length)
      produtos.forEach(({ nome, preco }) => listaPage.validarItem(nome, 1, preco))
    })

    it('deve agrupar o mesmo produto adicionado duas vezes, somando a quantidade', () => {
      const [produto] = produtos
      cy.visitarAutenticado('/home', cliente)

      homePage.adicionarProduto(produto.nome)
      listaPage.elements.paginaInicial().click()
      homePage.adicionarProduto(produto.nome)

      listaPage.elements.nomes().should('have.length', 1)
      listaPage.validarItem(produto.nome, 2, produto.preco)
    })

    it('deve aumentar e diminuir a quantidade de um produto na lista', () => {
      const [produto] = produtos
      cy.visitarAutenticado('/home', cliente)
      homePage.adicionarProduto(produto.nome)

      listaPage.aumentar(produto.nome)
      listaPage.aumentar(produto.nome)
      listaPage.validarItem(produto.nome, 3, produto.preco)

      listaPage.diminuir(produto.nome)
      listaPage.validarItem(produto.nome, 2, produto.preco)
    })

    it('deve limpar a lista de produtos', () => {
      cy.visitarAutenticado('/home', cliente)
      homePage.adicionarProduto(produtos[0].nome)
      listaPage.elements.paginaInicial().click()
      homePage.adicionarProduto(produtos[1].nome)

      listaPage.elements.nomes().should('have.length', 2)
      listaPage.elements.limparLista().click()

      listaPage.elements.mensagemVazia().should('have.text', 'Seu carrinho está vazio')
      listaPage.elements.nomes().should('not.exist')
    })

    it('deve exibir os botões de ação quando a lista possui produtos', () => {
      cy.visitarAutenticado('/home', cliente)
      homePage.adicionarProduto(produtos[0].nome)

      listaPage.elements.adicionarNoCarrinho().should('be.visible').and('be.enabled')
      listaPage.elements.limparLista().should('be.visible').and('be.enabled')
      listaPage.elements.paginaInicial().should('be.visible').and('be.enabled')
    })
  })

  context('Caminho não feliz', () => {
    it('deve exibir mensagem de lista vazia quando nenhum produto foi adicionado', () => {
      cy.visitarAutenticado('/minhaListaDeProdutos', cliente)

      listaPage.elements.mensagemVazia().should('have.text', 'Seu carrinho está vazio')
      listaPage.elements.nomes().should('not.exist')
      listaPage.elements.limparLista().should('not.exist')
    })

    it('não deve exibir produtos ao pesquisar um nome inexistente', () => {
      cy.visitarAutenticado('/home', cliente)
      homePage.pesquisarProduto(`Produto Inexistente ${sufixo}`)

      cy.contains('Nenhum produto foi encontrado').should('be.visible')
      homePage.elements.adicionarNaLista().should('not.exist')
    })

    it('deve redirecionar para o login ao acessar a lista sem estar autenticado', () => {
      listaPage.visitar()
      cy.location('pathname').should('eq', '/login')
    })

    it('deve redirecionar para o login ao acessar a home sem estar autenticado', () => {
      cy.visit('/home')
      cy.location('pathname').should('eq', '/login')
    })

    it('deve esvaziar a lista após logout', () => {
      cy.visitarAutenticado('/home', cliente)
      homePage.adicionarProduto(produtos[0].nome)

      homePage.elements.logout().click()
      cy.location('pathname').should('eq', '/login')

      loginPage.logar(cliente.email, cliente.password)
      cy.location('pathname').should('eq', '/home')
      homePage.elements.menuListaDeCompras().click()
      listaPage.elements.mensagemVazia().should('be.visible')
    })

    // BUG conhecido: Cart.deleteItem filtra por `id`, mas os itens são salvos com `_id`
    // (front/src/services/cart.js), então o produto nunca é removido. Reativar após a correção.
    it.skip('[BUG] deve remover o produto da lista ao diminuir a quantidade abaixo de 1', () => {
      const [produto] = produtos
      cy.visitarAutenticado('/home', cliente)
      homePage.adicionarProduto(produto.nome)

      listaPage.diminuir(produto.nome)

      listaPage.elements.mensagemVazia().should('be.visible')
    })
  })
})
