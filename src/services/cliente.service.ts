import { getRepository } from 'typeorm';
import { Cliente } from '../entity/cliente';

class ClienteService {
  async getClientes() {
    const clientes = await getRepository(Cliente).find();
    return clientes;
  }
}

export default new ClienteService();
