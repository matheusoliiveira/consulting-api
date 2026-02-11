# 🚀 StageFlow API - Backend

Esta é a API REST robusta do ecossistema **StageFlow**, desenvolvida para gerenciar o mapeamento de processos e a governança corporativa. O sistema utiliza uma arquitetura de árvore para organizar departamentos e processos de forma recursiva, permitindo uma visão clara da eficiência operacional.



## 🛠️ Tecnologias e Frameworks

* **Node.js & TypeScript:** Ambiente de execução e linguagem com tipagem estrita para maior segurança e produtividade.
* **Fastify:** Framework web de alta performance e baixo overhead, focado em escalabilidade.
* **TypeORM:** ORM moderno utilizado para gerenciar entidades e relacionamentos complexos de banco de dados.
* **PostgreSQL:** Banco de dados relacional robusto, escolhido para garantir a integridade da hierarquia de processos.

## 🧠 Diferenciais Técnicos

### 1. Hierarquia de Árvore (Materialized Path)
Implementamos o `TreeRepository` do TypeORM com a estratégia de **Materialized Path**. Isso permite:
* Consultas recursivas de alta performance para recuperar estruturas complexas.
* Criação de níveis ilimitados de sub-processos (relação Pai/Filho).
* Recuperação de árvores completas por departamento com uma única chamada via `findDescendantsTree`.

### 2. Governança e Integridade
* **Segurança na Deleção:** O sistema possui uma trava lógica que impede a remoção de processos que contenham sub-processos vinculados, evitando dados órfãos.
* **Tratamento de Erros Global:** `ErrorHandler` customizado que mapeia erros de banco de dados (como violação de chaves únicas ou estrangeiras) em mensagens amigáveis.
* **CORS Dinâmico:** Configuração de segurança que autoriza requisições apenas de origens confiáveis, alternando entre ambiente local e produção na Vercel.

## 🛤️ Endpoints Principais

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| **GET** | `/processos/arvore` | Retorna a hierarquia completa formatada em árvore, filtrada por `areaId`. |
| **POST** | `/processos` | Cria um novo processo ou sub-processo via `paiId`. |
| **PUT** | `/processos/:id` | Atualiza dados, ferramentas, responsáveis e links de documentação. |
| **DELETE** | `/processos/:id` | Remove um processo, validando se não há dependentes ativos. |



## ⚙️ Configuração para Produção (Render)

A API está totalmente preparada para deploy contínuo no **Render**:
* **Porta Dinâmica:** O servidor escuta na variável global `PORT` injetada automaticamente pelo ambiente.
* **Binding de Host:** Configurado em `0.0.0.0` para garantir a aceitação de conexões externas.
* **Variáveis de Ambiente Necessárias:**
    * `DATABASE_URL`: String de conexão completa com o PostgreSQL (Internal/External URL).
    * `FRONTEND_URL`: URL da aplicação hospedada na Vercel para autorização do CORS.

## 🚀 Como Rodar Localmente

1. Certifique-se de ter o **Docker** e o **Docker Compose** instalados.
2. Instale as dependências:
   ```bash
   npm install
3. Configure seu arquivo .env baseado no .env.example
4. Inicie o banco e a aplicação:
    ```bash
   docker-compose up -d
    npm run dev

