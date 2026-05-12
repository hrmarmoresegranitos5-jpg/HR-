/**
 * Extrai CSS e JS embutidos de index.html para arquivos externos.
 * Uso: node split-index-html.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const indexPath = path.join(root, 'index.html');

const lines = fs.readFileSync(indexPath, 'utf8').split(/\r?\n/);

const iStyleOpen = lines.findIndex((l) => l.trim() === '<style>');
const iStyleClose = lines.findIndex((l, idx) => idx > iStyleOpen && l.trim() === '</style>');
if (iStyleOpen < 0 || iStyleClose < 0) throw new Error('Bloco <style> não encontrado');

const cssBody = lines.slice(iStyleOpen + 1, iStyleClose).join('\n') + '\n';

const iBootstrapOpen = lines.findIndex((l, idx) => idx > iStyleClose && l.trim() === '<script>');
if (iBootstrapOpen < 0) throw new Error('Primeiro <script> não encontrado');

const iBootstrapClose = lines.findIndex((l, idx) => idx > iBootstrapOpen && l.trim() === '</script>');
if (iBootstrapClose < 0) throw new Error('Fechamento do bootstrap não encontrado');

const bootstrapJs = lines.slice(iBootstrapOpen + 1, iBootstrapClose).join('\n') + '\n';

const iMainOpen = lines.findIndex((l, idx) => idx > iBootstrapClose && l.trim() === '<script>');
if (iMainOpen < 0) throw new Error('Script principal não encontrado');

const iMainClose = lines.findIndex((l, idx) => idx > iMainOpen && l.trim() === '</script>');
if (iMainClose < 0) throw new Error('Fechamento do script principal não encontrado');

const mainJs = lines.slice(iMainOpen + 1, iMainClose).join('\n') + '\n';

fs.writeFileSync(path.join(root, 'app-styles.css'), cssBody, 'utf8');
fs.writeFileSync(path.join(root, 'app-bootstrap.js'), bootstrapJs, 'utf8');
fs.writeFileSync(path.join(root, 'app-main.js'), mainJs, 'utf8');

const newLines = [
  ...lines.slice(0, iStyleOpen),
  '<link rel="stylesheet" href="app-styles.css?v=3">',
  ...lines.slice(iStyleClose + 1, iBootstrapOpen),
  '<script src="app-bootstrap.js?v=3"></script>',
  ...lines.slice(iBootstrapClose + 1, iMainOpen),
  '<script src="app-main.js?v=3" defer></script>',
  ...lines.slice(iMainClose + 1),
];

fs.copyFileSync(indexPath, indexPath + '.bak');
fs.writeFileSync(indexPath, newLines.join('\n') + '\n', 'utf8');

console.log('Extracao concluída:', {
  appStylesCss: cssBody.length,
  appBootstrapJs: bootstrapJs.length,
  appMainJs: mainJs.length,
  backup: indexPath + '.bak',
});
