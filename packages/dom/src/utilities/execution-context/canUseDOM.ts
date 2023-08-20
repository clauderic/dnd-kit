// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
export const canUseDOM =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';
