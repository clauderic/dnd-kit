interface Arguments {
  element: Element;
  keyframes: PropertyIndexedKeyframes | Keyframe[];
  options: KeyframeAnimationOptions;
}

export function animateTransform({element, keyframes, options}: Arguments) {
  return element.animate(keyframes, options).finished;
}
