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
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,

  database: isTest ? "consulting_test" : process.env.DB_NAME,

  synchronize: isTest ? true : false,

  logging: false,
  entities: [Area, Processo],
  migrations: [],
  subscribers: [],
});