import 'react';

// Declare global variables for TypeScript and VSCode.
// Do not rename this file or move these types into index.d.ts
// @see https://code.visualstudio.com/docs/nodejs/working-with-javascript#_global-variables-and-type-checking
declare const __DEV__: boolean;
declare const __VERSION__: string;
declare const $FixMe: any;

type GlobalElement = JSX.Element;
type GlobalElementClass = JSX.ElementClass;
type GlobalElementAttributesProperty = JSX.ElementAttributesProperty;
type GlobalElementChildrenAttribute = JSX.ElementChildrenAttribute;
type GlobalIntrinsicAttributes = JSX.IntrinsicAttributes;
type GlobalIntrinsicClassAttributes<T> = JSX.IntrinsicClassAttributes<T>;
type GlobalIntrinsicElements = JSX.IntrinsicElements;

// Wrap global JSX namespace inside React, in preparation for React 19
// https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript
declare module 'react' {
    namespace JSX {
        interface Element extends GlobalElement { }
        interface ElementClass extends GlobalElementClass { }
        interface ElementAttributesProperty extends GlobalElementAttributesProperty { }
        interface ElementChildrenAttribute extends GlobalElementChildrenAttribute { }
        interface IntrinsicAttributes extends GlobalIntrinsicAttributes { }
        interface IntrinsicClassAttributes<T> extends GlobalIntrinsicClassAttributes<T> {}
        interface IntrinsicElements extends GlobalIntrinsicElements { }
    }
}
