import {useContext} from 'react';
import {Context} from '../../store';

export function useDraggableContext() {
  return useContext(Context);
}
