---
"@dnd-kit/core": minor
---

Added more flexibility for the `distance` and `tolerance` activation constraints. Consumers can still provide a `number` to calculate the distance or tolerance constraints, but can now also pass in an object that adheres to the `DistanceMeasurement` interface instead. This change allows consumers to specify which axis the activation distance or tolerance should be measured against, either `x`, `y` or both.

```
type DistanceMeasurement =
  | number
  | {x: number}
  | {y: number}
  | {x: number, y: number}

interface DistanceConstraint {
  distance: DistanceMeasurement;
}

interface DelayConstraint {
  delay: number;
  tolerance: DistanceMeasurement;
}
```

**Example usage:**

For example, when building a list that can only be sorted vertically when using the `restrictToVerticalAxis` modifier, a consumer can now configure sensors to only measure distance against the `y` axis when using the `MouseSensor`, and afford more tolerance on the `y` axis than the `x` axis for the `TouchSensor`:

```
const sensors = useSensors(
  useSensor(MouseSensor, {
    activationConstraint: {
      distance: { y: 10 },
    },
  }),
  useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: { y: 15, x: 5 },
    },
  }),
);
```

This also fixes a bug with the way the distance is calculated when passing a number to the `distance` or `tolerance` options. Previously, the sum of the distance on both the `x` and `y` axis was being calculated rather than the hypothenuse.
