import "solid-js";

declare module "solid-js" {
  namespace JSX {
    // Allow specific data-* attributes on all elements (native and custom)
    interface DOMAttributes<T> {
      "data-shadow"?: string;
      "data-accent-color"?: string;
      "data-highlight"?: string;
    }
    // Allow attr:data-* prefix variants (used on custom elements)
    interface ExplicitAttributes {
      "data-shadow"?: string;
      "data-accent-color"?: string;
      "data-highlight"?: string;
    }
    // Declare custom elements used in stories
    interface IntrinsicElements {
      "container-component": HTMLAttributes<HTMLElement>;
      "button-component": HTMLAttributes<HTMLElement>;
      "handle-component": HTMLAttributes<HTMLElement>;
      "dropzone-component": HTMLAttributes<HTMLElement>;
      "item-component": HTMLAttributes<HTMLElement>;
    }
  }
}
