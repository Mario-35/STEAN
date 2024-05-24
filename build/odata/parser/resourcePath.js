"use strict";var ResourcePath,__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const utils_1=__importDefault(require("./utils")),lexer_1=__importDefault(require("./lexer")),primitiveLiteral_1=__importDefault(require("./primitiveLiteral")),nameOrIdentifier_1=__importDefault(require("./nameOrIdentifier")),expressions_1=__importDefault(require("./expressions"));!function(u){u.resourcePath=function(t,a,n){47===t[a]&&a++;var l=u.batch(t,a)||u.entity(t,a,n)||u.metadata(t,a);if(l)return l;var i=nameOrIdentifier_1.default.entitySetName(t,a,n)||u.functionImportCall(t,a,n)||u.crossjoin(t,a)||u.all(t,a)||u.actionImportCall(t,a,n)||nameOrIdentifier_1.default.singletonEntity(t,a);if(i){l=a;a=i.next;let e;switch(i.type){case lexer_1.default.TokenType.EntitySetName:e=u.collectionNavigation(t,i.next,i.metadata),n=i.metadata,delete i.metadata;break;case lexer_1.default.TokenType.EntityCollectionFunctionImportCall:e=u.collectionNavigation(t,i.next,i.value.import.metadata),n=i.value.import.metadata,delete i.value.import.metadata;break;case lexer_1.default.TokenType.SingletonEntity:e=u.singleNavigation(t,i.next,i.metadata),n=i.metadata,delete i.metadata;break;case lexer_1.default.TokenType.EntityFunctionImportCall:e=u.singleNavigation(t,i.next,i.value.import.metadata),n=i.value.import.metadata,delete i.value.import.metadata;break;case lexer_1.default.TokenType.ComplexCollectionFunctionImportCall:case lexer_1.default.TokenType.PrimitiveCollectionFunctionImportCall:e=u.collectionPath(t,i.next,i.value.import.metadata),n=i.value.import.metadata,delete i.value.import.metadata;break;case lexer_1.default.TokenType.ComplexFunctionImportCall:e=u.complexPath(t,i.next,i.value.import.metadata),n=i.value.import.metadata,delete i.value.import.metadata;break;case lexer_1.default.TokenType.PrimitiveFunctionImportCall:e=u.singlePath(t,i.next,i.value.import.metadata),n=i.value.import.metadata,delete i.value.import.metadata}return 47===t[a=e?e.next:a]&&a++,i?lexer_1.default.tokenize(t,l,a,{resource:i,navigation:e},lexer_1.default.TokenType.ResourcePath,e||{metadata:n}):void 0}},u.batch=function(e,t){if(utils_1.default.equals(e,t,"$batch"))return lexer_1.default.tokenize(e,t,t+6,"$batch",lexer_1.default.TokenType.Batch)},u.entity=function(t,a,n){if(utils_1.default.equals(t,a,"$entity")){var l=a;let e;if(47===t[a+=7]){if(!(e=nameOrIdentifier_1.default.qualifiedEntityTypeName(t,a+1,n)))return;a=e.next}return lexer_1.default.tokenize(t,l,a,e||"$entity",lexer_1.default.TokenType.Entity)}},u.metadata=function(e,t){if(utils_1.default.equals(e,t,"$metadata"))return lexer_1.default.tokenize(e,t,t+9,"$metadata",lexer_1.default.TokenType.Metadata)},u.collectionNavigation=function(e,t,a){var n=t;let l;if(47===e[t]&&(l=nameOrIdentifier_1.default.qualifiedEntityTypeName(e,t+1,a))&&(t=l.next,a=l.value.metadata,delete l.value.metadata),(a=u.collectionNavigationPath(e,t,a))&&(t=a.next),l||a)return lexer_1.default.tokenize(e,n,t,{name:l,path:a},lexer_1.default.TokenType.CollectionNavigation,a||l)},u.collectionNavigationPath=function(t,a,n){var l=a,i=u.collectionPath(t,a,n)||expressions_1.default.refExpr(t,a);if(i)return i;if(i=expressions_1.default.keyPredicate(t,a,n)){let e={predicate:i};a=i.next;var r=u.singleNavigation(t,a,n);return r&&(e={predicate:i,navigation:r},a=r.next),lexer_1.default.tokenize(t,l,a,e,lexer_1.default.TokenType.CollectionNavigationPath,r||{metadata:n})}},u.singleNavigation=function(e,t,a){let n=u.boundOperation(e,t,!1,a)||expressions_1.default.refExpr(e,t)||expressions_1.default.valueExpr(e,t);if(n)return n;var l=t;let i;return 47===e[t]&&(i=nameOrIdentifier_1.default.qualifiedEntityTypeName(e,t+1,a))&&(t=i.next,a=i.value.metadata,delete i.value.metadata),47===e[t]&&(n=u.propertyPath(e,t+1,a))&&(t=n.next),i||n?lexer_1.default.tokenize(e,l,t,{name:i,path:n},lexer_1.default.TokenType.SingleNavigation,n):void 0},u.propertyPath=function(t,a,n){var l=nameOrIdentifier_1.default.entityColNavigationProperty(t,a,n)||nameOrIdentifier_1.default.entityNavigationProperty(t,a,n)||nameOrIdentifier_1.default.complexColProperty(t,a,n)||nameOrIdentifier_1.default.complexProperty(t,a,n)||nameOrIdentifier_1.default.primitiveColProperty(t,a,n)||nameOrIdentifier_1.default.primitiveProperty(t,a,n)||nameOrIdentifier_1.default.streamProperty(t,a,n);if(l){n=a;a=l.next;let e;switch(l.type){case lexer_1.default.TokenType.EntityCollectionNavigationProperty:e=u.collectionNavigation(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.EntityNavigationProperty:e=u.singleNavigation(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.ComplexCollectionProperty:e=u.collectionPath(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.ComplexProperty:e=u.complexPath(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.PrimitiveCollectionProperty:e=u.collectionPath(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.PrimitiveKeyProperty:case lexer_1.default.TokenType.PrimitiveProperty:e=u.singlePath(t,a,l.metadata),delete l.metadata;break;case lexer_1.default.TokenType.StreamProperty:e=u.boundOperation(t,a,l.metadata),delete l.metadata}return e&&(a=e.next),lexer_1.default.tokenize(t,n,a,{path:l,navigation:e},lexer_1.default.TokenType.PropertyPath,e)}},u.collectionPath=function(e,t,a){return expressions_1.default.countExpr(e,t)||u.boundOperation(e,t,!0,a)},u.singlePath=function(e,t,a){return expressions_1.default.valueExpr(e,t)||u.boundOperation(e,t,!1,a)},u.complexPath=function(e,t,a){var n=t;let l,i;if(47===e[t=47===e[t]&&(l=nameOrIdentifier_1.default.qualifiedComplexTypeName(e,t+1,a))?l.next:t]){if(!(i=u.propertyPath(e,t+1,a)))return;t=i.next}else i=u.boundOperation(e,t,!1,a);if(l||i)return lexer_1.default.tokenize(e,n,t,{name:l,path:i},lexer_1.default.TokenType.ComplexPath,i)},u.boundOperation=function(a,n,e,t){if(47===a[n]){var l=n,i=u.boundEntityColFuncCall(a,++n,e,t)||u.boundEntityFuncCall(a,n,e,t)||u.boundComplexColFuncCall(a,n,e,t)||u.boundComplexFuncCall(a,n,e,t)||u.boundPrimitiveColFuncCall(a,n,e,t)||u.boundPrimitiveFuncCall(a,n,e,t)||u.boundActionCall(a,n,e,t);if(i){n=i.next;let e,t;switch(i.type){case lexer_1.default.TokenType.BoundActionCall:break;case lexer_1.default.TokenType.BoundEntityCollectionFunctionCall:t=u.collectionNavigation(a,n,i.value.call.metadata),delete i.metadata;break;case lexer_1.default.TokenType.BoundEntityFunctionCall:t=u.singleNavigation(a,n,i.value.call.metadata),delete i.metadata;break;case lexer_1.default.TokenType.BoundComplexCollectionFunctionCall:47===a[n]&&(e=nameOrIdentifier_1.default.qualifiedComplexTypeName(a,n+1,i.value.call.metadata))&&(n=e.next),t=u.collectionPath(a,n,i.value.call.metadata),delete i.metadata;break;case lexer_1.default.TokenType.BoundComplexFunctionCall:t=u.complexPath(a,n,i.value.call.metadata),delete i.metadata;break;case lexer_1.default.TokenType.BoundPrimitiveCollectionFunctionCall:t=u.collectionPath(a,n,i.value.call.metadata),delete i.metadata;break;case lexer_1.default.TokenType.BoundPrimitiveFunctionCall:t=u.singlePath(a,n,i.value.call.metadata),delete i.metadata}return t&&(n=t.next),lexer_1.default.tokenize(a,l,n,{operation:i,name:e,navigation:t},lexer_1.default.TokenType.BoundOperation,t)}}},u.boundActionCall=function(e,t,a,n){var l=nameOrIdentifier_1.default.namespace(e,t);if(l!==t){var i=t;if(46===e[t=l]){t++;t=nameOrIdentifier_1.default.action(e,t,a,n);if(t)return t.value.namespace=utils_1.default.stringify(e,i,l),lexer_1.default.tokenize(e,i,t.next,t,lexer_1.default.TokenType.BoundActionCall,t)}}},u.boundFunctionCall=function(e,t,a,n,l,i){var r=nameOrIdentifier_1.default.namespace(e,t);if(r!==t){var o=t;if(46===e[t=r]){a=a(e,++t,l,i);if(a){a.value.namespace=utils_1.default.stringify(e,o,r),t=a.next;l=u.functionParameters(e,t);if(l)return t=l.next,lexer_1.default.tokenize(e,o,t,{call:a,params:l},n,a)}}}},u.boundEntityFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.entityFunction,lexer_1.default.TokenType.BoundEntityFunctionCall,a,n)},u.boundEntityColFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.entityColFunction,lexer_1.default.TokenType.BoundEntityCollectionFunctionCall,a,n)},u.boundComplexFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.complexFunction,lexer_1.default.TokenType.BoundComplexFunctionCall,a,n)},u.boundComplexColFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.complexColFunction,lexer_1.default.TokenType.BoundComplexCollectionFunctionCall,a,n)},u.boundPrimitiveFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.primitiveFunction,lexer_1.default.TokenType.BoundPrimitiveFunctionCall,a,n)},u.boundPrimitiveColFuncCall=function(e,t,a,n){return u.boundFunctionCall(e,t,nameOrIdentifier_1.default.primitiveColFunction,lexer_1.default.TokenType.BoundPrimitiveCollectionFunctionCall,a,n)},u.actionImportCall=function(e,t,a){if(a=nameOrIdentifier_1.default.actionImport(e,t,a))return lexer_1.default.tokenize(e,t,a.next,a,lexer_1.default.TokenType.ActionImportCall,a)},u.functionImportCall=function(e,t,a){if(a=nameOrIdentifier_1.default.entityFunctionImport(e,t,a)||nameOrIdentifier_1.default.entityColFunctionImport(e,t,a)||nameOrIdentifier_1.default.complexFunctionImport(e,t,a)||nameOrIdentifier_1.default.complexColFunctionImport(e,t,a)||nameOrIdentifier_1.default.primitiveFunctionImport(e,t,a)||nameOrIdentifier_1.default.primitiveColFunctionImport(e,t,a)){var n=t,l=(t=a.next,u.functionParameters(e,t));if(l)return t=l.next,lexer_1.default.tokenize(e,n,t,{import:a,params:l.value},a.type+"Call",a)}},u.functionParameters=function(t,a,e){var n=lexer_1.default.OPEN(t,a);if(n){var l=a,i=[];let e=u.functionParameter(t,a=n);for(;e;){i.push(e),a=e.next;var r=lexer_1.default.COMMA(t,a);if(!r)break;if(a=r,!(e=u.functionParameter(t,a)))return}n=lexer_1.default.CLOSE(t,a);if(n)return a=n,lexer_1.default.tokenize(t,l,a,i,lexer_1.default.TokenType.FunctionParameters)}},u.functionParameter=function(e,t,a){var n=expressions_1.default.parameterName(e,t);if(n){var l=t,i=(t=n.next,lexer_1.default.EQ(e,t));if(i){t=i;i=expressions_1.default.parameterAlias(e,t)||primitiveLiteral_1.default.primitiveLiteral(e,t);if(i)return t=i.next,lexer_1.default.tokenize(e,l,t,{name:n,value:i},lexer_1.default.TokenType.FunctionParameter)}}},u.crossjoin=function(t,a,n){if(utils_1.default.equals(t,a,"$crossjoin")){var l=a,i=(a+=10,lexer_1.default.OPEN(t,a));if(i){a=i;var r=[];let e=nameOrIdentifier_1.default.entitySetName(t,a,n);if(e){for(;e;){r.push(e),a=e.next;var o=lexer_1.default.COMMA(t,a);if(!o)break;if(a=o,!(e=nameOrIdentifier_1.default.entitySetName(t,a,n)))return}if(lexer_1.default.CLOSE(t,a))return lexer_1.default.tokenize(t,l,a,{names:r},lexer_1.default.TokenType.Crossjoin)}}}},u.all=function(e,t){if(utils_1.default.equals(e,t,"$all"))return lexer_1.default.tokenize(e,t,t+4,"$all",lexer_1.default.TokenType.AllResource)}}(ResourcePath=ResourcePath||{}),exports.default=ResourcePath;