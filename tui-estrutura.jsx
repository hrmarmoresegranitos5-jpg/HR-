import { TUM_TIPOS, SAMPLE_STONES } from './tui-catalog.js';
import { fm, roundM, tumApplyDescricaoTecnica, tumAutoStructuralGavetas } from './tui-calc-engine.js';
import './tumulos-module.css';

/** Etapa 1: identificação, tipo, dimensões, pedra (estrutura do serviço) */
export function TumuloEstrutura({
  quote,
  effective,
  setQuote,
  onSelectTipo,
  onNext,
}) {
  const q = quote;
  const dims = effective.dims;
  const sel = SAMPLE_STONES.find((s) => s.id === q.stoneId);
  const perda = q.pedras.perda || 15;
  const c = dims.comp;
  const l = dims.larg;
  const a = dims.alt;
  const m2base = c * l * 2 + c * a * 2 + l * a * 2;
  const m2com = m2base * (1 + perda / 100);

  const setDim = (key, v) =>
    setQuote((prev) => {
      const n = structuredClone(prev);
      n.dims[key] = v;
      return n;
    });

  const flushDescricaoNoCalculo = () => {
    setQuote((prev) => {
      const n = structuredClone(prev);
      tumApplyDescricaoTecnica(n);
      tumAutoStructuralGavetas(n);
      return n;
    });
  };

  const onPickFoto = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    if (!f || !/^image\//.test(f.type)) return;
    const rd = new FileReader();
    rd.onload = () => {
      setQuote((p) => ({ ...p, fotoTecnicaData: rd.result, fotoTecnicaNome: f.name || '' }));
    };
    rd.readAsDataURL(f);
  };

  return (
    <div className="tum-sec">
      <div className="tum-sec-lbl">Identificação</div>
      <div className="tum-grid2">
        <div className="tum-f">
          <label className="tum-lbl">Cliente / Contratante</label>
          <input className="tum-in" value={q.cli} placeholder="Família Oliveira..."
            onChange={(e) => setQuote((p) => ({ ...p, cli: e.target.value }))} />
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Falecido</label>
          <input className="tum-in" value={q.falecido} placeholder="Nome"
            onChange={(e) => setQuote((p) => ({ ...p, falecido: e.target.value }))} />
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Cemitério</label>
          <input className="tum-in" value={q.cemiterio} placeholder="Municipal"
            onChange={(e) => setQuote((p) => ({ ...p, cemiterio: e.target.value }))} />
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Quadra / Lote</label>
          <input className="tum-in" value={q.quadra} placeholder="Q04 L15"
            onChange={(e) => setQuote((p) => ({ ...p, quadra: e.target.value }))} />
        </div>
      </div>

      <div className="tum-sec-lbl" style={{ marginTop: 16 }}>
        Modelo inicial
      </div>
      <div style={{ fontSize: '.62rem', color: 'var(--t4)', marginBottom: 10, lineHeight: 1.45 }}>
        Cada cartão só{' '}
        <span style={{ color: 'var(--gold2)', fontWeight: 600 }}>carrega um ponto de partida</span>
        {' '}(medidas e serviços sugeridos). Você personaliza tudo depois: dimensões, compartimentos, revestimento,
        acabamentos, obra e materiais nas outras etapas. Use <strong>Projeto sob medida</strong> para começar sem nada marcado.
      </div>
      <div className="tum-tipos-grid">
        {Object.entries(TUM_TIPOS).map(([k, t]) => (
          <div key={k} className={`tum-tipo-card${q.tipo === k ? ' on' : ''}`} role="button" tabIndex={0}
            onClick={() => onSelectTipo(k)}
            onKeyDown={(ev) => (ev.key === 'Enter' ? onSelectTipo(k) : undefined)}>
            <div className="tum-tipo-icon">{t.icon}</div>
            <div className="tum-tipo-label">{t.label}</div>
            <div className="tum-tipo-desc">{t.desc}</div>
          </div>
        ))}
      </div>

      <div className="tum-sec-lbl" style={{ marginTop: 16 }}>
        Dimensionamento
      </div>
      <div style={{ fontSize: '.6rem', color: 'var(--t4)', margin: '-4px 0 8px', lineHeight: 1.4 }}>
        Valores livres. A altura não fica abaixo do mínimo por número de compartimentos (regra de segurança do cálculo).
      </div>
      <div className="tum-grid3">
        {[
          ['Comprimento (m)', 'comp', q.dims.comp, 'Ex: 2.20'],
          ['Largura (m)', 'larg', q.dims.larg, 'Ex: 0.90'],
          ['Altura (m)', 'alt', q.dims.alt, 'Ex: 0.60'],
          ['Espessura (cm)', 'esp', q.dims.esp, 'Ex: 3'],
          ['Gavetas', 'gavetas', q.dims.gavetas, 'Ex: 1'],
        ].map(([lab, key, val, ph]) => (
          <div className="tum-f" key={key}>
            <label className="tum-lbl">{lab}</label>
            <input className="tum-in" type="number" step="0.01" value={val} placeholder={ph}
              onChange={(e) => setDim(key, +e.target.value)} />
          </div>
        ))}
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          fontSize: '.62rem',
          color: 'var(--t3)',
          margin: '10px 0 14px',
        }}
      >
        <input
          type="checkbox"
          checked={!!q.moHorasLivres}
          style={{ accentColor: 'var(--gold)', marginTop: 2 }}
          onChange={(e) => setQuote((p) => ({ ...p, moHorasLivres: e.target.checked }))}
        />
        <span>
          Quando desmarcado, ao mudar o número de compartimentos o sistema sugere de novo as horas de marmorista e ajudante.
          Marque para manter as horas já definidas no projeto.
        </span>
      </label>

      <div className="tum-dims-preview">
        <div className="tum-dp-title">Área estimada das peças</div>
        <div className="tum-dp-grid">
          <div className="tum-dp-item"><span className="tum-dp-l">Tampa + Base</span><span className="tum-dp-v">{fm(c * l * 2)} m²</span></div>
          <div className="tum-dp-item"><span className="tum-dp-l">Laterais (×2)</span><span className="tum-dp-v">{fm(c * a * 2)} m²</span></div>
          <div className="tum-dp-item"><span className="tum-dp-l">Frontais (×2)</span><span className="tum-dp-v">{fm(l * a * 2)} m²</span></div>
          <div className="tum-dp-item"><span className="tum-dp-l">TOTAL líquido</span><span className="tum-dp-v">{fm(m2base)} m²</span></div>
          <div className="tum-dp-item"><span className="tum-dp-l">c/ {perda}% perda</span><span className="tum-dp-v">{fm(roundM(m2com))} m²</span></div>
        </div>
      </div>

      <div className="tum-sec-lbl" style={{ marginTop: 16 }}>
        Foto do túmulo e descrição técnica
      </div>
      <div style={{ fontSize: '.62rem', color: 'var(--t4)', marginBottom: 10 }}>
        Texto livre (ex.: mais 2 gavetas e revestimento completo). Ao sair do campo, aplicamos a interpretação uma vez;
        depois prevalece o que você editar nas demais etapas.
      </div>
      <div className="tum-grid2" style={{ alignItems: 'start' }}>
        <div className="tum-f">
          <label className="tum-lbl">Foto (referência)</label>
          <input className="tum-in" type="file" accept="image/*" onChange={onPickFoto} />
          {q.fotoTecnicaData ? (
            <div style={{ marginTop: 8 }}>
              <img
                alt="Referência do túmulo"
                src={q.fotoTecnicaData}
                style={{
                  maxWidth: '100%',
                  maxHeight: 180,
                  borderRadius: 10,
                  border: '1px solid var(--bd2)',
                  objectFit: 'contain',
                  background: '#111',
                }}
              />
              <button
                type="button"
                className="btn btn-o"
                style={{ fontSize: '.65rem', marginTop: 6 }}
                onClick={() => setQuote((p) => ({ ...p, fotoTecnicaData: '', fotoTecnicaNome: '' }))}
              >
                Remover foto
              </button>
            </div>
          ) : null}
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Descrição técnica / pedido</label>
          <textarea
            className="tum-in"
            rows={4}
            style={{ resize: 'vertical' }}
            placeholder='Ex.: modelo simples sem gaveta dupla; cliente quer adicionar 2 gavetas e revestimento completo.'
            value={q.descTecnica || ''}
            onChange={(e) => setQuote((p) => ({ ...p, descTecnica: e.target.value }))}
            onBlur={flushDescricaoNoCalculo}
          />
        </div>
      </div>

      <div className="tum-sec-lbl" style={{ marginTop: 16 }}>
        Pedra principal
      </div>
      <div className="tum-stone-row">
        {sel ? (
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 600 }}>{sel.nm}</div>
            <div style={{ fontSize: '.65rem', color: 'var(--grn)' }}>R$ {fm(sel.pr)}/m²</div>
          </div>
        ) : (
          <div style={{ fontSize: '.72rem', color: 'var(--t4)' }}>Nenhuma pedra selecionada</div>
        )}
        <select
          className="tum-in"
          style={{ flex: '1 1 180px', maxWidth: 280 }}
          value={q.stoneId ?? ''}
          onChange={(e) => setQuote((p) => ({
            ...p,
            stoneId: e.target.value || null,
            stonePrice: SAMPLE_STONES.find((x) => x.id === e.target.value)?.pr || 0,
          }))}
        >
          <option value="">Selecionar…</option>
          {SAMPLE_STONES.map((s) => (
            <option key={s.id} value={s.id}>{s.nm} — R$ {fm(s.pr)}/m²</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="tum-lbl">Perda / desperdício (%)</label>
        <input className="tum-in" type="number" min={5} max={40} style={{ maxWidth: 100 }}
          value={perda}
          onChange={(e) => setQuote((p) => {
            const n = structuredClone(p);
            n.pedras.perda = +e.target.value;
            return n;
          })} />
      </div>

      <div className="tmo-nav-row">
        <button type="button" className="btn btn-g" onClick={onNext}>Próximo: Pedras →</button>
      </div>
    </div>
  );
}
