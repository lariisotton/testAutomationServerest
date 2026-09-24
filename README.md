# Automação de Testes — ServeRest (Cypress)

Projeto de testes automatizados E2E para a aplicação [ServeRest](https://front.serverest.dev/login), desenvolvido com **Cypress** e **JavaScript**.

## Tecnologias

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Cypress](https://www.cypress.io/) 16.x
- JavaScript
- [cypress-plugin-api](https://github.com/filiphric/cypress-plugin-api) — exibe requisições e respostas dos testes de API na interface do Cypress

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

| Comando                | Descrição                                        |
| ---------------------- | ------------------------------------------------ |
| `npm run cy:open`      | Abre o Cypress no modo interativo                |
| `npm test`             | Executa todos os testes (front + API) headless   |
| `npm run test:front`   | Executa apenas os testes de front-end (E2E)      |
| `npm run test:api`     | Executa apenas os testes de back-end (API)       |

## Estratégia: front x back

Os testes são separados pela camada que validam:

| Camada | Pasta | O que valida | O que **não** valida |
| ------ | ----- | ------------ | -------------------- |
| **Front-end** | `cypress/e2e/front/` | Elementos da tela (`data-testid`), mensagens exibidas, redirecionamentos, dados que a tela envia, validações do navegador (HTML5) e `localStorage` | Status HTTP e regras de negócio da API |
| **Back-end** | `cypress/e2e/api/` | Status HTTP, corpo das respostas, regras de validação, autenticação e autorização (401/403) e CRUD completo | Interface |

Nos testes de front a API é usada apenas para **preparar e limpar a massa de dados** (comandos com prefixo `api` em `commands.js`, ex.: `cy.apiCriarUsuario()`), e o `cy.intercept` serve só para sincronizar a tela com a requisição.

## Estrutura do projeto

```
.
├── cypress/
│   ├── e2e/
│   │   ├── front/            # Testes E2E da interface
│   │   │   ├── login.cy.js
│   │   │   ├── cadastro.cy.js
│   │   │   ├── listaProdutos.cy.js
│   │   │   └── produtosAdmin.cy.js
│   │   └── api/              # Testes da API ServeRest
│   │       ├── login.api.cy.js
│   │       ├── usuarios.api.cy.js
│   │       └── produtos.api.cy.js
│   ├── fixtures/             # Massa de dados e mensagens esperadas
│   └── support/
│       ├── api/serverest.js  # Cliente da API (cy.api) usado pelos testes de back
│       ├── pages/            # Page Objects usados pelos testes de front
│       ├── commands.js       # Comandos customizados (prefixo `api` = chamada à API)
│       └── e2e.js            # Configurações globais carregadas antes dos testes
├── cypress.config.js         # Configuração do Cypress (baseUrl, timeouts, etc.)
├── package.json
└── README.md
```

## Cenários cobertos — Front-end (`cypress/e2e/front/`)

### Login (`login.cy.js`)

- **Elementos:** campos de email e senha (`data-testid`), botão Entrar e link Cadastre-se visíveis e habilitados
- **Caminho feliz:** login de usuário comum (`/home`) e de administrador (`/admin/home`), login com Enter e token salvo no `localStorage`
- **Caminho não feliz:** campos em branco, email não cadastrado, senha incorreta, email em formato inválido (validação HTML5, sem chamada à API) e fechamento do alerta de erro
- **Cadastro:** o botão Cadastre-se redireciona para `/cadastrarusuarios`

### Cadastro (`cadastro.cy.js`)

- **Elementos:** campos nome, email e senha, checkbox de administrador (desmarcado por padrão) e botão Cadastrar habilitados
- **Caminho feliz:** cadastro de usuário comum (redireciona para `/home`) e de administrador (redireciona para `/admin/home`), validando o corpo enviado pela tela e a mensagem de sucesso
- **Caminho não feliz:** todos os campos vazios, sem nome, sem email, sem senha, email já cadastrado, email em formato inválido e fechamento do alerta de erro
- **Navegação:** o link Entrar redireciona para `/login`

### Lista de produtos (`listaProdutos.cy.js`)

- **Caminho feliz:** login pela tela, adição de vários produtos pela home (botão `adicionarNaLista`) e validação de nome, quantidade e preço de cada um na lista; agrupamento do mesmo produto; botões + e −; limpar lista
- **Caminho não feliz:** lista vazia, pesquisa sem resultado, acesso à home ou à lista sem login e lista zerada após logout
- **Bug conhecido (sem teste automatizado):** ao diminuir a quantidade de 1 para 0 o produto não é removido, porque `Cart.deleteItem` filtra por `id` em vez de `_id`

### Produtos — admin (`produtosAdmin.cy.js`)

- **Login como admin:** login pela tela, redirecionamento para `/admin/home` e acesso ao cadastro pela home e pelo menu
- **Elementos:** campos nome, preço, descrição, quantidade e imagem (`data-testid`), campos numéricos que não aceitam letras e botão Cadastrar habilitado
- **Caminho feliz:** cadastro com e sem imagem e com quantidade zero, validando o corpo enviado pela tela e a linha do produto em `/admin/listarprodutos`
- **Caminho não feliz:** todos os campos vazios, cada campo obrigatório ausente, preço zero ou negativo, quantidade negativa, preço decimal (bloqueado pelo HTML5), nome duplicado e fechamento do alerta
- **Controle de acesso:** acesso sem login leva para `/login`; usuário comum vê a mensagem "Rota exclusiva para administradores"

## Cenários cobertos — Back-end (`cypress/e2e/api/`)

### Login (`login.api.cy.js`) — `POST /login`

- **Caminho feliz:** 200 com token `Bearer` (JWT)
- **Caminho não feliz:** 401 com senha incorreta ou email não cadastrado; 400 com campos ausentes, em branco ou email inválido

### Usuários (`usuarios.api.cy.js`) — `/usuarios`

- **POST:** cadastro de usuário comum e administrador; 400 para email duplicado, campos ausentes, em branco, email inválido e `administrador` diferente de `true`/`false`
- **GET:** busca por id, filtro por email, id inexistente e id em formato inválido
- **PUT:** alteração de dados e bloqueio de email já utilizado
- **DELETE:** exclusão e id inexistente ("Nenhum registro excluído")

### Produtos (`produtos.api.cy.js`) — `/produtos`

- **POST:** cadastro com token de admin e quantidade zero; 401 sem token ou com token inválido; 403 com usuário comum; 400 para nome duplicado, campos ausentes, preço zero, negativo ou decimal, quantidade negativa e campos em branco
- **GET:** filtro por nome e id inexistente
- **PUT:** alteração de produto e 401 sem token
- **DELETE:** exclusão, id inexistente e 403 com usuário comum

Toda massa criada (usuários e produtos) é excluída ao final dos testes.

## Configuração

As principais configurações ficam em `cypress.config.js`:

- `baseUrl`: `https://front.serverest.dev`
- `expose.apiUrl`: `https://serverest.dev` (usado para preparar massa de dados via API, acessado com `Cypress.expose('apiUrl')`)

> No Cypress 16 o `Cypress.env()` foi removido: valores públicos ficam em `expose` e valores sensíveis devem ser lidos com `cy.env()`.




