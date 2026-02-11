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

      const arvoresCompletas: Processo[] = [];
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

    const novoProcesso = new Processo();


    novoProcesso.nome = body.nome;
    novoProcesso.descricao = body.descricao;
    novoProcesso.tipo = body.tipo ?? 'manual';
    novoProcesso.ferramentas = body.ferramentas;
    novoProcesso.responsaveis = body.responsaveis;
    novoProcesso.documentacao = body.documentacao;

    if (body.areaId) {
      novoProcesso.area = { id: Number(body.areaId) } as any;
    }

    if (body.paiId) {
      const paiExistente = await repo.findOneBy({ id: Number(body.paiId) });
      if (paiExistente) {
        novoProcesso.pai = paiExistente;
      }
    }

    await repo.save(novoProcesso);
    return reply.status(201).send(novoProcesso);
  });

  app.put('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const registroProcesso = await repo.findOne({
      where: { id: Number(id) },
      relations: ['pai', 'area']
    });

    if (!registroProcesso) return reply.status(404).send({ message: "Processo não encontrado" });

    registroProcesso.nome = body.nome ?? registroProcesso.nome;
    registroProcesso.descricao = body.descricao ?? registroProcesso.descricao;
    registroProcesso.tipo = body.tipo ?? registroProcesso.tipo;
    registroProcesso.ferramentas = body.ferramentas ?? registroProcesso.ferramentas;
    registroProcesso.responsaveis = body.responsaveis ?? registroProcesso.responsaveis;
    registroProcesso.documentacao = body.documentacao ?? registroProcesso.documentacao;

    if (body.paiId !== undefined) {
      if (!body.paiId) {
        registroProcesso.pai = null;
      } else {
        const novoPai = await repo.findOneBy({ id: Number(body.paiId) });
        if (novoPai && novoPai.id !== registroProcesso.id) {
          registroProcesso.pai = novoPai;
        }
      }
    }

    if (body.areaId) {
      registroProcesso.area = { id: Number(body.areaId) } as any;
    }

    await repo.save(registroProcesso);
    return registroProcesso;
  });

  app.delete('/processos/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const itemParaRemover = await repo.findOne({
      where: { id: Number(id) },
      relations: ['sub_processos']
    });

    if (!itemParaRemover) return reply.status(404).send({ message: "Não encontrado" });

    if (itemParaRemover.sub_processos && itemParaRemover.sub_processos.length > 0) {
      return reply.status(400).send({
        message: "Não é possível apagar um processo que possui sub-processos vinculados."
      });
    }

    await repo.remove(itemParaRemover);
    return reply.status(204).send();
  });
}