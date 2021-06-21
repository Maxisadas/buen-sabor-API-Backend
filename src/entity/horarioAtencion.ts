import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Configuracion } from './configuracion';

@Entity()
export class HorarioAtencion {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  dias: string; // VALORES ENTRE_SEMANA O FINES_SEMANA
  @Column()
  horaApertura: number;
  @Column()
  horaCierre: number;
  @ManyToOne(() => Configuracion, (configuracion) => configuracion.horarios)
  configuracion?: Configuracion;
}
