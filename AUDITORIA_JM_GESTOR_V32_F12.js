(async function auditoriaJmGestorV32(){
  const GESTOR = 'jm-fluxo-gestor-v32-cache-leaflet-hotfix';
  const MOTORISTA = 'jm-fluxo-operacional-v31-motorista-cloudinary-real-flow';
  const OLD = 'jm-fluxo-operacional-v26-cache-refresh';
  const GLOBAL = 'jm-fluxo-global-v32-cache-control';
  const result = { ok: [], warn: [], fail: [], info: {} };
  const ok = (m) => result.ok.push(m);
  const warn = (m) => result.warn.push(m);
  const fail = (m) => result.fail.push(m);
  const check = (cond, pass, bad, soft=false) => cond ? ok(pass) : (soft ? warn(bad) : fail(bad));

  const assetEls = Array.from(document.querySelectorAll('script[src],link[href]'));
  const assets = assetEls.map((el) => el.src || el.href).filter(Boolean);
  result.info.url = location.href;
  result.info.assetsComVersao = assets.filter((u) => /[?&]v=/.test(u));

  check(/jm\.html(?:$|[?#])/.test(location.pathname + location.search), 'Página atual parece jm.html.', 'Abra exatamente jm.html para esta auditoria.', true);
  check(assets.some((u) => u.includes('js/app.js') && u.includes(GESTOR)), 'jm.html carregou app.js com versão V32 do gestor.', 'app.js não está com versão V32 do gestor.');
  check(assets.some((u) => u.includes('js/final-ux.js') && u.includes(GESTOR)), 'jm.html carregou final-ux.js com versão V32 do gestor.', 'final-ux.js não está com versão V32 do gestor.');
  check(!assets.some((u) => u.includes(OLD)), 'Nenhum asset carregado no jm.html está usando V26.', 'Ainda existe asset V26 carregado no jm.html.');
  check(!assets.some((u) => u.includes('js/app.js') && u.includes(MOTORISTA)), 'app.js do gestor não usa versão do motorista.', 'app.js do gestor está contaminado com versão do motorista.');

  check(typeof window.selectOperationalCall === 'function', 'selectOperationalCall existe direto no window.', 'selectOperationalCall não existe no window.');
  check(typeof window.selectCallDossier === 'function', 'selectCallDossier existe direto no window.', 'selectCallDossier não existe no window.');
  check(!!(window.JM && window.JM.app && typeof window.JM.app.selectOperationalCall === 'function'), 'selectOperationalCall continua em JM.app.', 'selectOperationalCall não existe em JM.app.');
  check(!!(window.JM && window.JM.app && typeof window.JM.app.selectCallDossier === 'function'), 'selectCallDossier continua em JM.app.', 'selectCallDossier não existe em JM.app.');

  const mapIds = ['dashboardMap','operationMap','fleetMap','callDossierRouteMap'];
  result.info.mapas = mapIds.map((id) => {
    const el = document.getElementById(id);
    if (!el) return { id, existe:false };
    const r = el.getBoundingClientRect();
    return { id, existe:true, visivel:r.width>0 && r.height>0, width:Math.round(r.width), height:Math.round(r.height), leafletId: !!el._leaflet_id };
  });
  check(!!window.L, 'Leaflet está disponível.', 'Leaflet não está disponível no window.', true);
  check(!!(window.JM && window.JM.mapa && typeof window.JM.mapa.renderFleetMap === 'function'), 'JM.mapa.renderFleetMap disponível.', 'JM.mapa.renderFleetMap indisponível.');
  check(!!(window.JM && window.JM.mapa && typeof window.JM.mapa.invalidateAll === 'function'), 'JM.mapa.invalidateAll disponível.', 'JM.mapa.invalidateAll indisponível.');

  const idsAtencao = ['driverCalls','expenseForm','expenseCall','expenseVehicle','expenseType','expenseAmount','expenseNotes'];
  result.info.idsAtencao = idsAtencao.map((id) => ({ id, existe: !!document.getElementById(id) }));
  warn('IDs de atenção foram apenas listados; ausência não significa erro sem validar a aba/fluxo que usa cada ID.');

  check(typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined', 'jsPDF disponível na página.', 'jsPDF não está disponível no jm.html; pode ser normal se PDF for só via relatorio.html/window.print().', true);
  check(typeof window.html2canvas !== 'undefined', 'html2canvas disponível na página.', 'html2canvas não está disponível no jm.html; pode ser normal se PDF for só via relatorio.html/window.print().', true);

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      result.info.serviceWorker = reg ? { scope: reg.scope, active: !!reg.active, scriptURL: reg.active && reg.active.scriptURL } : null;
      check(!!reg, 'Existe service-worker registrado.', 'Nenhum service-worker registrado ainda.', true);
      if (reg && reg.active) check(reg.active.scriptURL.includes(GESTOR) || reg.active.scriptURL.includes(GLOBAL), 'service-worker ativo está em V32/global.', 'service-worker ativo não parece V32/global.', true);
    } catch (e) { warn('Não consegui ler service-worker: ' + e.message); }
  } else warn('Navegador sem serviceWorker.');

  if (window.caches && caches.keys) {
    try {
      const keys = await caches.keys();
      result.info.caches = keys;
      check(keys.includes(GLOBAL) || keys.some((k) => k.includes('v32')), 'Cache V32/global encontrado ou preparado.', 'Cache V32/global ainda não apareceu; recarregue uma vez após subir.', true);
      check(!keys.some((k) => k.includes(OLD)), 'Cache V26 não aparece nas chaves.', 'Existe cache V26 antigo; limpar dados do site ou aguardar activate/purge.', true);
    } catch (e) { warn('Não consegui ler caches: ' + e.message); }
  }

  console.table(result.info.mapas);
  console.table(result.info.idsAtencao);
  console.log('AUDITORIA JM GESTOR V32:', result);
  return result;
})();
