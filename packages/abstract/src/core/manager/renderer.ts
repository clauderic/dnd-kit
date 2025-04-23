/**
 * Interface for handling visual feedback during drag operations.
 *
 * @remarks
 * Implementations of this interface are responsible for managing
 * the visual state of dragged elements and ensuring smooth animations.
 */
export interface Renderer {
  /**
   * Gets a promise that resolves when the current rendering operation is complete.
   *
   * @returns A promise that resolves when rendering is finished
   */
  get rendering(): Promise<void>;
}

/**
 * Default renderer implementation.
 *
 * @remarks
 * This implementation immediately resolves rendering promises,
 * making it suitable for environments where custom rendering
 * is not required or handled externally.
 */
export const defaultRenderer: Renderer = {
  get rendering() {
    return Promise.resolve();
  },
};
