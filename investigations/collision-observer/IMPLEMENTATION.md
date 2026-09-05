# Collision observer implementation

Implemented after the [reproduction and review](README.md). Application options, detector signatures, and event shapes are unchanged. Plugin authors gain the exported `CollisionPlugin` subclass and its protected `beginCollisionTransaction()` extension point; this is an additive API change. The generic `Plugin` class is unchanged. There is no timeout, cooldown, pointer-distance threshold, recent-target blacklist, or direction-change delay in the collision policy.

## Behavior

| Case                                                                     | Result                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Auto-height Kanban, stationary pointer and 1px jitter                    | Stable target; no repeated column transfers                                    |
| Moving through the Kanban gap and reversing across its affinity boundary | Target changes on the first half-pixel reversal                                |
| Touching vertical rows, 66→63px pointer reversal                         | Reorders on that first reverse input                                           |
| Repeated 65→63→65→63px reversals                                         | Source index follows 1→0→1→0, with no intervening forward input required       |
| Nested-to-root transfer that resizes visual feedback                     | Stable placement; the visual still resizes                                     |
| Dragging a container over its children                                   | Strict descendants excluded before ranking; sortable self-target remains valid |
| Scroll with stationary pointer                                           | New target selected in the scroll event's microtask turn                       |
| Input received during a pending render                                   | Latest input reconciled after the owned work completes                         |
| Three accepted keyboard commands, then drop during a pending render      | All three commands finish before drag end                                      |

## Observer and notifier

The observer explicitly subscribes to position, resolved transform, live shape, registry membership, IDs, eligibility, detectors, priorities, and target shapes. Automatic computation is coalesced into a microtask after the reactive batch, instead of recomputing for every individual rectangle write and then suppressing publication solely because the pointer stayed still. `forceUpdate(true)` remains synchronous; `forceUpdate(false)` now schedules actual computation.

The notifier reconciles published results against the actual target. Collision IDs retain their number/string distinction. A source retarget used by sorting acknowledges a consumed placement at a particular input revision. Measuring that placement again cannot replay it; the next input can revisit the same candidate immediately. Input that arrived while an earlier placement was still rendering is not consumed by that earlier acknowledgment.

Target writes, controlled DOM measurements, optimistic sorting, and accepted keyboard commands hold independent internal leases. Public `enable()` and `disable()` remain an idempotent boolean switch; releasing an internal lease cannot enable a caller's disabled observer. New input is retained until all relevant work completes. Generation checks and idempotent release prevent stale render completions from affecting a later drag. Reentrant collision listeners can prevent, stop, disable, retarget, or invalidate a decision.

Normal drop drains the latest accepted input and owned placement work before taking the terminal snapshot. Cancellation remains immediate. A lease-scoped continuation lets an already accepted keyboard command finish its position compensation while stopping; unrelated moves cannot change that pending drop.

The abstract `CollisionPlugin` subclass owns the transaction contract through its protected `beginCollisionTransaction()` method. It returns `release()` and `run(callback)` operations backed by the same internal state used by abstract target actions and terminal reconciliation. The abstract implementation has no knowledge of platform-specific consumers. Sortable plugins extend this specialized class and inject transaction acquisition into their helper; measurement and element ownership remain in the DOM package. Required geometry measurement uses a core wrapper around its collision plugin so application plugin replacement cannot remove it. Sortable plugins remain removable. There is no symbol lookup, observer augmentation, private-module import across packages, or silent fallback for incompatible versions. The workspace releases these packages together.

Plugins acquire a transaction before deferring accepted work, check operation validity before continuing, and release it in `finally` and on destruction. Transactions are independent and releases are idempotent. Abstract-only regression tests exercise this contract without importing a platform package, including overlapping ownership, live detection, pending drop completion, cancellation, stale continuations, exception handling, external disabling, and separate managers.

## Geometry policy

Default detection still prefers pointer containment and retains existing priority/type ordering. Its rectangular shape fallback translates the drag's initial footprint by the current resolved modifier transform. Destination-driven visual resizing therefore cannot introduce another destination into that fallback query.

The footprint's dimensions are established once per drag, or when shape history is explicitly reset. This is a deliberate default-policy choice: changing source content size mid-drag also leaves those query dimensions unchanged. Target geometry remains live. The public `dragOperation.shape.current` remains live as well, and explicit `shapeIntersection` or custom detectors receive it without a wrapper, cloned entity, or temporary operation mutation. Custom shapes, including rectangle subclasses with different intersection semantics, keep their own geometry operations.

For rectangular targets, shape-intersection scores now use distance to the nearest boundary instead of intersection-over-union divided by distance to the target center. A column growing taller cannot reverse affinity merely by changing its area or center when its nearby edge stays in place. Positive intersection remains necessary; finite scores handle zero distance. Nonrectangular targets retain center-distance ranking and exact shape eligibility.

Initial dimensions and resolved translation use the existing global coordinate space. Existing browser cases cover transformed elements, overlays, host/iframe transfers, transformed iframes, and table sizing. Dynamic iframe scaling or arbitrary source-shape rebasing during a drag is not newly modeled by this change.

## Measurement and cost

Known placement commits refresh eligible DOM targets in one batch after the renderer settles, including controlled application layouts. A revision loop retains a newer placement that arrives while an older commit is pending. Optimistic sorting also refreshes its affected groups and ancestor containers before releasing ownership. Scroll refreshes current geometry directly and no longer waits on the old 50ms collision invalidation timer.

An input-only collision pass reuses target measurements. A placement or scroll currently performs an O(n) eligible-target refresh; it does not maintain a spatial index or attempt to infer which arbitrary application layouts moved. Existing generic position-observer throttling remains for unrelated browser layout observation, but known placement and scroll correctness do not depend on that timer.

A focused comparison using 20 targets and 20 separate synchronous rectangle updates measured **400 detector calls on the baseline and 20 with this implementation**. Regression tests also check one pass for a reactive measurement batch, coalesced input, and repeated deferred force-update requests. This measures redundant scans, not general browser throughput or a latency benchmark.

## Validation

- All ten buildable packages built, including declaration generation.
- 187 abstract, collision, DOM, and sorting unit tests passed after integration with current main (`8b9e1add`).
- 11 collision browser regressions passed.
- 34 existing React browser cases passed, including horizontal/vertical sorting, keyboard, multiple lists, empty columns, cancellation, scrolling, tables, transforms, overlays, and iframes.
- 18 existing sortable browser cases passed across Vue, Solid, and Svelte.
- Targeted TypeScript and formatting checks passed.
- Declarations include the additive `CollisionPlugin` export and its protected transaction contract. The generic `Plugin` class is unchanged. The DOM `accepts` override retains its existing inherited signature; application inputs are unchanged.

The specialized-subclass follow-up reran all package builds, 187 unit tests, the 11 collision browser regressions, and targeted type/format checks. The broader React and framework compatibility runs above preceded that follow-up. A preliminary browser run timed out awaiting animation frames while the target remained stable; the complete subclass regression run passed without changing the test.

Browser validation used installed Chrome with the Storybook development servers. Some initial runs were interrupted by development-server dependency optimization/reloading; clean runs above completed after it settled. The table checks initially could not load because the already-declared `@tanstack/react-table` dependency was absent locally. Restoring that dependency required no manifest or lockfile changes.

Run the focused regressions from the repository root:

```sh
bun run build --filter='./packages/*'
bun test packages/abstract/tests packages/collision/tests packages/dom/tests packages/dom/src/sortable/plugins/__tests__
```

Then from `apps/stories`:

```sh
DND_BROWSER_CHANNEL=chrome bunx playwright test --config tests/collision-reproductions.config.ts
```

The current browser suite writes full traces under `apps/stories/test-results/collision-reproductions`. The [historical evidence](evidence.json) preserves the original baseline/PR comparison; the [implementation evidence](implementation-evidence.json) records the current outcomes.

## Limits

Structural exclusion follows DOM ownership, including shadow roots and accessible frames; it cannot infer logical parentage for children rendered into unrelated portals.

This fixes the measured auto-height and feedback-resize loops and the delivery/eligibility failures that accompanied them. It does not prove convergence for arbitrary application layouts or custom detectors that deliberately change winners after each placement. If a placement moves the actual contact boundary across the pointer, that is different from the area/center and footprint-resize mechanisms reproduced here; no generic detector can infer its cause from geometry alone.
