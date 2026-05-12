/** Peças reutilizáveis */

export function ToggleRow({
  checked,
  onToggle,
  label,
  detail,
  footer,
}) {
  return (
    <div className={`tum-peca-row${checked ? '' : ' tum-peca-off'}`}>
      <div className="tum-peca-header">
        <label className="tum-tog">
          <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
          <span className="tum-tog-slider" />
        </label>
        <div className="tum-peca-label">{label}</div>
        {footer ? <div className="tum-peca-val" style={{ fontSize: '.6rem', textAlign: 'right' }}>{footer}</div> : null}
      </div>
      {checked && detail ? <div className="tum-peca-detail">{detail}</div> : null}
    </div>
  );
}

export function MiniResumo({ custo, venda }) {
  const lucro = venda - custo;
  const margem = venda > 0 ? (lucro / venda) * 100 : 0;
  return (
    <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '.52rem', color: 'var(--t4)' }}>Custo</div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--t2)' }}>R$ {custo.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '.52rem', color: 'var(--t4)' }}>Venda</div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--grn)' }}>
          R$ {venda.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </div>
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '.52rem', color: 'var(--t4)' }}>Lucro</div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--gold2)' }}>
          R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} ({margem.toFixed(0)}%)
        </div>
      </div>
    </div>
  );
}

export function ExtraHeader({ title, checked, onToggle }) {
  return (
    <div className="tum-extra-hd" role="button" tabIndex={0} onClick={() => onToggle(!checked)} onKeyDown={(e) => (e.key === 'Enter' ? onToggle(!checked) : null)}>
      <label className="tum-tog" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="tum-tog-slider" />
      </label>
      <span style={{ fontSize: '.8rem', fontWeight: 600, color: checked ? 'var(--gold2)' : 'var(--t2)' }}>{title}</span>
    </div>
  );
}
