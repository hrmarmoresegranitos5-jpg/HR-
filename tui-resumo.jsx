import { TUM_TIPOS } from './tui-catalog.js';
import { SAMPLE_STONES } from './tui-catalog.js';
import { fm } from './tui-calc-engine.js';

/** Etapa 5: visão custo × venda e conferência */
export function TumuloResumo({
  quote,
  effective,
  calc,
  setQuote,
  onPrev,
}) {
  const tipo = TUM_TIPOS[quote.tipo] || {};
  const margem = calc.margemReal || 0;
  const margemCor = margem >= 30 ? '#4cda80' : margem >= 20 ? '#c9a84c' : '#e07070';
  const margemLabel = margem >= 30 ? 'Excelente' : margem >= 20 ? 'Aceitável' : 'Baixa';
  const sel = SAMPLE_STONES.find((s) => s.id === quote.stoneId);
  const diasMdo = tipo.diasMdo || 0;
  const diasObra = tipo.diasObra || 0;
  const tempoTotal = tipo.tempoTotal ?? diasMdo + diasObra;

  const cats = [
    { icon: '💎', label: 'Pedra', custo: calc.custoPedra, venda: calc.vendaPedra },
    { icon: '✨', label: 'Acabamentos', custo: calc.custoAcab, venda: calc.vendaAcab },
    { icon: '📜', label: 'Lápide', custo: calc.custoLapide, venda: calc.vendaLapide },
    { icon: '✝️', label: 'Cruz', custo: calc.custoCruz, venda: calc.vendaCruz },
    { icon: '📷', label: 'Foto Porc.', custo: calc.custoFoto, venda: calc.vendaFoto },
    { icon: '🪟', label: 'Revestimento', custo: calc.custoRev, venda: calc.vendaRev },
    { icon: '🔨', label: 'Mão de Obra', custo: calc.custoMdo, venda: calc.vendaMdo },
    { icon: '🧱', label: 'Construção', custo: calc.custoObra, venda: calc.custoObra },
    { icon: '🪣', label: 'Materiais', custo: calc.custoMat, venda: calc.custoMat },
  ].filter((c) => c.custo || c.venda);

  return (
    <div className="tum-sec">
      <div className="tum-sec-lbl">Custo × venda × lucro</div>
      <div className="tum-dre-table">
        <div className="tum-dre-head">
          <span>Categoria</span>
          <span>Custo Real</span>
          <span>Valor Venda</span>
          <span>Lucro</span>
        </div>
        {cats.map((cat) => {
          const lucro = (cat.venda || 0) - (cat.custo || 0);
          return (
            <div key={cat.label} className="tum-dre-row">
              <span style={{ fontSize: '.7rem' }}>{cat.icon} {cat.label}</span>
              <span style={{ color: 'var(--t2)' }}>R$ {fm(cat.custo || 0)}</span>
              <span style={{ color: '#4cda80' }}>R$ {fm(cat.venda || 0)}</span>
              <span style={{ color: lucro > 0 ? '#C9A84C' : lucro < 0 ? '#e07070' : 'var(--t3)' }}>
                {lucro > 0 ? '+ ' : ''}R$ {fm(lucro)}
              </span>
            </div>
          );
        })}
        <div className="tum-dre-total">
          <span>TOTAL</span>
          <span>R$ {fm(calc.custoTotal)}</span>
          <span style={{ color: '#4cda80' }}>R$ {fm(calc.vendaTotal)}</span>
          <span style={{ color: '#C9A84C' }}>R$ {fm(calc.lucroTotal)}</span>
        </div>
      </div>

      <div style={{ background: 'var(--s3)', border: '1px solid var(--bd2)', borderRadius: 14, padding: 14, margin: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '.65rem', color: 'var(--t3)' }}>Margem de lucro</span>
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: margemCor }}>{margem.toFixed(1)}% — {margemLabel}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 6, height: 8 }}>
          <div style={{ background: margemCor, borderRadius: 6, height: 8, width: `${Math.min(margem, 100)}%`, transition: 'width .4s' }} />
        </div>
      </div>

      <div className="tum-sec-lbl">Precificação</div>
      <div className="tum-prec-box">
        <div className="tum-grid2">
          <div className="tum-f">
            <label className="tum-lbl">Margem adicional (%)</label>
            <input className="tum-in" type="number" min={0} max={200} value={quote.margem || 0}
              onChange={(e) => setQuote((p) => ({ ...p, margem: +e.target.value }))} />
          </div>
          <div className="tum-f">
            <label className="tum-lbl">Desconto R$</label>
            <input className="tum-in" type="number" min={0} value={quote.desconto || 0}
              onChange={(e) => setQuote((p) => ({ ...p, desconto: +e.target.value }))} />
          </div>
        </div>
        <div className="tum-prec-final" style={{ marginTop: 10, paddingTop: 10 }}>
          <span>Valor final sugerido</span>
          <span>R$ {fm(calc.venda)}</span>
        </div>
      </div>

      <div className="tum-sec-lbl">Cronograma</div>
      <div className="tum-crono">
        <div className="tum-crono-row">
          {diasObra ? (
            <div className="tum-crono-item" style={{ flex: diasObra }}>
              <div className="tum-crono-bar tum-crono-obra" />
              <div className="tum-crono-lbl">Construção<br/>{diasObra} dias</div>
            </div>
          ) : null}
          {diasMdo ? (
            <div className="tum-crono-item" style={{ flex: diasMdo }}>
              <div className="tum-crono-bar tum-crono-mdo" />
              <div className="tum-crono-lbl">Marmoraria<br/>{diasMdo} dias</div>
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--t3)', marginTop: 8 }}>
          ⏱ Prazo estimado: <strong style={{ color: 'var(--gold2)' }}>{tempoTotal} dias úteis</strong>
        </div>
        <div style={{ fontSize: '.58rem', color: 'var(--t4)', marginTop: 8, lineHeight: 1.35 }}>
          Referência pelo modelo inicial — alinhe com o prazo real do contrato e da equipe.
        </div>
      </div>

      <div className="tum-sec-lbl">Resumo técnico</div>
      <div className="tum-tech-box">
        <div className="tum-tech-row"><span className="tum-tech-l">Tipo</span><span>{tipo.label || quote.tipo}</span></div>
        <div className="tum-tech-row"><span className="tum-tech-l">Cliente</span><span>{quote.cli || '—'}</span></div>
        {quote.falecido ? <div className="tum-tech-row"><span className="tum-tech-l">Falecido</span><span>{quote.falecido}</span></div> : null}
        <div className="tum-tech-row"><span className="tum-tech-l">Pedra</span><span>{sel ? `${sel.nm} (R$ ${fm(sel.pr)}/m²)` : 'Não selecionada'}</span></div>
        <div className="tum-tech-row">
          <span className="tum-tech-l">Dimensões</span>
          <span>
            {effective.dims.comp}m × {effective.dims.larg}m × {effective.dims.alt}m
            {effective.dims.gavetas ? <> · {effective.dims.gavetas} compart.</> : null}
          </span>
        </div>
        {quote.fotoTecnicaData ? (
          <div className="tum-tech-row">
            <span className="tum-tech-l">Foto referência</span>
            <span>Sim{quote.fotoTecnicaNome ? ` · ${quote.fotoTecnicaNome}` : ''}</span>
          </div>
        ) : null}
        {(quote.descTecnica || '').trim() ? (
          <div className="tum-tech-row">
            <span className="tum-tech-l">Descrição técnica</span>
            <span>
              {(quote.descTecnica.replace(/\s+/g, ' ').trim().length > 120
                ? `${quote.descTecnica.replace(/\s+/g, ' ').trim().slice(0, 117)}…`
                : quote.descTecnica.replace(/\s+/g, ' ').trim())}
            </span>
          </div>
        ) : null}
      </div>

      <div className="tum-sec-lbl">Observações</div>
      <textarea className="tum-in" rows={3} value={quote.obs || ''}
        placeholder="Observações técnicas..."
        onChange={(e) => setQuote((p) => ({ ...p, obs: e.target.value }))} />

      <div className="tmo-nav-row" style={{ marginTop: 20 }}>
        <button type="button" className="btn btn-o" onClick={onPrev}>← Acabamentos</button>
      </div>
    </div>
  );
}
