import { getRepository } from 'typeorm';
import { Configuracion } from '../entity/configuracion';
import { HorarioAtencion } from '../entity/horarioAtencion';

class ConfiguracionService {
  async saveConfig(config: any) {
    const configuracionEncontrada = await getRepository(Configuracion).findOne();
    if (!configuracionEncontrada) {
      const configuracion = new Configuracion();
      configuracion.cantidadCocinero = config.cantidadCocinero;
      configuracion.emailEmpresa = config.emailEmpresa;
      configuracion.tokenMercadoPago = config.tokenMercadoPago;
      await getRepository(Configuracion).save(configuracion);
      return;
    }
    configuracionEncontrada.cantidadCocinero = config.cantidadCocinero;
    configuracionEncontrada.emailEmpresa = config.emailEmpresa;
    configuracionEncontrada.tokenMercadoPago = config.tokenMercadoPago;
    await getRepository(Configuracion).save(configuracionEncontrada);
  }

  async getConfig() {
    const configuracionEncontrada = await getRepository(Configuracion).findOne();
    return configuracionEncontrada;
  }
}

export default new ConfiguracionService();
