"use strict";var Expressions,__importDefault=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(exports,"__esModule",{value:!0});const utils_1=__importDefault(require("./utils")),lexer_1=__importDefault(require("./lexer")),primitiveLiteral_1=__importDefault(require("./primitiveLiteral")),nameOrIdentifier_1=__importDefault(require("./nameOrIdentifier")),json_1=__importDefault(require("./json"));!function(e){function x(e,t){var r,t=primitiveLiteral_1.default.primitiveLiteral(e,t)||L(e,t)||json_1.default.arrayOrObject(e,t)||Fe(e,t)||K(e,t)||qe(e,t)||I(e,t)||be(e,t)||D(e,t)||We(e,t);if(t)return(r=n(e,t.next)||c(e,t.next)||y(e,t.next)||A(e,t.next)||R(e,t.next))&&(t.value={left:lexer_1.default.clone(t),right:r.value},t.next=r.value.next,t.type=r.type,t.raw=utils_1.default.stringify(e,t.position,t.next)),t?lexer_1.default.tokenize(e,t.position,t.next,t,lexer_1.default.TokenType.CommonExpression):void 0}function i(e,t){var r,n,t=ze(e,t)||j(e,t)||V(e,t)||x(e,t)||w(e,t);if(t)return r=void 0,t.type===lexer_1.default.TokenType.CommonExpression&&(r=u(e,t.next)||f(e,t.next)||o(e,t.next)||d(e,t.next)||p(e,t.next)||s(e,t.next)||_(e,t.next)||E(e,t.next))&&(t.value={left:t.value,right:r.value},t.next=r.value.next,t.type=r.type,t.raw=utils_1.default.stringify(e,t.position,t.next)),(r=l(e,t.next)||a(e,t.next))&&(n=lexer_1.default.clone(t),t.next=r.value.next,t.value={left:n,right:r.value},t.type=r.type,t.raw=utils_1.default.stringify(e,t.position,t.next),t.type===lexer_1.default.TokenType.AndExpression)&&t.value.right.type===lexer_1.default.TokenType.OrExpression&&(t.value.left=lexer_1.default.tokenize(e,t.value.left.position,t.value.right.value.left.next,{left:t.value.left,right:t.value.right.value.left},t.type),t.type=t.value.right.type,t.value.right=t.value.right.value.right),t}function l(e,t){var r=lexer_1.default.RWS(e,t);if(r&&r!==t&&utils_1.default.equals(e,r,"and")){var n=t;if(t=r+3,(r=lexer_1.default.RWS(e,t))&&r!==t){r=i(e,t=r);if(r)return lexer_1.default.tokenize(e,n,t,r,lexer_1.default.TokenType.AndExpression)}}}function a(e,t){var r=lexer_1.default.RWS(e,t);if(r&&r!==t&&utils_1.default.equals(e,r,"or")){var n=t;if(t=r+2,(r=lexer_1.default.RWS(e,t))&&r!==t){r=i(e,t=r);if(r)return lexer_1.default.tokenize(e,n,t,r,lexer_1.default.TokenType.OrExpression)}}}function r(e,t,r,n){var l=lexer_1.default.RWS(e,t);if(l&&l!==t){var i=t;if(t=l,utils_1.default.equals(e,t,r)&&(t+=r.length,l=lexer_1.default.RWS(e,t))&&l!==t){r=x(e,t=l);if(r)return lexer_1.default.tokenize(e,i,t,r.value,n)}}}function u(e,t){return r(e,t,"eq",lexer_1.default.TokenType.EqualsExpression)}function f(e,t){return r(e,t,"ne",lexer_1.default.TokenType.NotEqualsExpression)}function o(e,t){return r(e,t,"lt",lexer_1.default.TokenType.LesserThanExpression)}function d(e,t){return r(e,t,"le",lexer_1.default.TokenType.LesserOrEqualsExpression)}function p(e,t){return r(e,t,"gt",lexer_1.default.TokenType.GreaterThanExpression)}function s(e,t){return r(e,t,"ge",lexer_1.default.TokenType.GreaterOrEqualsExpression)}function _(e,t){return r(e,t,"has",lexer_1.default.TokenType.HasExpression)}function E(e,t){return r(e,t,"in",lexer_1.default.TokenType.InExpression)}function n(e,t){return r(e,t,"add",lexer_1.default.TokenType.AddExpression)}function c(e,t){return r(e,t,"sub",lexer_1.default.TokenType.SubExpression)}function y(e,t){return r(e,t,"mul",lexer_1.default.TokenType.MulExpression)}function A(e,t){return r(e,t,"div",lexer_1.default.TokenType.DivExpression)}function R(e,t){return r(e,t,"mod",lexer_1.default.TokenType.ModExpression)}function V(e,t){if(utils_1.default.equals(e,t,"not")){var r=t,n=(t+=3,lexer_1.default.RWS(e,t));if(n&&n!==t){n=i(e,t=n);if(n)return lexer_1.default.tokenize(e,r,n.next,n,lexer_1.default.TokenType.NotExpression)}}}function w(e,t){var r=lexer_1.default.OPEN(e,t);if(r){var n=t,r=(t=r,lexer_1.default.BWS(e,t));if(r){r=i(e,r);if(r){var l=lexer_1.default.BWS(e,r.next);if(l){l=lexer_1.default.CLOSE(e,l);if(l)return t=l,lexer_1.default.tokenize(e,n,t,r,lexer_1.default.TokenType.BoolParenExpression)}}}}}function D(e,t){var r=lexer_1.default.OPEN(e,t);if(r){var n=t,r=(t=r,lexer_1.default.BWS(e,t));if(r){r=x(e,r);if(r){var l=lexer_1.default.BWS(e,r.next);if(l){l=lexer_1.default.CLOSE(e,l);if(l)return t=l,lexer_1.default.tokenize(e,n,t,r.value,lexer_1.default.TokenType.ParenExpression)}}}}}function j(e,t){return F(e,t)||ke(e,t)||he(e,t)||Ce(e,t)||ge(e,t)||Pe(e,t)||Oe(e,t)||Me(e,t)||Se(e,t)||me(e,t)}function K(e,t){return H(e,t)||X(e,t)||Y(e,t)||Z(e,t)||U(e,t)||$(e,t)||G(e,t)||J(e,t)||ee(e,t)||Q(e,t)||te(e,t)||re(e,t)||ne(e,t)||le(e,t)||ie(e,t)||ae(e,t)||ue(e,t)||fe(e,t)||oe(e,t)||xe(e,t)||Ee(e,t)||ce(e,t)||ye(e,t)||ve(e,t)||Te(e,t)||de(e,t)||pe(e,t)||se(e,t)||_e(e,t)}function v(r,n,l,i,a){if(void 0===i&&(i=0),void 0===a&&(a=i),utils_1.default.equals(r,n,l)){var u=n,f=(n+=l.length,lexer_1.default.OPEN(r,n));if(f){let t=lexer_1.default.BWS(r,f);if(t){n=t;let e;if(0<i)for(e=[];e.length<a;){var o=x(r,n);if(e.length<i&&!o)return;if(!o)break;if(e.push(o.value),n=o.next,!(t=lexer_1.default.BWS(r,n)))return;n=t;o=lexer_1.default.COMMA(r,n);if(e.length<i&&!o)return;if(!o)break;if(n=o,!(t=lexer_1.default.BWS(r,n)))return;n=t}if(t=lexer_1.default.BWS(r,n)){n=t;f=lexer_1.default.CLOSE(r,n);if(f)return n=f,lexer_1.default.tokenize(r,u,n,{method:l,parameters:e},lexer_1.default.TokenType.MethodCallExpression)}}}}}function F(e,t){return v(e,t,"contains",2)}function $(e,t){return v(e,t,"startswith",2)}function G(e,t){return v(e,t,"endswith",2)}function Q(e,t){return v(e,t,"length",1)}function H(e,t){return v(e,t,"indexof",2)}function U(e,t){return v(e,t,"substring",2,3)}function J(e,t){return v(e,t,"substringof",2)}function X(e,t){return v(e,t,"tolower",1)}function Y(e,t){return v(e,t,"toupper",1)}function Z(e,t){return v(e,t,"trim",1,2)}function ee(e,t){return v(e,t,"concat",2)}function te(e,t){return v(e,t,"year",1)}function re(e,t){return v(e,t,"month",1)}function ne(e,t){return v(e,t,"day",1)}function le(e,t){return v(e,t,"hour",1)}function ie(e,t){return v(e,t,"minute",1)}function ae(e,t){return v(e,t,"second",1)}function ue(e,t){return v(e,t,"fractionalseconds",1)}function fe(e,t){return v(e,t,"totalseconds",1)}function oe(e,t){return v(e,t,"date",1)}function xe(e,t){return v(e,t,"time",1)}function de(e,t){return v(e,t,"totaloffsetminutes",1)}function pe(e,t){return v(e,t,"mindatetime",0)}function se(e,t){return v(e,t,"maxdatetime",0)}function _e(e,t){return v(e,t,"now",0)}function Ee(e,t){return v(e,t,"round",1)}function ce(e,t){return v(e,t,"floor",1)}function ye(e,t){return v(e,t,"ceiling",1)}function ve(e,t){return v(e,t,"geo.distance",2,3)}function Te(e,t){return v(e,t,"geo.length",1,2)}function me(e,t){return v(e,t,"geo.intersects",2,3)}function ke(e,t){return v(e,t,"geo.contains",2)}function he(e,t){return v(e,t,"geo.crosses",2)}function Ce(e,t){return v(e,t,"geo.disjoint",2)}function ge(e,t){return v(e,t,"geo.equals",2,3)}function Oe(e,t){return v(e,t,"geo.relate",2,3)}function Me(e,t){return v(e,t,"geo.touches",2,3)}function Se(e,t){return v(e,t,"geo.within",2,3)}function Pe(e,t){return v(e,t,"geo.overlaps",2,3)}function ze(t,r){if(utils_1.default.equals(t,r,"isof")){var n=r,l=(r+=4,lexer_1.default.OPEN(t,r));if(l){r=l;let e=lexer_1.default.BWS(t,r);if(e){l=x(t,r=e);if(l){if(r=l.next,!(e=lexer_1.default.BWS(t,r)))return;r=e;var i=lexer_1.default.COMMA(t,r);if(!i)return;if(r=i,!(e=lexer_1.default.BWS(t,r)))return;r=e}i=nameOrIdentifier_1.default.qualifiedTypeName(t,r);if(i&&(r=i.next,e=lexer_1.default.BWS(t,r))){r=e;var a=lexer_1.default.CLOSE(t,r);if(a)return r=a,lexer_1.default.tokenize(t,n,r,{target:l,typename:i},lexer_1.default.TokenType.IsOfExpression)}}}}}function We(t,r){if(utils_1.default.equals(t,r,"cast")){var n=r,l=(r+=4,lexer_1.default.OPEN(t,r));if(l){r=l;let e=lexer_1.default.BWS(t,r);if(e){l=x(t,r=e);if(l){if(r=l.next,!(e=lexer_1.default.BWS(t,r)))return;r=e;var i=lexer_1.default.COMMA(t,r);if(!i)return;if(r=i,!(e=lexer_1.default.BWS(t,r)))return;r=e}i=nameOrIdentifier_1.default.qualifiedTypeName(t,r);if(i&&(r=i.next,e=lexer_1.default.BWS(t,r))){r=e;var a=lexer_1.default.CLOSE(t,r);if(a)return r=a,lexer_1.default.tokenize(t,n,r,{target:l,typename:i},lexer_1.default.TokenType.CastExpression)}}}}}function be(e,t){if(45===e[t]){var r=t,n=(t++,lexer_1.default.BWS(e,t));if(n){n=x(e,t=n);if(n)return lexer_1.default.tokenize(e,r,n.next,n,lexer_1.default.TokenType.NegateExpression)}}}function qe(e,t){var r=Ie(e,t);let n;var l=t;if(r){if(47===e[r.next])return t=r.next+1,(n=T(e,t))?lexer_1.default.tokenize(e,l,n.next,[r,n],lexer_1.default.TokenType.FirstMemberExpression):void 0}else n=T(e,t);if(r=r||n)return lexer_1.default.tokenize(e,l,r.next,r,lexer_1.default.TokenType.FirstMemberExpression)}function T(e,t){var r=t,n=nameOrIdentifier_1.default.qualifiedEntityTypeName(e,t);if(n){if(47!==e[n.next])return;t=n.next+1}t=m(e,t)||N(e,t);if(t)return lexer_1.default.tokenize(e,r,t.next,n?{name:n,value:t}:t,lexer_1.default.TokenType.MemberExpression)}function m(e,t){let r=nameOrIdentifier_1.default.odataIdentifier(e,t);var n,l=t;if(r?(t=r.next,(n=W(e,r.next)||O(e,r.next)||z(e,r.next)||b(e,r.next)||q(e,r.next))&&(t=n.next,r={current:lexer_1.default.clone(r),next:n})):r||(r=nameOrIdentifier_1.default.streamProperty(e,t))&&(t=r.next),r)return lexer_1.default.tokenize(e,l,t,r,lexer_1.default.TokenType.PropertyPathExpression)}function Ie(e,t){return Ne(e,t)||(k?C(e,t):void 0)}function Ne(e,t){if(utils_1.default.equals(e,t,"$it"))return lexer_1.default.tokenize(e,t,t+3,"$it",lexer_1.default.TokenType.ImplicitVariableExpression)}e.commonExpr=x,e.boolCommonExpr=i,e.andExpr=l,e.orExpr=a,e.leftRightExpr=r,e.eqExpr=u,e.neExpr=f,e.ltExpr=o,e.leExpr=d,e.gtExpr=p,e.geExpr=s,e.hasExpr=_,e.inExpr=E,e.addExpr=n,e.subExpr=c,e.mulExpr=y,e.divExpr=A,e.modExpr=R,e.notExpr=V,e.boolParenExpr=w,e.parenExpr=D,e.boolMethodCallExpr=j,e.methodCallExpr=K,e.methodCallExprFactory=v,e.containsMethodCallExpr=F,e.startsWithMethodCallExpr=$,e.endsWithMethodCallExpr=G,e.lengthMethodCallExpr=Q,e.indexOfMethodCallExpr=H,e.substringMethodCallExpr=U,e.substringOfMethodCallExpr=J,e.toLowerMethodCallExpr=X,e.toUpperMethodCallExpr=Y,e.trimMethodCallExpr=Z,e.concatMethodCallExpr=ee,e.yearMethodCallExpr=te,e.monthMethodCallExpr=re,e.dayMethodCallExpr=ne,e.hourMethodCallExpr=le,e.minuteMethodCallExpr=ie,e.secondMethodCallExpr=ae,e.fractionalsecondsMethodCallExpr=ue,e.totalsecondsMethodCallExpr=fe,e.dateMethodCallExpr=oe,e.timeMethodCallExpr=xe,e.totalOffsetMinutesMethodCallExpr=de,e.minDateTimeMethodCallExpr=pe,e.maxDateTimeMethodCallExpr=se,e.nowMethodCallExpr=_e,e.roundMethodCallExpr=Ee,e.floorMethodCallExpr=ce,e.ceilingMethodCallExpr=ye,e.distanceMethodCallExpr=ve,e.geoLengthMethodCallExpr=Te,e.intersectsMethodCallExpr=me,e.geoContainsMethodCallExpr=ke,e.geoCrossesMethodCallExpr=he,e.geoDisjointMethodCallExpr=Ce,e.geoEqualsMethodCallExpr=ge,e.geoRelateMethodCallExpr=Oe,e.geoTouchesMethodCallExpr=Me,e.geoWithinMethodCallExpr=Se,e.geoOverlapsMethodCallExpr=Pe,e.isofExpr=ze,e.castExpr=We,e.negateExpr=be,e.firstMemberExpr=qe,e.memberExpr=T,e.propertyPathExpr=m,e.inscopeVariableExpr=Ie,e.implicitVariableExpr=Ne;let k=!1,h=!1;function C(e,t){e=nameOrIdentifier_1.default.odataIdentifier(e,t,lexer_1.default.TokenType.LambdaVariableExpression);if(e)return h=!0,e}function g(e,t){k=!0;t=i(e,t);if(k=!1,t&&h)return h=!1,lexer_1.default.tokenize(e,t.position,t.next,t,lexer_1.default.TokenType.LambdaPredicateExpression)}function Be(r,n){if(utils_1.default.equals(r,n,"any")){var l=n,i=(n+=3,lexer_1.default.OPEN(r,n));if(i){n=i;let t=lexer_1.default.BWS(r,n);if(t){i=C(r,n=t);let e;if(i){if(n=i.next,!(t=lexer_1.default.BWS(r,n)))return;n=t;var a=lexer_1.default.COLON(r,n);if(!a)return;if(n=a,!(t=lexer_1.default.BWS(r,n)))return;if(n=t,!(e=g(r,n)))return;n=e.next}if(t=lexer_1.default.BWS(r,n)){n=t;a=lexer_1.default.CLOSE(r,n);if(a)return n=a,lexer_1.default.tokenize(r,l,n,{variable:i,predicate:e},lexer_1.default.TokenType.AnyExpression)}}}}}function Le(e,t){if(utils_1.default.equals(e,t,"all")){var r=t,n=(t+=3,lexer_1.default.OPEN(e,t));if(n){t=n;n=lexer_1.default.BWS(e,t);if(n){var l=C(e,t=n);if(l&&(t=l.next,n=lexer_1.default.BWS(e,t))){t=n;var i=lexer_1.default.COLON(e,t);if(i&&(t=i,n=lexer_1.default.BWS(e,t))){i=g(e,t=n);if(i&&(t=i.next,n=lexer_1.default.BWS(e,t))){t=n;n=lexer_1.default.CLOSE(e,t);if(n)return t=n,lexer_1.default.tokenize(e,r,t,{variable:l,predicate:i},lexer_1.default.TokenType.AllExpression)}}}}}}}function O(e,t){var r=t;let n,l,i;if(47===e[t]){if(t++,!(n=nameOrIdentifier_1.default.qualifiedEntityTypeName(e,t)))return;t=n.next}var a=M(e,t);if(a?(t=a.next,(l=z(e,t))&&(t=l.next)):(i=W(e,t))&&(t=i.next),r<t)return lexer_1.default.tokenize(e,r,t,{entity:n,predicate:a,navigation:l,path:i},lexer_1.default.TokenType.CollectionNavigationExpression)}function M(e,t,r){return Ae(e,t,r)||Re(e,t)}function Ae(t,r,n){var l=lexer_1.default.OPEN(t,r);if(l){var i=r,l=P(t,r=l);if(l){r=lexer_1.default.CLOSE(t,l.next);if(r){let e;return"object"==typeof n&&n.key&&n.key.propertyRefs&&n.key.propertyRefs[0]&&n.key.propertyRefs[0].name&&(e=n.key.propertyRefs[0].name),lexer_1.default.tokenize(t,i,r,{key:e,value:l},lexer_1.default.TokenType.SimpleKey)}}}}function Re(t,r){var n=lexer_1.default.OPEN(t,r);if(n){var l=r;let e=S(t,r=n);if(e){for(var i=[];e;){i.push(e);var a=lexer_1.default.COMMA(t,e.next);e=a?S(t,a):null}r=i[i.length-1].next;n=lexer_1.default.CLOSE(t,r);if(n)return r=n,lexer_1.default.tokenize(t,l,r,i,lexer_1.default.TokenType.CompoundKey)}}}function S(e,t){var r,n=nameOrIdentifier_1.default.primitiveKeyProperty(e,t)||Ve(e,t);return n&&(r=lexer_1.default.EQ(e,n.next))&&(r=P(e,r))?lexer_1.default.tokenize(e,t,r.next,{key:n,value:r},lexer_1.default.TokenType.KeyValuePair):void 0}function P(e,t){e=primitiveLiteral_1.default.primitiveLiteral(e,t);if(e)return e.type=lexer_1.default.TokenType.KeyPropertyValue,e}function Ve(e,t){return nameOrIdentifier_1.default.odataIdentifier(e,t,lexer_1.default.TokenType.KeyPropertyAlias)}function z(e,t){var r;return 47===e[t]&&(r=T(e,t+1))?lexer_1.default.tokenize(e,t,r.next,r,lexer_1.default.TokenType.SingleNavigationExpression):void 0}function W(e,t){let r=Ke(e,t);if(r||47===e[t]&&(r=N(e,t+1)||Be(e,t+1)||Le(e,t+1)),r)return lexer_1.default.tokenize(e,t,r.next,r,lexer_1.default.TokenType.CollectionPathExpression)}function b(e,t){if(47===e[t]){var r=t,n=(t++,nameOrIdentifier_1.default.qualifiedComplexTypeName(e,t));if(n){if(47!==e[n.next])return;t=n.next+1}t=m(e,t)||N(e,t);return t?lexer_1.default.tokenize(e,r,t.next,n?[n,t]:[t],lexer_1.default.TokenType.ComplexPathExpression):void 0}}function q(e,t){var r;return 47===e[t]&&(r=N(e,t+1))?lexer_1.default.tokenize(e,t,r.next,r,lexer_1.default.TokenType.SinglePathExpression):void 0}function I(e,t){var r=nameOrIdentifier_1.default.namespace(e,t);if(r!==t&&46===e[r]){var n=t,l=(t=r+1,nameOrIdentifier_1.default.odataIdentifier(e,t));if(l){l.position=n,l.value.namespace=utils_1.default.stringify(e,n,r),l.raw=utils_1.default.stringify(e,n,l.next);var i,r=we(e,t=l.next);if(r)return(i=W(e,t=r.next)||O(e,t)||z(e,t)||b(e,t)||q(e,t))&&(t=i.next),lexer_1.default.tokenize(e,n,t,{fn:l,params:r,expression:i},lexer_1.default.TokenType.FunctionExpression)}}}function N(e,t){return I(e,t)}function we(t,r){var n=lexer_1.default.OPEN(t,r);if(n){var l=r,i=[];let e=B(t,r=n);for(;e;){i.push(e);var a=lexer_1.default.COMMA(t,e.next);if(a){if(r=a,!(e=B(t,r)))return}else r=e.next,e=null}n=lexer_1.default.CLOSE(t,r);if(n)return r=n,lexer_1.default.tokenize(t,l,r,i,lexer_1.default.TokenType.FunctionExpressionParameters)}}function B(e,t){var r=De(e,t);if(r){var n=lexer_1.default.EQ(e,r.next);if(r&&n){var l=t,n=L(e,t=n)||je(e,t);if(n)return lexer_1.default.tokenize(e,l,n.next,{name:r,value:n},lexer_1.default.TokenType.FunctionExpressionParameter)}}}function De(e,t){return nameOrIdentifier_1.default.odataIdentifier(e,t,lexer_1.default.TokenType.ParameterName)}function L(e,t){var r=lexer_1.default.AT(e,t);return(r=r&&nameOrIdentifier_1.default.odataIdentifier(e,r))?lexer_1.default.tokenize(e,t,r.next,r.value,lexer_1.default.TokenType.ParameterAlias):void 0}function je(e,t){var r=json_1.default.arrayOrObject(e,t)||x(e,t);if(r)return lexer_1.default.tokenize(e,t,r.next,r.value,lexer_1.default.TokenType.ParameterValue)}function Ke(e,t){if(utils_1.default.equals(e,t,"count"))return lexer_1.default.tokenize(e,t,t+5,"count",lexer_1.default.TokenType.CountExpression)}function Fe(n,l){if(utils_1.default.equals(n,l,"$root/")){var i=l,a=(l+=6,nameOrIdentifier_1.default.entitySetName(n,l));let e,t,r;if(a&&(e=M(n,a.next)),a&&e)r={entitySet:a,keys:e};else{if(!(t=nameOrIdentifier_1.default.singletonEntity(n,l)))return;r={entity:t}}if(e&&t)return(a=z(n,l=(e||t).next))&&(l=a.next),lexer_1.default.tokenize(n,i,l,{current:r,next:a},lexer_1.default.TokenType.RootExpression)}}e.lambdaVariableExpr=C,e.lambdaPredicateExpr=g,e.anyExpr=Be,e.allExpr=Le,e.collectionNavigationExpr=O,e.keyPredicate=M,e.simpleKey=Ae,e.compoundKey=Re,e.keyValuePair=S,e.keyPropertyValue=P,e.keyPropertyAlias=Ve,e.singleNavigationExpr=z,e.collectionPathExpr=W,e.complexPathExpr=b,e.singlePathExpr=q,e.functionExpr=I,e.boundFunctionExpr=N,e.functionExprParameters=we,e.functionExprParameter=B,e.parameterName=De,e.parameterAlias=L,e.parameterValue=je,e.countExpr=Ke,e.refExpr=function(e,t){if(utils_1.default.equals(e,t,"/$ref"))return lexer_1.default.tokenize(e,t,t+5,"/$ref",lexer_1.default.TokenType.RefExpression)},e.valueExpr=function(e,t){if(utils_1.default.equals(e,t,"/$value"))return lexer_1.default.tokenize(e,t,t+7,"/$value",lexer_1.default.TokenType.ValueExpression)},e.rootExpr=Fe}(Expressions=Expressions||{}),exports.default=Expressions;