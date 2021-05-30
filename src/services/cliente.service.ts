import { getRepository } from 'typeorm';
import { Cliente } from '../entity/cliente';

class ClienteService {
  async getClientes() {
    const clientes = await getRepository(Cliente).find();
    return clientes;
  }

  //Hacer el editarClientes donde debemos editar la informacion del cliente.
}

export default new ClienteService();
