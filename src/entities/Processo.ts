import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Tree,
  TreeParent,
  TreeChildren
} from "typeorm";
import { Area } from "./Area";

@Entity('processos')
@Tree("materialized-path")
export class Processo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ default: 'manual' })
  tipo: string;

  @Column({ type: 'simple-array', nullable: true })
  ferramentas: string[];

  @Column({ type: 'simple-array', nullable: true })
  responsaveis: string[];

  @Column({ type: 'text', nullable: true })
  documentacao: string;

  // Adicionamos onDelete: 'SET NULL' ou 'CASCADE' para evitar o erro de deleção
  // Localize isso no seu src/entities/Processo.ts
  @ManyToOne(() => Area, { onDelete: 'SET NULL', nullable: true })
  area: Area;

  @TreeParent({ onDelete: 'CASCADE' }) // Se apagar o pai, apaga os filhos (ou mude para 'SET NULL')
  pai: Processo;

  @TreeChildren()
  sub_processos: Processo[];
}