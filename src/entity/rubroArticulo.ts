import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ArticuloInsumo } from './articuloInsumo';
@Entity()
export class RubroArticulo {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, default: null })
  denominacion: string;
  @OneToMany(() => ArticuloInsumo, (articulo) => articulo.rubro)
  articulos: ArticuloInsumo[];
}
