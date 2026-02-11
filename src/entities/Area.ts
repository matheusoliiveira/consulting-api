import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Processo } from "./Processo";

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  nome!: string;

  @Column({ type: 'text', nullable: true })
  descricao!: string;

  @OneToMany(() => Processo, (processo) => processo.area)
  processos!: Processo[];
}