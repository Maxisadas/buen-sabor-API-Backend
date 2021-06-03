import { getRepository } from 'typeorm';
import { Cliente } from '../entity/cliente';

class ClienteService {
  async getClientes() {
    const clientes = await getRepository(Cliente).find();
    return clientes;
  }

  //Hacer el editarClientes donde debemos editar la informacion del cliente.
  // Ten en cuenta que SI el usuario cambia el email entonces debes cambiar el nombre de usuario al email nuevo. if(clienteEncontrado.usuario.email !== cliente.email){}
  // Recuerda que tambien debes actualizar el domicilio.
}

export default new ClienteService();
