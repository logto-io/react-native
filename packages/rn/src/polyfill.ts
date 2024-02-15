/* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-unnecessary-condition */
import { btoaPolyfill, atobPolyfill } from 'js-base64';

if (!global.btoa) {
  global.btoa = btoaPolyfill;
}

if (!global.atob) {
  global.atob = atobPolyfill;
}
/* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-unnecessary-condition */
