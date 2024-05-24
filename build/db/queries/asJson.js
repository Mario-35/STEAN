"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.asJson=void 0;const asJson=s=>""===s.query.trim()?"":`SELECT ${1==s.count?(s.fullCount?`(${s.fullCount})`:"count(t)")+`,
	`:""}${s.fields?s.fields.join(",\n\t"):""}coalesce(${!0===s.singular?"ROW_TO_JSON":`${!0===s.strip?"json_strip_nulls(":""} json_agg`}(t)${!0===s.strip?")":""}, '${!0===s.singular?"{}":"[]"}') AS results
	FROM (
	${s.query}) as t`;exports.asJson=asJson;