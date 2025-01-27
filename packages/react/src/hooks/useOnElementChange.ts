import {useRef} from 'react';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';
import {useIsomorphicLayoutEffect} from '@dnd-kit/react/hooks';

export function useOnElementChange(
  value: RefOrValue<Element>,
  onChange: (value: Element | undefined) => void
) {
  const previous = useRef(currentValue(value));

  useIsomorphicLayoutEffect(() => {
    const current = currentValue(value);

    if (current !== previous.current) {
      previous.current = current;
      onChange(current);
    }
  });
}
