"use strict";var NameOrIdentifier,__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const utils_1=__importDefault(require("./utils")),lexer_1=__importDefault(require("./lexer")),primitiveLiteral_1=__importDefault(require("./primitiveLiteral"));!function(T){function o(e,t){var i=t,n=T.namespace(e,t);if(n!==t&&46===e[n]){t=T.enumerationTypeName(e,n+1);if(t&&t.next!==n+1)return lexer_1.default.tokenize(e,i,t.next,"EnumTypeName",lexer_1.default.TokenType.Identifier)}}T.enumeration=function(e,t){var i=o(e,t);if(i){var n=t,r=(t=i.next,lexer_1.default.SQUAT(e,t));if(r){var a=T.enumValue(e,t=r);if(a&&(t=a.next,r=lexer_1.default.SQUAT(e,t)))return t=r,lexer_1.default.tokenize(e,n,t,{name:i,value:a},lexer_1.default.TokenType.Enum)}}},T.enumValue=function(e,t){let i=T.singleEnumValue(e,t);if(i){for(var n=t,r=[];i;){r.push(i),t=i.next;var a=lexer_1.default.COMMA(e,i.next);if(!a)break;t=a,i=T.singleEnumValue(e,t)}return lexer_1.default.tokenize(e,n,t,{values:r},lexer_1.default.TokenType.EnumValue)}},T.singleEnumValue=function(e,t){return T.enumerationMember(e,t)||T.enumMemberValue(e,t)},T.enumMemberValue=function(e,t){if(e=primitiveLiteral_1.default.int64Value(e,t))return e.type=lexer_1.default.TokenType.EnumMemberValue,e},T.singleQualifiedTypeName=function(e,t){return T.qualifiedEntityTypeName(e,t)||T.qualifiedComplexTypeName(e,t)||T.qualifiedTypeDefinitionName(e,t)||T.qualifiedEnumTypeName(e,t)||T.primitiveTypeName(e,t)},T.qualifiedTypeName=function(e,t){if(!utils_1.default.equals(e,t,"Collection"))return T.singleQualifiedTypeName(e,t);var i,n=t,r=(t+=10,lexer_1.default.SQUAT(e,t));r&&(i=T.singleQualifiedTypeName(e,t=r))&&(t=i.next,r=lexer_1.default.SQUAT(e,t))&&(t=r,i.position=n,i.next=t,i.raw=utils_1.default.stringify(e,i.position,i.next),i.type=lexer_1.default.TokenType.Collection)},T.qualifiedEntityTypeName=function(t,i,n){const r=i,a=T.namespace(t,i);if(a!==i&&46===t[a]){let e;"object"==typeof n&&(e=T.getMetadataRoot(n).schemas.filter(e=>e.namespace===utils_1.default.stringify(t,r,a))[0]);i=T.entityTypeName(t,a+1,e);if(i)return i.value.namespace=utils_1.default.stringify(t,r,a),lexer_1.default.tokenize(t,r,i.next,i,lexer_1.default.TokenType.QualifiedEntityTypeName)}},T.qualifiedComplexTypeName=function(t,i,n){const r=i,a=T.namespace(t,i);if(a!==i&&46===t[a]){let e;"object"==typeof n&&(e=T.getMetadataRoot(n).schemas.filter(e=>e.namespace===utils_1.default.stringify(t,r,a))[0]);i=T.complexTypeName(t,a+1,e);if(i)return i.value.namespace=utils_1.default.stringify(t,r,a),lexer_1.default.tokenize(t,r,i.next,i,lexer_1.default.TokenType.QualifiedComplexTypeName)}},T.qualifiedTypeDefinitionName=function(e,t){var i=t,n=T.namespace(e,t);if(n!==t&&46===e[n]){t=T.typeDefinitionName(e,n+1);if(t&&t.next!==n+1)return lexer_1.default.tokenize(e,i,t.next,"TypeDefinitionName",lexer_1.default.TokenType.Identifier)}},T.qualifiedEnumTypeName=o,T.namespace=function(e,t){let i=T.namespacePart(e,t);for(;i&&i.next>t;)if(t=i.next,46===e[i.next]&&(t++,i=T.namespacePart(e,t))&&46!==e[i.next])return t-1;return t-1},T.odataIdentifier=function(e,t,i){var n=t;if(lexer_1.default.identifierLeadingCharacter(e[t]))for(t++;t<e.length&&t-n<128&&lexer_1.default.identifierCharacter(e[t]);)t++;if(n<t)return lexer_1.default.tokenize(e,n,t,{name:utils_1.default.stringify(e,n,t)},i||lexer_1.default.TokenType.ODataIdentifier)},T.namespacePart=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.NamespacePart)},T.entitySetName=function(e,t,i){const a=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntitySetName);if(a){if("object"==typeof i){let n;if(i.dataServices.schemas.forEach(e=>e.entityContainer.forEach(e=>e.entitySets.filter(e=>{var t=e.name===a.raw;return t&&(n=e),t}))),!n)return;let r;if(i.dataServices.schemas.forEach(i=>0===n.entityType.indexOf(i.namespace+".")&&i.entityTypes.filter(e=>{var t=e.name===n.entityType.replace(i.namespace+".","");return t&&(r=e),t})),!r)return;a.metadata=r}return a}},T.singletonEntity=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.SingletonEntity)},T.entityTypeName=function(e,t,i){const n=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityTypeName);if(n){if("object"==typeof i){e=i.entityTypes.filter(e=>e.name===n.raw)[0];if(!e)return;n.metadata=e}return n}},T.complexTypeName=function(e,t,i){const n=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexTypeName);if(n){if("object"==typeof i){e=i.complexTypes.filter(e=>e.name===n.raw)[0];if(!e)return;n.metadata=e}return n}},T.typeDefinitionName=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.TypeDefinitionName)},T.enumerationTypeName=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.EnumerationTypeName)},T.enumerationMember=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.EnumerationMember)},T.termName=function(e,t){return T.odataIdentifier(e,t,lexer_1.default.TokenType.TermName)},T.primitiveTypeName=function(e,t){var i,n;if(utils_1.default.equals(e,t,"Edm."))return i=t,n=(t+=4)+(utils_1.default.equals(e,t,"Binary")||utils_1.default.equals(e,t,"Boolean")||utils_1.default.equals(e,t,"Byte")||utils_1.default.equals(e,t,"Date")||utils_1.default.equals(e,t,"DateTimePeriod")||utils_1.default.equals(e,t,"DateTimeOffset")||utils_1.default.equals(e,t,"Decimal")||utils_1.default.equals(e,t,"Double")||utils_1.default.equals(e,t,"Duration")||utils_1.default.equals(e,t,"Guid")||utils_1.default.equals(e,t,"Int16")||utils_1.default.equals(e,t,"Int32")||utils_1.default.equals(e,t,"Int64")||utils_1.default.equals(e,t,"SByte")||utils_1.default.equals(e,t,"Single")||utils_1.default.equals(e,t,"Stream")||utils_1.default.equals(e,t,"String")||utils_1.default.equals(e,t,"TimeOfDay")||utils_1.default.equals(e,t,"GeographyCollection")||utils_1.default.equals(e,t,"GeographyLineString")||utils_1.default.equals(e,t,"GeographyMultiLineString")||utils_1.default.equals(e,t,"GeographyMultiPoint")||utils_1.default.equals(e,t,"GeographyMultiPolygon")||utils_1.default.equals(e,t,"GeographyPoint")||utils_1.default.equals(e,t,"GeographyPolygon")||utils_1.default.equals(e,t,"GeometryCollection")||utils_1.default.equals(e,t,"GeometryLineString")||utils_1.default.equals(e,t,"GeometryMultiLineString")||utils_1.default.equals(e,t,"GeometryMultiPoint")||utils_1.default.equals(e,t,"GeometryMultiPolygon")||utils_1.default.equals(e,t,"GeometryPoint")||utils_1.default.equals(e,t,"GeometryPolygon")),t<n?lexer_1.default.tokenize(e,i,n,"PrimitiveTypeName",lexer_1.default.TokenType.Identifier):void 0};const i=["Edm.Binary","Edm.Boolean","Edm.Byte","Edm.Date","Edm.DateTimePeriod","Edm.DateTimeOffset","Edm.Decimal","Edm.Double","Edm.Duration","Edm.Guid","Edm.Int16","Edm.Int32","Edm.Int64","Edm.SByte","Edm.Single","Edm.Stream","Edm.String","Edm.TimeOfDay","Edm.GeographyCollection","Edm.GeographyLineString","Edm.GeographyMultiLineString","Edm.GeographyMultiPoint","Edm.GeographyMultiPolygon","Edm.GeographyPoint","Edm.GeographyPolygon","Edm.GeometryCollection","Edm.GeometryLineString","Edm.GeometryMultiLineString","Edm.GeometryMultiPoint","Edm.GeometryMultiPolygon","Edm.GeometryPoint","Edm.GeometryPolygon"];T.isPrimitiveTypeName=function(t,e){return(e=((e=T.getMetadataRoot(e)).schemas||e.dataServices&&e.dataServices.schemas||[]).filter(function(e){return 0===t.indexOf(e.namespace+".")})[0])?(e.enumTypes&&e.enumTypes.filter(function(e){return e.name===t.split(".").pop()})[0]||e.typeDefinitions&&e.typeDefinitions.filter(function(e){return e.name===t.split(".").pop()})[0])&&!(e.entityTypes&&e.entityTypes.filter(function(e){return e.name===t.split(".").pop()})[0]||e.complexTypes&&e.complexTypes.filter(function(e){return e.name===t.split(".").pop()})[0]):0<=i.indexOf(t)},T.getMetadataRoot=function(e){let t=e;for(;t.parent;)t=t.parent;return t.dataServices||t},T.primitiveProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveProperty);if(n){if("object"==typeof i){for(let e=0;e<i.properties.length;e++){const r=i.properties[e];if(r.name===n.raw){if(0===r.type.indexOf("Collection")||!T.isPrimitiveTypeName(r.type,i))return;n.metadata=r,i.key&&0<i.key.propertyRefs.filter(e=>e.name===r.name).length&&(n.type=lexer_1.default.TokenType.PrimitiveKeyProperty);break}}if(!n.metadata)return}return n}},T.primitiveKeyProperty=function(e,t,i){if((e=T.primitiveProperty(e,t,i))&&e.type===lexer_1.default.TokenType.PrimitiveKeyProperty)return e},T.primitiveNonKeyProperty=function(e,t,i){if((e=T.primitiveProperty(e,t,i))&&e.type===lexer_1.default.TokenType.PrimitiveProperty)return e},T.primitiveColProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveCollectionProperty);if(n){if("object"==typeof i){for(let e=0;e<i.properties.length;e++){const r=i.properties[e];if(r.name===n.raw){if(-1===r.type.indexOf("Collection")||!T.isPrimitiveTypeName(r.type.slice(11,-1),i))return;n.metadata=r,0<i.key.propertyRefs.filter(e=>e.name===r.name).length&&(n.type=lexer_1.default.TokenType.PrimitiveKeyProperty);break}}if(!n.metadata)return}return n}},T.complexProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexProperty);if(n){if("object"==typeof i){for(let e=0;e<i.properties.length;e++){const a=i.properties[e];if(a.name===n.raw){if(0===a.type.indexOf("Collection")||T.isPrimitiveTypeName(a.type,i))return;var r=T.getMetadataRoot(i).schemas.filter(e=>0===a.type.indexOf(e.namespace+"."))[0];if(!r)return;r=r.complexTypes.filter(e=>e.name===a.type.split(".").pop())[0];if(!r)return;n.metadata=r;break}}if(!n.metadata)return}return n}},T.complexColProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexCollectionProperty);if(n){if("object"==typeof i){for(let e=0;e<i.properties.length;e++){const a=i.properties[e];if(a.name===n.raw){if(-1===a.type.indexOf("Collection")||T.isPrimitiveTypeName(a.type.slice(11,-1),i))return;var r=T.getMetadataRoot(i).schemas.filter(e=>0===a.type.slice(11,-1).indexOf(e.namespace+"."))[0];if(!r)return;r=r.complexTypes.filter(e=>e.name===a.type.slice(11,-1).split(".").pop())[0];if(!r)return;n.metadata=r;break}}if(!n.metadata)return}return n}},T.streamProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.StreamProperty);if(n){if("object"==typeof i){for(let e=0;e<i.properties.length;e++){var r=i.properties[e];if(r.name===n.raw){if("Edm.Stream"!==r.type)return;n.metadata=r;break}}if(!n.metadata)return}return n}},T.navigationProperty=function(e,t,i){return T.entityNavigationProperty(e,t,i)||T.entityColNavigationProperty(e,t,i)},T.entityNavigationProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityNavigationProperty);if(n){if("object"==typeof i){for(let e=0;e<i.navigationProperties.length;e++){const a=i.navigationProperties[e];if(a.name===n.raw&&-1===a.type.indexOf("Collection")&&!T.isPrimitiveTypeName(a.type.slice(11,-1),i)){var r=T.getMetadataRoot(i).schemas.filter(e=>0===a.type.indexOf(e.namespace+"."))[0];if(!r)return;r=r.entityTypes.filter(e=>e.name===a.type.split(".").pop())[0];if(!r)return;n.metadata=r}}if(!n.metadata)return}return n}},T.entityColNavigationProperty=function(e,t,i){var n=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityCollectionNavigationProperty);if(n){if("object"==typeof i){for(let e=0;e<i.navigationProperties.length;e++){const a=i.navigationProperties[e];if(a.name===n.raw&&0===a.type.indexOf("Collection")&&!T.isPrimitiveTypeName(a.type.slice(11,-1),i)){var r=T.getMetadataRoot(i).schemas.filter(e=>0===a.type.slice(11,-1).indexOf(e.namespace+"."))[0];if(!r)return;r=r.entityTypes.filter(e=>e.name===a.type.slice(11,-1).split(".").pop())[0];if(!r)return;n.metadata=r}}if(!n.metadata)return}return n}},T.action=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.Action)){if(i&&"object"==typeof n)if(!T.getEnumOperation("action",n,e,i,!1,!1,"entityTypes"))return;return e}},T.actionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.ActionImport)){if("object"==typeof i)if(!T.getOperationImportType("action",i,e))return;return e}},T.odataFunction=function(e,t){return T.entityFunction(e,t)||T.entityColFunction(e,t)||T.complexFunction(e,t)||T.complexColFunction(e,t)||T.primitiveFunction(e,t)||T.primitiveColFunction(e,t)},T.getEnumOperation=function(t,e,i,n,r,a,o){let l=e.parent.namespace+"."+e.name;n&&(l="Collection("+l+")");let f;var u=T.getMetadataRoot(e);for(let e=0;e<u.schemas.length;e++){var p=u.schemas[e];for(let e=0;e<p[t+"s"].length;e++){var m=p[t+"s"][e];if(m.name===i.raw&&m.isBound)for(let e=0;e<m.parameters.length;e++){var y=m.parameters[e];if("bindingParameter"===y.name&&y.type===l){f=m;break}}if(f)break}if(f)break}if(f){if("action"===t)return f;if(f.returnType.type.indexOf("Collection")!==r){var d=r?f.returnType.type.slice(11,-1):f.returnType.type;if((!T.isPrimitiveTypeName(d,e)||a)&&(T.isPrimitiveTypeName(d,e)||!a)){if(a)return d;let t;if(o)for(let e=0;e<u.schemas.length;e++){var s=u.schemas[e];if(0===d.indexOf(s.namespace+"."))for(let e=0;e<s[o].length;e++){var c=s[o][e];if(s.namespace+"."+c.name===d){t=c;break}}if(t)break}return t}}}},T.entityFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!1,!1,"entityTypes");if(!t)return;e.metadata=t}return e}},T.entityColFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityCollectionFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!0,!1,"entityTypes");if(!t)return;e.metadata=t}return e}},T.complexFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!1,!1,"complexTypes");if(!t)return;e.metadata=t}return e}},T.complexColFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexCollectionFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!0,!1,"complexTypes");if(!t)return;e.metadata=t}return e}},T.primitiveFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!1,!0);if(!t)return;e.metadata=t}return e}},T.primitiveColFunction=function(e,t,i,n){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveCollectionFunction)){if(i&&"object"==typeof n){t=T.getEnumOperation("function",n,e,i,!0,!0);if(!t)return;e.metadata=t}return e}},T.getOperationImportType=function(i,n,t,e,r,a){let o;for(let e=0;e<n.dataServices.schemas.length;e++){var l=n.dataServices.schemas[e];for(let e=0;e<l.entityContainer.length;e++){var f=l.entityContainer[e];for(let e=0;e<f[i+"Imports"].length;e++){var u=f[i+"Imports"][e];if(u.name===t.raw){o=u;break}}if(o)break}if(o)break}if(o){let t;for(let e=0;e<n.dataServices.schemas.length;e++){var p=n.dataServices.schemas[e];if(0===o[i].indexOf(p.namespace+"."))for(let e=0;e<p[i+"s"].length;e++){var m=p[i+"s"][e];if(m.name===o.name){t=m;break}}if(t)break}if(t){if("action"===i)return t;if(t.returnType.type.indexOf("Collection")!==e){var y=e?t.returnType.type.slice(11,-1):t.returnType.type;if((!T.isPrimitiveTypeName(y,n)||r)&&(T.isPrimitiveTypeName(y,n)||!r)){if(r)return y;let t;if(a)for(let e=0;e<n.dataServices.schemas.length;e++){var d=n.dataServices.schemas[e];if(0===y.indexOf(d.namespace+"."))for(let e=0;e<d[a].length;e++){var s=d[a][e];if(d.namespace+"."+s.name===y){t=s;break}}if(t)break}return t}}}}},T.entityFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!1,!1,"entityTypes");if(!t)return;e.metadata=t}return e}},T.entityColFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.EntityCollectionFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!0,!1,"entityTypes");if(!t)return;e.metadata=t}return e}},T.complexFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!1,!1,"complexTypes");if(!t)return;e.metadata=t}return e}},T.complexColFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.ComplexCollectionFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!0,!1,"complexTypes");if(!t)return;e.metadata=t}return e}},T.primitiveFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!1,!0);if(!t)return;e.metadata=t}return e}},T.primitiveColFunctionImport=function(e,t,i){if(e=T.odataIdentifier(e,t,lexer_1.default.TokenType.PrimitiveCollectionFunctionImport)){if("object"==typeof i){t=T.getOperationImportType("function",i,e,!0,!0);if(!t)return;e.metadata=t}return e}}}(NameOrIdentifier=NameOrIdentifier||{}),exports.default=NameOrIdentifier;