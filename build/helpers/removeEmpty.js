"use strict";function removeEmpty(e){return Array.isArray(e)?e.map(e=>e&&"object"==typeof e?removeEmpty(e):e).filter(e=>!(null==e)):Object.entries(e).map(([e,t])=>[e,t&&"object"==typeof t?removeEmpty(t):t]).reduce((e,[t,r])=>(null==r||(e[t]=r),e),{})}Object.defineProperty(exports,"__esModule",{value:!0}),exports.removeEmpty=void 0,exports.removeEmpty=removeEmpty;