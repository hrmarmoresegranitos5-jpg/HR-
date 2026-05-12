import { TUM_TIPOS } from './tui-catalog.js';

/** Mesma lógica de tumSetTipo (app-tumulos.js). */
export function applyTipoPreset(quoteInput, tipoKey) {
  const q = structuredClone(quoteInput);
  q.tipo = tipoKey;
  const preset = TUM_TIPOS[tipoKey];
  if (!preset) return q;
  q.dims = { ...preset.dims };
  Object.keys(q.pedras).forEach((k) => {
    if (q.pedras[k] && 'on' in q.pedras[k]) q.pedras[k].on = false;
  });
  Object.keys(q.mdo).forEach((k) => {
    if (q.mdo[k]) q.mdo[k].on = false;
  });
  Object.keys(q.obra).forEach((k) => {
    if (q.obra[k]) q.obra[k].on = false;
  });
  Object.keys(q.mat).forEach((k) => {
    if (q.mat[k] && 'on' in q.mat[k]) q.mat[k].on = false;
  });
  preset.pedras.forEach((k) => {
    if (q.pedras[k]) q.pedras[k].on = true;
  });
  preset.mdo.forEach((k) => {
    if (q.mdo[k]) q.mdo[k].on = true;
  });
  preset.obra.forEach((k) => {
    if (q.obra[k]) q.obra[k].on = true;
  });
  preset.mat.forEach((k) => {
    if (q.mat[k] && 'on' in q.mat[k]) q.mat[k].on = true;
  });
  if (preset.diasMdo) {
    q.mdo.marmorista.horas = preset.diasMdo * 8;
    q.mdo.ajudante.horas = preset.diasMdo * 8;
  }
  if (preset.diasObra) {
    ['fundacao', 'levantamento', 'reboco', 'contraPiso', 'gavetas', 'concreto', 'acabOb'].forEach((k) => {
      if (q.obra[k]?.on) q.obra[k].dias = Math.max(1, Math.round(preset.diasObra / 3));
    });
  }
  return q;
}
