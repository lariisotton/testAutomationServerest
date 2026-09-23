# Teste de Automação — ServeRest (Cypress)

Projeto de testes automatizados E2E para a aplicação [ServeRest](https://front.serverest.dev/login), desenvolvido com **Cypress** e **JavaScript**.

## Tecnologias

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Cypress](https://www.cypress.io/) 16.x
- JavaScript

## Aplicação sob teste

| Camada   | URL                                  |
| -------- | ------------------------------------ |
| Front-end| https://front.serverest.dev          |
| API      | https://serverest.dev                |

## Pré-requisitos

- Node.js e npm instalados
- Git

## Instalação

```bash
git clone https://github.com/lariisotton/testAutomationServerest.git
cd testAutomationServerest
npm install
```

## Executando os testes

| Comando           | Descrição                                   |
| ----------------- | ------------------------------------------- |
| `npm run cy:open` | Abre o Cypress no modo interativo           |
| `npm run cy:run`  | Executa todos os testes em modo headless    |
| `npm test`        | Alias para `cy:run`                          |

## Estrutura do projeto

```
.
├── cypress/
│   ├── e2e/          # Especificações de teste (*.cy.js)
│   ├── fixtures/     # Massa de dados estática
│   └── support/
│       ├── pages/       # Page Objects (Login, Cadastro, Home, ListaProdutos, CadastroProduto, ListaProdutosAdmin)
│       ├── commands.js  # Comandos customizados (usuários, produtos, login via API)
│       └── e2e.js       # Configurações globais carregadas antes dos testes
├── cypress.config.js # Configuração do Cypress (baseUrl, timeouts, etc.)
├── package.json
└── README.md
```

## Cenários cobertos

### Login (`cypress/e2e/login.cy.js`)

- **Elementos:** campos de email e senha (`data-testid`), botão Entrar e link Cadastre-se visíveis e habilitados
- **Caminho feliz:** login de usuário comum (`/home`) e de administrador (`/admin/home`), login com Enter e token salvo no `localStorage`
- **Caminho não feliz:** campos em branco, email não cadastrado, senha incorreta, email em formato inválido (validação HTML5, sem chamada à API) e fechamento do alerta de erro
- **Cadastro:** o botão Cadastre-se redireciona para `/cadastrarusuarios`

### Cadastro (`cypress/e2e/cadastro.cy.js`)

- **Elementos:** campos nome, email e senha, checkbox de administrador (desmarcado por padrão) e botão Cadastrar habilitados
- **Caminho feliz:** cadastro de usuário comum (redireciona para `/home`) e de administrador (redireciona para `/admin/home`), validando o corpo da requisição e a mensagem de sucesso
- **Caminho não feliz:** todos os campos vazios, sem nome, sem email, sem senha, email já cadastrado, email em formato inválido e fechamento do alerta de erro
- **Navegação:** o link Entrar redireciona para `/login`

### Lista de produtos (`cypress/e2e/listaProdutos.cy.js`)

- **Caminho feliz:** login pela tela, adição de vários produtos pela home (botão `adicionarNaLista`) e validação de nome, quantidade e preço de cada um na lista; agrupamento do mesmo produto; botões + e −; limpar lista
- **Caminho não feliz:** lista vazia, pesquisa sem resultado, acesso à home ou à lista sem login e lista zerada após logout
- **Bug conhecido (teste pulado):** ao diminuir a quantidade de 1 para 0 o produto não é removido, porque `Cart.deleteItem` filtra por `id` em vez de `_id`

Os produtos são criados via API com um administrador de teste e removidos no final.

### Produtos — admin (`cypress/e2e/produtosAdmin.cy.js`)

- **Login como admin:** login pela tela, redirecionamento para `/admin/home` e acesso ao cadastro pela home e pelo menu
- **Elementos:** campos nome, preço, descrição, quantidade e imagem (`data-testid`), campos numéricos que não aceitam letras e botão Cadastrar habilitado
- **Caminho feliz:** cadastro com e sem imagem e com quantidade zero, validando o corpo da requisição e a linha do produto em `/admin/listarprodutos`
- **Caminho não feliz:** todos os campos vazios, cada campo obrigatório ausente, preço zero ou negativo, quantidade negativa, preço decimal (bloqueado pelo HTML5), nome duplicado e fechamento do alerta
- **Controle de acesso:** acesso sem login leva para `/login`; usuário comum recebe "Rota exclusiva para administradores" (403)

Os usuários do caminho feliz são criados via API (ou pela própria tela, no cadastro) e excluídos ao final de cada teste.

## Configuração

As principais configurações ficam em `cypress.config.js`:

- `baseUrl`: `https://front.serverest.dev`
- `expose.apiUrl`: `https://serverest.dev` (usado para preparar massa de dados via API, acessado com `Cypress.expose('apiUrl')`)

> No Cypress 16 o `Cypress.env()` foi removido: valores públicos ficam em `expose` e valores sensíveis devem ser lidos com `cy.env()`.

## Roadmap

- [x] Inicialização do projeto e configuração do Cypress
- [x] Testes de login
- [x] Testes de cadastro de usuários
- [x] Testes de lista de produtos (cliente)
- [x] Testes de produtos (admin)


