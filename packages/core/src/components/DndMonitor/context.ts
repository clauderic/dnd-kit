import {createContext} from 'react';

import type {RegisterListener} from './types';

export const DndMonitorContext = createContext<RegisterListener | null>(null);
