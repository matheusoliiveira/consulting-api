import { FastifyInstance } from 'fastify';
import { AppDataSource } from '../database';
import { Area } from '../entities/Area';
import { Not } from 'typeorm';

export async function areaRoutes(app: FastifyInstance) {
  const areaRepository = AppDataSource.getRepository(Area);

  app.get('/areas', async () => {
    return await areaRepository.find();
  });

  app.post('/areas', async (request, reply) => {
    const { nome, descricao } = request.body as any;
    const areaExistente = await areaRepository.findOneBy({ nome });

    if (areaExistente) {
      return reply.status(409).send({
        message: `O departamento "${nome}" já está cadastrado.`
      });
    }

    const novaArea = areaRepository.create({ nome, descricao });
    await areaRepository.save(novaArea);
    return reply.status(201).send(novaArea);
  });

  app.put('/areas/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { nome, descricao } = request.body as any;

    const area = await areaRepository.findOneBy({ id: Number(id) });
    if (!area) return reply.status(404).send({ message: "Área não encontrada" });

    if (nome && nome !== area.nome) {
      const nomeEmUso = await areaRepository.findOneBy({
        nome,
        id: Not(Number(id))
      });

      if (nomeEmUso) {
        return reply.status(409).send({
          message: `Já existe outro departamento chamado "${nome}".`
        });
      }
    }

    areaRepository.merge(area, { nome, descricao });
    return await areaRepository.save(area);
  });

  app.delete('/areas/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const area = await areaRepository.findOne({
      where: { id: Number(id) },
      relations: ['processos']
    });

    if (!area) {
      return reply.status(404).send({ message: "Área não encontrada" });
    }

    if (area.processos && area.processos.length > 0) {
      return reply.status(400).send({
        error: 'Erro de Dependência',
        message: `Não é possível excluir o departamento "${area.nome}" porque ele possui processos vinculados.`
      });
    }

    try {
      await areaRepository.remove(area);
      return reply.status(204).send();
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: "Erro ao tentar remover a área no banco de dados."
      });
    }
  });
}