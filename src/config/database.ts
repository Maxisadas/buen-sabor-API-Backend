import { createConnection } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const getConnection = async () => {
  console.log(process.env.DB_USERNAME, process.env.DB_PASS);
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
  return connection;
};

export default getConnection;
