export const dia = (d: Date) =>
  d.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });

export const extenso = (d: Date) =>
  d.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long' });

export const ano = (d: Date) => d.getUTCFullYear();

/** Rótulo do intervalo de um marco: data única ou janela. */
export function rotuloData(inicio: Date, fim?: Date) {
  if (!fim) return extenso(inicio);
  return `${inicio.getUTCDate()} a ${extenso(fim)}`;
}
