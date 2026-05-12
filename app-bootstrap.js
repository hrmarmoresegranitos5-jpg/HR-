/* HR Mármores — bootstrap mínimo (abre o app antes do carregamento completo do script principal) */
window._pendingPg=null;
function openApp(pg){
  var splash=document.getElementById('sSplash');
  var app=document.getElementById('sApp');
  if(splash){splash.classList.remove('on');splash.style.cssText='display:none!important';}
  if(app){app.classList.add('on');app.style.display='block';}
  window._pendingPg=pg;
  if(typeof window.setLayout==='function'){
    window.setLayout();
    if(typeof go==='function'){go(pg);window._pendingPg=null;}
  }
}
