import 'dotenv/config'; // Deve ser a primeira linha
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { AppDataSource } from './database';
import { areaRoutes } from './routes/areaRoutes';
import { processoRoutes } from './routes/processoRoutes';

const app = Fastify({
  logger: true
});

interface DatabaseError extends Error {
  code?: string;
  detail?: string;
}

// Handler de erros global AJUSTADO
app.setErrorHandler((error: DatabaseError, request, reply) => {
  app.log.error(error);

  // AJUSTE: Se a rota já definiu um erro (ex: 400 ou 409), não sobrescrevemos com 500
  if (reply.statusCode >= 400 && reply.statusCode < 500) {
    return reply.send();
  }

  // Erro de Duplicidade (PostgreSQL 23505)
  if (error.code === '23505' || error.message.includes('unique constraint')) {
    return reply.status(400).send({
      error: 'Conflito de Dados',
      message: 'Este registro já existe.',
    });
  }

  // Erro de Chave Estrangeira / Dependência (PostgreSQL 23503)
  if (error.code === '23503' || error.message.includes('foreign key constraint')) {
    return reply.status(400).send({
      error: 'Erro de Dependência',
      message: 'Operação impedida: este item está vinculado a outros registros.',
    });
  }

  // Erro padrão para qualquer outra falha crítica
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro interno no servidor.'
  });
});

const start = async () => {
  try {
    // 1. Inicializa o Banco de Dados
    await AppDataSource.initialize();
    console.log("✅ Banco de Dados conectado!");

    // 2. Configura o CORS (Antes das rotas)
    await app.register(cors, {
      origin: "*",
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    // 3. Registra as Rotas
    await app.register(areaRoutes);
    await app.register(processoRoutes);

    // 4. Porta e Inicialização
    const port = Number(process.env.PORT) || 3334;

    await app.listen({
      port: port,
      host: '0.0.0.0'
    });

    console.log(`🔥 Servidor online na porta ${port}`);
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor:");
    console.error(err);
    process.exit(1);
  }
};

start();