import { OBRA_LABELS, MAT_LABELS } from './tui-catalog.js';
import { ToggleRow } from './tui-widgets.jsx';
import { fm } from './tui-calc-engine.js';

/** Etapa 3: obra (pedreiro) + materiais */
export function TumuloConstrucao({
  quote,
  effective,
  calc,
  setQuote,
  onPrev,
  onNext,
}) {
  const obra = effective.obra;
  const mat = effective.mat;

  const toggleObra = (k, on) =>
    setQuote((p) => {
      const n = structuredClone(p);
      n.obra[k].on = on;
      return n;
    });
  const patchObra = (k, field, v) =>
    setQuote((p) => {
      const n = structuredClone(p);
      n.obra[k][field] = v;
      return n;
    });
  const toggleMat = (k, on) =>
    setQuote((p) => {
      const n = structuredClone(p);
      n.mat[k].on = on;
      return n;
    });
  const patchMat = (k, field, v) =>
    setQuote((p) => {
      const n = structuredClone(p);
      n.mat[k][field] = v;
      return n;
    });

  return (
    <div className="tum-sec">
      <div className="tum-sec-lbl">Serviços de pedreiro</div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, cursor: 'pointer', fontSize: '.62rem', color: 'var(--t3)' }}>
        <input type="checkbox" checked={quote.obraAutos !== false} style={{ accentColor: 'var(--gold)', marginTop: 2 }}
          onChange={(e) => setQuote((p) => ({ ...p, obraAutos: e.target.checked }))} />
        <span>Sugerir dias de obra a partir das medidas, compartimentos e revestimento (desmarque para ajustar só manualmente).</span>
      </label>
      <div className="tum-peca-list">
        {Object.entries(OBRA_LABELS).map(([k]) => {
          const item = obra[k];
          if (!item) return null;
          const vlr = (item.dias || 0) * (item.diaria || 350) * (item.equipe || 1);
          return (
            <ToggleRow key={k} checked={!!item.on} onToggle={(on) => toggleObra(k, on)}
              label={OBRA_LABELS[k]}
              footer={
                item.on ? (
                  <span style={{ textAlign: 'right', fontSize: '.62rem', color: 'var(--t3)' }}>
                    {item.dias}d × {item.equipe} pess.<br/><span style={{ color: '#4cda80' }}>R$ {fm(vlr)}</span>
                  </span>
                ) : undefined
              }
              detail={(
                <div className="tum-grid3">
                  <div className="tum-f">
                    <label className="tum-lbl">Dias</label>
                    <input className="tum-in" type="number" step="0.5" min={0} value={item.dias || 0}
                      onChange={(e) => patchObra(k, 'dias', +e.target.value)} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Diária R$</label>
                    <input className="tum-in" type="number" min={0} value={item.diaria ?? 350}
                      onChange={(e) => patchObra(k, 'diaria', +e.target.value)} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Equipe</label>
                    <input className="tum-in" type="number" min={1} value={item.equipe || 1}
                      onChange={(e) => patchObra(k, 'equipe', +e.target.value)} />
                  </div>
                </div>
              )} />
          );
        })}
      </div>

      <div className="tum-total-box">
        <div className="tum-total-row tum-total-big"><span>Total construção</span><span>R$ {fm(calc.custoObra)}</span></div>
      </div>

      <div className="tum-info-box" style={{ marginTop: 14 }}>
        Quantidades de materiais são estimadas a partir das dimensões — ajuste se necessário.
      </div>
      <div className="tum-sec-lbl">Materiais</div>
      <div className="tum-peca-list">
        {['cimento', 'areia', 'brita', 'ferro', 'tijolos', 'blocos', 'massa', 'cola', 'rejunte'].map((k) => {
          const item = mat[k];
          if (!item) return null;
          const tot = (item.qty || 0) * (item.preco || 0);
          return (
            <ToggleRow key={k} checked={!!item.on} onToggle={(on) => toggleMat(k, on)} label={MAT_LABELS[k]}
              footer={
                item.on ? (
                  <span style={{ textAlign: 'right', fontSize: '.6rem', color: 'var(--t3)' }}>
                    {fm(item.qty)} {item.unid}<br/><span style={{ color: '#4cda80' }}>R$ {fm(tot)}</span>
                  </span>
                ) : undefined}
              detail={(
                <div className="tum-grid2">
                  <div className="tum-f">
                    <label className="tum-lbl">Qtd ({item.unid})</label>
                    <input className="tum-in" type="number" min={0} step={0.1} value={item.qty || 0}
                      onChange={(e) => patchMat(k, 'qty', +e.target.value)} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Preço/{item.unid}</label>
                    <input className="tum-in" type="number" min={0} step={0.01} value={item.preco || 0}
                      onChange={(e) => patchMat(k, 'preco', +e.target.value)} />
                  </div>
                </div>
              )} />
          );
        })}
        {['agua', 'frete'].map((k) => {
          const item = mat[k];
          if (!item) return null;
          return (
            <ToggleRow key={k} checked={!!item.on} onToggle={(on) => toggleMat(k, on)} label={MAT_LABELS[k]}
              footer={item.on ? <span>R$ {fm(item.vlr || 0)}</span> : undefined}
              detail={(
                <div className="tum-f">
                  <label className="tum-lbl">Valor R$</label>
                  <input className="tum-in" type="number" min={0} value={item.vlr || 0}
                    onChange={(e) => patchMat(k, 'vlr', +e.target.value)} />
                </div>
              )} />
          );
        })}
      </div>

      <div className="tum-total-box">
        <div className="tum-total-row tum-total-big"><span>Total materiais</span><span>R$ {fm(calc.custoMat)}</span></div>
      </div>

      <div className="tmo-nav-row">
        <button type="button" className="btn btn-o" onClick={onPrev}>← Pedras</button>
        <button type="button" className="btn btn-g" onClick={onNext}>Acabamentos →</button>
      </div>
    </div>
  );
}
