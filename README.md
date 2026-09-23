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
│       ├── pages/       # Page Objects (ex.: LoginPage.js)
│       ├── commands.js  # Comandos customizados (criarUsuario, excluirUsuario)
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

Os usuários do caminho feliz são criados via API antes de cada teste e excluídos em seguida.

## Configuração

As principais configurações ficam em `cypress.config.js`:

- `baseUrl`: `https://front.serverest.dev`
- `expose.apiUrl`: `https://serverest.dev` (usado para preparar massa de dados via API, acessado com `Cypress.expose('apiUrl')`)

> No Cypress 16 o `Cypress.env()` foi removido: valores públicos ficam em `expose` e valores sensíveis devem ser lidos com `cy.env()`.

## Roadmap

- [x] Inicialização do projeto e configuração do Cypress
- [x] Testes de login
- [ ] Testes de cadastro de usuários
- [ ] Testes de produtos (admin)
- [ ] Comandos customizados e Page Objects
- [ ] Relatórios e integração contínua (GitHub Actions)
