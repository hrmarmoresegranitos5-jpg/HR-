// ══════════════════════════════════════════════════════════════════════
// APP-TUMULOS-ORCAMENTO.JS — Orçamento de Túmulos Integrado
// HR Mármores e Granitos · v3.2  (Etapa 5.1.2 — Geração automática de peças)
// ⚠ Medidas em CENTÍMETROS
// Integração: DB.j (Agenda) · DB.t (Finanças) · DB.q (Orçamentos)
//
// CSS NOVO (adicionar ao stylesheet):
//   .tum-acab-peca-on { background: rgba(201,168,76,.07); border-left: 2px solid var(--gold2,#c9a84c); }
//   .tum-peca-auto-badge { font-size:.5rem;background:rgba(201,168,76,.18);color:var(--gold2,#c9a84c);border:1px solid rgba(201,168,76,.3);border-radius:4px;padding:1px 5px;margin-left:5px;vertical-align:middle;letter-spacing:.04em;font-weight:700; }
//   .tum-peca-manual-badge { font-size:.5rem;background:rgba(120,120,120,.15);color:var(--t3,#888);border:1px solid rgba(120,120,120,.2);border-radius:4px;padding:1px 5px;margin-left:5px;vertical-align:middle;letter-spacing:.04em; }
//   .tum-auto-chip { display:inline-block;font-size:.55rem;background:rgba(100,200,100,.12);color:#6dbf6d;border:1px solid rgba(100,200,100,.25);border-radius:10px;padding:2px 8px;margin-bottom:8px;letter-spacing:.03em; }
//
// CSS ETAPA 5.1.3 — Motor Civil Automático (adicionar ao stylesheet):
//   .tum-civil-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(201,168,76,.15); }
//   .tum-civil-badge { display:inline-flex;align-items:center;gap:5px;font-size:.52rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;background:rgba(80,180,120,.12);color:#5db88a;border:1px solid rgba(80,180,120,.25);border-radius:12px;padding:3px 10px; }
//   .tum-civil-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px; }
//   .tum-civil-item { background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px 10px; }
//   .tum-civil-item-nm { font-size:.58rem;color:var(--t3,#888);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px; }
//   .tum-civil-item-val { font-size:.85rem;font-weight:700;color:var(--t1,#e8e2d5); }
//   .tum-civil-item-unit { font-size:.6rem;color:var(--t3,#888);margin-left:2px;font-weight:400; }
//   .tum-civil-item.highlight { border-color:rgba(201,168,76,.2);background:rgba(201,168,76,.04); }
//   .tum-civil-item.highlight .tum-civil-item-val { color:var(--gold2,#c9a84c); }
//   .tum-civil-dif { display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:.6rem;color:var(--t3,#888); }
//   .tum-civil-dif-bar { flex:1;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden; }
//   .tum-civil-dif-fill { height:100%;border-radius:2px;background:linear-gradient(90deg,#5db88a,#c9a84c,#e05555); }
//   .tum-civil-footer { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06); }
//   .tum-civil-total { background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.18);border-radius:8px;padding:10px;text-align:center; }
//   .tum-civil-total-lbl { font-size:.55rem;text-transform:uppercase;letter-spacing:.05em;color:var(--t3,#888); }
//   .tum-civil-total-val { font-size:1rem;font-weight:800;color:var(--gold2,#c9a84c);margin-top:2px; }
//   .tum-civil-prazo { background:rgba(80,180,120,.06);border:1px solid rgba(80,180,120,.2);border-radius:8px;padding:10px;text-align:center; }
//   .tum-civil-prazo-lbl { font-size:.55rem;text-transform:uppercase;letter-spacing:.05em;color:var(--t3,#888); }
//   .tum-civil-prazo-val { font-size:1rem;font-weight:800;color:#5db88a;margin-top:2px; }
//   .tum-civil-readonly-note { font-size:.55rem;color:var(--t3,#888);font-style:italic;margin-top:8px;text-align:center;opacity:.7; }
// ══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO PADRÃO
// ─────────────────────────────────────────────────────────────────────
var TUM_DEF_CFG = {
  margem:  35,
  parcMax: 8,
  juros:   12,
  mob: {
    pedreiro:   280,
    ajudante:   160,
    instalacao: 300,
    montagem:   280,
    transporte: 200
  },
  civil: {
    cimento:    38,
    areia:     120,
    brita:     150,
    argamassa:  28,
    ferro38:    42,
    ferro516:   28,
    malha:      45,
    blocos:    4.5
  },
  acab_ml: {
    moldura:    15,   // R$/ml — moldura decorativa de contorno
    pingadeira: 12,   // R$/ml — pingadeira de escoamento
    bisel:      18    // R$/ml — borda biselada 45°
  },
  extras_fix: {
    lapide_granito: 280,  // R$ — lápide de granito 60×40 cm
    plaquinha:      150,  // R$ — plaquinha gravada de identificação
    foto_porc:      200,  // R$ — foto em porcelana
    cruz_granito:   350,  // R$ — cruz em granito
    recorte_furo:    80   // R$ por unidade — recorte/furo
  },
  pedras: [
    { id:'p_gabriel', nm:'Preto São Gabriel',  cat:'Popular', pr:180, peso:78 },
    { id:'cinza_and', nm:'Cinza Andorinha',    cat:'Popular', pr:170, peso:75 },
    { id:'branco_si', nm:'Branco Siena',       cat:'Médio',   pr:220, peso:76 },
    { id:'verde_lab', nm:'Verde Labrador',     cat:'Médio',   pr:240, peso:80 },
    { id:'absoluto',  nm:'Absoluto Negro',     cat:'Premium', pr:380, peso:82 },
    { id:'carrara',   nm:'Mármore Carrara',    cat:'Premium', pr:420, peso:68 },
    { id:'quartzito', nm:'Quartzito Branco',   cat:'Premium', pr:460, peso:72 }
  ]
};

// ─────────────────────────────────────────────────────────────────────
// PRESETS — todas as medidas em cm
// C=comprimento, L=largura, E=espessura pedra, N=gavetas
// Ae=base estrutural(cm), Ab=rodapé(cm)
// ─────────────────────────────────────────────────────────────────────
var TUM_PRESETS = [
  { id:'simples',  nm:'Simples',       C:190, L:65, E:3, N:0, Ae:30, Ab:0,  badge:'Sem gaveta'  },
  { id:'1gav',     nm:'1 Gaveta',      C:200, L:70, E:3, N:1, Ae:30, Ab:8,  badge:'1 gaveta'    },
  { id:'dupla',    nm:'Dupla Gaveta',  C:200, L:70, E:3, N:2, Ae:30, Ab:8,  badge:'2 gavetas'   },
  { id:'premium',  nm:'Premium',       C:210, L:80, E:4, N:2, Ae:30, Ab:8,  badge:'Destaque'    },
  { id:'capela',   nm:'Capela',        C:220, L:90, E:3, N:3, Ae:35, Ab:8,  badge:'3–4 gav'     },
  { id:'moderno',  nm:'Moderno',       C:200, L:75, E:3, N:2, Ae:30, Ab:0,  badge:'1–2 gav'     },
  { id:'parcial',  nm:'Rev. Parcial',  C:190, L:65, E:3, N:1, Ae:30, Ab:0,  badge:'Econômico'   },
  { id:'completo', nm:'Rev. Completo', C:210, L:80, E:3, N:2, Ae:30, Ab:8,  badge:'Completo'    }
];

var TUM_PRESET_PECAS = {
  simples:  { tampa:true, lat_esq:false, lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  '1gav':   { tampa:true, lat_esq:true,  lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  dupla:    { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:false, lapide:false, rodape:false },
  premium:  { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:true,  rodape:false },
  capela:   { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:true,  rodape:true  },
  moderno:  { tampa:true, lat_esq:true,  lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  parcial:  { tampa:true, lat_esq:false, lat_dir:false, frente:true,  fundo:false, lapide:false, rodape:false },
  completo: { tampa:true, lat_esq:true,  lat_dir:true,  frente:true,  fundo:true,  lapide:false, rodape:true  }
};

// ─────────────────────────────────────────────────────────────────────
// TUM_MODELOS_AUTO — Etapa 5.1.2
// Define quais peças cada modelo gera automaticamente,
// acabamentos padrão sugeridos e flags de comportamento.
// Cada entrada pode sobrescrever pecas, acabs_peca e espessura mínima.
// ─────────────────────────────────────────────────────────────────────
var TUM_MODELOS_AUTO = {

  // ── Simples: só tampa e frente; sem laterais completas ─────────────
  simples: {
    label:   'Simples',
    desc:    'Tampa + frontal. Sem revestimento lateral.',
    pecas:   { tampa:true, lat_esq:false, lat_dir:false, frente:true, fundo:false, lapide:false, rodape:false },
    acabs:   [],                      // acabamentos auto-ativados
    espMin:  3,                       // espessura mínima recomendada (cm)
    premium: false
  },

  // ── 1 Gaveta: tampa + frente + lateral esquerda ────────────────────
  '1gav': {
    label:   '1 Gaveta',
    desc:    'Tampa + frente + lateral de acesso.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:false, frente:true, fundo:false, lapide:false, rodape:false },
    acabs:   [],
    espMin:  3,
    premium: false
  },

  // ── Dupla: tampa + frente + ambas laterais + laje divisória ────────
  dupla: {
    label:   'Dupla Gaveta',
    desc:    'Tampa + frente + laterais. Laje divisória calculada.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:false, lapide:false, rodape:false },
    acabs:   [],
    espMin:  3,
    premium: false
  },

  // ── Premium: completo + lápide + moldura automática ────────────────
  premium: {
    label:   'Premium',
    desc:    'Revestimento completo + lápide + acabamento elevado.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:true, lapide:true, rodape:false },
    acabs:   ['polido', 'moldura'],   // acabamentos ativados automaticamente
    espMin:  4,                       // espessura reforçada
    premium: true
  },

  // ── Capela: tudo + rodapé + 2+ divisórias ──────────────────────────
  capela: {
    label:   'Capela',
    desc:    'Completo com rodapé. 3+ gavetas, lajes múltiplas.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:true, lapide:true, rodape:true },
    acabs:   ['polido', 'moldura', 'pingadeira'],
    espMin:  3,
    premium: true
  },

  // ── Moderno: tampa + frente + lateral única ────────────────────────
  moderno: {
    label:   'Moderno',
    desc:    'Design assimétrico — tampa e frontal principal.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:false, frente:true, fundo:false, lapide:false, rodape:false },
    acabs:   ['angulo45'],
    espMin:  3,
    premium: false
  },

  // ── Parcial: mínimo econômico ──────────────────────────────────────
  parcial: {
    label:   'Rev. Parcial',
    desc:    'Tampa e frente apenas. Econômico.',
    pecas:   { tampa:true, lat_esq:false, lat_dir:false, frente:true, fundo:false, lapide:false, rodape:false },
    acabs:   [],
    espMin:  3,
    premium: false
  },

  // ── Completo: tudo menos lápide ───────────────────────────────────
  completo: {
    label:   'Rev. Completo',
    desc:    'Revestimento total + rodapé. Sem lápide.',
    pecas:   { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:true, lapide:false, rodape:true },
    acabs:   ['pingadeira'],
    espMin:  3,
    premium: false
  }
};

// ─────────────────────────────────────────────────────────────────────
// _tumGerarPecas(q) — Etapa 5.1.2
// Gera automaticamente o conjunto de peças para um dado estado q.
// Leva em conta: preset/modelo, nº de gavetas, Ab (rodapé), premium.
// Retorna { pecas, acabs_peca, autoInfo[] }
// autoInfo = lista de strings descrevendo o que foi gerado (para UI)
// ─────────────────────────────────────────────────────────────────────
function _tumGerarPecas(q) {
  var presetId = q.preset || 'dupla';
  var modelo   = TUM_MODELOS_AUTO[presetId] || TUM_MODELOS_AUTO['dupla'];
  var N        = Math.max(0, Math.round(q.N || 0));
  var Ab       = +(q.Ab) || 0;

  // Copia base de peças do modelo
  var pecas = JSON.parse(JSON.stringify(modelo.pecas));

  // Regra dinâmica: rodapé só existe se Ab > 0
  if (Ab <= 0) pecas.rodape = false;
  // Regra dinâmica: se modelo tem rodapé mas Ab zerou, remove
  if (Ab > 0 && modelo.pecas.rodape) pecas.rodape = true;

  // Regra dinâmica: gavetas → lajes divisórias são implícitas no motor.
  // Se N=0 em modelos de gaveta, remove laterais (caso manual)
  if (N === 0 && presetId !== 'simples' && presetId !== 'parcial') {
    // mantém seleção — usuário pode ter N=0 e ainda querer laterais
  }

  // Acabamentos automáticos do modelo
  var acabs_peca = JSON.parse(JSON.stringify(q.acabs_peca || {}));
  modelo.acabs.forEach(function(acabId) {
    // Só ativa se ainda não foi definido pelo usuário (primeira geração)
    // Se o objeto estava vazio = geração automática limpa
    if (acabs_peca[acabId] === undefined) {
      acabs_peca[acabId] = true;
    }
  });

  // Espessura mínima premium
  var espSugerida = modelo.espMin;

  // Monta lista de descrições para o badge AUTO na UI
  var autoInfo = [];
  Object.keys(pecas).forEach(function(pid) {
    if (!pecas[pid]) return;
    var def = TUM_PECAS_DEF.find(function(x){ return x.id === pid; });
    autoInfo.push(def ? def.nm : pid);
  });
  // Divisórias (geradas pelo motor, não por q.pecas)
  var N_lajes = Math.max(0, N - 1);
  if (N_lajes > 0) autoInfo.push('Laje Divisória ×' + N_lajes);
  if (modelo.premium) autoInfo.push('Acabamento Premium');

  return {
    pecas:       pecas,
    acabs_peca:  acabs_peca,
    espSugerida: espSugerida,
    isPremium:   modelo.premium,
    autoInfo:    autoInfo,
    modeloLabel: modelo.label,
    modeloDesc:  modelo.desc
  };
}

// ─────────────────────────────────────────────────────────────────────
// tumAutoGerarPecas() — chamado quando preset ou N muda
// Aplica geração automática preservando overrides manuais do usuário.
// _force=true → ignora overrides (reset completo ao modelo)
// ─────────────────────────────────────────────────────────────────────
function tumAutoGerarPecas(_force) {
  var q   = TUM.q;
  var gen = _tumGerarPecas(q);

  if (_force) {
    // Reset completo: aplica modelo sem preservar overrides
    q.pecas      = gen.pecas;
    q.acabs_peca = gen.acabs_peca;
  } else {
    // Merge suave: modelo define base, overrides manuais sobrevivem
    // (peças que o usuário explicitamente tocou não são sobrescritas)
    var manual = q._pecasManual || {};  // { id: true/false } = tocadas manualmente
    Object.keys(gen.pecas).forEach(function(pid) {
      if (!manual[pid]) q.pecas[pid] = gen.pecas[pid];
    });
    // Acabamentos automáticos só ativam se nunca foram definidos
    Object.keys(gen.acabs_peca).forEach(function(aid) {
      if (q.acabs_peca[aid] === undefined) q.acabs_peca[aid] = gen.acabs_peca[aid];
    });
  }

  // Espessura mínima: só sobe (nunca desce para não surpresar o usuário)
  if (gen.espSugerida > (q.E || 0)) q.E = gen.espSugerida;

  // Armazena info da geração para a UI exibir badge AUTO
  q._autoGen = gen;
  tumRecalc();
}

// ─────────────────────────────────────────────────────────────────────
// ACABAMENTOS DE BORDA (R$/ml — aplicado no perímetro das peças)
// ─────────────────────────────────────────────────────────────────────
var TUM_ACAB = [
  { id:'SEM', nm:'Sem acabamento',    prML:0,  dif:1.00, desc:'Borda bruta de corte'          },
  { id:'1L',  nm:'1 Lateral',         prML:8,  dif:1.05, desc:'Uma borda polida/bisotada'     },
  { id:'2L',  nm:'2 Laterais',        prML:14, dif:1.08, desc:'Duas bordas opostas'           },
  { id:'4L',  nm:'4 Laterais',        prML:24, dif:1.12, desc:'Todas as bordas'               },
  { id:'45G', nm:'45° Esquadria',     prML:18, dif:1.15, desc:'Borda em ângulo, sem emenda'   },
  { id:'BOL', nm:'Boleado',           prML:22, dif:1.20, desc:'Borda arredondada R=1,5cm'     },
  { id:'ESC', nm:'Escovado',          prML:12, dif:1.10, desc:'Textura antiderrapante'        },
  { id:'POL', nm:'Polido Brilho',     prML:20, dif:1.18, desc:'Espelho — memorial premium'    },
  { id:'FLA', nm:'Flameado',          prML:16, dif:1.12, desc:'Textura rústica por chama'     }
];

// ─────────────────────────────────────────────────────────────────────
// ACABAMENTOS POR PEÇA (R$/ml — incidem sobre as peças selecionadas)
// Centralizado aqui — NÃO existem fora deste módulo
// ─────────────────────────────────────────────────────────────────────
var TUM_ACAB_PECA = [
  {
    id:   'polido',
    nm:   'Polido Brilho',
    icon: '✨',
    desc: 'Espelho — superfície premium',
    prML: 20,
    // quais peças contribuem ML para este acabamento
    pecas: { tampa:'perim', frente:'perim', lat_esq:'perim', lat_dir:'perim', fundo:'perim', lapide:'perim', rodape:'perim' }
  },
  {
    id:   'escovado',
    nm:   'Escovado',
    icon: '〰️',
    desc: 'Textura antiderrapante',
    prML: 12,
    pecas: { tampa:'perim', frente:'perim', lat_esq:'perim', lat_dir:'perim', fundo:'perim', lapide:'perim', rodape:'perim' }
  },
  {
    id:   'flameado',
    nm:   'Flameado',
    icon: '🔥',
    desc: 'Textura rústica por chama',
    prML: 16,
    pecas: { tampa:'perim', frente:'perim', lat_esq:'perim', lat_dir:'perim', fundo:'perim', lapide:'perim', rodape:'perim' }
  },
  {
    id:   'boleado',
    nm:   'Boleado',
    icon: '〇',
    desc: 'Borda arredondada R=1,5cm',
    prML: 22,
    pecas: { tampa:'perim', frente:'largura', lat_esq:'altura', lat_dir:'altura', fundo:'largura', lapide:'perim', rodape:'comp' }
  },
  {
    id:   'angulo45',
    nm:   '45° Esquadria',
    icon: '◺',
    desc: 'Borda em ângulo, sem emenda',
    prML: 18,
    pecas: { tampa:'perim', frente:'largura', lat_esq:'altura', lat_dir:'altura', fundo:'largura', lapide:'perim', rodape:'comp' }
  },
  {
    id:   'lat1',
    nm:   '1 Lateral',
    icon: '▏',
    desc: 'Uma borda polida/bisotada',
    prML: 8,
    pecas: { tampa:'comp', frente:'comp', lat_esq:'altura', lat_dir:'altura', fundo:'comp', lapide:'comp', rodape:'comp' }
  },
  {
    id:   'lat2',
    nm:   '2 Lados',
    icon: '▏▕',
    desc: 'Duas bordas opostas',
    prML: 14,
    pecas: { tampa:'2comp', frente:'2comp', lat_esq:'2alt', lat_dir:'2alt', fundo:'2comp', lapide:'2comp', rodape:'2comp' }
  },
  {
    id:   'lat4',
    nm:   '4 Lados',
    icon: '□',
    desc: 'Todas as bordas da peça',
    prML: 24,
    pecas: { tampa:'perim', frente:'perim', lat_esq:'perim', lat_dir:'perim', fundo:'perim', lapide:'perim', rodape:'perim' }
  },
  {
    id:   'moldura',
    nm:   'Moldura Decorativa',
    icon: '▣',
    desc: 'Contorno decorativo em pedra',
    prML: 15,
    pecas: { tampa:'perim', frente:'perim', lapide:'perim' }
  },
  {
    id:   'pingadeira',
    nm:   'Pingadeira',
    icon: '💧',
    desc: 'Escoamento de água da chuva',
    prML: 12,
    pecas: { tampa:'comp', frente:'comp' }
  },
  {
    id:   'bisel',
    nm:   'Borda Biselada',
    icon: '◿',
    desc: 'Chanfro elegante — acabamento premium',
    prML: 18,
    pecas: { tampa:'perim', frente:'perim', lat_esq:'perim', lat_dir:'perim', fundo:'perim', lapide:'perim', rodape:'perim' }
  }
];

// ─────────────────────────────────────────────────────────────────────
// PEÇAS
// ─────────────────────────────────────────────────────────────────────
var TUM_PECAS_DEF = [
  { id:'tampa',   nm:'Tampa Superior',   sub:'Peça principal — todas as versões'  },
  { id:'lat_esq', nm:'Lateral Esquerda', sub:'Revestimento parcial e completo'    },
  { id:'lat_dir', nm:'Lateral Direita',  sub:'Revestimento completo'              },
  { id:'frente',  nm:'Frente / Frontal', sub:'Todas as versões'                   },
  { id:'fundo',   nm:'Fundo / Tardoz',   sub:'Revestimento completo / opcional'   },
  { id:'lapide',  nm:'Lápide',           sub:'60×40 cm padrão'                    },
  { id:'rodape',  nm:'Rodapé de Pedra',  sub:'Perímetro × altura do rodapé'       }
];

// ─────────────────────────────────────────────────────────────────────
// OPCIONAIS
// ─────────────────────────────────────────────────────────────────────
var TUM_OPTS_DEF = [
  { id:'cemiterio',      nm:'Instalação em cemitério',     sub:'+10% dificuldade · +20% logística',  fixo:0   },
  { id:'polido_extra',   nm:'Polimento extra completo',    sub:'+5% dificuldade',                     fixo:0   },
  { id:'gravacao',       nm:'Gravação / letras na lápide', sub:'+5% dificuldade',                     fixo:0   },
  { id:'cruzGranito',    nm:'Cruz em granito',             sub:'Valor fixo por peça',                 fixo:350 },
  { id:'foto_porc',      nm:'Foto em porcelana',           sub:'Valor fixo por peça',                 fixo:200 },
  { id:'lapide_granito', nm:'Lápide de granito',           sub:'Placa 60×40 cm — valor fixo',         fixo:280 },
  { id:'plaquinha',      nm:'Plaquinha gravada',           sub:'Identificação — valor fixo',           fixo:150 },
  { id:'recorte_furo',   nm:'Recorte / Furo',              sub:'Por peça — valor fixo',               fixo:80  }
];

// ─────────────────────────────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────────────
var TUM = {
  q: {
    // Identificação
    cli:'', tel:'', cemiterio:'', cidade:'', falecido:'', quadra:'', lote:'', obs:'',
    // Modelo
    preset: 'dupla',
    // ⚠ MEDIDAS EM CENTÍMETROS
    C:  200,  // comprimento (cm)
    L:   70,  // largura (cm)
    E:    3,  // espessura da pedra (cm)
    N:    2,  // gavetas
    Ae:  30,  // base estrutural (cm)
    Ab:   8,  // rodapé (cm)
    // Seleções
    matId:    null,
    acabId:   'POL',
    perda:    12,    // % perda no corte
    fatorCem: 20,    // % frete extra cemitério
    // Peças
    pecas: { tampa:true, lat_esq:true, lat_dir:true, frente:true, fundo:false, lapide:false, rodape:false },
    // Rastreia peças que o usuário tocou manualmente (preservadas no merge automático)
    _pecasManual: {},
    // Resultado da última geração automática (para badge AUTO na UI)
    _autoGen: null,
    // Opcionais
    opts:  { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false,
             lapide_granito:false, plaquinha:false, recorte_furo:false },
    // Acabamentos por peça — centralizados (substituem acabs_ml externos)
    // chave: id do acabamento (TUM_ACAB_PECA), valor: true/false
    acabs_peca: {},
    // Compatibilidade legado (lido no boot mas não mais utilizado)
    acabs_ml: { moldura:false, pingadeira:false, bisel:false },
    // Tipo de instalação
    instTipo: 'padrao'   // 'padrao' | 'complexa'
  },
  calc:  null,
  _tab:  'dados',
  _hist: []
};

// ─────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────
function _r2(v) { return Math.round(v * 100)  / 100;  }
function _r3(v) { return Math.round(v * 1000) / 1000; }
function _cm(v) { return Math.round(+v) + ' cm'; }
function _F(v)  { return typeof fm === 'function' ? fm(v) : v.toFixed(2); }
function _td()  { return typeof td === 'function' ? td() : new Date().toLocaleDateString('pt-BR'); }

function _tumCfg() {
  return (typeof CFG !== 'undefined' && CFG.tumCfg) ? CFG.tumCfg : TUM_DEF_CFG;
}

// Retorna todos os valores operacionais com fallback campo a campo.
// Garante que nunca chegue NaN ao motor de cálculo, mesmo que o CFG
// tenha campos ausentes, null ou inválidos.
function _tumVals() {
  var cfg = _tumCfg();
  var dc  = TUM_DEF_CFG.civil;
  var dm  = TUM_DEF_CFG.mob;
  var c   = (cfg.civil      && typeof cfg.civil      === 'object') ? cfg.civil      : {};
  var m   = (cfg.mob        && typeof cfg.mob        === 'object') ? cfg.mob        : {};
  var am  = (cfg.acab_ml    && typeof cfg.acab_ml    === 'object') ? cfg.acab_ml    : {};
  var ef  = (cfg.extras_fix && typeof cfg.extras_fix === 'object') ? cfg.extras_fix : {};

  function _n(v, fb) { var n = +v; return (isFinite(n) && n > 0) ? n : fb; }

  return {
    civil: {
      cimento:   _n(c.cimento,   dc.cimento),    // R$/saco
      areia:     _n(c.areia,     dc.areia),       // R$/m³
      brita:     _n(c.brita,     dc.brita),       // R$/m³
      argamassa: _n(c.argamassa, dc.argamassa),   // R$/saco
      ferro38:   _n(c.ferro38,   dc.ferro38),     // R$/barra
      ferro516:  _n(c.ferro516,  dc.ferro516),    // R$/barra
      malha:     _n(c.malha,     dc.malha),       // R$/m²
      blocos:    _n(c.blocos,    dc.blocos)       // R$/un.
    },
    mob: {
      pedreiro:   _n(m.pedreiro,   dm.pedreiro),   // R$/dia
      ajudante:   _n(m.ajudante,   dm.ajudante),   // R$/dia
      instalacao: _n(m.instalacao, dm.instalacao), // R$/serviço
      montagem:   _n(m.montagem,   dm.montagem),   // R$/serviço
      transporte: _n(m.transporte, dm.transporte)  // R$ fixo
    },
    acab_ml: {
      moldura:    _n(am.moldura,    TUM_DEF_CFG.acab_ml.moldura),    // R$/ml
      pingadeira: _n(am.pingadeira, TUM_DEF_CFG.acab_ml.pingadeira), // R$/ml
      bisel:      _n(am.bisel,      TUM_DEF_CFG.acab_ml.bisel)       // R$/ml
    },
    extras_fix: {
      lapide_granito: _n(ef.lapide_granito, TUM_DEF_CFG.extras_fix.lapide_granito),
      plaquinha:      _n(ef.plaquinha,      TUM_DEF_CFG.extras_fix.plaquinha),
      foto_porc:      _n(ef.foto_porc,      TUM_DEF_CFG.extras_fix.foto_porc),
      cruz_granito:   _n(ef.cruz_granito,   TUM_DEF_CFG.extras_fix.cruz_granito),
      recorte_furo:   _n(ef.recorte_furo,   TUM_DEF_CFG.extras_fix.recorte_furo)
    },
    margem:  _n(cfg.margem,  TUM_DEF_CFG.margem),
    parcMax: _n(cfg.parcMax, TUM_DEF_CFG.parcMax),
    juros:   _n(cfg.juros,   TUM_DEF_CFG.juros)
  };
}

function _tumPedras() {
  if (typeof CFG !== 'undefined' && CFG.stones && CFG.stones.length) {
    return CFG.stones.map(function(s) {
      return { id:s.id, nm:s.nm, cat:s.cat||s.fin||'', pr:s.pr, peso:s.peso||76 };
    });
  }
  return _tumCfg().pedras;
}

// ─────────────────────────────────────────────────────────────────────
// _tumCalcCivil(q) — ETAPA 5.1.3
// Motor Civil Automático dos Túmulos
//
// Calcula AUTOMATICAMENTE todos os quantitativos e custos de obra civil
// baseado no modelo real do túmulo — sem seleção manual de materiais.
//
// Calibração âncora (spec): N=2, 200×70cm →
//   18 sacos cimento · 1.2m³ areia · 0.9m³ brita · 42 blocos
//   6 barras 3/8" · 4 barras 5/16"
//
// Retorna:
//   { cimento, areia, brita, blocos, ferragem38, ferragem516, malha,
//     concreto, maoObra, custo_mat, custoCivil, prazoCivil, dificuldade }
// ─────────────────────────────────────────────────────────────────────
function _tumCalcCivil(q) {
  var vals = _tumVals();
  var cv   = vals.civil;
  var mob  = vals.mob;

  // ── Dimensões (cm → m) ──────────────────────────────────────────
  var C_m  = (q.C  || 200) / 100;
  var L_m  = (q.L  ||  70) / 100;
  var Ae_m = (q.Ae ||  30) / 100;
  var N    = Math.max(0, Math.round(q.N || 0));
  var E_cm = q.E || 3;
  var N_lajes = Math.max(0, N - 1);

  // Fator de área relativo ao padrão (200×70 cm = 1.40 m²)
  var areaFator = _r3((C_m * L_m) / 1.40);

  // ── FATOR DE DIFICULDADE TÉCNICA ─────────────────────────────────
  // Base por número de gavetas (âncoras do spec)
  var difBase;
  if      (N === 0) difBase = 1.00;  // Simples
  else if (N === 1) difBase = 1.15;  // 1 gaveta
  else if (N === 2) difBase = 1.35;  // 2 gavetas
  else              difBase = 1.65 + (N - 3) * 0.20; // 3+ gavetas

  // Modificadores adicionais
  var isPremium  = (q.preset === 'premium' || q.preset === 'capela');
  var isComplexa = ((q.instTipo || 'padrao') === 'complexa');
  if (isPremium)                      difBase += 0.25; // Premium +0.25
  if (isComplexa)                     difBase += 0.35; // Instalação complexa +0.35
  if (q.opts && q.opts.cemiterio)     difBase += 0.10; // Cemitério +0.10

  var dificuldade = _r2(Math.min(difBase, 3.50)); // cap de segurança

  // Rótulo legível da dificuldade
  var difLabel;
  if      (dificuldade < 1.10) difLabel = 'Simples';
  else if (dificuldade < 1.30) difLabel = 'Moderado';
  else if (dificuldade < 1.60) difLabel = 'Complexo';
  else if (dificuldade < 2.00) difLabel = 'Alto';
  else                          difLabel = 'Muito Alto';

  // ── QUANTITATIVOS BASE calibrados (200×70cm, N=2) ───────────────
  // Fórmula: base + N × incremento_por_gaveta, escalado por areaFator

  // Cimento CP-II (sacos 50kg)
  //   N=0→8, N=1→13, N=2→18, N=3→23 × areaFator
  var cimento = Math.ceil((8 + N * 5) * areaFator);

  // Areia média (m³)
  //   N=0→0.6, N=1→0.9, N=2→1.2, N=3→1.5 × areaFator
  var areia = _r3((0.60 + N * 0.30) * areaFator);

  // Brita 1 (m³)
  //   N=0→0.4, N=1→0.65, N=2→0.9, N=3→1.15 × areaFator
  var brita = _r3((0.40 + N * 0.25) * areaFator);

  // Blocos 14×19×39 (unidades)
  //   N=0→18, N=1→30, N=2→42, N=3→54 × areaFator
  var blocos = Math.ceil((18 + N * 12) * areaFator);

  // Ferragem 3/8" (barras 12m) — estrutural por perímetro + verticais
  //   N=0→4, N=1→5, N=2→6, N=3→7 · escala leve por área grande
  var ferragem38 = Math.ceil((4 + N) * Math.max(1.00, areaFator * 0.90));

  // Ferragem 5/16" (barras 12m) — estribos e travamentos
  //   N=0→2, N=1→3, N=2→4, N=3→5 · escala leve por área grande
  var ferragem516 = Math.ceil((2 + N) * Math.max(1.00, areaFator * 0.90));

  // Malha Q-92 (m²) — apenas nas lajes divisórias
  var malha = _r2(C_m * L_m * N_lajes);

  // Volume de concreto (m³): fundação + lajes divisórias
  var volFundacao = C_m * L_m * Ae_m;
  var volLajes    = C_m * L_m * 0.06 * N_lajes;
  var concreto    = _r3(volFundacao + volLajes);

  // ── Bônus PREMIUM: +20% nos materiais principais ─────────────────
  if (isPremium) {
    cimento     = Math.ceil(cimento     * 1.20);
    areia       = _r3(areia     * 1.20);
    brita       = _r3(brita     * 1.20);
    blocos      = Math.ceil(blocos      * 1.15);
    ferragem38  = Math.ceil(ferragem38  * 1.25);
    ferragem516 = Math.ceil(ferragem516 * 1.25);
    malha       = _r2(malha * 1.20);
  }

  // ── CUSTO DE MATERIAIS ───────────────────────────────────────────
  var custo_mat = _r2(
    cimento     * cv.cimento   +
    areia       * cv.areia     +
    brita       * cv.brita     +
    blocos      * cv.blocos    +
    ferragem38  * cv.ferro38   +
    ferragem516 * cv.ferro516  +
    malha       * cv.malha
  );

  // Frete cemitério sobre materiais civis
  if (q.opts && q.opts.cemiterio) {
    custo_mat = _r2(custo_mat * (1 + (q.fatorCem || 20) / 100));
  }

  // ── MÃO DE OBRA ESTRUTURAL (pedreiro + ajudante para obra civil) ─
  var dias_estrutura = Math.ceil((2 + N) * dificuldade);
  var maoObra = _r2(dias_estrutura * (mob.pedreiro + mob.ajudante));

  // ── CUSTO CIVIL TOTAL (materiais + M.O. estrutural) ─────────────
  var custoCivil = _r2(custo_mat + maoObra);

  // ── PRAZO CIVIL (dias úteis de obra + cura de concreto) ─────────
  var dias_obra  = Math.ceil(2 + N * 1.5);          // obra principal
  if (isPremium)        dias_obra += 1;              // acabamento extra
  if (isComplexa)       dias_obra += 2;              // complexidade
  if (areaFator > 1.50) dias_obra += 1;              // área grande
  var prazoCivil = 7 + dias_obra;                    // 7 dias cura (fixo)

  return {
    // Contexto dimensional
    C_m: C_m, L_m: L_m, Ae_m: Ae_m,
    N: N, N_lajes: N_lajes, areaFator: areaFator,

    // Quantitativos de materiais
    cimento:     cimento,      // sacos 50kg
    areia:       areia,        // m³
    brita:       brita,        // m³
    blocos:      blocos,       // unidades 14×19×39
    ferragem38:  ferragem38,   // barras 3/8" 12m
    ferragem516: ferragem516,  // barras 5/16" 12m
    malha:       malha,        // m² (lajes divisórias)
    concreto:    concreto,     // m³ total (fundação + lajes)

    // Custos
    custo_mat:   custo_mat,    // R$ materiais
    maoObra:     maoObra,      // R$ mão de obra estrutural
    custoCivil:  custoCivil,   // R$ total civil (mat + M.O.)

    // Prazo e dificuldade
    prazoCivil:  prazoCivil,   // dias úteis (cura + obra)
    dias_obra:   dias_obra,    // dias de obra em campo
    dias_estrutura: dias_estrutura,
    dificuldade: dificuldade,  // fator técnico (ex: 1.35)
    difLabel:    difLabel,     // texto (ex: 'Complexo')
    isPremium:   isPremium,
    isComplexa:  isComplexa
  };
}

// ─────────────────────────────────────────────────────────────────────
// MOTOR DE CÁLCULO (medidas entram em cm, convertidas para metros)
// ─────────────────────────────────────────────────────────────────────
function _tumCalcFull() {
  var q    = TUM.q;
  var cfg  = _tumCfg();
  var vals = _tumVals(); // valores com fallback campo a campo

  // cm → metros para cálculo interno
  var C  = q.C  / 100;
  var L  = q.L  / 100;
  var E  = q.E;                 // espessura: mantemos em cm como índice
  var N  = Math.max(0, Math.round(q.N));
  var Ae = q.Ae / 100;
  var Ab = q.Ab / 100;

  // Altura total: base + gavetas (45cm cada) + tampa (E+2cm)
  var At_cm = E + 2;
  var At    = At_cm / 100;
  var A     = Ae + (N * 0.45) + At;
  var A_cm  = _r2(A * 100);

  var _pedras = _tumPedras();
  var mat  = _pedras.find(function(x){ return x.id === q.matId; }) || _pedras[0];
  var acab = TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || TUM_ACAB[0];

  // ── 1. PEÇAS DE PEDRA ────────────────────────────────────────────
  var pecasCalc = [];
  var m2_bruto  = 0;

  function peca(nm, dim, m2, ml) {
    pecasCalc.push({ nm:nm, dim:dim, m2:_r2(m2), ml:_r2(ml) });
    m2_bruto += m2;
  }

  if (q.pecas.tampa)   peca('Tampa Superior',            _cm(q.C)+'×'+_cm(q.L),         C*L,         2*(C+L));
  if (q.pecas.lat_esq) peca('Lateral Esquerda',          _cm(A_cm)+'×'+_cm(q.L),         A*L,         A);
  if (q.pecas.lat_dir) peca('Lateral Direita',           _cm(A_cm)+'×'+_cm(q.L),         A*L,         A);
  if (q.pecas.frente)  peca('Frente / Frontal',          _cm(A_cm)+'×'+_cm(q.C),         A*C,         2*C);
  if (q.pecas.fundo)   peca('Fundo / Tardoz',            _cm(A_cm)+'×'+_cm(q.C),         A*C,         0);
  if (q.pecas.lapide)  peca('Lápide (60×40 cm)',         '60×40 cm',                      0.60*0.40,   2*(0.60+0.40));

  var N_lajes = Math.max(0, N - 1);
  if (N_lajes > 0)
    peca('Laje Divisória (×'+N_lajes+')', _cm(q.C)+'×'+_cm(q.L)+'×'+N_lajes, C*L*N_lajes, 0);

  if (q.pecas.rodape && Ab > 0) {
    var perim = 2*(C+L);
    peca('Rodapé', q.Ab+' cm × '+_r2(perim)+' ml', Ab*perim, perim);
  }

  var fatorPerda = 1 + (q.perda / 100);
  var m2_total   = _r3(m2_bruto * fatorPerda);

  // Multiplicador de espessura
  var espMult = {2:1.00, 3:1.35, 4:1.70, 5:2.10};
  var espM    = espMult[E] || 1.35;
  var custo_pedra  = _r2(m2_total * mat.pr * espM);
  var peso_total   = _r2(m2_total * mat.peso * (E / 3));

  // ── 2. ACABAMENTOS ───────────────────────────────────────────────
  var ml_total = 0;
  pecasCalc.forEach(function(p){ ml_total += p.ml; });
  ml_total = _r2(ml_total);
  var custo_acabamento = _r2(ml_total * acab.prML);

  // ── 3. CONSTRUÇÃO CIVIL — Motor Automático (Etapa 5.1.3) ─────────
  // Toda a obra civil é calculada automaticamente por _tumCalcCivil(q).
  // Nenhum checkbox manual. O usuário não seleciona materiais.
  var _civil        = _tumCalcCivil(q);
  var sacos_cimento = _civil.cimento;
  var m3_areia      = _civil.areia;
  var m3_brita      = _civil.brita;
  var unid_blocos   = _civil.blocos;
  var barras_f38    = _civil.ferragem38;
  var barras_f516   = _civil.ferragem516;
  var m2_malha      = _civil.malha;
  var Vol_total     = _civil.concreto;           // m³ (fundação + lajes)
  var sacos_argam   = Math.ceil(_civil.concreto * 5 + N * 0.5); // argamassa reboco
  var custo_civil   = _civil.custo_mat;          // só materiais no custo_total
  // (M.O. estrutural está em _civil.maoObra — incluída no custo_mob abaixo)

  // ── 4. MÃO DE OBRA ───────────────────────────────────────────────
  var Dif = 1.00;
  Dif += 0.05 * N;
  if (q.opts.cemiterio)    Dif += 0.10;
  if (q.opts.polido_extra) Dif += 0.05;
  if (q.opts.gravacao)     Dif += 0.05;
  if (acab.id === 'POL' || acab.id === '45G') Dif += 0.05;
  if (q.pecas.fundo && q.pecas.lat_esq && q.pecas.lat_dir) Dif += 0.08;
  if ((q.instTipo || 'padrao') === 'complexa') Dif += 0.25;  // instalação complexa
  Dif = _r2(Dif);

  var mob          = vals.mob;    // mão de obra via CFG (com fallback)
  var v_pedreiro   = _r2((2 + N)        * mob.pedreiro   * Dif);
  var v_ajudante   = _r2((2 + N)        * mob.ajudante   * Dif);
  var v_instalacao = _r2((1.5 + N*0.5)  * mob.instalacao);
  var v_montagem   = _r2((0.5 + N*0.25) * mob.montagem   * Dif);
  var v_frete      = mob.transporte + (N >= 2 ? 80 : 0);
  // M.O. estrutural (pedreiro+ajudante para obra civil) já em _civil.maoObra
  // Somamos ao custo_mob para evitar subcusto do serviço completo
  var custo_mob    = _r2(v_pedreiro + v_ajudante + v_instalacao + v_montagem + v_frete + _civil.maoObra);

  // ── 5. EXTRAS FIXOS (valores via CFG com fallback) ──────────────────
  var efv = vals.extras_fix;
  var custo_extras = 0;
  var extras_det   = [];
  var _extras_map  = [
    { key:'cruzGranito',    nm:'Cruz em granito',    val: efv.cruz_granito   },
    { key:'foto_porc',      nm:'Foto em porcelana',  val: efv.foto_porc      },
    { key:'lapide_granito', nm:'Lápide de granito',  val: efv.lapide_granito },
    { key:'plaquinha',      nm:'Plaquinha gravada',  val: efv.plaquinha      },
    { key:'recorte_furo',   nm:'Recorte / Furo',     val: efv.recorte_furo   }
  ];
  _extras_map.forEach(function(x) {
    if (q.opts[x.key]) { custo_extras += x.val; extras_det.push({ nm:x.nm, val:x.val }); }
  });
  custo_extras = _r2(custo_extras);

  // ── 5b. ACABAMENTOS POR PEÇA (centralizados — R$/ml por peça selecionada) ──
  var acabs_peca  = q.acabs_peca || {};
  var custo_acab_peca = 0;
  var acab_peca_det   = [];  // { nm, itens:[{peca,ml}], prML, total }

  // Helper: dado uma peça e o modo de ML, retorna os metros lineares dessa peça
  function _mlPeca(pecaId, modo, Cm, Lm, Am) {
    // Cm=comprimento(m), Lm=largura(m), Am=altura total(m)
    switch(modo) {
      case 'perim':   return _r2(2*(Cm+Lm));    // perímetro completo
      case 'comp':    return _r2(Cm);
      case '2comp':   return _r2(2*Cm);
      case 'largura': return _r2(Lm);
      case '2larg':   return _r2(2*Lm);
      case 'altura':  return _r2(Am);
      case '2alt':    return _r2(2*Am);
      default:        return _r2(2*(Cm+Lm));
    }
  }

  // Dimensões das peças individuais em metros
  var _dimPecas = {
    tampa:   { C:C,   L:L,   A:At  },
    frente:  { C:C,   L:A,   A:A   },
    fundo:   { C:C,   L:A,   A:A   },
    lat_esq: { C:A,   L:L,   A:A   },
    lat_dir: { C:A,   L:L,   A:A   },
    lapide:  { C:0.6, L:0.4, A:0.4 },
    rodape:  { C:C,   L:L,   A:Ab  }
  };

  TUM_ACAB_PECA.forEach(function(ap) {
    if (!acabs_peca[ap.id]) return;
    var itens = [];
    var totalML = 0;
    // Para cada peça selecionada que este acabamento cobre:
    Object.keys(ap.pecas).forEach(function(pecaId) {
      if (!q.pecas[pecaId]) return;           // peça não selecionada
      if (pecaId === 'rodape' && Ab <= 0) return;
      var modo = ap.pecas[pecaId];
      var dim  = _dimPecas[pecaId];
      if (!dim) return;
      var ml = _mlPeca(pecaId, modo, dim.C, dim.L, dim.A);
      itens.push({ peca: pecaId, ml: ml });
      totalML += ml;
    });
    if (totalML <= 0) return;
    totalML = _r2(totalML);
    var tot  = _r2(totalML * ap.prML);
    custo_acab_peca += tot;
    acab_peca_det.push({ id:ap.id, nm:ap.nm, icon:ap.icon, prML:ap.prML, itens:itens, mlTotal:totalML, total:tot });
  });
  custo_acab_peca = _r2(custo_acab_peca);

  // ── 5c. LEGADO: acabs_ml (perímetro geral) — mantido para compatibilidade ──
  var perim_ml      = _r2(2 * (C + L));
  var amlv          = vals.acab_ml;
  var custo_acab_ml = 0;
  var acab_ml_det   = [];
  // (legado não mais renderizado na UI, apenas incluído no custo_total)
  var _acab_ml_legacy = [
    { key:'moldura',    nm:'Moldura decorativa', prML: amlv.moldura    },
    { key:'pingadeira', nm:'Pingadeira',          prML: amlv.pingadeira },
    { key:'bisel',      nm:'Borda biselada 45°',  prML: amlv.bisel      }
  ];
  var acabs_ml_leg = q.acabs_ml || {};
  _acab_ml_legacy.forEach(function(x) {
    if (acabs_ml_leg[x.key]) {
      var tot = _r2(perim_ml * x.prML);
      custo_acab_ml += tot;
      acab_ml_det.push({ nm:x.nm, ml:perim_ml, prML:x.prML, total:tot });
    }
  });
  custo_acab_ml = _r2(custo_acab_ml);

  // ── 6. PRAZO (dias úteis) ────────────────────────────────────────
  var dias_fabr   = Math.ceil(m2_total / 6) + N;
  var dias_obra   = _civil.dias_obra;             // vem do motor civil
  var dias_cura   = 7;                            // cura de concreto (fixo)
  var dias_inst   = Math.ceil(1 + N * 0.5);
  if ((q.instTipo || 'padrao') === 'complexa') dias_inst += 2;
  var prazo_total = Math.max(dias_fabr, dias_obra) + dias_cura + dias_inst;

  // ── 7. TOTAIS ────────────────────────────────────────────────────
  var margem     = vals.margem;   // % margem de lucro via CFG
  var parcMax    = vals.parcMax;  // nº máximo de parcelas via CFG
  var juros      = vals.juros;    // % juros parcelamento via CFG

  var custo_total = _r2(custo_pedra + custo_acabamento + custo_civil + custo_mob + custo_extras + custo_acab_ml + custo_acab_peca);
  var valor_vista = _r2(custo_total / (1 - margem / 100));
  var valor_parc  = _r2(valor_vista * (1 + juros / 100));
  var parc_mensal = _r2(valor_parc  / parcMax);
  var lucro       = _r2(valor_vista - custo_total);

  // ── 8. ALERTA GAVETA ─────────────────────────────────────────────
  var C_int_cm = q.C - 30;
  var L_int_cm = q.L - 30;
  var alertaGaveta = N > 0 && (C_int_cm < 175 || L_int_cm < 55);

  return {
    C:C, L:L, E:E, N:N, Ae:Ae, Ab:Ab, A:A,
    A_cm:A_cm, At_cm:At_cm, N_lajes:N_lajes,
    C_int_cm:C_int_cm, L_int_cm:L_int_cm, alertaGaveta:alertaGaveta,
    mat:mat, acab:acab, espM:espM,
    pecasCalc:pecasCalc,
    m2_bruto:_r3(m2_bruto), m2_total:m2_total,
    ml_total:ml_total, peso_total:peso_total,
    custo_pedra:custo_pedra,
    custo_acabamento:custo_acabamento,
    custo_civil:custo_civil,
    custo_mob:custo_mob,
    custo_extras:custo_extras,
    extras_det:extras_det,
    custo_acab_ml:custo_acab_ml,
    acab_ml_det:acab_ml_det,
    custo_acab_peca:custo_acab_peca,
    acab_peca_det:acab_peca_det,
    perim_ml:perim_ml,
    instTipo: q.instTipo || 'padrao',
    Vol_total:_r3(Vol_total),
    sacos_cimento:sacos_cimento, m3_areia:m3_areia, m3_brita:m3_brita,
    sacos_argam:sacos_argam, barras_f38:barras_f38, barras_f516:barras_f516,
    m2_malha:m2_malha, unid_blocos:unid_blocos,
    // Motor Civil completo (Etapa 5.1.3)
    civil: _civil,
    v_pedreiro:v_pedreiro, v_ajudante:v_ajudante,
    v_instalacao:v_instalacao, v_montagem:v_montagem, v_frete:v_frete, Dif:Dif,
    custo_total:custo_total,
    valor_vista:valor_vista, valor_parc:valor_parc,
    parc_mensal:parc_mensal, lucro:lucro,
    margem:margem, parcMax:parcMax, juros:juros,
    prazo_total:prazo_total,
    prazo_dias:prazo_total,
    // Aliases para DB
    venda:      valor_vista,
    custoTotal: custo_total,
    lucroTotal: lucro,
    margemReal: valor_vista > 0 ? _r2(lucro / valor_vista * 100) : 0
  };
}

// ─────────────────────────────────────────────────────────────────────
// INIT / ENTRY
// ─────────────────────────────────────────────────────────────────────
function tumInit()   { _tumBoot(); }
function renderTum() { _tumBoot(); }

// ─────────────────────────────────────────────────────────────────────
// MODAL — usado quando pg9 não existe (Novo-app integrado)
// ─────────────────────────────────────────────────────────────────────
function _tumOpenModal() {
  var existing = document.getElementById('tumOrcModal');
  if (existing) { existing.remove(); }
  var el = document.createElement('div');
  el.id = 'tumOrcModal';
  el.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.92);overflow-y:auto;-webkit-overflow-scrolling:touch;';
  el.innerHTML = '<div style="min-height:100vh;">'
    + '<div style="position:sticky;top:0;z-index:10;background:var(--bg2,#101012);border-bottom:1px solid rgba(201,168,76,.2);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">'
    + '<span style="font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:var(--gold,#c9a84c);font-weight:700;">⚰️ Orçamento de Túmulo</span>'
    + '<button onclick="closeTumOrcModal()" style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:var(--t2,#b0ab9e);padding:5px 13px;font-size:.75rem;cursor:pointer;font-family:Outfit,sans-serif;">✕ Fechar</button>'
    + '</div>'
    + '<div id="pg9" style="padding-bottom:80px;min-height:calc(100vh - 48px);"></div>'
    + '</div>';
  document.body.appendChild(el);
  _tumBoot();
}
function closeTumOrcModal() {
  var el = document.getElementById('tumOrcModal');
  if (el) el.remove();
}

// Função chamada pelo botão no ambiente Túmulo do Novo-app
function abrirCalculadoraTumulos() {
  _tumOpenModal();
}

// Abre a calculadora pré-preenchida com dados do ambiente do Novo-app
function tumAbrirComAmb(ambId) {
  // Pega dados do ambiente
  var amb = (typeof ambientes !== 'undefined') ? ambientes.find(function(a) { return a.id === ambId; }) : null;
  if (amb) {
    // Pré-preenche dados do falecido/cemitério do tumExtra
    var te = amb.tumExtra || {};
    if (te.falecido)  TUM.q.falecido  = te.falecido;
    if (te.cemiterio) TUM.q.cemiterio = te.cemiterio;
    if (te.quadra)    TUM.q.quadra    = te.quadra;
    if (te.lote)      TUM.q.lote      = te.lote;
    // Pré-preenche pedra selecionada
    if (amb.selMat && typeof CFG !== 'undefined') {
      var st = (CFG.stones || []).find(function(s) { return s.id === amb.selMat; });
      if (st) TUM.q.matId = st.id;
    }
    // Salva id do ambiente para sincronizar de volta ao fechar
    TUM._ambId = ambId;
  }
  // Pega cliente/tel dos campos do formulário principal
  var cliEl = document.getElementById('cli');
  var telEl = document.getElementById('tel');
  if (cliEl && cliEl.value) TUM.q.cli = cliEl.value;
  if (telEl && telEl.value) TUM.q.tel = telEl.value;
  _tumOpenModal();
}

function _tumBoot() {
  _tumInitCfg();
  _tumLoadHist();
  if (!TUM.q.matId) TUM.q.matId = _tumPedras()[0].id;
  // Geração automática de peças na inicialização (merge suave — respeita overrides salvos)
  if (!TUM.q._autoGen) {
    if (!TUM.q._pecasManual) TUM.q._pecasManual = {};
    var _gen = _tumGerarPecas(TUM.q);
    TUM.q._autoGen = _gen;
  }
  TUM.calc = _tumCalcFull();
  _tumRender();
}

function _tumInitCfg() {
  if (typeof CFG === 'undefined') return;
  if (!CFG.tumCfg) {
    CFG.tumCfg = JSON.parse(JSON.stringify(TUM_DEF_CFG));
    if (typeof svCFG === 'function') svCFG();
    return;
  }
  ['mob','civil','acab_ml','extras_fix'].forEach(function(k) {
    if (!CFG.tumCfg[k]) CFG.tumCfg[k] = JSON.parse(JSON.stringify(TUM_DEF_CFG[k]));
    Object.keys(TUM_DEF_CFG[k]).forEach(function(f) {
      if (CFG.tumCfg[k][f] === undefined) CFG.tumCfg[k][f] = TUM_DEF_CFG[k][f];
    });
  });
  if (!CFG.tumCfg.pedras || !CFG.tumCfg.pedras.length)
    CFG.tumCfg.pedras = JSON.parse(JSON.stringify(TUM_DEF_CFG.pedras));
  if (!CFG.tumCfg.margem) CFG.tumCfg.margem = TUM_DEF_CFG.margem;
}

function _tumLoadHist() {
  try { TUM._hist = JSON.parse(localStorage.getItem('hr_tum_hist') || '[]'); }
  catch(e) { TUM._hist = []; }
}

// ─────────────────────────────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
function _tumRender() {
  // Suporte a pg9 (standalone) e ao modal tumCalcMd (Novo-app integrado)
  var pg = document.getElementById('pg9') || document.getElementById('tumCalcMd');
  if (!pg) {
    // Se chamado fora de contexto, tenta criar modal
    _tumOpenModal();
    return;
  }
  var r  = TUM.calc || {};
  var vf = r.valor_vista || 0;
  var q  = TUM.q;
  var preset = TUM_PRESETS.find(function(p){ return p.id === q.preset; });
  var subLbl = (preset ? preset.nm : '') +
    (q.N > 0 ? ' · ' + q.N + ' gav.' : '') +
    ' · ' + q.C + '×' + q.L + ' cm';

  pg.innerHTML =
    '<div class="tum-hero">' +
      '<div class="tum-hero-row">' +
        '<div>' +
          '<div class="tum-hero-title">⚰️ Orçamento de Túmulo</div>' +
          '<div class="tum-hero-sub">' + subLbl + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div class="tum-hero-val">' + (vf > 0 ? 'R$ ' + _F(vf) : '—') + '</div>' +
          (r.lucro > 0 ? '<div style="font-size:.6rem;color:var(--grn);margin-top:2px">lucro R$ ' + _F(r.lucro) + ' · ' + r.margemReal + '%</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +
    _tumTabs() +
    '<div id="tumBody" style="padding-bottom:90px"></div>';

  _tumRenderTab();
}

function _tumTabs() {
  var tabs = [
    { id:'dados',       lb:'① Dados'      },
    { id:'pedras',      lb:'② Pedras'     },
    { id:'acabamentos', lb:'③ Acabamentos'},
    { id:'resumo',      lb:'④ Resumo'     },
    { id:'historico',   lb:'📋 Histórico'  }
  ];
  var h = '<div class="tum-tabs">';
  tabs.forEach(function(t) {
    h += '<button class="tum-tab' + (TUM._tab === t.id ? ' on' : '') + '" onclick="tumTab(\'' + t.id + '\')">' + t.lb + '</button>';
  });
  return h + '</div>';
}

function tumTab(id) {
  TUM._tab = id;
  _tumRenderTab();
  document.querySelectorAll('.tum-tab').forEach(function(el) {
    var on = el.getAttribute('onclick').indexOf("'" + id + "'") > -1;
    el.classList.toggle('on', on);
  });
}

function _tumRenderTab() {
  var body = document.getElementById('tumBody');
  if (!body) return;
  var r   = TUM.calc;
  var map = {
    dados:        _tabDados,
    pedras:       _tabPedras,
    acabamentos:  _tabAcabamentos,
    resumo:       _tabResumo,
    historico:    _tabHistorico
  };
  body.innerHTML = (map[TUM._tab] || _tabDados)(r);
}

function tumRecalc() {
  TUM.calc = _tumCalcFull();
  var r  = TUM.calc || {};
  var vf = r.valor_vista || 0;
  // Atualiza hero sem re-renderizar tudo
  var hv = document.querySelector('.tum-hero-val');
  if (hv) hv.textContent = vf > 0 ? 'R$ ' + _F(vf) : '—';
  var hs = document.querySelector('.tum-hero-sub');
  if (hs) {
    var q = TUM.q;
    var preset = TUM_PRESETS.find(function(p){ return p.id === q.preset; });
    hs.textContent = (preset ? preset.nm : '') + (q.N > 0 ? ' · ' + q.N + ' gav.' : '') + ' · ' + q.C + '×' + q.L + ' cm';
  }
  _tumRenderTab();
}

// ─────────────────────────────────────────────────────────────────────
// COMPONENTES UI
// ─────────────────────────────────────────────────────────────────────
function _card(title, body) {
  return '<div class="tum-card"><div class="tum-card-title">' + title + '</div>' + body + '</div>';
}

function _fi(lbl, type, val, onchange, ph) {
  return '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label>' +
    '<input class="tum-in" type="' + type + '" value="' + (val||'') + '" placeholder="' + (ph||'') + '" oninput="' + onchange + '"></div>';
}

function _fiN(lbl, val, min, max, step, onchange, hint) {
  return '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label>' +
    '<input class="tum-in" type="number" value="' + val + '" min="' + min + '" max="' + max + '" step="' + step + '" oninput="' + onchange + '">' +
    (hint ? '<div class="tum-hint">' + hint + '</div>' : '') + '</div>';
}

function _fiSel(lbl, val, opts, onchange, hint) {
  var s = '<div class="tum-f"><label class="tum-lbl">' + lbl + '</label><select class="tum-in" onchange="' + onchange + '">';
  opts.forEach(function(o) { s += '<option value="' + o[0] + '"' + (val == o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; });
  return s + '</select>' + (hint ? '<div class="tum-hint">' + hint + '</div>' : '') + '</div>';
}

function _dLine(lbl, val, bold) {
  return '<div class="tum-dline' + (bold ? ' tum-dline-b' : '') + '"><span>' + lbl + '</span><span>' + val + '</span></div>';
}

function _resCard(lbl, val, sub, col) {
  var c = col === 'gold' ? 'var(--gold2)' : col === 'grn' ? 'var(--grn)' : 'var(--t1)';
  return '<div class="tum-rcard"><div class="tum-rcard-lbl">' + lbl + '</div>' +
    '<div class="tum-rcard-val" style="color:' + c + '">' + val + '</div>' +
    '<div class="tum-rcard-sub">' + (sub||'') + '</div></div>';
}

// ─────────────────────────────────────────────────────────────────────
// ABA: DADOS — identificação + preset + medidas em cm
// ─────────────────────────────────────────────────────────────────────
function _tabDados(r) {
  var q = TUM.q;
  var h = '';

  // ① Identificação
  h += _card('① Identificação',
    '<div class="tum-grid2">' +
    _fi('Nome do Cliente', 'text', q.cli,       'tumSet("cli",this.value)',       'Ex: Maria Silva') +
    _fi('Telefone',        'tel',  q.tel,       'tumSet("tel",this.value)',       '(74) 99999-9999') +
    '</div>' +
    '<div class="tum-grid2">' +
    _fi('Cemitério',       'text', q.cemiterio, 'tumSet("cemiterio",this.value)', 'Nome do cemitério') +
    _fi('Cidade',          'text', q.cidade,    'tumSet("cidade",this.value)',    'Pilão Arcado — BA') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fi('Falecido(a)',     'text', q.falecido,  'tumSet("falecido",this.value)',  'Nome completo') +
    _fi('Quadra',          'text', q.quadra,    'tumSet("quadra",this.value)',    'Q-12') +
    _fi('Lote / Número',   'text', q.lote,      'tumSet("lote",this.value)',      'L-04') +
    '</div>'
  );

  // ② Tipo de Túmulo (presets)
  var pbh = '<div class="tum-presets">';
  TUM_PRESETS.forEach(function(p) {
    pbh += '<button class="tum-preset' + (q.preset === p.id ? ' on' : '') + '" onclick="tumAplicarPreset(\'' + p.id + '\')">' +
      p.nm + '<span class="tum-preset-badge">' + p.badge + '</span></button>';
  });
  pbh += '</div>';
  h += _card('② Tipo de Túmulo', pbh);

  // ③ Medidas em cm
  var A_cm = r ? r.A_cm : _r2(q.Ae + q.N * 45 + q.E + 2);
  var alerta = r && r.alertaGaveta
    ? '<div class="tum-alerta">⚠ Espaço interno pode ser insuficiente para caixão padrão (mín. 175×55 cm). Revise C e L.</div>'
    : '';
  var info = '<div class="tum-info-box">📐 <strong>Altura calculada:</strong> ' +
    'Base (' + q.Ae + ' cm) + (' + q.N + ' gav × 45 cm) + Tampa (' + (q.E+2) + ' cm) = <strong>' + A_cm + ' cm</strong></div>';

  h += _card('③ Medidas <span style="font-size:.6rem;color:var(--t3)">(todas em cm)</span>',
    info + alerta +
    '<div class="tum-grid3">' +
    _fiN('Comprimento (cm)', q.C,  50,  500, 1,   'tumDim("C",this.value)',   'Tampa · Frente · Fundo') +
    _fiN('Largura (cm)',     q.L,  30,  200, 1,   'tumDim("L",this.value)',   'Tampa · Laterais') +
    _fiN('Espessura pedra (cm)', q.E, 2, 6, 0.5, 'tumDim("E",this.value)',   '2–3 cm lateral · 3–4 cm tampa') +
    '</div>' +
    '<div class="tum-grid3">' +
    _fiSel('Nº de Gavetas', q.N,
      [[0,'0 — Sem gaveta'],[1,'1 Gaveta'],[2,'2 Gavetas'],[3,'3 Gavetas'],[4,'4 Gavetas']],
      'tumDim("N",this.value)', 'Cada gaveta = +45 cm de altura') +
    _fiN('Base estrutural (cm)', q.Ae, 10, 100, 5, 'tumDim("Ae",this.value)', 'Altura da base de concreto') +
    _fiN('Rodapé de pedra (cm)', q.Ab, 0,   20, 1, 'tumDim("Ab",this.value)', '0 = sem rodapé') +
    '</div>'
  );

  // ④ Observações
  h += _card('④ Observações',
    '<textarea class="tum-obs" oninput="tumSet(\'obs\',this.value)" placeholder="Detalhes especiais, instruções de instalação, pedidos do cliente...">' + (q.obs||'') + '</textarea>'
  );

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'pedras\')">Próximo: Pedras →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: PEDRAS — com geração automática de peças (Etapa 5.1.2)
// ─────────────────────────────────────────────────────────────────────
function _tabPedras(r) {
  var q   = TUM.q;
  var h   = '';

  // ── ⑤ Material da Pedra ─────────────────────────────────────────
  var _pedras = _tumPedras();
  var mh = '<div class="tum-mat-grid">';
  _pedras.forEach(function(p) {
    var on = p.id === q.matId;
    mh += '<button class="tum-mat' + (on ? ' on' : '') + '" onclick="tumSelMat(\'' + p.id + '\')">' +
      '<div class="tum-mat-nm">' + p.nm + '</div>' +
      '<div class="tum-mat-cat">' + p.cat + '</div>' +
      '<div class="tum-mat-pr">R$ ' + p.pr + '/m²</div>' +
    '</button>';
  });
  mh += '</div>';
  var matSel = _pedras.find(function(x){ return x.id === q.matId; });
  if (matSel && r) {
    var eMult = {2:'1,00×', 3:'1,35×', 4:'1,70×', 5:'2,10×'};
    var eVal  = _r2(matSel.pr * (r.espM || 1.35));
    mh += '<div class="tum-info-box">📊 ' + matSel.nm + ' · esp. ' + q.E + ' cm (mult. ' + (eMult[q.E]||'1,35×') +
      ') → R$ ' + matSel.pr + ' × ' + (eMult[q.E]||'1,35×') + ' = <strong>R$ ' + eVal.toFixed(2) + '/m²</strong></div>';
  }
  h += _card('⑤ Material da Pedra', mh);

  // ── ⑥ Fator de Perda ────────────────────────────────────────────
  h += _card('⑥ Fator de Perda (%)',
    '<div class="tum-grid2">' +
    _fiN('Perda no corte (%)', q.perda, 5, 30, 1, 'tumDimAdv("perda",this.value)', 'Padrão: 12% — recortes, emendas, rejeitos') +
    '</div>' +
    (r ? '<div class="tum-info-box">m² bruto: ' + r.m2_bruto + ' m² → com perda ' + q.perda + '%: <strong>' + r.m2_total + ' m²</strong> · Peso: ' + r.peso_total + ' kg</div>' : '')
  );

  // ── ⑦ PEÇAS — GERAÇÃO AUTOMÁTICA ────────────────────────────────
  var autoGen   = q._autoGen || _tumGerarPecas(q);
  var manual    = q._pecasManual || {};
  var hasManual = Object.keys(manual).some(function(k) { return manual[k]; });

  // Cabeçalho do card com chip AUTO e botão de reset
  var pecaHeader =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div>' +
        '<span class="tum-auto-chip">⚙ AUTO · ' + autoGen.modeloLabel + '</span>' +
        '<div style="font-size:.6rem;color:var(--t3);margin-top:4px">' + autoGen.modeloDesc + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        (hasManual
          ? '<button class="tum-btn-out tum-btn-sm" onclick="tumResetPecas()" title="Voltar ao automático">↺ Resetar</button>'
          : '') +
        '<button class="tum-btn-out tum-btn-sm" onclick="tumAutoGerarPecas(true);if(typeof toast===\'function\')toast(\'✓ Peças regeneradas\')" title="Regenerar peças do modelo">⚙ Regerar</button>' +
      '</div>' +
    '</div>';

  // Linhas de cada peça
  var ph = '';
  TUM_PECAS_DEF.forEach(function(p) {
    var on         = !!q.pecas[p.id];
    var isManual   = !!manual[p.id];
    var isAuto     = !isManual && autoGen.pecas[p.id] !== undefined;
    var dim        = '';
    if (r && r.pecasCalc) {
      var pc = r.pecasCalc.find(function(x){ return x.nm.indexOf(p.nm.split('/')[0].trim()) > -1; });
      if (pc) dim = pc.dim + ' · ' + pc.m2 + ' m² · ' + pc.ml + ' ml';
    }

    // Badge AUTO ou MANUAL
    var badge = '';
    if (isManual) {
      badge = '<span class="tum-peca-manual-badge">MANUAL</span>';
    } else if (on && isAuto) {
      badge = '<span class="tum-peca-auto-badge">AUTO</span>';
    }

    ph += '<div class="tum-tog-row' + (!on ? ' tum-tog-row-off' : '') + '">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">' + (on ? '✔' : '○') + ' ' + p.nm + ' ' + badge + '</div>' +
        '<div class="tum-tog-sub">' + (dim || p.sub) + '</div>' +
      '</div>' +
      '<div class="tum-tog' + (on ? ' on' : '') + '" onclick="tumTogPeca(\'' + p.id + '\')"></div>' +
    '</div>';
  });

  // Lajes divisórias (geradas automaticamente pelo motor, não toggleáveis)
  var N_lajes = r ? r.N_lajes : Math.max(0, (q.N||0) - 1);
  if (N_lajes > 0) {
    var lajeM2 = r ? _r2(r.C * r.L * N_lajes) : '—';
    ph += '<div class="tum-tog-row" style="opacity:.75">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">✔ Laje Divisória ×' + N_lajes + ' <span class="tum-peca-auto-badge">AUTO</span></div>' +
        '<div class="tum-tog-sub">' + q.C + '×' + q.L + ' cm × ' + N_lajes + ' · ' + lajeM2 + ' m² — gerada pelo nº de gavetas</div>' +
      '</div>' +
      '<div style="width:36px;height:20px;border-radius:10px;background:rgba(100,200,100,.2);border:1px solid rgba(100,200,100,.3);display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#6dbf6d">SIM</div>' +
    '</div>';
  }

  // Totalizador
  if (r) {
    ph += '<div class="tum-info-box" style="margin-top:8px">' +
      '🪨 ' + r.pecasCalc.length + ' peças · ' + r.m2_bruto + ' m² bruto → ' +
      '<strong>' + r.m2_total + ' m²</strong> c/ perda · Peso: ' + Math.round(r.peso_total) + ' kg' +
    '</div>';
  }

  h += _card('⑦ Peças Geradas Automaticamente', pecaHeader + ph);

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'acabamentos\')">Próximo: Acabamentos →</button>';
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: ACABAMENTOS — CENTRALIZADO (Etapa 5.1.1)
// Todos os acabamentos vivem aqui. Nenhum fora deste módulo.
// ─────────────────────────────────────────────────────────────────────
function _tabAcabamentos(r) {
  var q    = TUM.q;
  var vals = _tumVals();
  var h    = '';

  // ── ⑧ Acabamento de borda (tipo geral das peças) ─────────────────
  var ah = '<div class="tum-acab-grid">';
  TUM_ACAB.forEach(function(a) {
    var on = q.acabId === a.id;
    ah += '<button class="tum-acab' + (on ? ' on' : '') + '" onclick="tumSelAcab(\'' + a.id + '\')">' +
      '<div class="tum-acab-nm">' + a.nm + '</div>' +
      '<div class="tum-acab-pr">' + (a.prML > 0 ? 'R$ ' + a.prML + '/ml' : 'Grátis') + '</div>' +
      '<div class="tum-acab-desc">' + a.desc + '</div>' +
    '</button>';
  });
  ah += '</div>';
  if (r && r.ml_total > 0) {
    ah += '<div class="tum-info-box">📐 ' + r.ml_total + ' ml de borda → custo acabamento: <strong>R$ ' + _F(r.custo_acabamento) + '</strong></div>';
  }
  h += _card('⑧ Acabamento das Bordas', ah);

  // ── ⑨ ACABAMENTOS POR PEÇA — centralizados ──────────────────────
  // Mostra quais peças estão ativas e o ML que cada acabamento geraria
  var pecasAtivas = TUM_PECAS_DEF.filter(function(p) { return !!q.pecas[p.id]; });
  var acabs_peca  = q.acabs_peca || {};

  // Info das peças ativas
  var pecasStr = pecasAtivas.length > 0
    ? pecasAtivas.map(function(p){ return p.nm.split('/')[0].trim(); }).join(', ')
    : '<em style="color:var(--t3)">Nenhuma peça selecionada</em>';
  var infoH = '<div class="tum-info-box" style="margin-bottom:10px">🪨 Peças ativas: <strong>' + pecasStr + '</strong></div>';

  var apH = infoH;
  TUM_ACAB_PECA.forEach(function(ap) {
    var on  = !!acabs_peca[ap.id];

    // Calcula ML previsto para as peças ativas
    var mlPrev = 0;
    var pecasDetStr = [];
    if (r) {
      // Reutiliza a mesma lógica do motor para preview
      var _dimPrev = {
        tampa:   { C:r.C,   L:r.L,   A:r.At_cm/100  },
        frente:  { C:r.C,   L:r.A,   A:r.A   },
        fundo:   { C:r.C,   L:r.A,   A:r.A   },
        lat_esq: { C:r.A,   L:r.L,   A:r.A   },
        lat_dir: { C:r.A,   L:r.L,   A:r.A   },
        lapide:  { C:0.6,   L:0.4,   A:0.4   },
        rodape:  { C:r.C,   L:r.L,   A:r.Ab  }
      };
      function _mlPrev(modo, dim) {
        switch(modo) {
          case 'perim':  return _r2(2*(dim.C+dim.L));
          case 'comp':   return _r2(dim.C);
          case '2comp':  return _r2(2*dim.C);
          case 'largura':return _r2(dim.L);
          case '2larg':  return _r2(2*dim.L);
          case 'altura': return _r2(dim.A);
          case '2alt':   return _r2(2*dim.A);
          default:       return _r2(2*(dim.C+dim.L));
        }
      }
      Object.keys(ap.pecas).forEach(function(pid) {
        if (!q.pecas[pid]) return;
        if (pid === 'rodape' && (q.Ab||0) <= 0) return;
        var dim = _dimPrev[pid];
        if (!dim) return;
        var ml = _mlPrev(ap.pecas[pid], dim);
        mlPrev += ml;
        var pNm = (TUM_PECAS_DEF.find(function(x){return x.id===pid;})||{nm:pid}).nm.split('/')[0].trim();
        pecasDetStr.push(pNm + ' ' + ml + ' ml');
      });
      mlPrev = _r2(mlPrev);
    }

    var totalPrev = _r2(mlPrev * ap.prML);
    var subText = ap.desc;
    if (mlPrev > 0) {
      subText += ' · ' + mlPrev + ' ml × R$ ' + ap.prML + '/ml';
      if (on) subText += ' = <strong style="color:var(--gold2)">R$ ' + _F(totalPrev) + '</strong>';
    } else if (pecasAtivas.length === 0) {
      subText += ' · <em style="color:var(--t3)">Selecione peças na aba Pedras</em>';
    } else {
      subText += ' · <em style="color:var(--t3)">Não se aplica às peças selecionadas</em>';
    }

    apH += '<div class="tum-tog-row' + (on ? ' tum-acab-peca-on' : '') + '">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">' + ap.icon + ' ' + ap.nm +
          (ap.prML > 0 ? ' <span style="font-size:.6rem;color:var(--t3);font-weight:400">R$ ' + ap.prML + '/ml</span>' : '') +
        '</div>' +
        '<div class="tum-tog-sub">' + subText + '</div>' +
        (on && pecasDetStr.length > 0
          ? '<div style="font-size:.58rem;color:var(--t3);margin-top:3px">↳ ' + pecasDetStr.join(' · ') + '</div>'
          : '') +
      '</div>' +
      '<div class="tum-tog' + (on ? ' on' : '') + '" onclick="tumTogAcabPeca(\'' + ap.id + '\')"></div>' +
    '</div>';
  });

  // Total dos acabamentos por peça
  if (r && (r.custo_acab_peca || 0) > 0) {
    apH += '<div class="tum-info-box" style="margin-top:8px">✅ Total acabamentos selecionados: <strong>R$ ' + _F(r.custo_acab_peca) + '</strong></div>';
  }
  h += _card('⑨ Acabamentos por Peça <span style="font-size:.6rem;color:var(--t3)">(centralizados)</span>', apH);

  // ── ⑩ Itens Opcionais / Extras Fixos ──────────────────────────────
  var efv    = vals.extras_fix;
  var keyMap = { cruzGranito:'cruz_granito', foto_porc:'foto_porc',
                 lapide_granito:'lapide_granito', plaquinha:'plaquinha', recorte_furo:'recorte_furo' };
  var oh = '';
  TUM_OPTS_DEF.forEach(function(o) {
    var on  = !!q.opts[o.id];
    var sub = o.sub;
    if (o.fixo > 0) {
      var ek = keyMap[o.id];
      if (ek && efv[ek]) sub = sub + ' · R$ ' + _F(efv[ek]);
    }
    oh += '<div class="tum-tog-row">' +
      '<div class="tum-tog-info">' +
        '<div class="tum-tog-nm">' + o.nm + '</div>' +
        '<div class="tum-tog-sub">' + sub + '</div>' +
      '</div>' +
      '<div class="tum-tog' + (on ? ' on' : '') + '" onclick="tumTogOpt(\'' + o.id + '\')"></div>' +
    '</div>';
  });
  h += _card('⑩ Itens Opcionais & Extras', oh);

  // ── ⑪ Tipo de Instalação ─────────────────────────────────────────
  var inst = q.instTipo || 'padrao';
  var ih = '<div class="tum-presets">' +
    '<button class="tum-preset' + (inst === 'padrao'   ? ' on' : '') + '" onclick="tumSetInst(\'padrao\')">' +
    'Instalação Padrão<span class="tum-preset-badge">Dificuldade normal</span></button>' +
    '<button class="tum-preset' + (inst === 'complexa' ? ' on' : '') + '" onclick="tumSetInst(\'complexa\')">' +
    'Instalação Complexa<span class="tum-preset-badge">+25% dif. · +2d prazo</span></button>' +
    '</div>' +
    (inst === 'complexa'
      ? '<div class="tum-alerta">⚠ Instalação complexa aplicada ao cálculo — mão de obra e prazo aumentados.</div>'
      : '<div class="tum-info-box">Instalação padrão — mão de obra calculada normalmente.</div>');
  h += _card('⑪ Tipo de Instalação', ih);

  h += _card('⑫ Logística (Avançado)',
    '<div class="tum-grid2">' +
    _fiN('Frete cemitério (%)', q.fatorCem, 0, 50, 5,
      'tumDimAdv("fatorCem",this.value)',
      'Aplicado sobre materiais civis quando "instalação em cemitério" ativo') +
    '</div>'
  );

  h += '<button class="tum-btn-gold tum-btn-full" onclick="tumTab(\'resumo\')">Ver Resumo →</button>';
  return h;
}
// ─────────────────────────────────────────────────────────────────────
// ABA: RESUMO
// ─────────────────────────────────────────────────────────────────────
function _tabResumo(r) {
  if (!r || !r.custo_total) {
    return '<div class="tum-empty">Preencha os dados e volte ao resumo.</div>';
  }
  var q = TUM.q;
  var h = '';

  // Cards de KPIs
  h += '<div class="tum-res-grid">' +
    _resCard('m² c/ perda',  r.m2_total + ' m²',           r.m2_bruto + ' bruto') +
    _resCard('ml bordas',    r.ml_total + ' ml',            r.acab.nm) +
    _resCard('Peso aprox.',  Math.round(r.peso_total) + ' kg', r.mat.nm + ' ' + q.E + 'cm') +
    _resCard('Custo Pedra',  'R$ ' + _F(r.custo_pedra),    r.mat.nm,               'gold') +
    _resCard('Civil (mat.)', 'R$ ' + _F(r.custo_civil),    '🏗 ' + (r.civil ? r.civil.cimento + ' sac · dif×' + r.civil.dificuldade : 'materiais')) +
    _resCard('Mão de Obra',  'R$ ' + _F(r.custo_mob),      (r.instTipo === 'complexa' ? 'Complexa ×' : 'Padrão ×') + r.Dif) +
    _resCard('Acab. Bordas', 'R$ ' + _F(r.custo_acabamento), r.acab.nm) +
    (r.custo_acab_peca > 0 ? _resCard('Acabamentos', 'R$ ' + _F(r.custo_acab_peca), (r.acab_peca_det||[]).length + ' tipo(s)') : '') +
    (r.custo_acab_ml  > 0 ? _resCard('Acab. ML (leg.)', 'R$ ' + _F(r.custo_acab_ml), (r.acab_ml_det||[]).length + ' item(s)') : '') +
    (r.custo_extras  > 0 ? _resCard('Extras',   'R$ ' + _F(r.custo_extras),  (r.extras_det||[]).length + ' item(s)') : '') +
    _resCard('Custo Total',  'R$ ' + _F(r.custo_total),    'Sem lucro') +
    _resCard('Margem ' + r.margem + '%', 'R$ ' + _F(r.lucro), r.margemReal + '% real', 'grn') +
  '</div>';

  // Detalhamento peças
  var autoGen  = q._autoGen || _tumGerarPecas(q);
  var manualQ  = q._pecasManual || {};
  h += _card('🪨 Peças de Pedra <span style="font-size:.55rem;color:var(--t3)">· ' + autoGen.modeloLabel + '</span>',
    '<div class="tum-auto-chip" style="margin-bottom:8px">⚙ AUTO · ' + autoGen.autoInfo.join(' · ') + '</div>' +
    r.pecasCalc.map(function(p) {
      var pid  = TUM_PECAS_DEF.find(function(x){ return p.nm.indexOf(x.nm.split('/')[0].trim()) > -1; });
      var bdg  = pid && manualQ[pid.id] ? '<span class="tum-peca-manual-badge">MANUAL</span>' : '<span class="tum-peca-auto-badge">AUTO</span>';
      return _dLine(p.nm + ' ' + bdg + ' <span class="tum-dim">' + p.dim + '</span>', p.m2 + ' m²');
    }).join('') +
    _dLine('Perda ' + q.perda + '%', r.m2_total + ' m² final') +
    _dLine(r.mat.nm + ' × esp.×' + ({2:'1,00',3:'1,35',4:'1,70',5:'2,10'}[r.E]||'1,35'),
           '<span style="color:var(--gold2)">R$ ' + _F(r.custo_pedra) + '</span>')
  );

  // Estrutura Civil Automática (Etapa 5.1.3) — Motor completo
  var civ = r.civil || {};
  var difPct = Math.min(100, Math.round(((civ.dificuldade || 1) - 1.0) / 2.50 * 100));
  h += '<div class="tum-card">' +
    '<div class="tum-civil-header">' +
      '<div>' +
        '<div class="tum-card-title" style="margin-bottom:4px">🏗 Estrutura Civil Automática</div>' +
        '<span class="tum-civil-badge">⚙ AUTO · ' + (civ.difLabel || 'Calculado') + '</span>' +
        (civ.isPremium  ? ' <span class="tum-civil-badge" style="background:rgba(201,168,76,.12);color:var(--gold2,#c9a84c);border-color:rgba(201,168,76,.3)">★ Premium</span>' : '') +
        (civ.isComplexa ? ' <span class="tum-civil-badge" style="background:rgba(220,80,80,.10);color:#e07070;border-color:rgba(220,80,80,.25)">⚠ Complexa</span>' : '') +
      '</div>' +
      '<div style="text-align:right;font-size:.6rem;color:var(--t3)">' +
        'Área ×' + (civ.areaFator || 1).toFixed(2) + '<br>' +
        (civ.N_lajes > 0 ? civ.N_lajes + ' laje(s)' : 'Sem lajes') +
      '</div>' +
    '</div>' +

    // Barra de dificuldade
    '<div class="tum-civil-dif">' +
      '<span>Dif. técnica: <strong>' + (civ.dificuldade || 1).toFixed(2) + '×</strong></span>' +
      '<div class="tum-civil-dif-bar"><div class="tum-civil-dif-fill" style="width:' + difPct + '%"></div></div>' +
      '<span>' + (civ.difLabel || '') + '</span>' +
    '</div>' +

    // Grid de materiais
    '<div class="tum-civil-grid">' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Cimento CP-II</div>' +
        '<div class="tum-civil-item-val">' + (civ.cimento||r.sacos_cimento) + '<span class="tum-civil-item-unit">sacos</span></div>' +
      '</div>' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Areia média</div>' +
        '<div class="tum-civil-item-val">' + (civ.areia||r.m3_areia) + '<span class="tum-civil-item-unit">m³</span></div>' +
      '</div>' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Brita 1</div>' +
        '<div class="tum-civil-item-val">' + (civ.brita||r.m3_brita) + '<span class="tum-civil-item-unit">m³</span></div>' +
      '</div>' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Blocos 14×19×39</div>' +
        '<div class="tum-civil-item-val">' + (civ.blocos||r.unid_blocos) + '<span class="tum-civil-item-unit">un.</span></div>' +
      '</div>' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Ferragem 3/8"</div>' +
        '<div class="tum-civil-item-val">' + (civ.ferragem38||r.barras_f38) + '<span class="tum-civil-item-unit">barras</span></div>' +
      '</div>' +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Ferragem 5/16"</div>' +
        '<div class="tum-civil-item-val">' + (civ.ferragem516||r.barras_f516) + '<span class="tum-civil-item-unit">barras</span></div>' +
      '</div>' +
      (civ.malha > 0
        ? '<div class="tum-civil-item">' +
            '<div class="tum-civil-item-nm">Malha Q-92</div>' +
            '<div class="tum-civil-item-val">' + civ.malha + '<span class="tum-civil-item-unit">m²</span></div>' +
          '</div>'
        : '') +
      '<div class="tum-civil-item">' +
        '<div class="tum-civil-item-nm">Concreto (vol.)</div>' +
        '<div class="tum-civil-item-val">' + (civ.concreto||r.Vol_total) + '<span class="tum-civil-item-unit">m³</span></div>' +
      '</div>' +
    '</div>' +

    // Footer: custo civil + prazo estrutural
    '<div class="tum-civil-footer">' +
      '<div class="tum-civil-total">' +
        '<div class="tum-civil-total-lbl">Custo Civil</div>' +
        '<div class="tum-civil-total-val">R$ ' + _F(r.custo_civil) + '</div>' +
        '<div style="font-size:.55rem;color:var(--t3);margin-top:3px">materiais' +
          (civ.maoObra > 0 ? ' + M.O. estrutural' : '') + '</div>' +
      '</div>' +
      '<div class="tum-civil-prazo">' +
        '<div class="tum-civil-prazo-lbl">Prazo Estrutural</div>' +
        '<div class="tum-civil-prazo-val">' + (civ.prazoCivil||'?') + ' dias</div>' +
        '<div style="font-size:.55rem;color:var(--t3);margin-top:3px">' + (civ.dias_obra||'?') + ' obra + 7 cura</div>' +
      '</div>' +
    '</div>' +

    '<div class="tum-civil-readonly-note">⚙ Calculado automaticamente pelo modelo — sem seleção manual de materiais</div>' +
  '</div>';

  // Mão de Obra
  h += _card('🔨 Mão de Obra <span style="font-size:.65rem">(fator ×' + r.Dif + ')</span>',
    _dLine('Pedreiro',          'R$ ' + _F(r.v_pedreiro)) +
    _dLine('Ajudante',          'R$ ' + _F(r.v_ajudante)) +
    _dLine('Instalação pedra',  'R$ ' + _F(r.v_instalacao)) +
    _dLine('Montagem',          'R$ ' + _F(r.v_montagem)) +
    _dLine('Transporte',        'R$ ' + _F(r.v_frete)) +
    _dLine('Total M.O.', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_mob) + '</span>', true)
  );

  // Acabamentos por peça — detalhamento centralizado
  if (r.acab_peca_det && r.acab_peca_det.length > 0) {
    var apLines = r.acab_peca_det.map(function(a) {
      var detStr = a.itens.map(function(it) {
        var pNm = (TUM_PECAS_DEF.find(function(x){return x.id===it.peca;})||{nm:it.peca}).nm.split('/')[0].trim();
        return pNm + ' ' + it.ml + ' ml';
      }).join(' · ');
      return _dLine(
        a.icon + ' ' + a.nm + ' <span class="tum-dim">' + a.mlTotal + ' ml × R$ ' + a.prML + '/ml</span>',
        '<span style="color:var(--gold2)">R$ ' + _F(a.total) + '</span>'
      ) + (detStr ? '<div style="font-size:.58rem;color:var(--t3);padding:0 8px 6px">↳ ' + detStr + '</div>' : '');
    }).join('');
    h += _card('✂️ Acabamentos por Peça',
      apLines +
      _dLine('Total Acabamentos', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_acab_peca) + '</span>', true)
    );
  }

  // Acabamentos em Metro Linear (detalhamento)
  if (r.acab_ml_det && r.acab_ml_det.length > 0) {
    var amlLines = r.acab_ml_det.map(function(a) {
      return _dLine(a.nm + ' <span class="tum-dim">' + a.ml + ' ml × R$ ' + a.prML + '/ml</span>',
                    '<span style="color:var(--gold2)">R$ ' + _F(a.total) + '</span>');
    }).join('');
    h += _card('✂️ Acabamentos em ML — perímetro ' + r.perim_ml + ' ml',
      amlLines +
      _dLine('Total Acab. ML', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_acab_ml) + '</span>', true)
    );
  }

  // Extras fixos (dinâmico via extras_det)
  if (r.custo_extras > 0 && r.extras_det && r.extras_det.length > 0) {
    var extLines = r.extras_det.map(function(e) {
      return _dLine(e.nm, 'R$ ' + _F(e.val));
    }).join('');
    h += _card('✨ Extras',
      extLines +
      _dLine('Total Extras', '<span style="color:var(--gold2)">R$ ' + _F(r.custo_extras) + '</span>', true)
    );
  }

  // Total final
  h += '<div class="tum-total-box">' +
    '<div class="tum-total-linha"><span>Custo interno</span><span>R$ ' + _F(r.custo_total) + '</span></div>' +
    '<div class="tum-total-linha" style="color:var(--grn)"><span>Lucro (' + r.margem + '%)</span><span>R$ ' + _F(r.lucro) + '</span></div>' +
    '<div class="tum-total-main"><span>À Vista</span><span class="tum-total-val">R$ ' + _F(r.valor_vista) + '</span></div>' +
    '<div class="tum-total-parc">Parcelado: R$ ' + _F(r.valor_parc) + ' — até ' + r.parcMax + '× de R$ ' + _F(r.parc_mensal) + '</div>' +
    '<div class="tum-prazo">🕐 Prazo estimado: ' + r.prazo_total + ' dias úteis</div>' +
  '</div>';

  // Ações
  h += '<div class="tum-acoes">' +
    '<button class="tum-btn-gold" onclick="tumSalvar()">💾 Salvar</button>' +
    '<button class="tum-btn-out"  onclick="tumCopiarWA()">📲 WhatsApp</button>' +
    '<button class="tum-btn-out"  onclick="tumNovo()">🆕 Novo</button>' +
  '</div>';

  return h;
}

// ─────────────────────────────────────────────────────────────────────
// ABA: HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function _tabHistorico() {
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<span style="font-size:.72rem;color:var(--t3)">' + TUM._hist.length + ' orçamentos salvos</span>' +
    '<button class="tum-btn-out tum-btn-sm" onclick="tumLimparHist()">🗑 Limpar</button>' +
  '</div>';

  if (!TUM._hist.length) {
    return h + '<div class="tum-empty">📋 Nenhum orçamento salvo ainda.<br>Preencha o formulário e salve.</div>';
  }

  TUM._hist.forEach(function(o, i) {
    var r = o.r || {};
    h += '<div class="tum-hist-card" onclick="tumVerHist(' + i + ')">' +
      '<div class="tum-hist-row">' +
        '<span class="tum-hist-cli">' + (o.cli || 'Cliente') + '</span>' +
        '<span class="tum-hist-val">R$ ' + _F(r.valor_vista || 0) + '</span>' +
      '</div>' +
      '<div class="tum-hist-meta">' +
        (o.falecido  ? '<span>⚰️ ' + o.falecido  + '</span>' : '') +
        (o.cemiterio ? '<span>🏛 ' + o.cemiterio + '</span>' : '') +
        '<span>' + (o.matNm||'') + '</span>' +
        '<span>' + (o.N||0) + ' gav.</span>' +
        '<span>' + (o.date||'') + '</span>' +
      '</div>' +
      '<div class="tum-hist-badges">' +
        '<span class="tum-badge">' + (r.m2_total||0) + ' m²</span>' +
        '<span class="tum-badge" style="color:var(--grn)">' + (r.prazo_total||'?') + 'd</span>' +
      '</div>' +
    '</div>';
  });
  return h;
}

// ─────────────────────────────────────────────────────────────────────
// SETTERS
// ─────────────────────────────────────────────────────────────────────
function tumSet(key, val) {
  TUM.q[key] = val;
}

function tumDim(key, val) {
  TUM.q[key] = +val;
  // Quando gavetas ou rodapé mudam, re-gera peças automaticamente (merge suave)
  if (key === 'N' || key === 'Ab') {
    tumAutoGerarPecas(false);
  } else {
    tumRecalc();
  }
}

function tumDimAdv(key, val) {
  TUM.q[key] = +val;
  tumRecalc();
}

function tumAplicarPreset(id) {
  var p  = TUM_PRESETS.find(function(x){ return x.id === id; });
  if (!p) return;
  TUM.q.preset = id;
  TUM.q.C  = p.C;
  TUM.q.L  = p.L;
  TUM.q.E  = p.E;
  TUM.q.N  = p.N;
  TUM.q.Ae = p.Ae;
  TUM.q.Ab = p.Ab;
  // Reset de overrides manuais ao trocar de preset
  TUM.q._pecasManual = {};
  // Geração automática de peças + acabamentos do modelo (force=true)
  tumAutoGerarPecas(true);
  if (typeof toast === 'function') toast('✓ Preset: ' + p.nm);
}

function tumSelMat(id)  { TUM.q.matId  = id; tumRecalc(); }
function tumSelAcab(id) { TUM.q.acabId = id; tumRecalc(); }
function tumTogPeca(id) {
  TUM.q.pecas[id] = !TUM.q.pecas[id];
  // Marca como override manual para o merge automático respeitar
  if (!TUM.q._pecasManual) TUM.q._pecasManual = {};
  TUM.q._pecasManual[id] = true;
  tumRecalc();
}
function tumTogOpt(id)  { TUM.q.opts[id]  = !TUM.q.opts[id];  tumRecalc(); }
function tumTogAcabML(id) {
  if (!TUM.q.acabs_ml) TUM.q.acabs_ml = { moldura:false, pingadeira:false, bisel:false };
  TUM.q.acabs_ml[id] = !TUM.q.acabs_ml[id];
  tumRecalc();
}
function tumTogAcabPeca(id) {
  if (!TUM.q.acabs_peca) TUM.q.acabs_peca = {};
  TUM.q.acabs_peca[id] = !TUM.q.acabs_peca[id];
  tumRecalc();
}
function tumSetInst(tipo) { TUM.q.instTipo = tipo; tumRecalc(); }

// Reseta peças ao automático (apaga overrides manuais e regenera)
function tumResetPecas() {
  TUM.q._pecasManual = {};
  tumAutoGerarPecas(true);
  if (typeof toast === 'function') toast('↺ Peças resetadas ao automático');
}

// ─────────────────────────────────────────────────────────────────────
// SALVAR — Integra com DB.j (Agenda) + DB.t (Finanças) + DB.q (Orç.)
// ─────────────────────────────────────────────────────────────────────
function tumSalvar() {
  var q = TUM.q;
  var r = TUM.calc;
  if (!q.cli) { if (typeof toast === 'function') toast('⚠ Informe o nome do cliente'); return; }
  if (!r)     { if (typeof toast === 'function') toast('⚠ Calcule o orçamento primeiro'); return; }

  var _pedras = _tumPedras();
  var matNm   = (_pedras.find(function(x){ return x.id === q.matId; }) || {}).nm || 'Pedra';
  var preset  = TUM_PRESETS.find(function(x){ return x.id === q.preset; });
  var tipo    = 'Túmulo — ' + (preset ? preset.nm : q.preset) + (q.N > 0 ? ' ' + q.N + 'G' : '');

  // ── Histórico local ──────────────────────────────────────────────
  var rec = {
    id:       Date.now(),
    date:     _td(),
    cli:      q.cli, tel: q.tel,
    cemiterio:q.cemiterio, cidade: q.cidade,
    falecido: q.falecido, quadra: q.quadra, lote: q.lote,
    obs:      q.obs,
    preset:   q.preset, N: q.N,
    matNm:    matNm,
    acabNm:   (TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || {}).nm || '',
    r:        JSON.parse(JSON.stringify(r)),
    q:        JSON.parse(JSON.stringify(q))
  };
  TUM._hist.unshift(rec);
  if (TUM._hist.length > 50) TUM._hist.pop();
  localStorage.setItem('hr_tum_hist', JSON.stringify(TUM._hist));

  // ── DB.q — Lista de orçamentos ───────────────────────────────────
  if (typeof DB !== 'undefined' && DB.q) {
    DB.q.unshift({
      id:         rec.id,
      tipo:       tipo,
      cli:        q.cli,
      mat:        matNm,
      vista:      r.valor_vista,
      prazo:      r.valor_vista,
      ent:        _r2(r.valor_vista * 0.5),
      custo:      r.custo_total,
      lucro:      r.lucro,
      margemReal: r.margemReal,
      obs:        q.obs,
      tum:        JSON.parse(JSON.stringify(q)),
      tumCalc:    JSON.parse(JSON.stringify(r)),
      dt:         rec.date,
      date:       rec.date
    });
    if (typeof DB.sv === 'function') DB.sv();
  }

  // ── DB.j — Agenda de serviços ────────────────────────────────────
  if (typeof DB !== 'undefined' && DB.j && typeof lastEnd === 'function' && typeof addD === 'function') {
    var startAg  = lastEnd() || _td();
    var diasEst  = Math.ceil(r.prazo_total || 13);
    var endAg    = addD(startAg, diasEst);
    var obsAg    = tipo + ' — ' + matNm;
    if (q.falecido)  obsAg += ' | Falecido: ' + q.falecido;
    if (q.cemiterio) obsAg += ' | Cemitério: ' + q.cemiterio;
    if (q.quadra)    obsAg += ' Q' + q.quadra;
    if (q.lote)      obsAg += ' L' + q.lote;
    if (q.obs)       obsAg += ' | ' + q.obs;

    var job = {
      id:       rec.id + 1,
      cli:      q.cli,
      desc:     obsAg,
      material: matNm,
      tipo:     tipo,
      start:    startAg,
      end:      endAg,
      value:    r.valor_vista,
      pago:     0,
      obs:      [
        q.cemiterio ? 'Cemitério: ' + q.cemiterio : '',
        q.quadra    ? 'Quadra: ' + q.quadra        : '',
        q.lote      ? 'Lote: '   + q.lote          : '',
        q.falecido  ? 'Falecido: '+ q.falecido     : '',
        q.cidade    ? q.cidade                      : ''
      ].filter(Boolean).join(' · '),
      done:   false,
      status: 'agendado'
    };
    DB.j.unshift(job);
    if (typeof DB.sv === 'function') DB.sv();
    if (typeof updUrgDot === 'function') updUrgDot();
  }

  // ── DB.t — Finanças (lançar A Receber) ──────────────────────────
  if (typeof DB !== 'undefined' && DB.t) {
    var hoje = new Date().toISOString().split('T')[0];
    DB.t.unshift({
      id:   rec.id + 2,
      type: 'pend',
      tp:   'pend',
      desc: 'Túmulo — ' + q.cli + (q.falecido ? ' (' + q.falecido + ')' : ''),
      val:  r.valor_vista,
      value:r.valor_vista,
      dt:   hoje,
      date: hoje
    });
    if (typeof DB.sv === 'function') DB.sv();
    if (typeof renderFin === 'function') renderFin();
  }

  if (typeof toast === 'function') toast('✅ Salvo! Agenda e Finanças atualizados.');
  // Atualiza histórico de orçamentos e agenda do Novo-app
  if (typeof renderOrc === 'function') renderOrc();
  if (typeof renderAgenda === 'function') renderAgenda();
  // Re-renderiza a aba histórico do módulo de túmulos
  if (TUM._tab === 'historico') _tumRenderTab();
  // Sincroniza dados de volta ao ambiente do Novo-app (se aberto via tumAbrirComAmb)
  if (TUM._ambId && typeof ambientes !== 'undefined') {
    var ambBack = ambientes.find(function(a) { return a.id === TUM._ambId; });
    if (ambBack) {
      if (!ambBack.tumExtra) ambBack.tumExtra = {};
      ambBack.tumExtra.falecido  = q.falecido  || '';
      ambBack.tumExtra.cemiterio = q.cemiterio || '';
      ambBack.tumExtra.quadra    = q.quadra    || '';
      ambBack.tumExtra.lote      = q.lote      || '';
      ambBack.tumExtra.calc_ok   = true;
      ambBack.tumExtra.m2_total  = r.m2_total;
      ambBack.tumExtra.prazo_dias = r.prazo_total;
      ambBack.tumExtra.subtipo   = tipo;
      if (typeof renderAmbientes === 'function') renderAmbientes();
    }
  }
  // Fecha o modal após salvar
  setTimeout(function() { closeTumOrcModal(); }, 1200);
}

// ─────────────────────────────────────────────────────────────────────
// COPIAR WHATSAPP
// ─────────────────────────────────────────────────────────────────────
function tumCopiarWA() {
  var q   = TUM.q;
  var r   = TUM.calc;
  if (!r) return;
  var emp = (typeof CFG !== 'undefined' && CFG.emp) ? CFG.emp : { nome:'HR Mármores', tel:'' };
  var _pedras = _tumPedras();
  var matNm   = (_pedras.find(function(x){ return x.id === q.matId; }) || {}).nm || '';
  var acabNm  = (TUM_ACAB.find(function(x){ return x.id === q.acabId; }) || {}).nm || '';
  var preset  = TUM_PRESETS.find(function(p){ return p.id === q.preset; });

  var txt = emp.nome + '\nORÇAMENTO DE TÚMULO\n';
  txt += '─────────────────────\n';
  txt += 'Cliente: ' + q.cli + '\n';
  if (q.tel)       txt += 'Tel: ' + q.tel + '\n';
  if (q.falecido)  txt += 'Falecido(a): ' + q.falecido + '\n';
  if (q.cemiterio) txt += 'Cemitério: ' + q.cemiterio + (q.cidade ? ', ' + q.cidade : '') + '\n';
  if (q.quadra || q.lote) txt += 'Quadra ' + q.quadra + '  Lote ' + q.lote + '\n';
  txt += '\nMODELO\n';
  txt += 'Tipo: ' + (preset ? preset.nm : q.preset);
  txt += '\nMedidas: ' + q.C + ' × ' + q.L + ' cm  ·  Alt. ' + r.A_cm + ' cm';
  txt += '\nGavetas: ' + q.N;
  txt += '\nMaterial: ' + matNm + ' ' + q.E + ' cm';
  txt += '\nAcabamento: ' + acabNm;
  txt += '\nm²: ' + r.m2_total + ' m² (c/ perdas)';
  txt += '\n\nVALORES\n─────────────────────\n';
  txt += 'À vista: R$ ' + _F(r.valor_vista) + '\n';
  txt += 'Parcelado: R$ ' + _F(r.valor_parc) + ' (' + r.parcMax + '× R$ ' + _F(r.parc_mensal) + ')\n';
  txt += '\nPrazo: ~' + r.prazo_total + ' dias úteis\n';
  if (r.civil) {
    txt += '\nESTRUTURA CIVIL (automático)\n─────────────────────\n';
    txt += 'Cimento: ' + r.civil.cimento + ' sacos\n';
    txt += 'Areia: '   + r.civil.areia   + ' m³ · Brita: ' + r.civil.brita + ' m³\n';
    txt += 'Blocos: '  + r.civil.blocos  + ' un. · Ferragem 3/8": ' + r.civil.ferragem38 + ' barras\n';
    txt += 'Dificuldade: ' + r.civil.dificuldade + '× (' + r.civil.difLabel + ')\n';
    txt += 'Prazo estrutural: ' + r.civil.prazoCivil + ' dias úteis\n';
  }
  if (q.obs) txt += '\nObs: ' + q.obs + '\n';
  txt += '\n' + emp.nome;
  if (emp.tel) txt += '\n' + emp.tel;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(function() {
      if (typeof toast === 'function') toast('📋 Copiado para área de transferência!');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof toast === 'function') toast('📋 Copiado!');
  }
}

// ─────────────────────────────────────────────────────────────────────
// HISTÓRICO
// ─────────────────────────────────────────────────────────────────────
function tumVerHist(i) {
  var o = TUM._hist[i];
  if (!o) return;
  TUM.q = JSON.parse(JSON.stringify(o.q));
  TUM.calc = _tumCalcFull();
  TUM._tab = 'resumo';
  _tumRender();
}

function tumLimparHist() {
  if (!confirm('Apagar todo o histórico de orçamentos de túmulos?')) return;
  TUM._hist = [];
  localStorage.removeItem('hr_tum_hist');
  _tumRenderTab();
}

// ─────────────────────────────────────────────────────────────────────
// NOVO ORÇAMENTO
// ─────────────────────────────────────────────────────────────────────
function tumNovo() {
  if (!confirm('Limpar orçamento atual?')) return;
  var q = TUM.q;
  q.cli=''; q.tel=''; q.cemiterio=''; q.cidade='';
  q.falecido=''; q.quadra=''; q.lote=''; q.obs='';
  q.opts     = { cemiterio:false, polido_extra:false, gravacao:false, cruzGranito:false, foto_porc:false,
                 lapide_granito:false, plaquinha:false, recorte_furo:false };
  q.acabs_ml  = { moldura:false, pingadeira:false, bisel:false };
  q.acabs_peca = {};
  q._pecasManual = {};
  q._autoGen = null;
  q.instTipo = 'padrao';
  tumAplicarPreset('dupla');
  TUM._tab = 'dados';
  _tumRender();
  if (typeof toast === 'function') toast('✓ Novo orçamento');
}
