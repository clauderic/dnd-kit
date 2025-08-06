import {Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';

interface PreventSelectionPluginOptions {
  /**
   * The nonce to be applied to the style element.
   */
  nonce?: string;
}

export class PreventSelection extends Plugin<DragDropManager> {
  constructor(
    public manager: DragDropManager,
    options?: PreventSelectionPluginOptions
  ) {
    super(manager, options);

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;
      const {nonce} = this.options ?? {};

      if (dragOperation.status.initialized) {
        const style = document.createElement('style');
        if (nonce) {
          style.setAttribute('nonce', nonce);
        }
        style.textContent = `* { user-select: none !important; -webkit-user-select: none !important; }`;
        document.head.appendChild(style);

        removeSelection();
        document.addEventListener('selectionchange', removeSelection, {
          capture: true,
        });

        return () => {
          document.removeEventListener('selectionchange', removeSelection, {
            capture: true,
          });
          style.remove();
        };
      }
    });
  }
}

function removeSelection() {
  document.getSelection()?.removeAllRanges();
}
