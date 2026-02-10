import { FastifyInstance } from 'fastify';
import { AppDataSource } from '../database';
import { Processo } from '../entities/Processo';

export async function processoRoutes(app: FastifyInstance) {
  const repo = AppDataSource.getTreeRepository(Processo);

  // LISTAR TUDO
  app.get('/processos', async () => {
    return await repo.find({ relations: ['area', 'pai'] });
  });

  // BUSCAR ÁRVORE (Para o gráfico de hierarquia)
  app.get('/processos/arvore', async () => {
    return await repo.findTrees({ relations: ['area'] });
  });

  // CADASTRAR
  app.post('/processos', async (request, reply) => {
    const body = request.body as any;
    const processo = repo.create(body);

    if (body.areaId) {
      processo.area = { id: Number(body.areaId) } as any;
    }

    if (body.paiId) {
      const paiExistente = await repo.findOneBy({ id: Number(body.paiId) });
      if (paiExistente) processo.pai = paiExistente;
    }

    await repo.save(processo);
    return reply.status(201).send(processo);
  });

  // ATUALIZAR (Permite mover entre processos e mudar áreas)
  app.put('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const processo = await repo.findOne({
      where: { id: Number(id) },
      relations: ['pai', 'area']
    });

    if (!processo) return reply.status(404).send({ message: "Processo não encontrado" });

    // Atualiza campos básicos
    processo.nome = body.nome ?? processo.nome;
    processo.tipo = body.tipo ?? processo.tipo;
    processo.ferramentas = body.ferramentas ?? processo.ferramentas;
    processo.responsaveis = body.responsaveis ?? processo.responsaveis;
    processo.documentacao = body.documentacao ?? processo.documentacao;

    // Ajuste de Hierarquia (Subprocessos)
    if (body.paiId !== undefined) {
      if (body.paiId === null || body.paiId === "" || body.paiId === 0) {
        processo.pai = null;
      } else {
        const novoPai = await repo.findOneBy({ id: Number(body.paiId) });
        if (novoPai && novoPai.id !== processo.id) {
          processo.pai = novoPai;
        }
      }
    }

    if (body.areaId) {
      processo.area = { id: Number(body.areaId) } as any;
    }

    await repo.save(processo);
    return processo;
  });

  // REMOVER PROCESSO
  app.delete('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const processo = await repo.findOne({
      where: { id: Number(id) },
      relations: ['sub_processos']
    });

    if (!processo) return reply.status(404).send({ message: "Não encontrado" });

    // Se tiver filhos, não deixa apagar para não quebrar a árvore
    if (processo.sub_processos && processo.sub_processos.length > 0) {
      return reply.status(400).send({
        message: "Não é possível apagar um processo que possui sub-processos."
      });
    }

    await repo.remove(processo);
    return reply.status(204).send();
  });
}