import { SAMPLE_STONES, PEDRA_LABELS } from './tui-catalog.js';
import { ToggleRow } from './tui-widgets.jsx';
import { fm } from './tui-calc-engine.js';

const PEC_KEYS = ['tampa', 'detalhe', 'laterais', 'frontais', 'base', 'gavetas', 'sainha'];

/** Etapa 2: peças de pedra, moldura, pingadeira, recortes */
export function TumuloPedras({
  quote,
  effective,
  calc,
  setQuote,
  onPrev,
  onNext,
}) {
  const stPr = SAMPLE_STONES.find((s) => s.id === quote.stoneId)?.pr || quote.stonePrice || 0;
  const p = effective.pedras;

  const togglePeca = (k, on) =>
    setQuote((prev) => {
      const n = structuredClone(prev);
      if (n.pedras[k]) n.pedras[k].on = on;
      return n;
    });

  const patchPeca = (k, field, v) =>
    setQuote((prev) => {
      const n = structuredClone(prev);
      n.pedras[k][field] = v;
      return n;
    });

  const pecDetail = (k) => {
    const peca = p[k];
    if (!peca) return null;
    const m2 = peca.m2 || 0;
    return (
      <div className="tum-grid3">
        <div className="tum-f">
          <label className="tum-lbl">Área (m²)</label>
          <input className="tum-in" type="number" step="0.01" value={m2}
            onChange={(e) => patchPeca(k, 'm2', +e.target.value)} />
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Qtd peças</label>
          <input className="tum-in" type="number" min={1} value={peca.qty || 1}
            onChange={(e) => patchPeca(k, 'qty', +e.target.value)} />
        </div>
        <div className="tum-f">
          <label className="tum-lbl">Acréscimo R$</label>
          <input className="tum-in" type="number" min={0} value={peca.extra || 0}
            onChange={(e) => patchPeca(k, 'extra', +e.target.value)} />
        </div>
      </div>
    );
  };

  const moldura = p.moldura;
  const m2mol = (moldura.ml || 0) * 0.12;
  const molRow = (
    <ToggleRow
      checked={moldura.on}
      onToggle={(on) => togglePeca('moldura', on)}
      label={PEDRA_LABELS.moldura}
      footer={moldura.on ? (<><span>{fm(moldura.ml)} ml</span>{stPr ? <><br/><span>R$ {fm(m2mol * stPr)}</span></> : null}</>) : undefined}
      detail={(
        <div className="tum-grid3">
          <div className="tum-f">
            <label className="tum-lbl">Metros lineares</label>
            <input className="tum-in" type="number" step="0.01" value={moldura.ml || 0}
              onChange={(e) => patchPeca('moldura', 'ml', +e.target.value)} />
          </div>
          <div className="tum-f">
            <label className="tum-lbl">Valor/ml R$</label>
            <input className="tum-in" type="number" value={moldura.vlrMl || 120}
              onChange={(e) =>
                setQuote((pr) => {
                  const x = structuredClone(pr);
                  x.pedras.moldura.vlrMl = +e.target.value;
                  return x;
                })} />
          </div>
        </div>
      )}
    />
  );

  const ping = p.pingadeira;
  const m2ping = (ping.ml || 0) * 0.08;
  const pingRow = (
    <ToggleRow
      checked={ping.on}
      onToggle={(on) => togglePeca('pingadeira', on)}
      label={PEDRA_LABELS.pingadeira}
      footer={ping.on ? (<><span>{fm(ping.ml)} ml</span>{stPr ? <><br/><span>R$ {fm(m2ping * stPr)}</span></> : null}</>) : undefined}
      detail={(
        <div className="tum-grid3">
          <div className="tum-f">
            <label className="tum-lbl">Metros lineares</label>
            <input className="tum-in" type="number" step="0.01" value={ping.ml || 0}
              onChange={(e) => patchPeca('pingadeira', 'ml', +e.target.value)} />
          </div>
          <div className="tum-f">
            <label className="tum-lbl">Valor/ml R$</label>
            <input className="tum-in" type="number" value={ping.vlrMl || 80}
              onChange={(e) =>
                setQuote((pr) => {
                  const x = structuredClone(pr);
                  x.pedras.pingadeira.vlrMl = +e.target.value;
                  return x;
                })} />
          </div>
        </div>
      )}
    />
  );

  const rec = p.recortes;
  const recRow = (
    <ToggleRow
      checked={rec.on}
      onToggle={(on) => togglePeca('recortes', on)}
      label={PEDRA_LABELS.recortes}
      footer={rec.on ? <span>custo R$ {fm((rec.qty || 0) * (rec.vlrUn || 80))}</span> : undefined}
      detail={(
        <div className="tum-grid3">
          <div className="tum-f">
            <label className="tum-lbl">Qtd</label>
            <input className="tum-in" type="number" min={0} value={rec.qty || 0}
              onChange={(e) =>
                setQuote((pr) => {
                  const x = structuredClone(pr);
                  x.pedras.recortes.qty = +e.target.value;
                  return x;
                })} />
          </div>
          <div className="tum-f">
            <label className="tum-lbl">Valor un R$</label>
            <input className="tum-in" type="number" value={rec.vlrUn || 80}
              onChange={(e) =>
                setQuote((pr) => {
                  const x = structuredClone(pr);
                  x.pedras.recortes.vlrUn = +e.target.value;
                  return x;
                })} />
          </div>
        </div>
      )}
    />
  );

  return (
    <div className="tum-sec">
      {!stPr ? <div className="tum-warn">Selecione uma pedra na etapa Estrutura para ver os valores por m².</div> : null}
      <div className="tum-sec-lbl">Peças de pedra</div>
      <div className="tum-peca-list">
        {PEC_KEYS.map((k) => {
          const peca = p[k];
          if (!peca) return null;
          const m2 = peca.m2 || 0;
          const custo = m2 * stPr;
          return (
            <ToggleRow key={k} checked={!!peca.on} onToggle={(on) => togglePeca(k, on)} label={PEDRA_LABELS[k]}
              footer={
                peca.on ? (
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--t3)' }}>{fm(m2)} m²</span>
                    <br/>
                    {stPr ? <span style={{ color: '#4cda80' }}>R$ {fm(custo)}</span> : null}
                  </span>
                ) : undefined}
              detail={pecDetail(k)} />
          );
        })}
      </div>
      {molRow}
      {pingRow}
      {recRow}

      <div className="tum-total-box">
        <div className="tum-total-row"><span>Área líquida</span><span>{fm(calc.m2liq)} m²</span></div>
        <div className="tum-total-row"><span>Com {(p.perda || 15)}% perda</span><span>{fm(calc.m2total)} m²</span></div>
        {stPr ? (
          <>
            <div className="tum-total-row tum-total-big"><span>Custo real pedra</span><span>R$ {fm(calc.custoPedra)}</span></div>
            <div className="tum-total-row tum-total-big"><span>Valor venda pedra</span><span>R$ {fm(calc.vendaPedra)}</span></div>
          </>
        ) : null}
      </div>

      <div className="tmo-nav-row">
        <button type="button" className="btn btn-o" onClick={onPrev}>← Estrutura</button>
        <button type="button" className="btn btn-g" onClick={onNext}>Construção →</button>
      </div>
    </div>
  );
}
