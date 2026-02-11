import "reflect-metadata";
import { DataSource } from "typeorm";
import { Area } from "./entities/Area";
import { Processo } from "./entities/Processo";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: "postgres",

  url: process.env.DATABASE_URL,

  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
  port: process.env.DATABASE_URL ? undefined : (Number(process.env.DB_PORT) || 5432),
  username: process.env.DATABASE_URL ? undefined : process.env.DB_USER || 'postgres',
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS || '123',
  database: isTest ? "consulting_test" : (process.env.DATABASE_URL ? undefined : process.env.DB_NAME),

  synchronize: isTest || process.env.NODE_ENV === 'production' ? true : false,

  logging: false,
  entities: [Area, Processo],
  migrations: [],
  subscribers: [],
});