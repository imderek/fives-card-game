// react-jsx-runtime@1.0.0 downloaded from https://ga.jspm.io/npm:react-jsx-runtime@1.0.0-alpha.1/dist/index.es.js

import"object-assign";import r from"react";
/** @license React v17.0.2
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var e=r,t=60103;var o=60107;if("function"===typeof Symbol&&Symbol.for){var a=Symbol.for;t=a("react.element");o=a("react.fragment")}var f=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n=Object.prototype.hasOwnProperty,_={key:true,ref:true,__self:true,__source:true};function q(r,e,o){var a,u={},l=null,p=null;void 0!==o&&(l=""+o);void 0!==e.key&&(l=""+e.key);void 0!==e.ref&&(p=e.ref);for(a in e)n.call(e,a)&&!_.hasOwnProperty(a)&&(u[a]=e[a]);if(r&&r.defaultProps)for(a in e=r.defaultProps,e)void 0===u[a]&&(u[a]=e[a]);return{$$typeof:t,type:r,key:l,ref:p,props:u,_owner:f.current}}var u=q;var l=q;const p={Fragment:o,jsx:u,jsxs:l};export{o as Fragment,p as default,u as jsx,l as jsxs};

