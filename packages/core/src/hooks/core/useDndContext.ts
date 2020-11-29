import {useContext} from 'react';
import {Context} from '../../store';

export function useDndContext() {
  return useContext(Context);
}
