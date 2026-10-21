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

The backend follows a modular, feature-oriented architecture. Business features are grouped under `src/features/`, while configuration and shared capabilities remain outside that directory.

```text
gatherly-api/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── services/
│   │   │   ├── strategies/
│   │   │   ├── types/
│   │   │   └── auth.module.ts
│   │   └── user/
│   │       ├── controllers/
│   │       ├── dto/
│   │       ├── repositories/
│   │       ├── schemas/
│   │       ├── services/
│   │       └── user.module.ts
│   ├── common/
│   │   └── filters/
│   ├── config/
│   │   ├── keys/
│   │   └── config.module.ts
│   ├── security/
│   │   └── hasher/
│   └── main.ts
└── test/
    ├── e2e/
    ├── factories/
    ├── integration/
    └── unit/
        └── features/
            ├── auth/
            └── user/
                └── services/
                    └── user.service.spec.ts
```

### Responsibilities

| Directory | Responsibility |
|---|---|
| `src/features/` | Groups application features and their NestJS modules. |
| `src/features/auth/` | Handles authentication, login, JWT validation, authentication guards, and related types. |
| `src/features/user/` | Handles user creation, retrieval, search, updates, and deletion. |
| `src/common/` | Contains genuinely shared components, such as global exception filters. |
| `src/config/` | Centralizes environment configuration through `registerAs` files under `config/keys/` and the configuration module. |
| `src/security/` | Provides reusable security capabilities, such as password hashing and verification. |
| `src/main.ts` | Bootstraps the application and configures global behavior. |
| `test/` | Centralizes automated tests and shared test resources outside production code. |

Within each feature, files are grouped by responsibility:

- `controllers/`: HTTP endpoints and delegation to services.
- `dto/`: input data structures and validation rules.
- `services/`: application behavior and business rules.
- `repositories/`: persistence queries and operations.
- `schemas/`: MongoDB/Mongoose document definitions.
- `guards/`: access checks, such as requiring an authenticated request.
- `strategies/`: authentication strategies, such as Passport JWT.
- `types/`: feature-specific TypeScript types.
- `<feature>.module.ts`: registration of controllers, providers, imports, and exports.

A feature should contain only the folders it needs. For example, `auth/` does not need a repository folder unless it owns persistence operations.

### Adding or extending a feature

1. For existing functionality, add code under the appropriate responsibility folder inside its feature.
2. For new functionality, create a directory under `src/features/`, such as `src/features/collection/`.
3. Create the feature's NestJS module and register its controllers, providers, imports, and exports.
4. Connect the new module to the application's module composition.
5. Add corresponding unit tests under `test/unit/features/<feature>/`.
6. Add integration and E2E coverage when the change affects persistence or complete HTTP flows.

Keep feature-specific code inside its feature. Use `common/` only for genuinely shared components, `security/` for reusable security utilities, and `config/` for environment configuration.

Preserve this modular structure. Do not introduce entities, ports, adapters, or use-case layers by default.

## 🧪 Tests

Tests are centralized in `test/`, outside production code. Unit tests mirror the feature organization under `src/features/`.

```text
test/
├── e2e/
├── factories/
│   └── user.factory.ts
├── integration/
└── unit/
    └── features/
        ├── auth/
        └── user/
            └── services/
                └── user.service.spec.ts
```

### Test categories

| Category | Location | Purpose | Dependencies |
|---|---|---|---|
| Unit tests | `test/unit/features/` | Test feature classes in isolation. Examples: user creation, duplicate-user handling, email and username normalization, search results, and authentication decisions. | Mock injected dependencies such as repositories, hashers, and token services. Feature service tests must not require MongoDB, an HTTP server, or external services. |
| Integration tests | `test/integration/` | Verify cooperation between real components, such as a repository and a test MongoDB, including schemas, queries, indexes, and persistence. | Use controlled dependencies and an isolated test database when required. |
| E2E tests | `test/e2e/` | Verify complete HTTP flows, such as registration, login, authenticated access, DTO validation, and error responses. | Start the application and use isolated test data. HTTP requests may be sent with `supertest`. |
| Factories | `test/factories/` | Generate reusable, predictable test data. For example, `makeUser()` creates user fixtures with optional field overrides. Factories are supporting resources, not a separate test category. | No database, network, or external-service access. |

The project uses Vitest. Feature service unit tests use mocks created with `vi.fn()` to isolate dependencies.

### Commands

Run these commands from `gatherly-api/`:

```bash
# Run the test suite configured in Vitest
npm run test

# Run tests in watch mode
npm run test:watch

# Run only the UserService tests
npm run test:user

# Run tests with coverage reporting
npm run test:coverage
```

The `test:user` script must target the current location:

```json
{
  "test:user": "vitest run test/unit/features/user/services/user.service.spec.ts"
}
```

Integration and E2E tests must be executed through their configured scripts or test projects when separate environments are required.

### Import aliases

Tests use aliases to avoid long relative imports:

```ts
import { UserService } from '@/features/user/services/user.service.js';
import { UserRepository } from '@/features/user/repositories/user.repository.js';
import { PASSWORD_HASHER } from '@/security/hasher/password-hasher.js';
import { makeUser } from '@test/factories/user.factory.js';
```

- `@/` points to `src/`.
- `@test/` points to `test/`.
- Aliases must be configured in both `tsconfig.json` and `vitest.config.ts`.
- Moving features does not change the alias roots; imports must now include `features/`.

### Adopted principles

- Feature service unit tests must not access MongoDB, the network, the filesystem, or external services.
- Mock injected dependencies to test service behavior independently.
- No public API response may expose passwords, password hashes, or recovery tokens.
- Each test should verify a clear behavioral rule.
- Reset mock state and implementations between tests to avoid cross-test interference.
- Factories must generate predictable data and allow explicit overrides.
- Integration and E2E tests must use isolated data and never access the development database.
- New or changed business rules must have appropriate tests.
- E2E tests should cover critical authentication flows and private routes.
## ✅ Linting and Change Validation

Every change must pass linting and automated tests before being pushed to the repository or merged into the main development branch.

The project uses ESLint to check code quality, Prettier for formatting, and Vitest to run automated tests.

### Required checks

After making a change, run:

```bash
# Check code quality
npm run lint

# Run automated tests
npm run test

# Verify that the application compiles
npm run build
```

If formatting changes or automatically fixable lint issues are found, run:

```bash
# Format the code
npm run format

# Apply automatic lint fixes
npm run lint:fix
```

After applying fixes, run the required checks again. Automatic fixes may modify imports or other code, so passing linting alone does not guarantee that tests or the build will pass.

### Acceptance criteria

A change is ready to be pushed or merged only when:

- Linting completes without errors.
- All automated tests included in the checks pass.
- The application builds successfully.
- New or changed behavior has appropriate test coverage.
- Formatting and automatic fixes have been reviewed to ensure they did not unintentionally change behavior.

Do not disable rules, skip failing tests, or remove assertions solely to make the checks pass. Investigate and fix the underlying issue.

When the change affects database integration, authentication, or HTTP flows, also run the relevant integration and E2E tests using the scripts configured in the project.

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

O backend segue uma arquitetura modular, organizada por funcionalidade. As funcionalidades ficam agrupadas em `src/features/`, enquanto as configurações e os recursos compartilhados permanecem fora desse diretório.

```text
gatherly-api/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── services/
│   │   │   ├── strategies/
│   │   │   ├── types/
│   │   │   └── auth.module.ts
│   │   └── user/
│   │       ├── controllers/
│   │       ├── dto/
│   │       ├── repositories/
│   │       ├── schemas/
│   │       ├── services/
│   │       └── user.module.ts
│   ├── common/
│   │   └── filters/
│   ├── config/
│   │   ├── keys/
│   │   └── config.module.ts
│   ├── security/
│   │   └── hasher/
│   └── main.ts
└── test/
    ├── e2e/
    ├── factories/
    ├── integration/
    └── unit/
        └── features/
            ├── auth/
            └── user/
                └── services/
                    └── user.service.spec.ts
```

### Responsabilidades

| Diretório | Responsabilidade |
|---|---|
| `src/features/` | Agrupa as funcionalidades da aplicação e seus módulos NestJS. |
| `src/features/auth/` | Mantém autenticação, login, validação JWT, guards de autenticação e tipos relacionados. |
| `src/features/user/` | Mantém criação, consulta, busca, atualização e exclusão de usuários. |
| `src/common/` | Contém componentes realmente compartilhados, como filtros globais de exceção. |
| `src/config/` | Centraliza as configurações de ambiente, com arquivos `registerAs` em `config/keys/` e o módulo de configuração. |
| `src/security/` | Oferece recursos reutilizáveis de segurança, como geração e verificação de hashes de senha. |
| `src/main.ts` | Inicializa a aplicação e configura comportamentos globais. |
| `test/` | Centraliza os testes automatizados e seus recursos auxiliares fora do código de produção. |

Dentro de cada funcionalidade, os arquivos são separados por responsabilidade:

- `controllers/`: endpoints HTTP e delegação para os serviços.
- `dto/`: estrutura dos dados de entrada e regras de validação.
- `services/`: comportamento da aplicação e regras de negócio.
- `repositories/`: consultas e operações de persistência.
- `schemas/`: definição dos documentos MongoDB/Mongoose.
- `guards/`: verificações de acesso, como exigir uma requisição autenticada.
- `strategies/`: estratégias de autenticação, como Passport JWT.
- `types/`: tipos TypeScript específicos da funcionalidade.
- `<feature>.module.ts`: registro de controllers, providers, imports e exports.

Cada funcionalidade deve conter somente as pastas necessárias. Por exemplo, `auth/` não precisa de uma pasta de repositories enquanto não possuir operações próprias de persistência.

### Como adicionar ou ampliar uma funcionalidade

1. Para funcionalidades existentes, adicione o código na pasta correspondente à responsabilidade dentro do módulo.
2. Para novas funcionalidades, crie um diretório em `src/features/`, como `src/features/collection/`.
3. Crie o módulo NestJS da funcionalidade e registre seus controllers, providers, imports e exports.
4. Conecte o novo módulo à composição de módulos da aplicação.
5. Adicione os testes unitários correspondentes em `test/unit/features/<feature>/`.
6. Adicione cobertura de integração e E2E quando a alteração afetar persistência ou fluxos HTTP completos.

Mantenha o código específico dentro da funcionalidade correspondente. Use `common/` somente para componentes realmente compartilhados, `security/` para utilitários reutilizáveis de segurança e `config/` para configurações de ambiente.

Preserve essa estrutura modular. Não introduza, por padrão, camadas de entities, ports, adapters ou use cases.

## 🧪 Testes

Os testes são centralizados em `test/`, fora do código de produção. Os testes unitários espelham a organização das funcionalidades em `src/features/`.

```text
test/
├── e2e/
├── factories/
│   └── user.factory.ts
├── integration/
└── unit/
    └── features/
        ├── auth/
        └── user/
            └── services/
                └── user.service.spec.ts
```

### Categorias de testes

| Categoria | Local | Objetivo | Dependências |
|---|---|---|---|
| Testes unitários | `test/unit/features/` | Testar classes das funcionalidades isoladamente. Exemplos: criação de usuário, tratamento de duplicidade, normalização de e-mail e username, resultados de busca e decisões de autenticação. | Usam mocks das dependências injetadas, como repositories, hashers e serviços de tokens. Os testes dos services de funcionalidades não devem exigir MongoDB, servidor HTTP ou serviços externos. |
| Testes de integração | `test/integration/` | Verificar a colaboração entre componentes reais, como repository e MongoDB de teste, incluindo schemas, consultas, índices e persistência. | Usam dependências controladas e banco de dados isolado quando necessário. |
| Testes E2E | `test/e2e/` | Verificar fluxos HTTP completos, como cadastro, login, acesso autenticado, validação de DTOs e respostas de erro. | Inicializam a aplicação e usam dados isolados. As requisições HTTP podem ser enviadas com `supertest`. |
| Factories | `test/factories/` | Gerar dados reutilizáveis e previsíveis. Por exemplo, `makeUser()` cria objetos de usuário e permite sobrescrever campos específicos. Factories são recursos auxiliares, não uma categoria independente de testes. | Não acessam banco, rede ou serviços externos. |

O projeto utiliza Vitest. Os testes unitários dos services de funcionalidades usam mocks criados com `vi.fn()` para isolar suas dependências.

### Comandos

Execute os comandos a partir de `gatherly-api/`:

```bash
# Executa a suíte configurada no Vitest
npm run test

# Mantém os testes em modo observação
npm run test:watch

# Executa somente os testes do UserService
npm run test:user

# Executa os testes com relatório de cobertura
npm run test:coverage
```

O script `test:user` deve apontar para a localização atual:

```json
{
  "test:user": "vitest run test/unit/features/user/services/user.service.spec.ts"
}
```

Testes de integração e E2E devem ser executados pelos scripts ou projetos de teste configurados para eles quando exigirem ambientes separados.

### Aliases de importação

Os testes usam aliases para evitar imports relativos longos:

```ts
import { UserService } from '@/features/user/services/user.service.js';
import { UserRepository } from '@/features/user/repositories/user.repository.js';
import { PASSWORD_HASHER } from '@/security/hasher/password-hasher.js';
import { makeUser } from '@test/factories/user.factory.js';
```

- `@/` aponta para `src/`.
- `@test/` aponta para `test/`.
- Os aliases devem estar configurados tanto no `tsconfig.json` quanto no `vitest.config.ts`.
- A movimentação das funcionalidades não altera as raízes dos aliases; os imports passam a incluir `features/`.

### Princípios adotados

- Testes unitários dos services de funcionalidades não devem acessar MongoDB, rede, filesystem ou serviços externos.
- Use mocks das dependências injetadas para testar o comportamento dos serviços isoladamente.
- Nenhuma resposta pública da API deve expor senhas, hashes de senha ou tokens de recuperação.
- Cada teste deve verificar uma regra de comportamento clara.
- Reinicialize o estado e as implementações dos mocks entre os testes para evitar interferência entre casos.
- Factories devem gerar dados previsíveis e permitir sobrescritas explícitas.
- Testes de integração e E2E devem usar dados isolados e nunca acessar o banco de desenvolvimento.
- Regras de negócio novas ou alteradas devem possuir testes adequados.
- Testes E2E devem cobrir os fluxos críticos de autenticação e rotas privadas.
## ✅ Linting e Validação de Alterações

Toda alteração deve passar pelo lint e pelos testes automatizados antes de ser enviada ao repositório ou integrada à branch principal de desenvolvimento.

O projeto utiliza ESLint para verificar a qualidade do código, Prettier para formatação e Vitest para executar testes automatizados.

### Verificações obrigatórias

Após realizar uma alteração, execute:

```bash
# Verifica a qualidade do código
npm run lint

# Executa os testes automatizados
npm run test

# Verifica se a aplicação compila
npm run build
```

Caso seja necessário formatar o código ou corrigir problemas de lint automaticamente, execute:

```bash
# Formata o código
npm run format

# Aplica correções automáticas de lint
npm run lint:fix
```

Depois das correções, execute novamente as verificações obrigatórias. Correções automáticas podem modificar imports ou outros trechos do código; portanto, passar no lint não garante que os testes ou o build também passarão.

### Critérios de aceitação

Uma alteração só está pronta para ser enviada ou integrada quando:

- O lint termina sem erros.
- Todos os testes automatizados incluídos nas verificações passam.
- A aplicação compila com sucesso.
- Comportamentos novos ou alterados possuem cobertura de testes adequada.
- A formatação e as correções automáticas foram revisadas para garantir que não alteraram o comportamento involuntariamente.

Não desative regras, ignore testes com falha ou remova verificações apenas para fazer as validações passarem. Investigue e corrija a causa do problema.

Quando a alteração afetar integração com o banco, autenticação ou fluxos HTTP, execute também os testes de integração e E2E relevantes, usando os scripts configurados no projeto.

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
