import {Plugin} from '@dnd-kit/abstract';
import {effect} from '@dnd-kit/state';

import {DragDropManager} from '../../manager/index.ts';
import {StyleInjector} from '../stylesheet/StyleInjector.ts';

const CSS_RULES =
  '* { user-select: none !important; -webkit-user-select: none !important; }';

export class PreventSelection extends Plugin<DragDropManager> {
  constructor(public manager: DragDropManager) {
    super(manager);

    const styleInjector = manager.registry.plugins.get(
      StyleInjector as any
    ) as StyleInjector | undefined;

    const unregisterStyles = styleInjector?.register(CSS_RULES);

    this.destroy = effect(() => {
      const {dragOperation} = this.manager;

      if (dragOperation.status.initialized) {
        removeSelection();
        document.addEventListener('selectionchange', removeSelection, {
          capture: true,
        });

        return () => {
          document.removeEventListener('selectionchange', removeSelection, {
            capture: true,
          });
        };
      }
    });

    if (unregisterStyles) {
      const originalDestroy = this.destroy.bind(this);
      this.destroy = () => {
        unregisterStyles();
        originalDestroy();
      };
    }
  }
}

function removeSelection() {
  document.getSelection()?.removeAllRanges();
}
