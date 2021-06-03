import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { Cliente } from '../entity/cliente';
import { Domicilio } from '../entity/domicilio';
import { User } from '../entity/user';
import RolUsuario from '../enumerables/roles.enum';

class UserService {
  async getUsers() {
    const usuarios = await getRepository(User).find();
    return usuarios;
  }

  async createUser(usuario: any) {
    try {
      //Buscamos si existe un usuario con ese mismo nombre de usuario ingresado.
      const usuarioEncontrado = await getRepository(User).findOne({
        where: { nombreUsuario: usuario.nombreUsuario, fechaBaja: null },
      });
      if (usuarioEncontrado) {
        return { mensaje: 'El usuario con ese nombre de usuario, ya existe en nuestro sistema', status: 400 };
      }
      const nuevoUsuario = new User();
      nuevoUsuario.nombreUsuario = String(usuario.nombreUsuario).toLowerCase(); //Para poder almacenar los nombres de usuarios todo en minusucula
      nuevoUsuario.rolUsuario = usuario.rolUsuario;
      nuevoUsuario.fechaCreacion = new Date();
      // Debemos hashear la contraseña con bcrypt.
      const salt = await bcrypt.genSalt(10);
      const contrasenaCifrada = await bcrypt.hash(usuario.contrasena, salt);
      nuevoUsuario.constrasena = contrasenaCifrada;
      await getRepository(User).save(nuevoUsuario);
      // Si el rol del usuario es cliente, creamos el objeto cliente.
      if (usuario.rolUsuario === RolUsuario.CLIENTE) {
        const nuevoCliente = new Cliente();
        nuevoCliente.nombre = usuario.nombre;
        nuevoCliente.apellido = usuario.apellido;
        nuevoCliente.email = usuario.email;
        nuevoCliente.telefono = usuario.telefono;
        nuevoCliente.usuario = nuevoUsuario;
        nuevoCliente.fechaCreacion = new Date();
        await getRepository(Cliente).save(nuevoCliente);
        const domicilio = new Domicilio();
        domicilio.calle = usuario.calle;
        domicilio.localidad = usuario.localidad;
        domicilio.numero = usuario.numero;
        await getRepository(Domicilio).save(domicilio);
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(idUsuario: string) {
    const usuarioEncontrado = await getRepository(User).findOne(idUsuario, { where: { fechaBaja: null } });
    if (!usuarioEncontrado) {
      return { mensaje: 'El usuario no se encuentra en el sistema', status: 400 };
    }
    usuarioEncontrado.fechaBaja = new Date();
    // AL dar de baja el usuario, tamien debemos dar de baja el objeto cliente si el rol es cliente.
    if (usuarioEncontrado.rolUsuario === RolUsuario.CLIENTE) {
      const clienteEncontrado = await getRepository(Cliente).findOne({ where: { usuario: usuarioEncontrado } });
      if (!clienteEncontrado) {
        return { mensaje: 'El cliente no se encuentra en el sistema', status: 400 };
      }
      clienteEncontrado.fechaBaja = new Date();
      await getRepository(Cliente).save(clienteEncontrado);
    }
    await getRepository(User).save(usuarioEncontrado);
  }
}

export default new UserService();
