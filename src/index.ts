import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'reflect-metadata';
import userRoutes from './routes/users.routes';
import getConnection from './config/database';
import clientesRoutes from './routes/clientes.routes';
import authRoutes from './routes/auth.routes';
import configuracionRoutes from './routes/configuracion.routes';
import pedidoRoutes from './routes/pedido.routes';

const app = express();

// middlewares
app.use(cors()); //Cors nos permite conectarnos con otros servicios de nuestro entorno o pc, por ejemplo que el frontend se pueda conectar a nuestro sistema
app.use(morgan('dev')); // Para poder loggear nuestro proyecto
app.use(express.json()); // Para obtener los datos externos en formato JSON

// routes
app.use(userRoutes);
app.use(clientesRoutes);
app.use(authRoutes);
app.use(configuracionRoutes);
app.use(pedidoRoutes);
// init database
getConnection();

app.listen(3000);
console.log('Servidor corriendo en el puerto 3000');
