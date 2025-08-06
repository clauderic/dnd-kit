import {Plugin} from '@dnd-kit/abstract';
import {computed, effect} from '@dnd-kit/state';
import {getDocument} from '@dnd-kit/dom/utilities';

import {DragDropManager} from '../../manager/index.ts';

interface CursorPluginOptions {
  /**
   * The style of the cursor to be applied to the document body.
   * @default 'grabbing'
   */
  cursor?: string;
  /**
   * The nonce to be applied to the style element.
   */
  nonce?: string;
}

export class Cursor extends Plugin<DragDropManager> {
  constructor(
    public manager: DragDropManager,
    options?: CursorPluginOptions
  ) {
    super(manager, options);

    const doc = computed(() =>
      getDocument(this.manager.dragOperation.source?.element)
    );

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;
      const {cursor = 'grabbing', nonce} = this.options ?? {};

      if (dragOperation.status.initialized) {
        const document = doc.value;
        const style = document.createElement('style');

        if (nonce) {
          style.setAttribute('nonce', nonce);
        }

        style.textContent = `* { cursor: ${cursor} !important; }`;
        document.head.appendChild(style);

        return () => style.remove();
      }
    });
  }
}
