import React from 'react';

type TransitionState<T extends string | number> = [
  phase: Phase,
  value: T,
  changeEnd: () => void
];

type Phase = 'idle' | 'beforeAnimation' | 'duringAnimation' | 'afterAnimation';

type State<T> = {
  phase: Phase;
  value: T;
  count: number;
};

export function useTransitionalChange<T extends string | number>(
  inputValue: T,
  disabled: boolean
): TransitionState<T> {
  const theValue = React.useRef(inputValue);
  const prevValue = React.useRef(inputValue);

  const [phaseAndValue, setPhaseAndValue] = React.useState<State<T>>({
    phase: 'idle',
    value: inputValue,
    count: 0,
  });

  const {phase: phaseAndValuePhase, count: phaseAndValueCount} = phaseAndValue;

  React.useLayoutEffect(() => {
    if (inputValue !== theValue.current) {
      prevValue.current = theValue.current;
      theValue.current = inputValue;
    }
  }, [inputValue]);

  // Trigger the chain
  React.useLayoutEffect(() => {
    setPhaseAndValue((currPhaseAndValue) => {
      if (
        disabled &&
        (currPhaseAndValue.phase !== 'idle' ||
          currPhaseAndValue.value !== theValue.current)
      ) {
        return {
          phase: 'idle',
          value: theValue.current,
          count: currPhaseAndValue.count,
        };
      }

      return currPhaseAndValue;
    });

    return afterNextPaint(() => {
      setPhaseAndValue((currPhaseAndValue) => {
        if (
          !disabled &&
          currPhaseAndValue.phase === 'idle' &&
          prevValue.current !== inputValue
        ) {
          return {
            phase: 'beforeAnimation',
            value: prevValue.current,
            count: currPhaseAndValue.count + 1,
          };
        }

        return currPhaseAndValue;
      });
    });
  }, [inputValue, disabled]);

  React.useEffect(() => {
    return afterNextPaint(() => {
      let update;

      if (phaseAndValuePhase === 'beforeAnimation') {
        update = {
          phase: 'duringAnimation',
          value: theValue.current,
          count: phaseAndValueCount,
        } as const;
      }

      if (phaseAndValuePhase === 'afterAnimation') {
        update = {
          phase: 'idle',
          value: theValue.current,
          count: phaseAndValueCount,
        } as const;
      }

      if (update) {
        setPhaseAndValue(update);
      }
    });
  }, [phaseAndValuePhase, phaseAndValueCount, disabled, phaseAndValue]);

  const changeEnd = React.useCallback(function changeEnd() {
    setPhaseAndValue((o) => {
      const {phase, value, count} = o;
      if (phase === 'duringAnimation') {
        return {
          phase: 'afterAnimation',
          value,
          count,
        };
      }

      return o;
    });
  }, []);

  return [phaseAndValue.phase, phaseAndValue.value, changeEnd];
}

/**
 * Ensure dom commit for transitions
 */
function afterNextPaint(cb: () => void) {
  let handler = window.requestAnimationFrame(() => {
    handler = window.requestAnimationFrame(() => cb());
  });
  return function cancel() {
    window.cancelAnimationFrame(handler);
  };
}
