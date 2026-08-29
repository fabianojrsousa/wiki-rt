import { defineCollection, z } from 'astro:content';

/**
 * Fonte oficial. Obrigatória em toda norma e todo marco.
 * Se faltar, o build quebra — é assim que o princípio
 * "nenhuma afirmação sem fonte" vira regra técnica.
 */
const fonteOficial = z.object({
  titulo: z.string(),
  url: z.string().url(),
  orgao: z.string(),
  acessado_em: z.coerce.date(),
  arquivo_local: z.string().optional(),
});

const normas = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    tipo: z.enum([
      'emenda_constitucional',
      'lei_complementar',
      'lei_ordinaria',
      'medida_provisoria',
      'decreto',
      'resolucao',
      'ato_conjunto',
      'portaria',
      'instrucao_normativa',
      'nota_tecnica',
      'informe_tecnico',
    ]),
    numero: z.string(),
    ano: z.number(),
    orgao: z.string(),
    data_publicacao: z.coerce.date(),
    data_vigencia: z.coerce.date().optional(),
    ementa: z.string(),
    status: z.enum(['vigente', 'revogada', 'parcialmente_revogada', 'sem_eficacia']),
    espelha: z.string().optional(),
    altera: z.array(z.string()).default([]),
    regulamenta: z.array(z.string()).default([]),
    conceitos: z.array(z.string()).default([]),
    fontes: z.array(fonteOficial).min(1),
    verificado_em: z.coerce.date(),
    ordem: z.number().default(50),
  }),
});

const marcos = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    data_evento: z.coerce.date(),
    data_fim: z.coerce.date().optional(),
    criticidade: z.enum(['critica', 'alta', 'media', 'informativa']),
    tipo: z.enum([
      'obrigacao_acessoria',
      'prazo_opcao',
      'inicio_vigencia',
      'entrega_declaracao',
      'marco_tecnico',
      'evento_legislativo',
      'evento_judicial',
    ]),
    afeta: z.array(z.string()).default([]),
    base_normativa: z.array(z.string()).default([]),
    /** false = data prevista, ainda sem ato publicado que a confirme */
    confirmado: z.boolean(),
    historico_datas: z
      .array(
        z.object({
          data_anterior: z.coerce.date(),
          alterada_em: z.coerce.date(),
          motivo: z.string(),
        })
      )
      .default([]),
    fontes: z.array(fonteOficial).min(1),
    verificado_em: z.coerce.date(),
  }),
});

const conceitos = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    resumo: z.string(),
    normas_relacionadas: z.array(z.string()).default([]),
    conceitos_relacionados: z.array(z.string()).default([]),
    verificado_em: z.coerce.date(),
  }),
});

const situacoes = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    publico: z.string(),
    resumo: z.string(),
    marcos_relevantes: z.array(z.string()).default([]),
    verificado_em: z.coerce.date(),
  }),
});

const glossario = defineCollection({
  type: 'data',
  schema: z.object({
    termo: z.string(),
    expansao: z.string().optional(),
    definicao: z.string(),
    ver: z.string().optional(),
  }),
});

export const collections = { normas, marcos, conceitos, situacoes, glossario };
