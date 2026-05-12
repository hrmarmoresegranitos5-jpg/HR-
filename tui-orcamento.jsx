import { useMemo, useState } from 'react';
import { createInitialQuote } from './tui-quote-seed.js';
import { SAMPLE_STONES, TUM_TIPOS } from './tui-catalog.js';
import { finalizeQuote, fm } from './tui-calc-engine.js';
import { applyTipoPreset } from './tui-preset-tipo.js';
import { TumuloEstrutura } from './tui-estrutura.jsx';
import { TumuloPedras } from './tui-pedras.jsx';
import { TumuloConstrucao } from './tui-construcao.jsx';
import { TumuloAcabamentos } from './tui-acabamentos.jsx';
import { TumuloResumo } from './tui-resumo.jsx';
import './tui-module.css';

const STEPS = [
  { key: 'estrutura', label: 'Estrutura', icon: '📐' },
  { key: 'pedras', label: 'Pedras', icon: '🪨' },
  { key: 'construcao', label: 'Construção', icon: '🧱' },
  { key: 'acabamentos', label: 'Acabamentos', icon: '✨' },
  { key: 'resumo', label: 'Resumo', icon: '💰' },
];

/** Orquestrador: apenas etapas + estado único do orçamento + cálculo derivado. */
export function TumulosOrcamento() {
  const [step, setStep] = useState(0);
  const [quote, setQuote] = useState(createInitialQuote);

  const stones = SAMPLE_STONES;
  const { effective, calc } = useMemo(() => finalizeQuote(quote, stones), [quote, stones]);

  const vendaFinal = calc.venda > 0;
  const lucro = calc.lucroTotal || 0;

  const onSelectTipo = (k) =>
    setQuote((prev) => applyTipoPreset(prev, k));

  const goPrev = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));

  const common = {
    quote,
    effective,
    calc,
    setQuote,
  };

  return (
    <div className="tmo-wrap">
      <header className="tum-hero">
        <div className="tum-hero-row">
          <div>
            <div className="tum-hero-title">⚰️ Orçamento funerário</div>
            <div className="tum-hero-sub">{TUM_TIPOS[quote.tipo]?.label || quote.tipo}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tum-hero-val">{vendaFinal ? `R$ ${fm(calc.venda)}` : '—'}</div>
            {lucro > 0 ? (
              <div style={{ fontSize: '.65rem', color: '#4cda80', marginTop: 2 }}>
                lucro R$ {fm(lucro)} · {(calc.margemReal ?? 0).toFixed(0)}%
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="tmo-steps" aria-label="Etapas do orçamento">
        {STEPS.map((st, idx) => (
          <button key={st.key} type="button" className={`tmo-step-pill${idx === step ? ' on' : ''}`}
            onClick={() => setStep(idx)}>
            <span aria-hidden>{st.icon}</span>
            <span>{st.label}</span>
          </button>
        ))}
      </nav>

      {step === 0 && (
        <TumuloEstrutura {...common} onSelectTipo={onSelectTipo} onNext={goNext} />
      )}
      {step === 1 && (
        <TumuloPedras {...common} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 2 && (
        <TumuloConstrucao {...common} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 3 && (
        <TumuloAcabamentos {...common} onPrev={goPrev} onNext={goNext} />
      )}
      {step === 4 && (
        <TumuloResumo {...common} onPrev={goPrev} />
      )}
    </div>
  );
}
