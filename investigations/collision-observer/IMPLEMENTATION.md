# Collision observer implementation

Implemented after the [reproduction and review](README.md). Application options, detector signatures, event shapes, package exports, and the generic `Plugin` class are unchanged. Promises returned directly from action-owned `dragmove` and `dragover` listeners now contribute to action completion. This is a behavioral extension, documented below. There is no timeout, cooldown, pointer-distance threshold, recent-target blacklist, or direction-change delay in the collision policy.

## Behavior

| Case                                                                     | Result                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Auto-height Kanban, stationary pointer and 1px jitter                    | Stable target; no repeated column transfers                                    |
| Moving through the Kanban gap and reversing across its affinity boundary | Target changes on the first half-pixel reversal                                |
| Touching vertical rows, 66→63px pointer reversal                         | Reorders on that first reverse input                                           |
| Repeated 65→63→65→63px reversals                                         | Source index follows 1→0→1→0, with no intervening forward input required       |
| Nested-to-root transfer that resizes visual feedback                     | Stable placement; the visual still resizes                                     |
| Puck root card at the moving container edge                              | No repeated transfers while the pointer is stationary                          |
| Dragging a container over its children                                   | Strict descendants excluded before ranking; sortable self-target remains valid |
| Scroll with stationary pointer                                           | New target selected in the scroll event's microtask turn                       |
| Input received during a pending render                                   | Latest input reconciled after the owned work completes                         |
| Three accepted keyboard commands, then drop during a pending render      | All three commands finish before drag end                                      |

## Observer and notifier

The observer explicitly subscribes to position, resolved transform, live shape, registry membership, IDs, eligibility, detectors, priorities, and target shapes. Automatic computation is coalesced into a microtask after the reactive batch, instead of recomputing for every individual rectangle write and then suppressing publication solely because the pointer stayed still. `forceUpdate(true)` remains synchronous; `forceUpdate(false)` now schedules actual computation.

The notifier reconciles published results against the actual target. Collision IDs retain their number/string distinction. A completed target action records the collision result produced by its committed layout, paired with the actual target and input revision. Measuring that result again cannot request another placement. Sorting can also acknowledge placement through its existing source retarget. The next input can revisit the same candidate immediately, and a later independent change of candidate is still actionable. Input that arrived while an earlier placement was still rendering is not consumed by that earlier acknowledgment.

Collision selection and action completion have separate private state. The observer keeps computing the latest geometry and input; the notifier defers applying another target while accepted actions are finishing. Public `enable()` and `disable()` remain an idempotent boolean switch. Reentrant collision listeners can prevent, stop, disable, retarget, or invalidate a decision.

## Action completion

`setDropTarget()` already returns a completion promise. It now covers work returned by that action's `dragover` listeners, the renderer captured during dispatch, and any render started before those handlers settle. Every sibling handler finishes before a rejection is reported. A nested target action waits only for its own handlers and renderer; it never waits for the parent action or a global set of jobs. A same-target acknowledgment resolves immediately instead of joining itself.

`move()` retains its existing queued default position write. Returning an asynchronous handler does not delay that write or replay old movement when the promise settles. A handler that consumes movement must prevent the default before the queued write. The action remains pending until its default write, returned work, and rendering finish. Normal drop drains accepted actions and reconciles final collisions before taking its snapshot; new movement is refused after stop is requested. Cancellation remains immediate, and stale completions cannot release a later operation's work.

Optimistic sorting returns its placement work and source acknowledgment from an ordinary `Plugin` event handler. The DOM renderer boundary measures the committed layout before action completion; sortable plugins do not collect affected rows or old/new ancestors. The abstract action layer sequences relative input before dispatch, owns queued commands immediately, and discards undispatched commands on cancellation. Absolute pointer input bypasses that queue. Keyboard handlers return one promise per command and await only their own target action; they maintain no private input queue. They update position as part of that original input, so no privileged continuation or second synthetic `dragmove` is needed.

Pending tasks are guarded against cancellation, replacement, and destruction by a private abstract utility. That utility depends only on abstract drag state and `AbortController`; its lifetime and plugin-completion tests live in abstract. DOM sorting bundles include the helper through a build-time source import. It has no shared module state, no runtime source-file dependency, and no public export or new `Plugin` member.

A private DOM core plugin adapts the existing renderer so its completion includes geometry measurement. The same behavior covers ordinary asynchronous monitor listeners, including move handlers, without a sortable-specific task wrapper.

There is no collision-specific plugin subclass, observer capability, shared collision-event gate, public transaction API, or cross-package access to private state. Abstract code knows only actions, events, returned promises, and rendering. DOM ownership and measurement stay in the DOM package.

### Compatibility boundary

Completion tracking applies to promises returned **directly to the monitor** while an action dispatches `dragmove` or `dragover`. Synchronous listeners and non-promise return values keep their behavior. Other events remain notifications. A detached asynchronous task that is not returned is not owned by the action. Existing framework callback wrappers are unchanged; wrappers that discard return values do not acquire asynchronous completion semantics automatically.

A direct asynchronous listener can therefore postpone subsequent target application or normal drop for as long as its returned work takes. Pointer position and raw detection remain live; cancellation does not wait. This replaces previously ignored promise results with an explicit completion meaning. It is a deliberate behavioral change, not a guarantee that arbitrary asynchronous application callbacks cannot stall completion.

The existing `renderer` property remains assignable with the same type. On a DOM manager, reading it returns a memoized adapter whose `rendering` promise includes measurement. Saving and restoring that renderer does not stack adapters or discard the underlying render wait, but its object identity differs from the assigned renderer. Abstract rendering remains platform independent.

Relative input listeners are dispatched in command order after the previous command completes, so each sees its committed position. Keyboard input now dispatches one `dragmove` per original command, without an extra synthetic event for position compensation. Consumers still receive the original event and final drop position.

## Geometry policy

Default detection still prefers pointer containment and retains existing priority/type ordering. Its rectangular shape fallback translates the drag's initial footprint by the current resolved modifier transform. Destination-driven visual resizing therefore cannot introduce another destination into that fallback query.

The footprint's dimensions are established once per drag, or when shape history is explicitly reset. This is a deliberate default-policy choice: changing source content size mid-drag also leaves those query dimensions unchanged. Target geometry remains live. The public `dragOperation.shape.current` remains live as well, and explicit `shapeIntersection` or custom detectors receive it without a wrapper, cloned entity, or temporary operation mutation. Custom shapes, including rectangle subclasses with different intersection semantics, keep their own geometry operations.

For rectangular targets, shape-intersection scores now use distance to the nearest boundary instead of intersection-over-union divided by distance to the target center. A column growing taller cannot reverse affinity merely by changing its area or center when its nearby edge stays in place. Positive intersection remains necessary; finite scores handle zero distance. Nonrectangular targets retain center-distance ranking and exact shape eligibility.

Initial dimensions and resolved translation use the existing global coordinate space. Existing browser cases cover transformed elements, overlays, host/iframe transfers, transformed iframes, and table sizing. Dynamic iframe scaling or arbitrary source-shape rebasing during a drag is not newly modeled by this change.

## Measurement and cost

DOM rendering refreshes connected, eligible targets in one batch after the underlying renderer settles, including controlled application layouts. Concurrent reads ready together share a measurement pass. A later read measures again so writes made by asynchronous handlers after the first render are included. Target actions and asynchronous move actions await a final render after their returned handlers settle; they do not wait on unrelated actions or a global queue. Cancellation, source replacement, and destruction make stale measurements inert. This replaces sortable-specific affected-target tracking and the separate placement revision loop. Scroll refreshes current geometry directly and no longer waits on the old 50ms collision invalidation timer. Ancestor animation measurements also query the current animation list and project newly pending animations immediately; a cached list could mix a container's final position with its children's animated positions.

An input-only collision pass reuses target measurements. Each completed DOM render or scroll performs a refresh across n registered targets; action completion may require both an initial and final render pass. This is O(n) target refresh calls per pass, with animation-query and DOM-read costs additional; it does not maintain a spatial index or attempt to infer which arbitrary application layouts moved. Existing generic position-observer throttling remains for unrelated browser layout observation, but known placement and scroll correctness do not depend on that timer.

A focused comparison using 20 targets and 20 separate synchronous rectangle updates measured **400 detector calls on the baseline and 20 with this implementation**. Regression tests also check one pass for a reactive measurement batch, coalesced input, and repeated deferred force-update requests. This measures redundant scans, not general browser throughput or a latency benchmark. Animation projection now reads the live animation list for each measurement; that cost is outside this detector-call comparison.

## Validation

- All ten buildable packages built, including declaration generation.
- 200 abstract, collision, DOM, and sorting unit tests passed after integration with current main (`8b9e1add`).
- 13 collision browser regressions and 6 nested-collection story cases passed.
- 34 existing React browser cases passed, including horizontal/vertical sorting, keyboard, multiple lists, empty columns, cancellation, scrolling, tables, transforms, overlays, and iframes.
- 18 existing sortable browser cases passed across Vue, Solid, and Svelte.
- Targeted TypeScript and formatting checks passed.
- Public exports and method/event signatures remain unchanged; the DOM `accepts` override retains its existing inherited signature.

The renderer-boundary refactor and nested story reran package builds, unit tests, collision regressions, broader React compatibility, framework sortable cases, and targeted type/format checks.

The nested-collection story at `React/Sortable/Nested collections/Example` is a finished board with recursive collections, card transfers, empty groups, root reordering, keyboard reversal, cancellation, and reset. It uses the normal collision detectors and explicit type acceptance: cards sort against cards; collections sort against collection headers; both can enter collection contents. Its tree update guards against cycles. All eight diagnostic stories remain available. Light, dark, and 390px layouts were visually inspected.

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

The Puck follow-up reproduced continuous transfers at two container-edge positions while the pointer remained stationary. Correcting animation measurement alone still left a two-layout cycle; recording the action's resulting collision before reopening notification stopped it. The regressions check the stationary loop, not a general promise of stable placement under arbitrary pointer jitter across moving contact boundaries.

This fixes the measured auto-height, feedback-resize, and Puck container-edge loops and the delivery/eligibility failures that accompanied them. It does not prove convergence for arbitrary application layouts or custom detectors that deliberately change winners after each placement. Completed placement geometry is consumed at its originating input revision; fresh input remains actionable. Arbitrary asynchronous layout work detached from action completion, or a custom detector changing winners independently after completion, is not a convergence guarantee.
