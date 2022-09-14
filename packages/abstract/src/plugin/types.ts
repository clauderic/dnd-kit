import type {DragDropManager} from '../manager';
import type {Plugin} from './plugin';

export interface PluginConstructor<
  U extends DragDropManager<any, any> = DragDropManager<any, any>,
  T extends Plugin<U> = Plugin<U>
> {
  new (...args: any): T;
}
