import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Processo } from "./Processo"; // Importe a entidade Processo

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  // ADICIONE ESTA LINHA:
  // Ela diz que uma área pode ter muitos processos
  @OneToMany(() => Processo, (processo) => processo.area)
  processos: Processo[];
}