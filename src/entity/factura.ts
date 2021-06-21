import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { DetalleFactura } from './detalle-factura';
import { Pedido } from './pedido';
@Entity()
export class Factura {
  @PrimaryGeneratedColumn()
  numeroFactura: number;
  @Column({ nullable: true, default: null })
  fechaFacturacion: Date;
  @Column({ nullable: true, default: null })
  montoDescuento: number;
  @Column({ nullable: true, default: null })
  formaPago: string;
  @Column({ nullable: true, default: null })
  nroTarjeta: string;
  @Column({ nullable: true, default: null })
  totalVenta: number;
  @Column({ nullable: true, default: null })
  totalCosto: number;
  @OneToOne(() => Pedido, { nullable: true })
  @JoinColumn()
  pedido: Pedido;
  @OneToMany(() => DetalleFactura, (detalleFactura) => detalleFactura.factura)
  detalleFacturas: DetalleFactura[];
}
