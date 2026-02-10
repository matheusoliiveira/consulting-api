# 📊 API de Mapeamento de Processos - Consultoria

Este projeto é uma API REST robusta desenvolvida para gerenciar o mapeamento de processos e sub-processos de empresas, organizados por áreas. O sistema permite a criação de uma hierarquia infinita de processos utilizando a estratégia de **Materialized Path**.

## 🛠️ Tecnologias Utilizadas

* **Node.js & TypeScript:** Garantia de produtividade com segurança de tipos.
* **Fastify:** Framework web de alto desempenho e baixo overhead.
* **TypeORM:** ORM moderno para interação com banco de dados.
* **PostgreSQL:** Banco de dados relacional robusto.
* **Docker & Docker Compose:** Containerização para garantir que o ambiente seja idêntico em qualquer máquina.

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Docker e Docker Compose instalados.
* Node.js (v18 ou superior) instalado localmente (opcional para desenvolvimento).

### Passo a Passo

1.  **Clonar o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/consulting-api.git](https://github.com/seu-usuario/consulting-api.git)
    cd consulting-api
    ```

2.  **Subir o Banco de Dados (Docker):**
    ```bash
    docker-compose up -d
    ```

3.  **Instalar dependências:**
    ```bash
    npm install
    ```

4.  **Rodar a aplicação:**
    ```bash
    npm run dev
    ```
    A API estará online em: `http://localhost:3334`

## 🛤️ Endpoints Principais

### Áreas
* `GET /areas` - Lista todas as áreas.
* `POST /areas` - Cadastra uma nova área.
* `PUT /areas/:id` - Atualiza dados de uma área.
* `DELETE /areas/:id` - Remove uma área (impede remoção se houver processos vinculados).

### Processos (Estrutura em Árvore)
* `GET /processos/arvore` - Retorna a hierarquia completa de processos e sub-processos.
* `POST /processos` - Cria um processo ou sub-processo (basta enviar o `paiId`).
* `PUT /processos/:id` - Atualiza informações do processo.
* `DELETE /processos/:id` - Remove um processo da hierarquia.

## 🧠 Diferenciais Técnicos (Destaques para a Avaliação)

* **Hierarquia de Árvore:** Implementação de `TreeRepository` com `Materialized Path`, permitindo consultas recursivas eficientes no banco de dados.
* **Integridade Referencial:** Tratamento de erros para impedir a deleção de áreas com processos ativos.
* **Padronização REST:** Uso correto de métodos HTTP (GET, POST, PUT, DELETE) e códigos de status (201, 204, 400, 404).
* **Ambiente Isolado:** Configuração completa via Docker para facilitar o deploy e testes.

