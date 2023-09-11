/**
 * Constantsfor Query.
 *
 * @copyright 2023-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

const _NONE = "none";


// load file json
let importFile = false;
var jsonObj = {};
var listOptions = {};
var canGo = false;
let builder = undefined;

let winSqlQuery = null;
let winDecoderResult = null;
let winDecoderCode = null;
let winJsonResult = null;
let winCsvResult = null;
let winResult = null;
let winLinks = null;
const cardDatas = {};
let dragText = "";
let jsonViewer = undefined; 

// log debug test
let isDebug = false;

// replace at execution
const _PARAMS={};

function entityList() {
    return Object.keys(_PARAMS._DATAS).filter((elem) => _PARAMS._DATAS[elem].order > 0).sort((a, b) => (_PARAMS._DATAS[a].order > _PARAMS._DATAS[b].order ? 1 : -1)) ; 
  }
  
function columnsList(input) {
    const ent = getEntityName(input);
    return ent ? Object.keys(_PARAMS._DATAS[ent].columns) : undefined;
}

function relationsList(input) {
    const ent = getEntityName(input);
    return ent ? Object.keys(_PARAMS._DATAS[ent].relations) : undefined;
}

function winActives() {
    const results = [];
    if (winSqlQuery !== null) results.push("winSqlQuery");
    if (winDecoderResult !== null) results.push("winDecoderResult");
    if (winDecoderCode !== null) results.push("winDecoderCode");
    if (winJsonResult !== null) results.push("winJsonResult");
    if (winCsvResult !== null) results.push("winCsvResult");
    if (winResult !== null) results.push("winResult");
    if (winLinks !== null) results.push("winLinks");
    return results;
}

function onlyOneWinActive() {
    console.log(winJsonResult);
    console.log(winActives());
    return winActives().length > 0;
}