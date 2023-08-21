export interface Renderer {
  get rendering(): Promise<void>;
}

export const defaultRenderer: Renderer = {
  get rendering() {
    return Promise.resolve();
  },
};
