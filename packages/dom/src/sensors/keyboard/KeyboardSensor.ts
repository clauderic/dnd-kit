// import {effect} from '@dnd-kit/state';
// import type {CleanupFunction} from '@dnd-kit/types';
// import {getOwnerDocument, Listeners} from '@dnd-kit/dom-utilities';

// import type {DragDropManager} from '../../manager';
// import type {Draggable} from '../../nodes';
// import type {DOMSensor} from '../types';

// export type KeyCode = KeyboardEvent['code'];

// export type KeyboardCodes = {
//   start: KeyCode[];
//   cancel: KeyCode[];
//   end: KeyCode[];
// };

// export interface KeyboardSensorOptions {
//   keyboardCodes?: KeyboardCodes;
// }

// const DEFAULT_KEYBOARD_CODES: KeyboardCodes = {
//   start: ['Space', 'Enter'],
//   cancel: ['Escape'],
//   end: ['Space', 'Enter'],
// };

// /**
//  * The KeyboardSensor class is a DOMSensor that handles Keyboard events.
//  */
// export class KeyboardSensor implements DOMSensor<KeyboardSensorOptions> {
//   constructor(private manager: DragDropManager) {}

//   private listeners = new Listeners();

//   private cleanup: CleanupFunction | undefined;

//   public bind(source: Draggable, options: KeyboardSensorOptions) {
//     const unbind = effect(() => {
//       const target = source.activator ?? source.element;
//       const listener: EventListener = (event: Event) => {
//         if (event instanceof KeyboardEvent) {
//           this.handleKeyUp(event, source, options);
//         }
//       };

//       if (target) {
//         target.addEventListener('keyup', listener);

//         return () => {
//           target.removeEventListener('keyup', listener);
//         };
//       }
//     });

//     return unbind;
//   }

//   private handleKeyUp = (
//     event: KeyboardEvent,
//     source: Draggable,
//     options: KeyboardSensorOptions
//   ) => {
//     const {keyboardCodes = DEFAULT_KEYBOARD_CODES} = options;

//     if (keyboardCodes.start.includes(event.code)) {
//       return;
//     }

//     if (!(event.target instanceof Element)) {
//       return;
//     }

//     if (source.disabled === true) {
//       return;
//     }

//     this.manager.actions.setDragSource(source.id);

//     event.stopImmediatePropagation();
//   };

//   public destroy() {
//     // Remove all event listeners
//     this.listeners.clear();
//   }
// }
