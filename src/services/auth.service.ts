import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import { User } from '../entity/user';

class AuthService {
  async login(usuario: any) {
    const usuarioEncontrado = await getRepository(User).findOne({
      where: { nombreUsuario: String(usuario.nombreUsuario).toLowerCase(), fechaBaja: null },
    });
    if (!usuarioEncontrado) {
      return { mensaje: 'El usuario y/o contraseña son incorrectos', status: 400 };
    }
    if (!bcrypt.compareSync(usuario.contrasena, usuarioEncontrado?.constrasena)) {
      return { mensaje: 'El usuario y/o contraseña son incorrectos', status: 400 };
    }
    return {
      nombreUsuario: usuarioEncontrado.nombreUsuario,
      rolUsuario: usuarioEncontrado.rolUsuario,
    };
  }
}

export default new AuthService();
