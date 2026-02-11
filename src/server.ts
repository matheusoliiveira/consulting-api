import 'dotenv/config';
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

app.setErrorHandler((error: DatabaseError, request, reply) => {
  app.log.error(error);

  if (reply.statusCode >= 400 && reply.statusCode < 500) {
    return reply.send();
  }

  if (error.code === '23505' || error.message.includes('unique constraint')) {
    return reply.status(400).send({
      error: 'Conflito de Dados',
      message: 'Este registro já existe.',
    });
  }

  if (error.code === '23503' || error.message.includes('foreign key constraint')) {
    return reply.status(400).send({
      error: 'Erro de Dependência',
      message: 'Operação impedida: este item está vinculado a outros registros.',
    });
  }

  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro interno no servidor.'
  });
});

const start = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Banco de Dados conectado!");

    await app.register(cors, {
      origin: (origin, cb) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          process.env.FRONTEND_URL
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
          return;
        }
        cb(new Error("Not allowed by CORS"), false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    await app.register(areaRoutes);
    await app.register(processoRoutes);

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