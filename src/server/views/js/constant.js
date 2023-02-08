/**
 * Constantsfor Query.
 *
 * @copyright 2023-present Inrae
 * @author mario.adam@inrae.fr
 *
 */

const _SPACE = " ";
const _NONE = "none";
const _CHECK = "✔";
const _UP = "↑";
const _DOWN = "↓";
const _ALL = "all";
const _SELECTED = "selcted";

let tdb = '';

var jsonObj = {};
var listOptions = {};
var canGo = false;
var modeDebug = true;
let builder = undefined;
let winSqlQuery = null;
let winDecoderResult = null;
let winDecoderCode = null;
let winJsonResult = null;
let winCsvResult = null;
let winLinks = null;
const cardDatas = {};
let dragText = "";

// log debug test
let isDebug = true;

// replace at execution
const _PARAMS={};

function entityList() {
    return Object.keys(_PARAMS._DATAS).filter((elem) => _PARAMS._DATAS[elem].order > 0).sort((a, b) => (_PARAMS._DATAS[a].order > _PARAMS._DATAS[b].order ? 1 : -1)) ; 
  }
  
function columnsList(input) {
    return Object.keys(_PARAMS._DATAS[getEntityName(input)].columns)
}

function relationsList(input) {
    return Object.keys(_PARAMS._DATAS[getEntityName(input)].relations)
}