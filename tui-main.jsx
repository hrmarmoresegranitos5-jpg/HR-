import React from 'react';
import { createRoot } from 'react-dom/client';
import { TumulosOrcamento } from './tui-orcamento.jsx';
import './tui-index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TumulosOrcamento />
  </React.StrictMode>
);
