const fs = require('fs');
const assert = require('assert');

const GESTOR = 'jm-fluxo-gestor-v32-cache-leaflet-hotfix';
const MOTORISTA = 'jm-fluxo-operacional-v31-motorista-cloudinary-real-flow';
const GLOBAL = 'jm-fluxo-global-v32-cache-control';
const OLD = 'jm-fluxo-operacional-v26-cache-refresh';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const jm = read('jm.html');
const app = read('js/app.js');
const mapa = read('js/mapa.js');
const finalUx = read('js/final-ux.js');
const sw = read('service-worker.js');
const motorista = read('motorista.html');
const version = JSON.parse(read('version.json'));

assert(jm.includes(`app.js?v=${GESTOR}`), 'jm.html deve carregar app.js com versão própria do gestor V32');
assert(jm.includes(`final-ux.js?v=${GESTOR}`), 'jm.html deve carregar final-ux.js com versão própria do gestor V32');
assert(!jm.includes(OLD), 'jm.html não pode carregar V26');
assert(!jm.includes(`?v=${MOTORISTA}`), 'jm.html não pode usar query string da versão do motorista');

assert(app.includes(`LOGIN_FLOW_VERSION = "${GESTOR}"`), 'app.js deve registrar service-worker com versão do gestor V32');
assert(app.includes('window.selectOperationalCall = selectOperationalCall;'), 'selectOperationalCall precisa existir direto no window');
assert(app.includes('window.selectCallDossier = selectCallDossier;'), 'selectCallDossier precisa existir direto no window');
assert(app.includes('selectOperationalCall,'), 'selectOperationalCall precisa continuar em JM.app');
assert(app.includes('selectCallDossier,'), 'selectCallDossier precisa continuar em JM.app');

assert(mapa.includes('const renderTokens = {};'), 'mapa.js precisa controlar tokens de renderização');
assert(mapa.includes('function containerCanRender(container)'), 'mapa.js precisa checar container visível/conectado');
assert(mapa.includes('function isRenderStale(containerId, token, map)'), 'mapa.js precisa descartar renderização antiga');
assert(mapa.includes('try { map.invalidateSize(); } catch (_) {}'), 'mapa.js precisa proteger invalidateSize');

assert(finalUx.includes(GESTOR), 'final-ux.js deve marcar V32 do gestor');
assert(sw.includes(`CACHE_NAME = "${GLOBAL}"`), 'service-worker deve usar cache global V32');
assert(sw.includes(`GESTOR_VERSION = "${GESTOR}"`), 'service-worker deve aceitar versão do gestor');
assert(sw.includes(`MOTORISTA_VERSION = "${MOTORISTA}"`), 'service-worker deve preservar versão ativa do motorista');
assert(sw.includes('ACTIVE_ASSET_VERSIONS'), 'service-worker deve aceitar múltiplas versões ativas conscientemente');
assert(version.version === GLOBAL, 'version.json deve declarar cache global V32');
assert(version.gestorVersion === GESTOR, 'version.json deve declarar gestor V32');
assert(version.motoristaVersion === MOTORISTA, 'version.json deve preservar motorista V31');

assert(motorista.includes(MOTORISTA), 'motorista.html precisa permanecer em V31');
assert(!motorista.includes(GESTOR), 'motorista.html não pode receber versão do gestor');

console.log('OK gestor-v32-cache-leaflet-hotfix');
