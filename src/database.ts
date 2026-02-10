import "reflect-metadata";
import { DataSource } from "typeorm";
import { Area } from "./entities/Area";
import { Processo } from "./entities/Processo";
import * as dotenv from 'dotenv';
import path from 'path';

// Força o carregamento do .env local antes de exportar a conexão
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("DB_HOST configurado como:", process.env.DB_HOST); // Log de teste

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Area, Processo],
});