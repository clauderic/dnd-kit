export type CleanupFunction = () => void;

export type Effect = () => CleanupFunction | void;
