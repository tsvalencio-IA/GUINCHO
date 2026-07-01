# ENTREGA JM Gestor V32 - cache/Leaflet/hotfix cirúrgico

## Base comparada
- Base original: `GuinchoJM-main(1).zip`
- Candidata analisada: `GuinchoJM-v31-gestor-cache-leaflet-hotfix.zip`

## Diagnóstico da candidata
A candidata alterava apenas:
- `jm.html`
- `js/app.js`
- `js/final-ux.js`
- `js/mapa.js`
- `version.json`

Ela não alterava `motorista.html` nem scripts do motorista, mas colocava o gestor usando a versão:
`jm-fluxo-operacional-v31-motorista-cloudinary-real-flow`.

Isso corrigia parte do cache, mas mantinha a contaminação semântica entre gestor e motorista.

## Correção aplicada nesta V32
Versão própria do gestor:
`jm-fluxo-gestor-v32-cache-leaflet-hotfix`

Cache global consciente:
`jm-fluxo-global-v32-cache-control`

Versão do motorista preservada:
`jm-fluxo-operacional-v31-motorista-cloudinary-real-flow`

## Arquivos alterados
- `jm.html`
- `js/app.js`
- `js/final-ux.js`
- `js/mapa.js`
- `service-worker.js`
- `version.json`
- `tests/gestor-v32-cache-leaflet-hotfix.test.js`
- `AUDITORIA_JM_GESTOR_V32_F12.js`
- `ENTREGA_JM_GESTOR_V32_CACHE_LEAFLET_HOTFIX.md`

## Arquivos preservados
- `motorista.html`
- `js/motorista.js`
- `js/motorista-simple-flow.js`
- `js/motorista-final-ux.js`
- `cliente-chamado.html`
- `relatorio.html`
- `superadmin.html`
- regras Firebase/RTDB
- Firebase config
- Cloudinary config
- CSS/layout geral

## O que foi corrigido
1. `jm.html` deixou de carregar V26 e deixou de usar a versão do motorista.
2. `js/app.js` passou a registrar o service-worker com a versão própria do gestor V32.
3. `selectOperationalCall` e `selectCallDossier` continuam em `JM.app` e também foram expostas direto em `window` para compatibilidade com HTML legado/auditorias.
4. `js/mapa.js` recebeu proteção de ciclo de vida Leaflet: token de renderização, checagem de container visível/conectado, descarte de renderização antiga e proteção de `invalidateSize`.
5. `service-worker.js` deixou de ter cache nomeado como motorista e passou a aceitar conscientemente as duas versões ativas: gestor V32 e motorista V31.
6. `version.json` passou a declarar separadamente cache global, versão do gestor e versão do motorista.

## Testes feitos
- `node --check js/app.js`
- `node --check js/final-ux.js`
- `node --check js/mapa.js`
- `node --check service-worker.js`
- `npm run check:js`
- `node tests/gestor-v32-cache-leaflet-hotfix.test.js`
- grep estático para V26/V31 indevida em `jm.html`, `js/app.js`, `js/final-ux.js`, `js/mapa.js`, `service-worker.js`, `version.json`
- auditoria estática de chamadas `JM.app.*` versus exports de `window.JM.app`

## Atenções que continuam fora deste hotfix
- `cliente-chamado.html`, `relatorio.html`, `superadmin.html` e `index.html` ainda têm V26 porque não foram alterados neste escopo.
- Relatórios/PDF: o gestor aponta para relatório/print; `jm.html` não possui `jsPDF/html2canvas`. Não foi adicionada lib sem validar fluxo real.
- Firebase rules não foram alteradas. O sistema usa `transactions`, `expenses`, `calls`, `callProofs`, `publicCalls`, `users`, `vehicles`, `settings`, entre outras coleções.
- Financeiro/pagamentos/provas/IA foram auditados estaticamente, mas ainda exigem teste manual logado em produção.
- O erro `_leaflet_pos` deve ser validado navegando entre Dashboard, Central Operacional, Mapa/Tracker e Dossiê de chamado após subir.

## Script F12
Após subir no GitHub Pages, abrir `jm.html`, logar, apertar F12 > Console e colar o conteúdo de:
`AUDITORIA_JM_GESTOR_V32_F12.js`
