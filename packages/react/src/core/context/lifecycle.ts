import {Component} from 'react';
import type {CleanupFunction} from '@dnd-kit/state';
import {DragDropManager} from '@dnd-kit/dom';
import {timeout} from '@dnd-kit/dom/utilities';

export class Lifecycle extends Component<{manager: DragDropManager}> {
  private initialized = false;
  private clearTimeout: CleanupFunction | undefined;

  componentDidMount() {
    this.clearTimeout?.();
    this.clearTimeout = timeout(() => (this.initialized = true), 25);
  }

  componentWillUnmount() {
    if (!this.initialized) return;
    this.props.manager.destroy();
  }

  render() {
    return null;
  }
}
