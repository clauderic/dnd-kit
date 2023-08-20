export interface Transition {
  /**
   * The duration of the transition in milliseconds.
   * @default 250
   */
  duration?: number;
  /**
   * The easing function to use for the transition.
   * @default 'ease-in-out'
   */
  easing?: string;
}
