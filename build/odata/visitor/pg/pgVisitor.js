"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.PgVisitor=void 0;const helpers_1=require("../../../helpers"),literal_1=require("../../parser/literal"),sqlLiteral_1=require("../../parser/sqlLiteral"),logger_1=require("../../../logger"),helper_1=require("../helper"),messages_1=require("../../../messages"),enums_1=require("../../../enums"),models_1=require("../../../models"),log_1=require("../../../log"),constants_1=require("../../../constants"),visitor_1=require("./visitor");class PgVisitor extends visitor_1.Visitor{entity="";parentEntity=void 0;id=BigInt(0);parentId=BigInt(0);intervalColumns=void 0;splitResult;interval;payload;skip=0;limit=0;count=!1;numeric=!1;returnNull=!1;navigationProperty;parameters=[];ast;showRelations=!0;results={};debugOdata=!(0,helpers_1.isTest)();constructor(e,t={}){super(e,t)}noLimit(){this.limit=0,this.skip=0}addToIntervalColumns(e){e.endsWith('Time"')?e="step AS "+e:'"@iot.id"'===e?e='coalesce("@iot.id", 0) AS "@iot.id"':!e.startsWith("CONCAT")&&"'"===e[0]||(e=""+e),this.intervalColumns?this.intervalColumns.push(e):this.intervalColumns=[e]}getColumn(e,t,i){var s=i.target===enums_1.EnumQuery.Where&&i.identifier?models_1.models.getEntity(this.ctx.config,i.identifier.split(".")[0]):this.isSelect(i)?models_1.models.getEntity(this.ctx.config,this.entity||this.parentEntity||this.navigationProperty):void 0,t="result"===e?this.formatColumnResult(i,t):s?this.getColumnNameOrAlias(s,e,this.createDefaultOptions()):void 0;return t||(this.isSelect(i)&&s&&s.relations[e]&&(t=models_1.models.getEntityName(this.ctx.config,e),s)&&t?`CONCAT('${this.ctx.decodedUrl.root}/${s.name}(', "${s.table}"."id", ')/${t}') AS "${t}@iot.navigationLink"`:void 0)}formatColumnResult(e,t,i){if(e.target!==enums_1.EnumQuery.Where)return`CASE 
          WHEN JSONB_TYPEOF( "result"->'value') = 'number' THEN ("result"->${1==this.numeric?">":""}'value')::jsonb
          WHEN JSONB_TYPEOF( "result"->'value') = 'array'  THEN ("result"->'${1==this.valueskeys?"valueskeys":"value"}')::jsonb
      END`+(!0===this.isSelect(e)?' AS "result"':"");{e=Array.from({length:5},(e,t)=>t+1);const s=`TRANSLATE (SUBSTRING ("result"->>'value' FROM '(([0-9]+.*)*[0-9]+)'), '[]','')`,r=""!=t.trim();return i?`@EXPRESSIONSTRING@ ANY (ARRAY_REMOVE( ARRAY[
${e.map(e=>`${r?t+" (":""} SPLIT_PART ( ${s}, ',', ${e}))`).join(",\n")}], null))`:`@EXPRESSION@ ANY (ARRAY_REMOVE( ARRAY[
${e.map(e=>`${r?t+" (":""}NULLIF (SPLIT_PART ( ${s}, ',', ${e}),'')::numeric`+(r?")":"")).join(",\n")}], null))`}}getColumnNameOrAlias(e,t,i){let s=void 0;return(s=e&&""!=t&&e.columns[t]?(s=e.columns[t].alias(this.ctx.config,i))||(0,helpers_1.addDoubleQuotes)(t):s)?""+(!0===i.table&&s&&'"'===s[0]?`"${e.table}".`+s:s):void 0}clear(e){return e=e.includes("@START@")?(e=e.split("@START@").join("(")).split("@END@").join("")+")":e}start(e){e=this.Visit(e);return this.verifyQuery(),e.query.where.init(this.clear(e.query.where.toString())),e}verifyQuery=()=>{const t=[];this.includes&&this.includes.forEach(e=>{"ExpandItem"===e.ast.type&&t.push(e.ast.raw.split("(")[0])}),t.forEach(e=>{e=e.split("/");e.unshift(this.entity),e[0]?Object.keys(this.ctx.model[e[0]].relations).includes(e[1])||this.ctx.throw(400,{detail:`Invalid expand path ${e[1]} for `+e[0]}):this.ctx.throw(400,{detail:(0,messages_1.msg)(messages_1.errors.invalid,"entity")+e[0]})}),!0===(0,helpers_1.isObservation)(this.entity)&&void 0!==this.splitResult&&0==Number(this.parentId)&&this.ctx.throw(400,{detail:messages_1.errors.splitNotAllowed}),this.returnFormat===helpers_1.returnFormats.dataArray&&0<BigInt(this.id)&&!this.parentEntity&&this.ctx.throw(400,{detail:messages_1.errors.dataArrayNotAllowed})};Visit(e,t){if(this.ast=this.ast||e,t=t||{target:enums_1.EnumQuery.Where},e){var i=this["Visit"+e.type];if(!i)throw log_1.log.errorMsg("Node error =================> Visit"+e.type),log_1.log.errorMsg(e),new Error("Unhandled node type: "+e.type);i.call(this,e,t),this.debugOdata}return e==this.ast&&this.entity.startsWith("Lora")&&"string"==typeof this.id&&this.query.where.init(`"lora"."deveui" = '${this.id}'`),this}isSelect=e=>!!e.target&&e.target===enums_1.EnumQuery.Select;VisitExpand(e,t){e.value.items.forEach(e=>{const t=e.value.path.raw;let i=this.includes?this.includes.filter(e=>e.navigationProperty==t)[0]:void 0;i||(i=new PgVisitor(this.ctx,{...this.options}),this.includes?this.includes.push(i):this.includes=[i]),i.Visit(e)})}VisitEntity(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t))}VisitSplitResult(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t)),this.splitResult=(0,helpers_1.removeAllQuotes)(e.value).split(",")}VisitInterval(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t)),this.interval=e.value,this.interval&&this.noLimit()}VisitPayload(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t)),this.payload=e.value}VisitDebug(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t))}VisitResultFormat(e,t){e.value.format&&(this.returnFormat=helpers_1.returnFormats[e.value.format]),[helpers_1.returnFormats.dataArray,helpers_1.returnFormats.graph,helpers_1.returnFormats.graphDatas,helpers_1.returnFormats.csv].includes(this.returnFormat)&&this.noLimit(),(this.showRelations=!1,helpers_1.isGraph)(this)&&(this.showRelations=!1,this.query.orderBy.add('"resultTime" ASC'))}VisitExpandItem(e,t){this.Visit(e.value.path,t),e.value.options&&e.value.options.forEach(e=>this.Visit(e,t))}VisitExpandPath(e,t){this.navigationProperty=e.raw}VisitQueryOptions(e,t){e.value.options.forEach(e=>this.Visit(e,t))}VisitInlineCount(e,t){this.count=literal_1.Literal.convert(e.value.value,e.value.raw)}VisitFilter(e,t){t.target=enums_1.EnumQuery.Where,""!=this.query.where.toString().trim()&&this.query.where.add(" AND "),this.Visit(e.value,t)}VisitOrderBy(i,s){s.target=enums_1.EnumQuery.OrderBy,i.value.items.forEach((e,t)=>{this.Visit(e,s),t<i.value.items.length-1&&this.query.orderBy.add(", ")})}VisitOrderByItem(e,t){this.Visit(e.value.expr,t),this.query.orderBy.notNull()&&this.query.orderBy.add(0<e.value.direction?" ASC":" DESC")}VisitSkip(e,t){this.skip=+e.value.raw}VisitTop(e,t){this.limit=+e.value.raw}VisitSelect(e,t){t.target=enums_1.EnumQuery.Select,e.value.items.forEach(e=>{this.Visit(e,t)})}VisitSelectItem(e,t){var i=this.getColumn(e.raw,"",t);t.identifier=i||e.raw,t.target&&this.query[t.target].add(i?""+i+constants_1._COLUMNSEPARATOR:""+(0,helpers_1.addDoubleQuotes)(e.raw)+constants_1._COLUMNSEPARATOR),this.showRelations=!1}VisitAndExpression(e,t){this.Visit(e.value.left,t),this.query.where.add(t.in&&!0===t.in?" INTERSECT ":" AND "),this.Visit(e.value.right,t)}VisitOrExpression(e,t){this.Visit(e.value.left,t),this.query.where.add(" OR "),this.Visit(e.value.right,t)}VisitNotExpression(e,t){this.query.where.add(" NOT "),this.Visit(e.value,t)}VisitBoolParenExpression(e,t){this.query.where.add("("),this.Visit(e.value,t),this.query.where.add(")")}VisitCommonExpression(e,t){this.Visit(e.value,t)}VisitFirstMemberExpression(e,t){this.Visit(e.value,t)}VisitMemberExpression(e,t){this.Visit(e.value,t)}VisitPropertyPathExpression(e,t){e.value.current&&e.value.next?models_1.models.getRelationColumnTable(this.ctx.config,this.ctx.model[this.entity],e.value.current.raw)===enums_1.EnumColumnType.Column&&models_1.models.isColumnType(this.ctx.config,this.ctx.model[this.entity],e.value.current.raw,"json")&&"/"==e.value.next.raw[0]?this.query.where.add((0,helpers_1.addDoubleQuotes)(e.value.current.raw)+"->>"+(0,helpers_1.addSimpleQuotes)(e.value.next.raw.slice(1))):(e.value.next.raw[0],this.Visit(e.value.current,t),t.identifier+=".",this.Visit(e.value.next,t)):this.Visit(e.value,t)}VisitSingleNavigationExpression(e,t){e.value.current&&e.value.next?(this.Visit(e.value.current,t),this.Visit(e.value.next,t)):this.Visit(e.value,t)}VisitLesserThanExpression(e,t){t.sign="<",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t))}VisitLesserOrEqualsExpression(e,t){t.sign="<=",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t))}VisitDateType(e,t){if(t.sign&&models_1.models.getRelationColumnTable(this.ctx.config,this.ctx.model[this.entity],e.value.left.raw)===enums_1.EnumColumnType.Column&&models_1.models.isColumnType(this.ctx.config,this.ctx.model[this.entity],e.value.left.raw,"date")){var i=(0,helper_1.oDataDateFormat)(e,t.sign),t=this.getColumnNameOrAlias(this.ctx.model[t.identifier||this.entity],e.value.left.raw,{table:!0,as:!0,cast:!1,...this.createDefaultOptions()});if(i)return this.query.where.add(""+(t||""+(0,helpers_1.addDoubleQuotes)(e.value.left.raw))+i),!0}return!1}addExpressionToWhere(e,t){this.query.where.toString().includes("@EXPRESSION@")?this.query.where.replace("@EXPRESSION@","@EXPRESSION@ "+t.sign):!this.query.where.toString().includes("@EXPRESSIONSTRING@")&&t.sign&&this.query.where.add(" "+t.sign)}VisitGreaterThanExpression(e,t){t.sign=">",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t))}VisitGreaterOrEqualsExpression(e,t){t.sign=">=",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t))}createDefaultOptions(){return{valueskeys:this.valueskeys,numeric:this.numeric}}createComplexWhere(e,t,i){var s,r;i.target&&(r=models_1.models.getEntity(this.ctx.config,e))&&((s=models_1.models.getRelationColumnTable(this.ctx.config,r,t.value.name))===enums_1.EnumColumnType.Column?i.relation&&Object.keys(r.relations).includes(i.relation)&&!i.key&&(i.key=r.relations[i.relation].entityColumn,this.query[i.target].add(i.key)):s===enums_1.EnumColumnType.Relation&&(r=models_1.models.getEntity(this.ctx.config,t.value.name))&&(i.relation?i.sql=`${(0,helpers_1.addDoubleQuotes)(this.ctx.model[e].table)}.${(0,helpers_1.addDoubleQuotes)(this.ctx.model[e].relations[t.value.name].entityColumn)} IN (SELECT ${(0,helpers_1.addDoubleQuotes)(r.table)}.${(0,helpers_1.addDoubleQuotes)(this.ctx.model[e].relations[t.value.name].relationKey)} FROM `+(0,helpers_1.addDoubleQuotes)(r.table):i.relation=t.value.name,!i.key)&&i.relation&&(i.key=this.ctx.model[e].relations[i.relation].entityColumn,this.query[i.target].add((0,helpers_1.addDoubleQuotes)(this.ctx.model[e].relations[i.relation].entityColumn))))}VisitODataIdentifier(t,i){var e=this.getColumn(t.value.name,"",i);if(t.value.name=e||t.value.name,i.relation&&i.identifier&&models_1.models.isColumnType(this.ctx.config,this.ctx.model[i.relation],(0,helpers_1.removeAllQuotes)(i.identifier).split(".")[0],"json"))i.identifier=(0,helpers_1.addDoubleQuotes)(i.identifier.split(".")[0])+"->>"+(0,helpers_1.addSimpleQuotes)(t.raw);else if(i.target===enums_1.EnumQuery.Where&&this.createComplexWhere(i.identifier?i.identifier.split(".")[0]:this.entity,t,i),!i.relation&&!i.identifier&&e&&i.target)this.query[i.target].add(e);else if(i.identifier=t.value.name,i.target&&!i.key){let e=this.getColumnNameOrAlias(this.ctx.model[this.entity],t.value.name,this.createDefaultOptions());e=i.target===enums_1.EnumQuery.Where?e?.split(" AS ")[0]:e,this.query[i.target].add(t.value.name.includes("->>")||t.value.name.includes("->")||t.value.name.includes("::")?t.value.name:this.entity&&this.ctx.model[this.entity]?e||"":(0,helpers_1.addDoubleQuotes)(t.value.name))}}VisitEqualsExpression(e,t){t.sign="=",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t),this.query.where.replace(/= null/,"IS NULL"))}VisitNotEqualsExpression(e,t){t.sign="<>",this.VisitDateType(e,t)||(this.Visit(e.value.left,t),this.addExpressionToWhere(e,t),this.Visit(e.value.right,t),this.query.where.replace(/<> null$/,"IS NOT NULL"))}VisitLiteral(e,t){var i,s;t.relation&&t.target===enums_1.EnumQuery.Where?(s=this.query.where.toString().split(" ").filter(e=>""!=e),t.sign=s.pop(),this.query.where.init(s.join(" ")),this.query.where.add(` ${t.in&&!0===t.in?"":" IN @START@"}(SELECT ${this.ctx.model[this.entity].relations[t.relation]?(0,helpers_1.addDoubleQuotes)(this.ctx.model[this.entity].relations[t.relation].relationKey):(0,helpers_1.addDoubleQuotes)(this.ctx.model[t.relation].table)+'."id"'} FROM ${(0,helpers_1.addDoubleQuotes)(this.ctx.model[t.relation].table)} WHERE `),t.in=!0,t.identifier&&(t.identifier.startsWith("CASE")||t.identifier.startsWith("(")?this.query.where.add(`${t.identifier} ${t.sign} ${sqlLiteral_1.SQLLiteral.convert(e.value,e.raw)})`):t.identifier.includes("@EXPRESSION@")?(s=(s=models_1.models.getEntity(this.ctx.config,t.relation))?this.getColumnNameOrAlias(s,t.identifier,this.createDefaultOptions()):void 0,this.query.where.add(t.sql?`${t.sql} ${t.target} ${(0,helpers_1.addDoubleQuotes)(t.identifier)}))@END@`:`${s||""+t.identifier.replace("@EXPRESSION@",` ${sqlLiteral_1.SQLLiteral.convert(e.value,e.raw)} `+t.sign)})`)):(s=models_1.models.getEntity(this.ctx.config,t.relation),i='"'===t.identifier[0]?"":'"',s=s?this.getColumnNameOrAlias(s,t.identifier,this.createDefaultOptions()):void 0,this.query.where.add(t.sql?`${t.sql} ${t.target} ${(0,helpers_1.addDoubleQuotes)(t.identifier)} ${t.sign} ${sqlLiteral_1.SQLLiteral.convert(e.value,e.raw)}))@END@`:`${s?"":this.ctx.model[t.relation].table+"."}${s||i+t.identifier+i} ${t.sign} ${sqlLiteral_1.SQLLiteral.convert(e.value,e.raw)})`)))):(s=t.literal="Edm.Boolean"==e.value?e.raw:sqlLiteral_1.SQLLiteral.convert(e.value,e.raw),this.query.where.toString().includes("@EXPRESSION@")?this.query.where.replace("@EXPRESSION@",s):this.query.where.toString().includes("@EXPRESSIONSTRING@")?this.query.where.replace("@EXPRESSIONSTRING@",s+" "+t.sign):this.query.where.add(s))}VisitInExpression(e,t){this.Visit(e.value.left,t),this.query.where.add(" IN ("),this.Visit(e.value.right,t),this.query.where.add(":list)")}VisitArrayOrObject(e,t){this.query.where.add(t.literal=sqlLiteral_1.SQLLiteral.convert(e.value,e.raw))}createGeoColumn(e,t){t=(0,helpers_1.removeAllQuotes)(t);let i=void 0;e="string"==typeof e?this.ctx.model[e]:e;if(t.includes("/")){var s,r=t.split("/");e.relations.hasOwnProperty(r[0])&&(s=e.relations[r[0]],t=`(SELECT ${(0,helpers_1.addDoubleQuotes)(r[1])} FROM ${(0,helpers_1.addDoubleQuotes)(s.tableName)} WHERE ${s.expand} AND length(${(0,helpers_1.addDoubleQuotes)(r[1])}::text) > 2)`,i=(i=this.ctx.model[s.entityName].columns[r[1]].test)&&`(SELECT ${(0,helpers_1.addDoubleQuotes)(i)} FROM ${(0,helpers_1.addDoubleQuotes)(s.tableName)} WHERE ${s.expand})`)}else if(e.columns.hasOwnProperty(t))i=`"${e.columns[t].test}"`,t=(0,helpers_1.addDoubleQuotes)(t);else{if(!e.relations.hasOwnProperty(t))throw new Error("Invalid column "+t);r=e.relations[t];t=`(SELECT ${(0,helpers_1.addDoubleQuotes)(r.entityColumn)} FROM ${(0,helpers_1.addDoubleQuotes)(r.tableName)} WHERE ${r.expand} AND length(${(0,helpers_1.addDoubleQuotes)(r.entityColumn)}::text) > 2)`,i=this.ctx.model[r.entityName].columns[r.entityColumn].test}return t=i?`CASE WHEN ${i} LIKE '%geo+json' THEN ST_GeomFromEWKT(ST_GeomFromGeoJSON(coalesce(${t}->'geometry',${t}))) ELSE ST_GeomFromEWKT(${t}::text) END`:t}VisitMethodCallExpression(e,r){var t=e.value.method;const a=e.value.parameters||[],l=e=>{var t,i=this.ctx.model[this.entity],e="string"==typeof e?e:decodeURIComponent(literal_1.Literal.convert(a[e].value,a[e].raw));return e.includes("/")?(t=e.split("/"),i.relations.hasOwnProperty(t[0])?this.ctx.model[i.relations[t[0]].entityName].columns[t[1]].test:void 0):i.columns.hasOwnProperty(e)?e:i.relations.hasOwnProperty(e)?this.ctx.model[i.relations[e].entityName].columns[i.relations[e].entityColumn].test:void 0};var i=(e,t,i)=>{var s=decodeURIComponent(literal_1.Literal.convert(a[e].value,a[e].raw));return"result"===s?this.formatColumnResult(r,t,i):(t=l(s))?(0,helpers_1.addDoubleQuotes)(t):(0,helpers_1.addSimpleQuotes)(o(e,!1))};const o=(e,t)=>{e=decodeURIComponent(literal_1.Literal.convert(a[e].value,a[e].raw)).replace("geography","");return this.ctx.model[this.entity].columns[e]?e:(!0===t?"SRID=4326;":"")+(0,helpers_1.removeAllQuotes)(e)};var s=e=>"Edm.String"==a[e].value?(0,helpers_1.removeAllQuotes)(literal_1.Literal.convert(a[e].value,a[e].raw)):literal_1.Literal.convert(a[e].value,a[e].raw),n=2===a.length?l(0)?[0,1]:[1,0]:[0];switch(t){case"contains":this.Visit(a[0],r),this.query.where.add(` ~* '${sqlLiteral_1.SQLLiteral.convert(a[1].value,a[1].raw).slice(1,-1)}'`);break;case"containsAny":this.query.where.add("array_to_string("),this.Visit(a[0],r),this.query.where.add(`, ' ') ~* '${sqlLiteral_1.SQLLiteral.convert(a[1].value,a[1].raw).slice(1,-1)}'`);break;case"endswith":this.query.where.add(`${i(0,"",!0)}  ILIKE '%${s(1)}'`);break;case"startswith":this.query.where.add(`${i(0,"",!0)} ILIKE '${s(1)}%'`);break;case"substring":this.query.where.add(3==a.length?` SUBSTR(${i(0,"",!0)}, ${s(1)} + 1, ${s(2)})`:` SUBSTR(${i(0,"",!0)}, ${s(1)} + 1)`);break;case"substringof":this.query.where.add(`${i(0,"",!0)} ILIKE '%${s(1)}%'`);break;case"indexof":this.query.where.add(` POSITION('${s(1)}' IN ${i(0,"",!0)})`);break;case"concat":this.query.where.add(`(${i(0,"concat",!0)} || '${s(1)}')`);break;case"length":this.query.where.add("result"===decodeURIComponent(literal_1.Literal.convert(a[0].value,a[0].raw))?""+i(0,"CHAR_LENGTH",!0):`CHAR_LENGTH(${i(0,"CHAR_LENGTH",!0)})`);break;case"tolower":this.query.where.add(`LOWER(${i(0,"",!0)})`);break;case"toupper":this.query.where.add(`UPPER(${i(0,"",!0)})`);break;case"year":case"month":case"day":case"hour":case"minute":case"second":this.query.where.add(`EXTRACT(${t.toUpperCase()} FROM ${i(0,"",!1)})`);break;case"round":case"floor":case"ceiling":this.query.where.add(i(0,t.toUpperCase(),!1));break;case"now":this.query.where.add("NOW()");break;case"date":this.query.where.add(t.toUpperCase()+"("),this.Visit(a[0],r),this.query.where.add(")");break;case"time":this.query.where.add(`(${i(0,"",!0)})::time`);break;case"geo.distance":case"geo.contains":case"geo.crosses":case"geo.disjoint":case"geo.equals":case"geo.overlaps":case"geo.relate":case"geo.touches":case"geo.within":this.query.where.add(`${t.toUpperCase().replace("GEO.","ST_")}(${this.createGeoColumn(this.entity,i(n[0],"",!0))}), ${i(n[1],"",!0)}')`);break;case"geo.length":this.query.where.add(`ST_Length(ST_MakeLine(ST_AsText(${this.createGeoColumn(this.entity,i(n[0],"",!0))}), ${i(n[1],"",!0)}'))`);break;case"geo.intersects":this.query.where.add(`st_intersects(ST_AsText(${this.createGeoColumn(this.entity,i(n[0],"",!0))}), ${i(n[1],"",!0)})`);break;case"trim":this.query.where.add(`TRIM(BOTH '${2==a.length?s(1):" "}' FROM ${i(0,"",!0)})`);break;case"mindatetime":this.query.where.add(`MIN(${this.query.where.toString().split('" ')[0]}")`)}}toString(){return this.query.toString(this)}toPgQuery(){return this.query.toPgQuery(this)}}exports.PgVisitor=PgVisitor;