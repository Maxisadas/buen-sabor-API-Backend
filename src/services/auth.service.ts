import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User } from '../entity/user';

class AuthService {
  async login(usuario: any) {
    const usuarioEncontrado = await getRepository(User).findOne({
      where: { nombreUsuario: usuario.nombreUsuario, fechaBaja: null },
    });
    if (!usuarioEncontrado) {
      return { mensaje: 'El usuario no se ha encontrado', status: 400 };
    }
    if (!bcrypt.compareSync(usuario.contrasena, usuarioEncontrado?.constrasena)) {
      return { mensaje: 'El usuario no se ha encontrado', status: 400 };
    }
    return {
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      rolUsuario: usuarioEncontrado.rolUsuario,
    };
  }
}

export default new AuthService();
