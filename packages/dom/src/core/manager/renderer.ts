import type {Renderer} from '@dnd-kit/abstract';
import {scheduler} from '@dnd-kit/dom/utilities';

function noop() {}

export const renderer: Renderer = {
  get rendering() {
    return scheduler.schedule(noop);
  },
};
