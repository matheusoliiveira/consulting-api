import { FastifyInstance } from 'fastify';
import { AppDataSource } from '../database';
import { Processo } from '../entities/Processo';
import { IsNull } from 'typeorm';

export async function processoRoutes(app: FastifyInstance) {
  const repo = AppDataSource.getTreeRepository(Processo);

  app.get('/processos', async (request) => {
    const { areaId } = request.query as { areaId?: string };
    const whereClause = areaId ? { area: { id: Number(areaId) } } : {};

    return await repo.find({
      where: whereClause,
      relations: ['area', 'pai']
    });
  });

  app.get('/processos/arvore', async (request) => {
    const { areaId } = request.query as { areaId?: string };

    if (areaId) {
      const raizes = await repo.find({
        where: {
          area: { id: Number(areaId) },
          pai: IsNull()
        },
        relations: ['area']
      });

      const arvoresCompletas = [];
      for (const raiz of raizes) {
        const arvore = await repo.findDescendantsTree(raiz);
        arvoresCompletas.push(arvore);
      }
      return arvoresCompletas;
    }

    return await repo.findTrees({ relations: ['area'] });
  });

  app.post('/processos', async (request, reply) => {
    const body = request.body as any;
    const processo = repo.create(body);

    if (body.areaId) {
      processo.area = { id: Number(body.areaId) } as any;
    }

    if (body.paiId) {
      const paiExistente = await repo.findOneBy({ id: Number(body.paiId) });
      if (paiExistente) {
        processo.pai = paiExistente;
      }
    }

    await repo.save(processo);
    return reply.status(201).send(processo);
  });

  app.put('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const processo = await repo.findOne({
      where: { id: Number(id) },
      relations: ['pai', 'area']
    });

    if (!processo) return reply.status(404).send({ message: "Processo não encontrado" });

    processo.nome = body.nome ?? processo.nome;
    processo.tipo = body.tipo ?? processo.tipo;
    processo.ferramentas = body.ferramentas ?? processo.ferramentas;
    processo.responsaveis = body.responsaveis ?? processo.responsaveis;
    processo.documentacao = body.documentacao ?? processo.documentacao;

    if (body.paiId !== undefined) {
      if (!body.paiId) {
        processo.pai = null as any;
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

  app.delete('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const processo = await repo.findOne({
      where: { id: Number(id) },
      relations: ['sub_processos']
    });

    if (!processo) return reply.status(404).send({ message: "Não encontrado" });

    if (processo.sub_processos && processo.sub_processos.length > 0) {
      return reply.status(400).send({
        message: "Não é possível apagar um processo que possui sub-processos vinculados."
      });
    }

    await repo.remove(processo);
    return reply.status(204).send();
  });
}