import mercadopago from 'mercadopago';
import { getRepository } from 'typeorm';
import { Configuracion } from '../entity/configuracion';

class MercadoPago {
  async realizarPago(datos: any, totalPedido: number) {
    const config = await getRepository(Configuracion).findOne();
    if (!config) {
      throw new Error('Configuraciones no existe, por favor crear configuraciones del sistema');
    }
    mercadopago.configure({
      access_token: config.tokenMercadoPago,
    });
    // Respetar estructura de MercadoPago
    const enviarDatos = {
      transaction_amount: totalPedido, //monto
      token: datos.token, //Token del comprador
      installments: Number(datos.installments), //cuotas
      payment_method_id: datos.paymentMethodId, //Metodo de pago
      payer: {
        email: datos.email, // Datos del comprador, email
      },
    };
    try {
      const response = await mercadopago.payment.save(enviarDatos);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new MercadoPago();
