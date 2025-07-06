import {useEffect} from 'react';

export function createVanillaStory(story: () => () => void) {
  return function Story() {
    useEffect(story, []);

    return null;
  };
}
