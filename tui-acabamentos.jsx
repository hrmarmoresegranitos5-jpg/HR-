import { ACAB_LABELS, MDO_LABELS } from './tui-catalog.js';
import { ToggleRow, ExtraHeader, MiniResumo } from './tui-widgets.jsx';
import { fm } from './tui-calc-engine.js';

const LAP_OPTS = [['padrao', 'Padrão'], ['personalizada', 'Personalizada'], ['bronze', 'Placa Bronze']];
const MAT_CRUZ = [['marmore', 'Mármore'], ['granito', 'Granito'], ['metal', 'Metal Pintado'], ['inox', 'Inox']];
const MOD_CRUZ = [['simples', 'Simples'], ['lavrada', 'Lavrada / Trabalhada'], ['com_base', 'Com Base']];
const FOTO_TAM = [['10x15', '10×15 cm'], ['15x20', '15×20 cm'], ['20x25', '20×25 cm'], ['oval', 'Oval']];
const RV_TIPO = [['granito', 'Granito'], ['marmore', 'Mármore'], ['porcelana', 'Porcelanato'], ['ceramica', 'Cerâmica']];
const RV_ESCOPO = [
  ['parcial', 'Parcial (~metade envelope)'],
  ['completo', 'Completo (~100%)'],
];
const PERF_ACAB = [
  ['rapido', 'Mais rápido / econômico'],
  ['normal', 'Normal'],
  ['refinado', 'Refinado (mais horas MO)'],
];

/** Etapa 4: extras (lápide, cruz, foto, rev.) + acabamentos especiais + mão de obra */
export function TumuloAcabamentos({
  quote,
  effective,
  calc,
  setQuote,
  onPrev,
  onNext,
}) {
  const q = quote;
  const patch = (fn) => setQuote((p) => {
    const n = structuredClone(p);
    fn(n);
    return n;
  });

  const lap = effective.lapide;
  const cr = effective.cruz;
  const ft = effective.foto;
  const rv = effective.revestimento;
  const mdo = effective.mdo;

  const custoLap = lap.on ? lap.custo + lap.linhas * lap.custoPorLinha : 0;
  const vendaLap = lap.on ? lap.venda + lap.linhas * lap.vendaPorLinha : 0;
  const custoFoto = ft.on ? ft.custo + (ft.moldura ? ft.custoMoldura : 0) : 0;
  const vendaFoto = ft.on ? ft.venda + (ft.moldura ? ft.vendaMoldura : 0) : 0;
  const custoRev = rv.on ? (rv.m2 || 0) * rv.custo + (rv.preparo.on ? rv.preparo.custo : 0) : 0;
  const vendaRev = rv.on ? (rv.m2 || 0) * rv.venda + (rv.preparo.on ? rv.preparo.venda : 0) : 0;

  return (
    <div className="tum-sec">
      <ExtraHeader title="📜 Lápide" checked={lap.on} onToggle={(v) => patch((x) => { x.lapide.on = v; })} />
      {lap.on ? (
        <div className="tum-extra-body">
          <div className="tum-grid2">
            <div className="tum-f">
              <label className="tum-lbl">Tipo</label>
              <select className="tum-in" value={lap.tipo} onChange={(e) => patch((x) => { x.lapide.tipo = e.target.value; })}>
                {LAP_OPTS.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Linhas de texto</label>
              <input className="tum-in" type="number" min={1} max={12} value={lap.linhas}
                onChange={(e) => patch((x) => { x.lapide.linhas = +e.target.value; })} />
            </div>
          </div>
          <div className="tum-grid2" style={{ marginTop: 8 }}>
            <div className="tum-f">
              <label className="tum-lbl">Custo placa R$</label>
              <input className="tum-in" type="number" min={0} value={lap.custo}
                onChange={(e) => patch((x) => { x.lapide.custo = +e.target.value; })} />
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Venda placa R$</label>
              <input className="tum-in" type="number" min={0} value={lap.venda}
                onChange={(e) => patch((x) => { x.lapide.venda = +e.target.value; })} />
            </div>
          </div>
          <MiniResumo custo={custoLap} venda={vendaLap} />
          <div className="tum-f" style={{ marginTop: 8 }}>
            <label className="tum-lbl">Texto</label>
            <textarea className="tum-in" rows={2} placeholder="Aqui jaz..." value={lap.texto}
              onChange={(e) => patch((x) => { x.lapide.texto = e.target.value; })} />
          </div>
        </div>
      ) : null}

      <ExtraHeader title="✝️ Cruz" checked={cr.on} onToggle={(v) => patch((x) => { x.cruz.on = v; })} />
      {cr.on ? (
        <div className="tum-extra-body">
          <div className="tum-grid2">
            <div className="tum-f">
              <label className="tum-lbl">Material</label>
              <select className="tum-in" value={cr.tipo} onChange={(e) => patch((x) => { x.cruz.tipo = e.target.value; })}>
                {MAT_CRUZ.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Modelo</label>
              <select className="tum-in" value={cr.modelo} onChange={(e) => patch((x) => { x.cruz.modelo = e.target.value; })}>
                {MOD_CRUZ.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
          </div>
          <div className="tum-grid2" style={{ marginTop: 8 }}>
            <div className="tum-f">
              <label className="tum-lbl">Custo R$</label>
              <input className="tum-in" type="number" min={0} value={cr.custo}
                onChange={(e) => patch((x) => { x.cruz.custo = +e.target.value; })} />
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Venda R$</label>
              <input className="tum-in" type="number" min={0} value={cr.venda}
                onChange={(e) => patch((x) => { x.cruz.venda = +e.target.value; })} />
            </div>
          </div>
          <MiniResumo custo={cr.custo} venda={cr.venda} />
        </div>
      ) : null}

      <ExtraHeader title="📷 Foto Porcelana" checked={ft.on} onToggle={(v) => patch((x) => { x.foto.on = v; })} />
      {ft.on ? (
        <div className="tum-extra-body">
          <div className="tum-grid2">
            <div className="tum-f">
              <label className="tum-lbl">Tamanho</label>
              <select className="tum-in" value={ft.tamanho} onChange={(e) => patch((x) => { x.foto.tamanho = e.target.value; })}>
                {FOTO_TAM.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Moldura</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', fontSize: '.72rem', color: 'var(--t2)' }}>
                <input type="checkbox" checked={ft.moldura} style={{ accentColor: 'var(--gold)' }}
                  onChange={(e) => patch((x) => { x.foto.moldura = e.target.checked; })} /> Com moldura
              </label>
            </div>
          </div>
          <div className="tum-grid2" style={{ marginTop: 8 }}>
            <div className="tum-f">
              <label className="tum-lbl">Custo foto R$</label>
              <input className="tum-in" type="number" min={0} value={ft.custo}
                onChange={(e) => patch((x) => { x.foto.custo = +e.target.value; })} />
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Venda foto R$</label>
              <input className="tum-in" type="number" min={0} value={ft.venda}
                onChange={(e) => patch((x) => { x.foto.venda = +e.target.value; })} />
            </div>
          </div>
          {ft.moldura ? (
            <div className="tum-grid2" style={{ marginTop: 4 }}>
              <div className="tum-f">
                <label className="tum-lbl">Custo moldura</label>
                <input className="tum-in" type="number" min={0} value={ft.custoMoldura}
                  onChange={(e) => patch((x) => { x.foto.custoMoldura = +e.target.value; })} />
              </div>
              <div className="tum-f">
                <label className="tum-lbl">Venda moldura</label>
                <input className="tum-in" type="number" min={0} value={ft.vendaMoldura}
                  onChange={(e) => patch((x) => { x.foto.vendaMoldura = +e.target.value; })} />
              </div>
            </div>
          ) : null}
          <MiniResumo custo={custoFoto} venda={vendaFoto} />
        </div>
      ) : null}

      <ExtraHeader title="🪟 Revestimento" checked={rv.on} onToggle={(v) => patch((x) => { x.revestimento.on = v; })} />
      {rv.on ? (
        <div className="tum-extra-body">
          <div className="tum-grid2">
            <div className="tum-f">
              <label className="tum-lbl">Material</label>
              <select className="tum-in" value={rv.tipo} onChange={(e) => patch((x) => { x.revestimento.tipo = e.target.value; })}>
                {RV_TIPO.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Âmbito (m² automático)</label>
              <select className="tum-in" value={rv.escopo || 'parcial'} onChange={(e) => patch((x) => {
                x.revestimento.escopo = e.target.value;
                x.revestimento.sincronizaM2 = true;
              })}>
                {RV_ESCOPO.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 6px', cursor: 'pointer', fontSize: '.62rem', color: 'var(--t3)' }}>
            <input type="checkbox" checked={rv.sincronizaM2 !== false} style={{ accentColor: 'var(--gold)' }}
              onChange={(e) => patch((x) => { x.revestimento.sincronizaM2 = e.target.checked; })} />
            Sincronizar m² com C × L × H (desmarque para valor manual)
          </label>
          <div className="tum-grid2">
            <div className="tum-f">
              <label className="tum-lbl">Área (m²)</label>
              <input className="tum-in" type="number" step={0.01} value={rv.m2 || 0}
                onChange={(e) => patch((x) => { x.revestimento.m2 = +e.target.value; x.revestimento.sincronizaM2 = false; })} />
            </div>
          </div>
          <div className="tum-grid2" style={{ marginTop: 8 }}>
            <div className="tum-f">
              <label className="tum-lbl">Custo/m² R$</label>
              <input className="tum-in" type="number" min={0} value={rv.custo}
                onChange={(e) => patch((x) => { x.revestimento.custo = +e.target.value; })} />
            </div>
            <div className="tum-f">
              <label className="tum-lbl">Venda/m² R$</label>
              <input className="tum-in" type="number" min={0} value={rv.venda}
                onChange={(e) => patch((x) => { x.revestimento.venda = +e.target.value; })} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', fontSize: '.72rem', color: 'var(--t2)' }}>
            <input type="checkbox" checked={rv.preparo.on} style={{ accentColor: 'var(--gold)' }}
              onChange={(e) => patch((x) => { x.revestimento.preparo.on = e.target.checked; })} />
            Preparo de superfície
          </label>
          {rv.preparo.on ? (
            <div className="tum-grid2" style={{ marginTop: 8 }}>
              <div className="tum-f">
                <label className="tum-lbl">Custo preparo R$</label>
                <input className="tum-in" type="number" min={0} value={rv.preparo.custo}
                  onChange={(e) => patch((x) => { x.revestimento.preparo.custo = +e.target.value; })} />
              </div>
              <div className="tum-f">
                <label className="tum-lbl">Venda preparo R$</label>
                <input className="tum-in" type="number" min={0} value={rv.preparo.venda}
                  onChange={(e) => patch((x) => { x.revestimento.preparo.venda = +e.target.value; })} />
              </div>
            </div>
          ) : null}
          <MiniResumo custo={custoRev} venda={vendaRev} />
        </div>
      ) : null}

      <div className="tum-sec-lbl">Acabamentos especiais</div>
      <div className="tum-grid2" style={{ marginBottom: 12 }}>
        <div className="tum-f">
          <label className="tum-lbl">Perfil no cálculo de MO</label>
          <select className="tum-in" value={quote.acabNivel || 'normal'} onChange={(e) => setQuote((p) => ({ ...p, acabNivel: e.target.value }))}>
            {PERF_ACAB.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}
          </select>
        </div>
        <div className="tum-f">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, cursor: 'pointer', fontSize: '.62rem', color: 'var(--t3)' }}>
            <input type="checkbox" checked={quote.acabSyncQty !== false} style={{ accentColor: 'var(--gold)' }}
              onChange={(e) => setQuote((p) => ({ ...p, acabSyncQty: e.target.checked }))} />
            Preencher qtd pelo túmulo (m² / perímetro)
          </label>
        </div>
      </div>
      <div className="tum-peca-list">
        {Object.entries(ACAB_LABELS).map(([k]) => {
          const item = effective.acab[k];
          if (!item) return null;
          const custoAc = (item.qty || 0) * (item.custo || 0);
          const vendaAc = (item.qty || 0) * (item.venda || 0);
          return (
            <ToggleRow key={k} checked={!!item.on}
              onToggle={(on) => patch((x) => { x.acab[k].on = on; })}
              label={ACAB_LABELS[k]}
              footer={item.on ? <span>custo R$ {fm(custoAc)} · venda R$ {fm(vendaAc)}</span> : undefined}
              detail={(
                <div className="tum-grid3">
                  <div className="tum-f">
                    <label className="tum-lbl">Qtd ({item.unid})</label>
                    <input className="tum-in" type="number" step={0.01} min={0} value={item.qty || 0}
                      onChange={(e) => patch((x) => { x.acab[k].qty = +e.target.value; })} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Custo/{item.unid}</label>
                    <input className="tum-in" type="number" min={0} value={item.custo || 0}
                      onChange={(e) => patch((x) => { x.acab[k].custo = +e.target.value; })} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Venda/{item.unid}</label>
                    <input className="tum-in" type="number" min={0} value={item.venda || 0}
                      onChange={(e) => patch((x) => { x.acab[k].venda = +e.target.value; })} />
                  </div>
                </div>
              )} />
          );
        })}
      </div>

      <div className="tum-sec-lbl" style={{ marginTop: 16 }}>Equipe e serviços (mão de obra)</div>
      <div className="tum-peca-list">
        {['marmorista', 'ajudante'].map((k) => {
          const item = mdo[k];
          const dias = Math.ceil((item.horas || 0) / 8);
          const custoDi = dias * (item.diaria || 0);
          return (
            <ToggleRow key={k} checked={!!item.on}
              onToggle={(on) => patch((x) => { x.mdo[k].on = on; })}
              label={MDO_LABELS[k]}
              footer={
                item.on ? (
                  <span style={{ textAlign: 'right', fontSize: '.62rem' }}>
                    <span style={{ color: 'var(--t3)' }}>{item.horas}h = {dias}d</span>
                    <br />
                    <span style={{ color: '#4cda80' }}>R$ {fm(custoDi)}</span>
                  </span>
                ) : undefined}
              detail={(
                <div className="tum-grid2">
                  <div className="tum-f">
                    <label className="tum-lbl">Horas</label>
                    <input className="tum-in" type="number" min={0} value={item.horas || 0}
                      onChange={(e) => patch((x) => { x.mdo[k].horas = +e.target.value; })} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Diária R$</label>
                    <input className="tum-in" type="number" min={0} value={item.diaria ?? 400}
                      onChange={(e) => patch((x) => { x.mdo[k].diaria = +e.target.value; })} />
                  </div>
                </div>
              )} />
          );
        })}
        {['instalacao', 'acabamento', 'montagem', 'transporte'].map((k) => {
          const item = mdo[k];
          return (
            <ToggleRow key={k} checked={!!item.on}
              onToggle={(on) => patch((x) => { x.mdo[k].on = on; })}
              label={MDO_LABELS[k]}
              footer={
                item.on ? (
                  <span style={{ textAlign: 'right', fontSize: '.62rem', color: 'var(--t3)' }}>
                    custo R$ {fm(item.custo)}<br/>venda R$ {fm(item.venda)}
                  </span>
                ) : undefined}
              detail={(
                <div className="tum-grid2">
                  <div className="tum-f">
                    <label className="tum-lbl">Custo R$</label>
                    <input className="tum-in" type="number" min={0} value={item.custo || 0}
                      onChange={(e) => patch((x) => { x.mdo[k].custo = +e.target.value; })} />
                  </div>
                  <div className="tum-f">
                    <label className="tum-lbl">Valor cobrado R$</label>
                    <input className="tum-in" type="number" min={0} value={item.venda || 0}
                      onChange={(e) => patch((x) => { x.mdo[k].venda = +e.target.value; })} />
                  </div>
                </div>
              )} />
          );
        })}
        {['riscoQuebra', 'dificuldade'].map((k) => {
          const item = mdo[k];
          return (
            <ToggleRow key={k} checked={!!item.on}
              onToggle={(on) => patch((x) => { x.mdo[k].on = on; })}
              label={MDO_LABELS[k]}
              footer={item.on ? `${item.perc || 0}%` : undefined}
              detail={(
                <div className="tum-f">
                  <label className="tum-lbl">% sobre custo pedra</label>
                  <input className="tum-in" type="number" min={0} max={50} step={0.5} value={item.perc || 0}
                    onChange={(e) => patch((x) => { x.mdo[k].perc = +e.target.value; })} />
                </div>
              )} />
          );
        })}
      </div>

      <div className="tum-total-box">
        <div className="tum-total-row"><span>Custo real MO</span><span>R$ {fm(calc.custoMdo)}</span></div>
        <div className="tum-total-row tum-total-big"><span>Valor venda MO</span><span>R$ {fm(calc.vendaMdo)}</span></div>
      </div>

      <div className="tmo-nav-row">
        <button type="button" className="btn btn-o" onClick={onPrev}>← Construção</button>
        <button type="button" className="btn btn-g" onClick={onNext}>Resumo →</button>
      </div>
    </div>
  );
}
