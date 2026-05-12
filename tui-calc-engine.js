/** Cálculos espelham tumCalc / autos (app-tumulos.js) */

import { TUM_TIPOS } from './tui-catalog.js';

const TUM_STRUCT_ALT_POR_GAVETA = 0.6;
const TUM_STRUCT_HORAS_MO_POR_GAVETA_EXTRA = 8;
const TUM_STRUCT_CONCR_DIAS_POR_GAVETA_EXTRA = 0.62;
const TUM_STRUCT_REFORCO_TAMPA_RS = 195;
const TUM_STRUCT_CIMENTO_BOOST_PER_G = 0.2;
const TUM_STRUCT_FERRO_BOOST_PER_G = 0.15;

export function roundM(v) {
  return Math.round(v * 100) / 100;
}

/** Fator de “peso de serviço” da pedra (referência 3 cm). Espessuras maiores exigem mais manuseio/colagem. */
export function tumEspPedraFactor(espCmRaw) {
  const e = Number(espCmRaw);
  const base = Number.isFinite(e) && e > 0 ? e : 3;
  return roundM(Math.max(0.88, Math.min(1.38, base / 3)));
}

/** Envelope útil para revestimento: tampa/base + perímetro × altura. */
export function tumEnvelopeRevM2(cRaw, lRaw, aRaw) {
  const c = Number(cRaw) || 2.2;
  const l = Number(lRaw) || 0.9;
  const a = Number(aRaw) || 0.6;
  return roundM(2 * c * l + (2 * c + 2 * l) * a);
}

export function tumSumM2PedrasPlanas(q) {
  const keys = ['tampa', 'detalhe', 'laterais', 'frontais', 'base', 'gavetas', 'sainha'];
  let s = 0;
  for (const k of keys) {
    const p = q.pedras?.[k];
    if (p?.on) s += Number(p.m2) || 0;
  }
  return roundM(s);
}

export function tumNormalizeDescTxt(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Interpreta descTecnica antes dos outros autos (mesma heurística que app-tumulos.js). */
export function tumApplyDescricaoTecnica(q) {
  const raw = String(q.descTecnica ?? '').trim();
  if (!raw) return;
  const t = tumNormalizeDescTxt(raw);
  const preset = TUM_TIPOS[q.tipo];
  let presetG = preset?.dims?.gavetas ?? 1;
  presetG = Math.max(1, Math.min(12, Math.round(Number(presetG)) || 1));

  let gCur = Number(q.dims.gavetas);
  gCur = Math.max(1, Math.min(12, Math.round(Number.isFinite(gCur) ? gCur : presetG) || presetG));

  const mAdd =
    t.match(/\b(?:adicion(?:ar|r)|somar|incluir)[^0-9]{0,36}(\d{1,2})\s*gavetas?\b/) ||
    t.match(/\b(?:mais|adicione)\s+(\d{1,2})\s*gavetas?\b/) ||
    t.match(/\b\+\s*(\d{1,2})\s*gavetas?\b/);
  let g = gCur;
  if (mAdd) {
    g = Math.min(12, presetG + parseInt(mAdd[1], 10));
  } else {
    const mAbs = t.match(/\b(\d{1,2})\s*gavetas?\b/);
    if (mAbs) {
      g = Math.min(12, Math.max(1, parseInt(mAbs[1], 10)));
    } else {
      if (/\bgavetas?\s+tripl(?:a|as|o)|\btripl[oa]\s+gavetas?|\btres\s+gavetas?|\b3\s+gavetas?\b/.test(t)) g = 3;
      else if (
        /\bgavetas?\s+dupl(?:as|a|o)|\bdupl[oa]\s+gavetas?|\bduas\s+gavetas?\b|\b2\s+gavetas?\b/.test(t)
      )
        g = Math.max(g, 2);
      else if (/\b(uma|um)\s+gavetas?\b/.test(t)) g = 1;
      else if (/\bsem\s+gavetas?\b|\bsem\s+compartimento/.test(t)) g = 1;
    }
  }
  q.dims.gavetas = g;

  if (g >= 2 && q.pedras?.gavetas && /\bgavetas?\b/.test(t)) q.pedras.gavetas.on = true;

  if (/\bmontagens?\b/.test(t) && q.mdo?.montagem) q.mdo.montagem.on = true;

  if (/\brevest/.test(t)) {
    q.revestimento.on = true;
    const full =
      /\b(?:complet[oa]s?|integral|inteir[oa]|total(?:mente)?|360)\b/.test(t) ||
      /\bem\s+todo\b/.test(t) ||
      /\btod(?:o|os|a|as)\s+os?\s+lados?\b/.test(t);
    if (!full) {
      q.revestimento.escopo = 'parcial';
      q.revestimento.sincronizaM2 = true;
    }
    if (full) {
      q.revestimento.escopo = 'completo';
      q.revestimento.sincronizaM2 = true;
      if (q.revestimento.preparo) q.revestimento.preparo.on = true;
      if (q.obra?.reboco) q.obra.reboco.on = true;
    }
  }
}

/** Gavetas (clamp) + altura mínima física por compartimento. */
export function tumAutoStructuralGavetas(q) {
  const gRaw = Number(q.dims.gavetas);
  const g = Math.max(1, Math.min(12, Math.round(Number.isFinite(gRaw) ? gRaw : 1)));
  q.dims.gavetas = g;

  const minAlt = roundM(g * TUM_STRUCT_ALT_POR_GAVETA);
  let curAlt = Number(q.dims.alt);
  if (!Number.isFinite(curAlt) || curAlt <= 0) curAlt = minAlt;
  q.dims.alt = roundM(Math.max(curAlt, minAlt));
}

/** m² do revestimento a partir do envelope (parcial vs completo), se sincronização ativa. */
export function tumAutoRevestimentoM2(q) {
  const rv = q.revestimento;
  if (!rv?.on || rv.sincronizaM2 === false) return;
  const env = tumEnvelopeRevM2(q.dims.comp, q.dims.larg, q.dims.alt);
  const mult = rv.escopo === 'completo' ? 1.05 : 0.52;
  rv.m2 = roundM(env * mult);
}

/** Quantidades dos acabamentos especiais proporcionais a m²/perímetro (quando auto ativo). */
export function tumAutoAcabQty(q) {
  if (q.acabSyncQty === false) return;
  const d = q.dims;
  const c = Number(d.comp) || 2.2;
  const l = Number(d.larg) || 0.9;
  const g = Math.max(1, Math.round(Number(d.gavetas)) || 1);
  const peri = roundM(2 * (c + l));
  const ms = tumSumM2PedrasPlanas(q);
  const niv = { rapido: 0.88, normal: 1, refinado: 1.12 }[q.acabNivel || 'normal'] || 1;
  const set = (key, qty) => {
    if (q.acab?.[key]?.on) q.acab[key].qty = Math.max(0, roundM(qty * niv));
  };
  set('polimento', ms * 0.62);
  set('jateamento', ms * 0.38);
  set('resinagem', ms * 0.48);
  set('bisote', peri * 1.15);
  set('chanfro', peri * 0.72);
  set('furo', g + Math.max(0, ms * 0.04));
}

/** Horas MO: base do modelo + gavetas + carga por m² de pedra, revestimento, espessura e perfil de acabamento. */
export function tumAutoMoFromProjeto(q) {
  if (q.moHorasLivres) return;
  const preset = TUM_TIPOS[q.tipo];
  const diasMdoBase = preset?.diasMdo ?? 2;
  const g = Math.max(1, Math.round(Number(q.dims.gavetas)) || 1);
  const base = diasMdoBase * 8 + (g - 1) * TUM_STRUCT_HORAS_MO_POR_GAVETA_EXTRA;
  const espF = tumEspPedraFactor(q.dims?.esp);
  const ms = tumSumM2PedrasPlanas(q);
  const rev = q.revestimento?.on ? Number(q.revestimento.m2) || 0 : 0;
  const nivMul = { rapido: 0.9, normal: 1, refinado: 1.18 }[q.acabNivel || 'normal'] || 1;
  const acabOn = ['polimento', 'jateamento', 'bisote', 'resinagem', 'chanfro', 'furo'].some((k) => q.acab?.[k]?.on);
  const perfil = acabOn ? nivMul * 1.06 : nivMul;
  const extras = Math.round(((ms * 1.2 + rev * 2.15) * espF * perfil) / 8);
  const h = Math.round(base + extras);
  if (q.mdo?.marmorista) q.mdo.marmorista.horas = Math.max(h, Math.round(base));
  if (q.mdo?.ajudante) q.mdo.ajudante.horas = Math.max(h, Math.round(base));
}

/** Dias sugeridos de obra a partir do volume, perímetro×altura, compartimentos e revestimento. */
export function tumAutoObraDiasSugeridos(q) {
  if (q.obraAutos === false) return;
  const d = q.dims;
  const c = Number(d.comp) || 2.2;
  const l = Number(d.larg) || 0.9;
  const a = Number(d.alt) || 0.6;
  const g = Math.max(1, Math.round(Number(d.gavetas)) || 1);
  const preset = TUM_TIPOS[q.tipo];
  const diasObraBase = preset?.diasObra ?? 0;
  const env = tumEnvelopeRevM2(c, l, a);
  const revM = q.revestimento?.on ? Number(q.revestimento.m2) || 0 : 0;
  const espK = tumEspPedraFactor(d.esp);
  const vol = roundM(c * l * Math.max(0.25, a * 0.42));

  if (q.obra?.concreto?.on) {
    const baseConc = diasObraBase > 0 ? Math.max(0.4, roundM(diasObraBase / 7)) : 0.45;
    q.obra.concreto.dias = roundM(
      baseConc +
        Math.max(0, g - 1) * TUM_STRUCT_CONCR_DIAS_POR_GAVETA_EXTRA +
        vol * 0.095 +
        revM * 0.017 +
        (espK - 1) * 0.82
    );
  }
  if (q.obra?.fundacao?.on) {
    q.obra.fundacao.dias = roundM(Math.max(0.65, 0.9 + Math.max(0, c * l - 2) * 0.26 + vol * 0.035));
  }
  if (q.obra?.levantamento?.on) {
    q.obra.levantamento.dias = roundM(Math.max(0.55, 0.82 + env * 0.034 + Math.max(0, g - 1) * 0.42 + revM * 0.02 + (espK - 1) * 0.38));
  }
  if (q.obra?.gavetas?.on) {
    q.obra.gavetas.dias = roundM(Math.max(0.45, g * 0.56 + Math.max(0, g - 1) * 0.32 + revM * 0.014));
  }
}

export function tumAutoMatGavetasBoost(q) {
  const mat = q.mat;
  const g = Math.max(1, Math.round(Number(q.dims.gavetas)) || 1);
  const k = Math.max(0, g - 1);
  if (!k || !mat) return;
  if (mat.cimento?.on && (mat.cimento.qty || 0) > 0) {
    mat.cimento.qty = Math.ceil(mat.cimento.qty * (1 + TUM_STRUCT_CIMENTO_BOOST_PER_G * k));
  }
  if (mat.ferro?.on && (mat.ferro.qty || 0) > 0) {
    mat.ferro.qty = Math.ceil(mat.ferro.qty * (1 + TUM_STRUCT_FERRO_BOOST_PER_G * k));
  }
}

function stonePrice(quote, stones) {
  const sel = quote.stoneId && stones?.length ? stones.find((s) => s.id === quote.stoneId) : null;
  return sel ? sel.pr : quote.stonePrice || 0;
}

export function tumAutoCalcDims(q) {
  const d = q.dims;
  const p = q.pedras;
  const c = d.comp;
  const l = d.larg;
  const a = d.alt;
  const g = d.gavetas || 1;
  const fe = tumEspPedraFactor(d.esp);
  const m2fe = (v) => roundM(v * fe);
  if (p.tampa) p.tampa.m2 = m2fe(c * l);
  if (p.detalhe) p.detalhe.m2 = m2fe((c + l) * 2 * 0.1);
  if (p.laterais) p.laterais.m2 = m2fe(c * a * 2);
  if (p.frontais) p.frontais.m2 = m2fe(l * a * 2);
  if (p.base) p.base.m2 = m2fe(c * l);
  if (p.gavetas) p.gavetas.m2 = m2fe(l * (a / g) * g);
  if (p.sainha) p.sainha.m2 = m2fe((c + l) * 2 * 0.15);
  if (p.moldura) p.moldura.ml = p.moldura.ml || roundM((c + l) * 2);
  if (p.pingadeira) p.pingadeira.ml = p.pingadeira.ml || roundM((c + l) * 2);
}

export function tumAutoMatQty(q, calc) {
  const d = q.dims;
  const mat = q.mat;
  const c = Number(d.comp) || 2.2;
  const l = Number(d.larg) || 0.9;
  const a = Number(d.alt) || 0.6;
  const g = Math.max(1, Math.round(Number(d.gavetas)) || 1);
  const espK = tumEspPedraFactor(d.esp);
  const volFoot = roundM(c * l * Math.max(0.2, a * 0.38));
  let m2Total = (calc && calc.m2total) || c * l * 3;
  const revM = q.revestimento?.on ? Number(q.revestimento.m2) || 0 : 0;
  if (q.revestimento?.on) m2Total = roundM(m2Total + revM);
  const revBoost = revM > 0 ? 1 + Math.min(0.85, revM / Math.max(m2Total, 0.01)) : 1;
  const gBoost = 1 + 0.08 * Math.max(0, g - 1);
  const m2Parede = roundM(c * a * 2 + l * a * 2);

  if (mat.cimento) mat.cimento.qty = Math.ceil(volFoot * (5 + g * 0.32) * espK * revBoost * gBoost);
  if (mat.areia) mat.areia.qty = Math.round(volFoot * 0.045 * espK * gBoost * 100) / 100;
  if (mat.cola) mat.cola.qty = Math.ceil((m2Total * revBoost) / 4);
  if (mat.rejunte) mat.rejunte.qty = Math.ceil(m2Total * 0.52 * revBoost);
  if (mat.massa) mat.massa.qty = Math.ceil((m2Total * revBoost) / 8);
  if (mat.tijolos) mat.tijolos.qty = Math.ceil(m2Parede * 70 * gBoost * espK);
  if (mat.blocos) mat.blocos.qty = Math.ceil(m2Parede * 15 * gBoost * espK);
  if (mat.brita) mat.brita.qty = Math.round(c * l * 0.021 * gBoost * 100) / 100;
  if (mat.ferro) {
    mat.ferro.qty = Math.ceil(m2Parede * (2 + 0.38 * Math.max(0, g - 1)) * espK);
  }
}

export function tumCalc(q, stones) {
  const p = q.pedras;
  const mdo = q.mdo;
  const obra = q.obra;
  const mat = q.mat;
  const stPr = stonePrice(q, stones);

  let m2Liq = 0;
  ['tampa', 'detalhe', 'laterais', 'frontais', 'base', 'gavetas', 'sainha'].forEach((k) => {
    if (p[k] && p[k].on) m2Liq += p[k].m2 || 0;
  });
  if (p.moldura?.on) m2Liq += (p.moldura.ml || 0) * 0.12;
  if (p.pingadeira?.on) m2Liq += (p.pingadeira.ml || 0) * 0.08;
  const m2Total = m2Liq * (1 + (p.perda || 15) / 100);
  let custoPedra = m2Total * stPr;
  ['tampa', 'detalhe', 'laterais', 'frontais', 'base', 'gavetas', 'sainha'].forEach((k) => {
    if (p[k] && p[k].on) custoPedra += p[k].extra || 0;
  });
  if (p.moldura?.on) {
    custoPedra += (p.moldura.ml || 0) * (p.moldura.vlrMl || 120) - (p.moldura.ml || 0) * 0.12 * stPr;
  }
  if (p.pingadeira?.on) {
    custoPedra += (p.pingadeira.ml || 0) * (p.pingadeira.vlrMl || 80) - (p.pingadeira.ml || 0) * 0.08 * stPr;
  }
  if (p.recortes?.on) custoPedra += (p.recortes.qty || 0) * (p.recortes.vlrUn || 80);

  const gv = Math.max(1, Math.min(12, Math.round(Number(q.dims.gavetas)) || 1));
  const reforcoTampa = Math.max(0, gv - 1) * TUM_STRUCT_REFORCO_TAMPA_RS;
  custoPedra += reforcoTampa;

  const vendaPedra = custoPedra;

  let custoAcab = 0;
  let vendaAcab = 0;
  Object.keys(q.acab).forEach((k) => {
    const it = q.acab[k];
    if (it?.on) {
      custoAcab += (it.qty || 0) * (it.custo || 0);
      vendaAcab += (it.qty || 0) * (it.venda || 0);
    }
  });

  let custoLapide = 0;
  let vendaLapide = 0;
  if (q.lapide.on) {
    custoLapide = q.lapide.custo + q.lapide.linhas * q.lapide.custoPorLinha;
    vendaLapide = q.lapide.venda + q.lapide.linhas * q.lapide.vendaPorLinha;
  }

  let custoCruz = 0;
  let vendaCruz = 0;
  if (q.cruz.on) {
    custoCruz = q.cruz.custo;
    vendaCruz = q.cruz.venda;
  }

  let custoFoto = 0;
  let vendaFoto = 0;
  if (q.foto.on) {
    custoFoto = q.foto.custo + (q.foto.moldura ? q.foto.custoMoldura : 0);
    vendaFoto = q.foto.venda + (q.foto.moldura ? q.foto.vendaMoldura : 0);
  }

  let custoRev = 0;
  let vendaRev = 0;
  if (q.revestimento.on) {
    custoRev = (q.revestimento.m2 || 0) * q.revestimento.custo + (q.revestimento.preparo.on ? q.revestimento.preparo.custo : 0);
    vendaRev = (q.revestimento.m2 || 0) * q.revestimento.venda + (q.revestimento.preparo.on ? q.revestimento.preparo.venda : 0);
  }

  let custoMdo = 0;
  let vendaMdo = 0;
  if (mdo.marmorista?.on) {
    const dias = Math.ceil((mdo.marmorista.horas || 0) / 8);
    custoMdo += dias * (mdo.marmorista.diaria || 400);
    vendaMdo += dias * (mdo.marmorista.diaria || 400);
  }
  if (mdo.ajudante?.on) {
    const dias = Math.ceil((mdo.ajudante.horas || 0) / 8);
    custoMdo += dias * (mdo.ajudante.diaria || 220);
    vendaMdo += dias * (mdo.ajudante.diaria || 220);
  }
  ['instalacao', 'acabamento', 'montagem', 'transporte'].forEach((k) => {
    const it = mdo[k];
    if (it?.on) {
      custoMdo += it.custo || 0;
      vendaMdo += it.venda || 0;
    }
  });
  if (mdo.riscoQuebra?.on) {
    custoMdo += (custoPedra * (mdo.riscoQuebra.perc || 0)) / 100;
    vendaMdo += (custoPedra * (mdo.riscoQuebra.perc || 0)) / 100;
  }
  if (mdo.dificuldade?.on) {
    custoMdo += (custoPedra * (mdo.dificuldade.perc || 0)) / 100;
    vendaMdo += ((custoPedra * (mdo.dificuldade.perc || 0)) / 100) * 1.3;
  }

  let custoObra = 0;
  Object.keys(obra).forEach((k) => {
    const it = obra[k];
    if (it?.on) custoObra += (it.dias || 0) * (it.diaria || 350) * (it.equipe || 1);
  });

  let custoMat = 0;
  ['cimento', 'areia', 'brita', 'ferro', 'tijolos', 'blocos', 'massa', 'cola', 'rejunte'].forEach((k) => {
    const it = mat[k];
    if (it?.on) custoMat += (it.qty || 0) * (it.preco || 0);
  });
  if (mat.agua?.on) custoMat += mat.agua.vlr || 0;
  if (mat.frete?.on) custoMat += mat.frete.vlr || 0;

  const custoTotal =
    custoPedra +
    custoAcab +
    custoLapide +
    custoCruz +
    custoFoto +
    custoRev +
    custoMdo +
    custoObra +
    custoMat;
  const vendaTotal =
    vendaPedra +
    vendaAcab +
    vendaLapide +
    vendaCruz +
    vendaFoto +
    vendaRev +
    vendaMdo +
    custoObra +
    custoMat;
  const lucroTotal = vendaTotal - custoTotal;
  const margemExtra = (vendaTotal * (q.margem || 0)) / 100;
  const venda = vendaTotal + margemExtra - (q.desconto || 0);
  const margemReal = venda > 0 ? ((venda - custoTotal) / venda) * 100 : 0;

  return {
    m2total: m2Total,
    m2liq: m2Liq,
    custoPedra,
    vendaPedra,
    custoAcab,
    vendaAcab,
    custoLapide,
    vendaLapide,
    custoCruz,
    vendaCruz,
    custoFoto,
    vendaFoto,
    custoRev,
    vendaRev,
    custoMdo,
    vendaMdo,
    custoObra,
    custoMat,
    custoTotal,
    vendaTotal,
    lucroTotal,
    margemExtra,
    venda,
    margemReal,
  };
}

export function finalizeQuote(raw, stones) {
  const q = structuredClone(raw);
  tumAutoStructuralGavetas(q);
  tumAutoCalcDims(q);
  tumAutoRevestimentoM2(q);
  tumAutoAcabQty(q);
  tumAutoMoFromProjeto(q);
  tumAutoObraDiasSugeridos(q);
  let calc = tumCalc(q, stones);
  tumAutoMatQty(q, calc);
  tumAutoMatGavetasBoost(q);
  calc = tumCalc(q, stones);
  return { effective: q, calc };
}

export function fm(n) {
  return (Number(n) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}
