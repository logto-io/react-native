/**
 * @fileoverview
 * This file is a polyfill for the `atob` and `btoa` functions. It is required for Logto to work in
 * Expo managed workflow (also React Native).
 */

/* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-unnecessary-condition */
import { btoaPolyfill, atobPolyfill } from 'js-base64';

global.btoa ||= btoaPolyfill;

global.atob ||= atobPolyfill;
/* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-unnecessary-condition */
