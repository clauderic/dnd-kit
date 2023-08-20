import {Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.js';

interface CursorPluginOptions {
  /**
   * The style of the cursor to be applied to the document body.
   * @default 'grabbing'
   */
  cursor?: string;
}

export class Cursor extends Plugin<DragDropManager> {
  constructor(
    public manager: DragDropManager,
    options?: CursorPluginOptions
  ) {
    super(manager, options);

    const style = document.createElement('style');
    document.head.appendChild(style);

    const effectCleanup = effect(() => {
      const {dragOperation} = this.manager;
      const {cursor = 'grabbing'} = this.options ?? {};

      if (dragOperation.status.initialized) {
        style.innerText = `* { cursor: ${cursor} !important; }`;
      } else {
        style.innerText = '';
      }
    });

    this.destroy = () => {
      effectCleanup();
      style.remove();
    };
  }
}
