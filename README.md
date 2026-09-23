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
│       ├── commands.js  # Comandos customizados
│       └── e2e.js       # Configurações globais carregadas antes dos testes
├── cypress.config.js # Configuração do Cypress (baseUrl, timeouts, etc.)
├── package.json
└── README.md
```

## Configuração

As principais configurações ficam em `cypress.config.js`:

- `baseUrl`: `https://front.serverest.dev`
- `env.apiUrl`: `https://serverest.dev` (usado para preparar massa de dados via API)

Variáveis sensíveis podem ser definidas localmente em `cypress.env.json` (ignorado pelo Git).

## Roadmap

- [x] Inicialização do projeto e configuração do Cypress
- [ ] Testes de login
- [ ] Testes de cadastro de usuários
- [ ] Testes de produtos (admin)
- [ ] Comandos customizados e Page Objects
- [ ] Relatórios e integração contínua (GitHub Actions)
