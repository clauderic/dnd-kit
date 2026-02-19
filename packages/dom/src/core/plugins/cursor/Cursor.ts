import {Plugin} from '@dnd-kit/abstract';

import {DragDropManager} from '../../manager/index.ts';
import {StyleInjector} from '../stylesheet/StyleInjector.ts';

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

    const {cursor = 'grabbing'} = options ?? {};
    const styleInjector = manager.registry.plugins.get(
      StyleInjector as any
    ) as StyleInjector | undefined;

    const unregisterStyles = styleInjector?.register(
      `* { cursor: ${cursor} !important; }`
    );

    if (unregisterStyles) {
      const originalDestroy = this.destroy.bind(this);
      this.destroy = () => {
        unregisterStyles();
        originalDestroy();
      };
    }
  }
}
