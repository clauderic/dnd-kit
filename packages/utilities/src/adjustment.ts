function createAdjustmentFn(modifier: number) {
  return <T extends Record<U, number>, U extends string>(
    object: T,
    ...adjustments: Partial<T>[]
  ): T => {
    return adjustments.reduce<T>(
      (accumulator, adjustment) => {
        const entries = Object.entries(adjustment) as [U, number][];

        for (const [key, valueAdjustment] of entries) {
          const value = accumulator[key];

          if (value != null) {
            accumulator[key] = (value + modifier * valueAdjustment) as T[U];
          }
        }

        return accumulator;
      },
      {
        ...object,
      }
    );
  };
}

export const add = createAdjustmentFn(1);
export const subtract = createAdjustmentFn(-1);
