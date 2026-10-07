<div align="center">
  <h1>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
    <br>
    Gatherly - Backend 🇺🇸
  </h1>
  <p>Repository for the backend of the Gatherly application</p>
</div>

## 🏗️ Architecture

The backend follows a modular, feature-oriented structure. Each feature owns its HTTP endpoints and the code directly related to them:

```text
gatherly-api/src/
├── auth/
├── user/
├── security/
├── config/
├── common/
├── app.module.ts
└── main.ts
```

**Responsibilities:**
- `auth/` and `user/` are feature modules. Inside each module, code is grouped by responsibility:
  - `controllers/` handles HTTP requests and responses and delegates work to services.
  - `dto/` defines and validates the shape of data accepted by HTTP endpoints.
  - `services/` implements application and business behavior for the feature.
  - `repositories/` encapsulates persistence queries and operations.
  - `schemas/` defines MongoDB/Mongoose document structures.
  - `guards/`, `strategies/`, and `types/` contain authentication-specific authorization, Passport/JWT strategy, and types under `auth/`.
  - `<feature>.module.ts` declares the feature's controllers, providers, imports, and exports.
- `security/` contains reusable security capabilities, such as password hashing, that can be used by multiple features.
- `config/` holds application configuration, including `registerAs` configuration files under `config/keys/`, and its configuration module.
- `common/` is reserved for components genuinely shared across the application, such as global exception filters. Feature-specific code should stay in its feature module.
- `app.module.ts` composes the application modules; `main.ts` bootstraps the NestJS application.

**Adding or extending a layer:**
- For behavior belonging to an existing feature, add the code under that feature's responsibility folder. If a responsibility needs a new category, create a folder inside that feature (for example, `auth/guards/`) rather than adding an unnecessary top-level architecture layer.
- For a new feature, create a new directory under `src/`, organize its files by responsibility, add its NestJS module, and import that module in `app.module.ts`.
- Register new controllers, providers, imports, or exports in the owning feature's module. Add a dependency to `common/` only when it is genuinely shared; keep reusable security utilities in `security/`.
- Add a new architectural layer only when the feature requires a distinct responsibility. Keep the existing modular structure; do not introduce layers such as entities, ports, adapters, or use cases by default.

## Tests

Tests are kept outside the production layer and centralized in `test/`. This keeps `src/` focused on application code and clearly separates unit, integration, and E2E tests from shared test resources:

```text
test/
├── factories/
│   └── user.factory.ts
├── unit/
│   └── user/
│       └── services/
│           └── user.service.spec.ts
├── integration/
└── e2e/
```

| Layer | Location | Purpose | Real dependencies? |
|---|---|---|---|
| Unit tests | `test/unit/` | Test a class or method in isolation, especially business rules in services. Examples: `UserService.create`, checking whether a user already exists, normalizing email and username, removing password/hash from the response, and handling a user not found. | No. Mock `UserRepository`, `PasswordHasher`, external services, and other injected dependencies. Do not start an HTTP server, connect to a real MongoDB, use real Argon2, or depend on real JWT. |
| Integration tests | `test/integration/` | Test real communication between internal layers, such as `UserRepository` and a test MongoDB, Mongoose schemas, indexes, queries, persistence, and mappings. | Yes, but controlled. A test MongoDB may be used, such as Testcontainers or an isolated test instance. Do not depend on a complete HTTP application when the goal is to test only persistence and service integration. |
| E2E tests | `test/e2e/` | Test complete HTTP flows, from the request to the API response. Examples: creating a user, logging in, receiving a JWT, accessing a private route with a Bearer token, receiving 401 without a token, and validating DTOs. | Yes. Start the NestJS application and use controllers, guards, pipes, services, and ideally an isolated test database. `supertest` can be used to send HTTP requests. |
| Factories | `test/factories/` | Centralize reusable test builders and objects. For example, `makeUser()` in `user.factory.ts` creates valid user objects and allows specific fields to be overridden. | No. Factories should only generate predictable test data. |

The project uses Vitest. `UserService` unit tests use mocks created with `vi.fn()` and do not access a real database.

```bash
# Run all tests
npm run test

# Keep tests running in watch mode
npm run test:watch

# Run only the UserService tests
npm run test:user

# Run tests with a coverage report
npm run test:coverage
```

### Import aliases

Tests use aliases to avoid long relative imports:

```ts
import { UserService } from '@/user/services/user.service.js';
import { UserRepository } from '@/user/repositories/user.repository.js';
import { makeUser } from '@test/factories/user.factory.js';
```

- `@/` points to `src/`.
- `@test/` points to `test/`.
- Aliases must be configured in both `tsconfig.json` and `vitest.config.ts`.

### Adopted principles

- Unit tests must not access MongoDB, the network, the filesystem, or external services.
- Use mocks for injected dependencies, such as repositories and hashers.
- No public API response may expose a password or password hash.
- Each test should validate a clear behavioral rule.
- Integration and E2E tests must use isolated data and must not access the development database.
- Relevant new business rules should have corresponding unit tests.
- E2E tests should cover critical authentication flows and private routes.

## 📝 Commit Convention

All commit messages must strictly adhere to the following pattern:

```Plaintext
[TAG] - description of what was done
```

**Common Tags:**
- `[FEAT]`/`[ADD]` - New features, endpoints, or file additions.
- `[FIX]` - Bug fixes, corrections, or removing unnecessary files.
- `[TEST]` - Adding or updating unit/integration tests.
- `[REFACTOR]` - Code restructuring without changing behavior or adding features.
- `[DOCS]` - Documentation updates (e.g., README, API docs).
- `[CHORE]` - Maintenance tasks, dependency updates, build/tooling configuration.
- `[STYLE]` - Code formatting, lint fixes, whitespace (no functional logic changes).

**Examples:**
- `[FEAT] - implement user authentication use case`
- `[TEST] - create unit tests for bio VO`
- `[ADD] - include dependencies and structure for tests`
- `[REFACTOR] - adapt test folder structure`
- `[FIX] - remove name.spec`
- `[DOCS] - update commit guidelines in README`

---

<div align="center">
  <h1>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
    <br>
    Gatherly - Backend 🇧🇷
  </h1>
  <p>Repositório para o backend da aplicação Gatherly</p>
</div>

## 🏗️ Arquitetura

O backend segue uma estrutura modular, organizada por funcionalidade. Cada funcionalidade mantém seus endpoints e o código diretamente relacionado a eles:

```text
gatherly-api/src/
├── auth/
├── user/
├── security/
├── config/
├── common/
├── app.module.ts
└── main.ts
```

**Responsabilidades:**
- `auth/` e `user/` são módulos de funcionalidade. Dentro de cada módulo, o código é separado por responsabilidade:
  - `controllers/` recebe requisições HTTP, prepara as respostas e delega o trabalho aos serviços.
  - `dto/` define e valida a estrutura dos dados aceitos pelos endpoints HTTP.
  - `services/` implementa o comportamento de aplicação e as regras da funcionalidade.
  - `repositories/` encapsula consultas e operações de persistência.
  - `schemas/` define as estruturas dos documentos MongoDB/Mongoose.
  - `guards/`, `strategies/` e `types/` mantêm, em `auth/`, a autorização da autenticação, a estratégia Passport/JWT e os tipos relacionados.
  - `<feature>.module.ts` declara controllers, providers, imports e exports da funcionalidade.
- `security/` contém recursos de segurança reutilizáveis, como a hash de senhas, que podem ser utilizados por várias funcionalidades.
- `config/` mantém as configurações da aplicação, incluindo arquivos com `registerAs` em `config/keys/`, e o módulo de configuração.
- `common/` é reservado para componentes realmente compartilhados pela aplicação, como filtros globais de exceção. Código específico de uma funcionalidade deve permanecer no módulo correspondente.
- `app.module.ts` compõe os módulos da aplicação; `main.ts` inicializa a aplicação NestJS.

**Como adicionar ou ampliar uma camada:**
- Para um comportamento de uma funcionalidade existente, adicione o código na pasta correspondente à responsabilidade dentro do módulo. Se precisar de uma nova categoria, crie uma pasta dentro da funcionalidade (por exemplo, `auth/guards/`) em vez de adicionar uma camada desnecessária no nível raiz.
- Para uma nova funcionalidade, crie um diretório em `src/`, organize os arquivos por responsabilidade, adicione seu módulo NestJS e importe-o em `app.module.ts`.
- Registre novos controllers, providers, imports ou exports no módulo responsável. Use `common/` somente para algo realmente compartilhado; mantenha utilitários de segurança reutilizáveis em `security/`.
- Adicione uma camada arquitetural somente quando a funcionalidade exigir uma responsabilidade distinta. Preserve a estrutura modular existente; não introduza, por padrão, camadas como entities, ports, adapters ou use cases.

## Testes

Os testes ficam fora da camada de produção e são centralizados em `test/`. Assim, `src/` permanece focado no código da aplicação, enquanto os testes unitários, de integração e E2E ficam claramente separados dos recursos compartilhados de teste:

```text
test/
├── factories/
│   └── user.factory.ts
├── unit/
│   └── user/
│       └── services/
│           └── user.service.spec.ts
├── integration/
└── e2e/
```

| Camada | Local | Objetivo | Dependências reais? |
|---|---|---|---|
| Testes unitários | `test/unit/` | Testar uma classe ou método isoladamente, principalmente regras de negócio nos services. Exemplos: `UserService.create`, validar usuário já existente, normalizar e-mail e username, remover senha/hash da resposta e tratar usuário não encontrado. | Não. Devem usar mocks para `UserRepository`, `PasswordHasher`, serviços externos e demais dependências injetadas. Não devem iniciar servidor HTTP, conectar ao MongoDB real, usar Argon2 real nem depender de JWT real. |
| Testes de integração | `test/integration/` | Testar a comunicação real entre camadas internas, como `UserRepository` e MongoDB de teste, schemas Mongoose, índices, consultas, persistência e mapeamentos. | Sim, mas controladas. Podem usar MongoDB de teste, como Testcontainers ou uma instância isolada para testes. Não devem depender de uma aplicação HTTP completa quando a intenção for testar apenas a integração entre persistência e serviços. |
| Testes E2E | `test/e2e/` | Testar fluxos completos por HTTP, desde a requisição até a resposta da API. Exemplos: criar usuário, fazer login, receber JWT, acessar rota privada com Bearer token, receber 401 sem token e validar DTOs. | Sim. Devem iniciar a aplicação NestJS e usar controllers, guards, pipes, services e, idealmente, uma base isolada de teste. Podem usar `supertest` para enviar requisições HTTP. |
| Factories | `test/factories/` | Concentrar builders e objetos reutilizáveis de teste. Por exemplo, `makeUser()` em `user.factory.ts` cria objetos de usuário válidos e permite sobrescrever campos específicos. | Não. Factories devem somente gerar dados previsíveis para os testes. |

O projeto utiliza Vitest. Os testes unitários do `UserService` usam mocks com `vi.fn()` e não acessam um banco de dados real.

```bash
# Executa todos os testes
npm run test

# Mantém os testes em modo observação
npm run test:watch

# Executa somente os testes do UserService
npm run test:user

# Executa os testes com relatório de cobertura
npm run test:coverage
```

### Aliases de importação

Os testes usam aliases para evitar imports relativos longos:

```ts
import { UserService } from '@/user/services/user.service.js';
import { UserRepository } from '@/user/repositories/user.repository.js';
import { makeUser } from '@test/factories/user.factory.js';
```

- `@/` aponta para `src/`.
- `@test/` aponta para `test/`.
- Os aliases devem estar configurados tanto no `tsconfig.json` quanto no `vitest.config.ts`.

### Princípios adotados

- Testes unitários não devem acessar MongoDB, rede, filesystem ou serviços externos.
- Mocks devem ser usados para dependências injetadas, como repositories e hashers.
- Nenhuma resposta pública da API deve expor senha ou hash de senha.
- Um teste deve validar uma regra de comportamento clara.
- Testes de integração e E2E devem usar dados isolados, sem acessar o banco de desenvolvimento.
- Novas regras de negócio relevantes devem possuir testes unitários correspondentes.
- Testes E2E devem cobrir os fluxos críticos de autenticação e rotas privadas.

## 📝 Padronização de Commits

Todas as mensagens de commit devem seguir estritamente o seguinte padrão:

```Plaintext
[TAG] - descrição do que foi feito
```

**Common Tags:**
- `[FEAT]`/`[ADD]` - Novas funcionalidades, endpoints ou adição de arquivos/estruturas.
- `[FIX]` - Correção de bugs, erros ou remoção de arquivos desnecessários/quebrados.
- `[TEST]` - Criação ou alteração de testes unitários/integração.
- `[REFACTOR]` - Refatoração de código sem alterar o comportamento externo (melhorias estruturais).
- `[DOCS]` - Alterações na documentação (ex: README, documentação de APIs).
- `[CHORE]` - Tarefas de manutenção, atualização de dependências ou configurações de build/ferramentas.
- `[STYLE]` - Formatação de código, ajustes de lint ou espaços em branco (sem mudança na lógica).

**Exemplos:**
- `[FEAT] - implement user authentication use case`
- `[TEST] - create unit tests for bio VO`
- `[ADD] - include dependencies and structure for tests`
- `[REFACTOR] - adapt test folder structure`
- `[FIX] - remove name.spec`
- `[DOCS] - update commit guidelines in README`
