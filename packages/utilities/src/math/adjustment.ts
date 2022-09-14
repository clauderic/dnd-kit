export function createAdjustmentFunction(modifier: number) {
  return <T extends Record<string, number>>(
    object: T,
    ...adjustments: Partial<T>[]
  ): T => {
    return adjustments.reduce<T>(
      (accumulator, adjustment) => {
        const entries = Object.entries(adjustment) as [keyof T, number][];

        for (const [key, valueAdjustment] of entries) {
          const value = accumulator[key];

          if (value != null) {
            accumulator[key] = (value +
              modifier * valueAdjustment) as T[keyof T];
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
