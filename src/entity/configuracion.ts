import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { HorarioAtencion } from './horarioAtencion';

@Entity()
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  cantidadCocinero: number;
  @Column({ nullable: true, default: null })
  emailEmpresa: string;
  @Column({ nullable: true, default: null })
  tokenMercadoPago: string;
  @OneToMany(() => HorarioAtencion, (horarios) => horarios.configuracion, { eager: true, cascade: true })
  horarios: HorarioAtencion[];
}
