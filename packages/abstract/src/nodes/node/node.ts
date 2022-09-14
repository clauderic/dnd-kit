import {Shape} from '@dnd-kit/geometry';
import {reactive} from '@dnd-kit/state';
import type {UniqueIdentifier} from '@dnd-kit/types';

import type {Data} from './types';

export interface Input<T extends Data = Data> {
  id: UniqueIdentifier;
  data?: T | null;
  disabled?: boolean;
}

export class Node<T extends Data = Data> {
  constructor(input: Input<T>) {
    const {id, data = null, disabled = false} = input;

    this.id = id;
    this.data = data;
    this.disabled = disabled;
  }

  @reactive
  id: UniqueIdentifier;

  @reactive
  data: Data | null;

  @reactive
  disabled: boolean;

  @reactive
  public shape: Shape | null = null;
}
