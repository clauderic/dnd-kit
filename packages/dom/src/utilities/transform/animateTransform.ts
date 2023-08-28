import {Styles} from '../styles/index.js';
import {getWindow} from '../execution-context/index.js';

interface Arguments {
  element: Element;
  keyframes: PropertyIndexedKeyframes | Keyframe[];
  options: KeyframeAnimationOptions;
  onReady?(): void;
  onFinish?(): void;
}
export function animateTransform({
  element,
  keyframes,
  options,
  onReady,
  onFinish,
}: Arguments) {
  const styles = new Styles(element);
  const {transitionProperty} = getWindow(element).getComputedStyle(element);

  const properties = transitionProperty.split(', ');

  // styles.set({
  //   'transition-property': properties.length
  //     ? properties
  //         .filter(
  //           (property) =>
  //             !property.includes('transform') && !property.includes('translate')
  //         )
  //         .join(', ')
  //     : 'none',
  // });

  onReady?.();

  element.animate(keyframes, options).finished.then(() => {
    onFinish?.();
    styles.reset();
  });
}
