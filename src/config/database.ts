import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import carga_inicial_datos from '../scripts';
import mercadoPago from '../services/mercadoPago';

dotenv.config();

const getConnection = async () => {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    entities: ['src/entity/**/*.ts'],
    synchronize: true,
    logger: 'debug',
  });
  console.log('Database ON');
  // init script de carga.
  await carga_inicial_datos();
  return connection;
};

export default getConnection;
