let isDebug=!1,isAdmin=!1;const _NONE="none";let importFile=!1;var jsonObj={},listOptions={},canGo=!1;let builder=void 0;const wins={SqlQuery:!1,Json:!1,logs:!1,Csv:!1,Sql:!1,Links:!1,Graph:!1},cardDatas={};let dragText="",jsonViewer=void 0;const _PARAMS={};function getEntityList(){return Object.keys(_PARAMS._DATAS).filter(t=>0<_PARAMS._DATAS[t].order).sort((t,e)=>_PARAMS._DATAS[t].order>_PARAMS._DATAS[e].order?1:-1)}function getColumnsList(t){t=getEntityName(t);return t?Object.keys(_PARAMS._DATAS[t].columns):void 0}function getRelationsList(t){t=getEntityName(t);return t?Object.keys(_PARAMS._DATAS[t].relations):void 0}const getWinActives=()=>0<Object.entries(wins).filter(t=>!0===t).length;async function asyncForEach(e,n){for(let t=0;t<e.length;t++)await n(e[t],t,e)}