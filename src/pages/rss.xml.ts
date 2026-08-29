import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const normas = (await getCollection('normas')).sort(
    (a, b) => b.data.data_publicacao.valueOf() - a.data.data_publicacao.valueOf()
  );

  const itens = normas
    .map(
      (n) => `    <item>
      <title>${escapar(n.data.titulo)}</title>
      <link>${base}/normas/${n.slug}</link>
      <guid>${base}/normas/${n.slug}</guid>
      <description>${escapar(n.data.ementa)}</description>
      <pubDate>${n.data.data_publicacao.toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Wiki da Reforma Tributária</title>
    <link>${base}</link>
    <description>Normas, prazos e conceitos da Reforma Tributária do Consumo.</description>
    <language>pt-BR</language>
${itens}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

function escapar(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
