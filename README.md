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
