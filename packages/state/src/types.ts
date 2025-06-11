import type {effect} from '@preact/signals-core';

export type CleanupFunction = () => void;

export type Effect = Parameters<typeof effect>[0];
