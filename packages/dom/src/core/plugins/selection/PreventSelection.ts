import {Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';

export class PreventSelection extends Plugin<DragDropManager> {
  constructor(public manager: DragDropManager) {
    super(manager);

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;

      if (dragOperation.status.initialized) {
        const style = document.createElement('style');
        style.innerText = `* { user-select: none !important; -webkit-user-select: none !important; }`;
        document.head.appendChild(style);

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
