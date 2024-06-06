import {Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';

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

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;
      const {cursor = 'grabbing'} = this.options ?? {};

      if (dragOperation.status.initialized) {
        const style = document.createElement('style');
        style.innerText = `* { cursor: ${cursor} !important; }`;
        document.head.appendChild(style);

        return () => {
          style.remove();
        };
      }
    });
  }
}
