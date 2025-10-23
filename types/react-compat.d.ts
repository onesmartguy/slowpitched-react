/**
 * React 19 compatibility types for React Native libraries
 * These types resolve incompatibilities between React 19 and React Native component types
 * TODO: Remove once React Native libraries are fully compatible with React 19
 */

declare module 'react' {
  interface Component {
    refs?: any;
  }
}

export {};
