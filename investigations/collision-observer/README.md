# Collision observer investigation and redesign plan

Status: implemented. See [implementation and validation](IMPLEMENTATION.md) for the final behavior and verification. The diagnosis and plan below preserve the investigation that preceded implementation.

Investigated on `aa53b823` with the notifier from [PR #2101](https://github.com/clauderic/dnd-kit/pull/2101), commit `9be9b238e8337d75e168eeeef1b7777023fe691e`. The historical browser comparison substituted **only that notifier** into the baseline abstract package in memory. It did not compare unrelated historical builds or replace workspace source/build files. The current browser suite tests the implementation; compact historical results remain in `evidence.json`. The new root export in #2101 has no effect on these behavioral comparisons.

## Recommendation

Do not proceed with #2101's recent-target distance policy. It stops the measured loops, but introduces a measurable reversal delay in a real vertical sortable list.

Treat this as three connected problems:

1. **Update delivery:** collision computation, publication and target application can disagree or lose updates.
2. **Geometry used for decisions:** changing the layout or resizing feedback after a placement changes the evidence for that same placement.
3. **Eligibility:** a dragged container can target its own descendants.

Keep the public detector signatures, collision events, observer methods and package exports unchanged. Add no timeout, cooldown, minimum pointer distance, recent-target blacklist or direction-change delay. The proposed geometry work below is a design to prototype against these reproductions, not a claim that every custom detector/layout now has a proven stable solution.

## Reproductions created and verified

Seven stories and fourteen browser comparisons run the real pointer sensor, browser layout, React renderer, default collision detector and feedback. Twelve additional abstract tests isolate update delivery using real rectangles and package collision algorithms. These began as **characterization tests** describing the existing bugs. They have now been converted into regressions asserting the desired behavior and expanded with lifecycle, geometry, scrolling, and keyboard cases.

| Case                                                                 | Baseline result                                                                                   | With PR notifier                                                                    | What it isolates                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Auto-height columns; card 3; 20 inputs alternating by 1px in the gap | 20 alternating selections, 19 reversals after the first selection                                 | First selection remains stable                                                      | Target geometry changes its own ranking; no sortable plugin is required               |
| Same Kanban layout with item-level sortable targets                  | Settles on source `3`                                                                             | Stable, but retains target `1` because returning to source is suppressed            | A stable board is not necessarily an equivalent target state                          |
| Touching vertical sortable rows; reverse by 3px                      | Reorders back on the first reverse input                                                          | Reorders back only after reaching the 10px threshold from the earlier target change | Actual OptimisticSortingPlugin responsiveness regression                              |
| Nested lists adapted from #1524; child moved toward root             | Alternates between `root:canvas` and `item:B2` during 1px jitter; drag width alternates 254/300px | Repeated transfers suppressed                                                       | Feedback resizing changes which targets intersect, across different priorities        |
| Container dragged over its own nested children                       | Own descendants appear in candidates and become targets                                           | Same invalid candidates/targets                                                     | Independent structural eligibility failure                                            |
| Puck-style grid adapted from #1610                                   | Child transfers from nested to root, width 274→320px                                              | Same size transition exercised                                                      | Nested layout/resize control; this particular replay did not produce an endless cycle |
| Variable-size Puck-style blocks                                      | Size 320×260→274×156px exercised                                                                  | Same size transition exercised                                                      | Changes in both width and height; a control, not a separate confirmed endless cycle   |

The historical PRs were read and adapted to today's hooks and plugins: [#1610](https://github.com/clauderic/dnd-kit/pull/1610) supplied the Puck-style nested grid; [#1524](https://github.com/clauderic/dnd-kit/pull/1524) supplied recursive lists/root transfers and descendant eligibility. These are current-API reproductions, not exact historical checkouts. The nested stories add explicit root/children drop surfaces, deterministic sizing and trace instrumentation. A defensive application move guard prevents corrupting the tree while leaving invalid collisions visible. Nested stories handle moves themselves and prevent the optimistic fallback; the vertical control exercises the actual optimistic plugin.

### Run

From the repository root:

```sh
bun run build --filter='./packages/*'
bun test packages/abstract/tests/collision-observer-reproductions.test.ts
```

From `apps/stories`:

```sh
DND_BROWSER_CHANNEL=chrome bunx playwright test --config tests/collision-reproductions.config.ts
```

Omit `DND_BROWSER_CHANNEL=chrome` to use Playwright's installed Chromium. The config starts Storybook on port 6006 or reuses an existing server. The investigated environment used Chrome 152. These tests pace input with animation-frame barriers so rendering and measurement can settle; this is test observation, not proposed collision logic or a latency benchmark. The historical baseline and PR comparison used the same pacing and geometry.

Individual `collision-evidence.json` and `nested-collision-evidence.json` files are written beneath `apps/stories/test-results/collision-reproductions`. They contain pointer positions, ordered candidates, source and target geometry, and applied targets. Nested traces also contain group/tree changes and descendant flags. Instrumentation reads signals inside `untracked` and does not add dependencies to the notifier effect.

### Open manually

Run `bun run dev -- --ci --no-open` from `apps/stories`, then open:

- [Auto-height Kanban](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions--kanban&viewMode=story): drag 3 from its center to `(A.left + 231, A.top + 50)`, then alternate y by 1px. Both columns remain outside the pointer while overlapping the dragged shape.
- [Sortable Kanban control](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions--sortable-kanban&viewMode=story): repeat the same path with item targets.
- [Vertical reversal](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions--vertical-reversal&viewMode=story): drag 1 just into 2, continue slightly, then reverse across their shared edge.
- [Nested root transfer](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions-nested--nested-lists-root-transfer&viewMode=story): drag A1.2 toward the initial root append band's horizontal center and 75% height, then jitter y by 1px. The test measures that point before the drag and keeps it fixed as the layout moves.
- [Own descendants](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions-nested--own-descendant-exclusion&viewMode=story): drag A's handle over A1.2. The trace reports `invalid-own-descendant`.
- [Puck nested grid](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions-nested--puck-nested-grid&viewMode=story): 3a onto the lower part of 2, then back into 3.
- [Variable-size grid](http://localhost:6006/iframe.html?id=react-sortable-collision-reproductions-nested--variable-size-nested-grid&viewMode=story): tall item 2 into 3 and back out.

Use an iframe viewport of 1440×1100; the tall control uses 1440×1500 to stay away from auto-scroll activation. Reload the simple stories to reset; nested stories provide Reset layout. Live traces are available in `window.__collisionRepro.samples` and `window.__nestedCollisionTrace.events`. Test globals belong only to the stories, not the library API.

## What the evidence changes about the diagnosis

### Column ranking depends on the result of the previous selection

For the auto-height case, column A is initially 220×280px and B is 220×128px. After moving 3 into B, both are 220×204px. The source remains 188×64px.

The shape fallback computes intersection-over-union divided by distance to the **center** of the target. At the recorded gap point, B initially scores approximately `0.000998` versus A's `0.000516`. After reparenting, A scores `0.000784` versus B's `0.000636`. The 1px movement merely lets the new geometry be published. No scripted winning IDs were involved.

The comment in `packages/collision/src/algorithms/shapeIntersection.ts:24` says intersection area is avoided because it can cause cyclic collisions, but lines 30–34 still incorporate it through the intersection ratio. Both the area denominator and target center move when column height changes.

### Nested resizing changes candidate admission, not just scores

In the nested replay, a 254px-wide source shape misses B's right edge. Once placed at root it grows to 300px; its left edge reaches into B, so `item:B2` becomes a shape-intersection candidate. That item has normal priority, which outranks the root's lowest priority even though the pointer is in the root surface. Moving into B shrinks the source and removes the intersection, so root wins again.

The resize compensation can keep the pointer at the same relative place within the visual element and still cause this loop. The issue is not established to be incorrect offset arithmetic. `Feedback` writes the resized visual geometry into `dragOperation.shape` (`packages/dom/src/core/plugins/feedback/observers.ts:198–214`), and collision eligibility immediately depends on that result.

Changing the distance metric alone cannot fix this case: admission and priority change before numeric ranking matters. Reordering priorities globally would also alter explicit application policy; it is not part of this proposal.

### The PR suppresses legitimate movement

The real vertical test samples pointer offsets from the source's initial top:

| Offset                | 65  | 66  | 63  | 62  | 60  | 57  | 55  |
| --------------------- | --- | --- | --- | --- | --- | --- | --- |
| Baseline source index | 1   | 1   | 0   | 0   | 0   | 0   | 0   |
| PR source index       | 1   | 1   | 1   | 1   | 1   | 1   | 0   |

The first reverse input is 66→63. The PR waits until offset 55, ten pixels from the original target change at 65. Its history test does not ask whether a layout shift occurred, whether the pointer now directly intersects the candidate, or whether the current target remains appropriate. The old PR's description of this delay as imperceptible is not supported by this result.

### The observer/notifier also loses useful updates

The abstract characterizations confirm:

- Position-only movement does not invalidate default/pointer detection: the observer reads position untracked, and detector reads are untracked too. DOM feedback normally hides this by updating the drag shape.
- Stationary geometry changes run computation but may never publish it; disabling the selected droppable while another candidate exists can leave the disabled target selected.
- Disabling observation does not stop collision publication; it stops notifier handling. Enabling it does not replay skipped work because `isDisabled()` is untracked.
- A newer collision arriving while target rendering is pending can be lost after rendering settles.
- `forceUpdate(false)` only clears a coordinate sentinel. It schedules no recomputation and requires another dependency to change.
- External retargeting to the source can survive later collision updates because equality compares only the last candidate ID sequence. This action is used by optimistic sorting, so the redesign must model its purpose rather than simply force the raw winner repeatedly.
- Concatenating IDs makes `[a, bc]` equal `[ab, c]`, and numeric `1` equal string `"1"`.

The DOM path also has existing 50ms scroll invalidation and 75ms position-observer throttling. They are not proposed remedies; their interaction with correctness should be removed from the critical path for known input/placement changes.

## Proposed implementation plan

### 1. Make input, measurement and placement explicit internal stages

Introduce internal revisions for the drag generation, input/transform, geometry/eligibility, and the applied placement. Capture which revisions a collision pass used. Read the current position explicitly, even if the drag shape did not change.

Keep `computeCollisions(entries?, detector?)` synchronous and side-effect-free with its existing signature. Collect measurement data before publishing results or dispatching events. Do not allow per-droppable update order to mix old and new rectangles in an automatically published decision following a known placement.

Preserve real entity/operation identity for custom detectors. Do not implement snapshots by shallow-cloning class instances, proxying private getters, or temporarily replacing reactive shapes on live entities. Snapshot numeric data for built-in calculations; custom detectors keep their existing inputs. Registry/type/priority/acceptance changes must invalidate the relevant pass too.

Known placement changes should refresh affected geometry at the renderer's actual commit boundary. An existing render promise is a synchronization boundary, not a new delay. Pointer input over coherent geometry remains eligible in its existing processing turn; do not add a frame wait before evaluating it.

### 2. Make notifier application reliable and idempotent

Replace the loose internal disable/set-target/enable sequence with owned transaction state. Keep the existing public enable/disable behavior available, but internal sorting/notifying/keyboard operations must not accidentally resume one another's work. Use scoped ownership and generation checks around asynchronous completions; clear state on cancel, reset and destroy.

While application is suspended, retain the latest dirty input and geometry revisions. After the relevant commit and measurements, reconcile once against that latest state. Do not replay every obsolete intermediate pointer position, and do not require a fresh pointer event to recover a skipped update. Dropping immediately after a move must resolve the latest valid decision.

Separate “this placement decision was consumed” from “these IDs appeared previously.” Compare typed IDs and actual applied decision state; an optimistic source retarget is an acknowledgment of a placement, not a reason to permanently ignore that winner or immediately apply the same placement again. A new input may legitimately revisit the same candidate. Preserve collision prevention, dragover prevention, keyboard target ownership, and dragstart-before-dragover ordering.

Do not ship removal of the old coordinate guard on its own. Reliable geometry-driven delivery can expose an uninterrupted layout loop unless the geometry work below lands with it.

### 3. Prototype stable geometry for default shape fallback

Address both measured causes independently, then combine them:

**A. Stop whole-target area/center changes from steering gap affinity.** For the rectangular default shape fallback, retain intersection eligibility and existing priority/type ordering, but prototype ranking by distance from the pointer to the nearest relevant point on the target boundary. In the Kanban replay those distances stay 11px to A and 21px to B while their heights change. No recent-target memory or minimum movement is needed to make that comparison stable.

This is a deliberate change to default affinity, not a claim that nearest-boundary distance solves all layouts. Explicitly test ties, overlap, very large targets, zero distance, rotated/scaled geometry and non-rectangular shapes. Do not silently substitute a bounding box for arbitrary custom-shape semantics. Leave custom detector value semantics intact.

**B. Separate collision footprint from destination-driven visual resizing.** The visual can resize to fit its destination without that placement immediately changing the footprint used to discover a different destination. Prototype a logical query footprint derived from the drag's established geometry plus the resolved input/modifier/frame transform; destination placeholder resizing alone must not create a new collision candidate.

Prefer deriving this internal default query from existing drag geometry and resolved transforms while preserving the public operation and custom detector inputs. If internal bookkeeping is needed, keep it private: no new required options, exported configuration knob or wrapper objects. The implementation spike must verify this works across package bundles without introducing a second state/geometry identity.

Define rebasing explicitly for genuine content/size changes, external layout changes, scrolling, scaling, iframes and modifiers. Do not freeze every rectangle for the entire drag, ignore all changes occurring during rendering, or equate elapsed time with causality. A known placeholder/feedback resize can be identified at its write site; unrelated changes remain real invalidations. Preserving the public live shape while changing only the built-in query is preferable to silently changing what custom detectors observe.

Keep pointer-intersection and single-list insertion paths responsive. The 3px reversal control is a release gate for every variant. A change that stabilizes Kanban but delays that reversal is rejected.

If this combination fails cases where placement moves the actual contact boundaries, investigate projected geometry for the affected sortable layout next. That must model placement contribution rather than freeze the entire board or add a bigger threshold. The current tests establish two concrete mechanisms; they are not a proof covering arbitrary layout feedback.

### 4. Enforce structural eligibility in the DOM layer

Exclude strict descendants of the canonical dragged subtree before collision ranking. Preserve sortable self-targets, which optimistic sorting uses. Use the source/placeholder/proxy relationship rather than the detached visual clone to determine ownership. Reparenting must not briefly make a source eligible for its own children.

Share this eligibility rule across automatic pointer computation and the keyboard plugin's explicit `computeCollisions` calls. Keep abstract droppables independent of DOM ancestry and honor existing accept/disabled rules. Add portal, shadow-root and frame cases before claiming containment works across all those contexts.

This fixes the descendant reproduction independently of ranking stabilization. The story's defensive tree-move guard should remain a demonstration of application robustness, not become the library's collision solution.

### 5. Make measurement efficient without introducing a correctness delay

Use explicit invalidation sources: input, scroll/frame transforms, registry/eligibility changes, and known placement/feedback writes. Batch affected measurements and publish a coherent set; do not recompute all candidates once per individual droppable callback.

For an input-only pass with current geometry, reuse measurements and run selection immediately. For a known placement, refresh the affected source/target groups and relevant ancestors when the renderer commits. Keep dirty work until it is consumed. `forceUpdate(true)` should still evaluate synchronously; the deferred form should request actual work rather than merely arm a sentinel. Scroll must update a stationary pointer's target without relying on the next accidental rectangle notification.

Measure detector calls and rectangle reads before introducing indexes/caches. The current reproduction tests do not establish performance or timing budgets. Correctness must not depend on waiting for the 50/75ms timer paths to fire.

### 6. Turn reproductions into release gates

First replace `CURRENT` assertions with the desired invariants. Then extend the suite before shipping:

| Dimension      | Required checks                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stability      | Stationary pointer; 0.25/1px jitter; monotonic travel through the contested region; direct and repeated reversals; two- and three-target cycles                        |
| Responsiveness | First reverse input reorders immediately where baseline does; touching rows, ordinary gaps, unequal heights, horizontal/RTL lists and grids; no fixed travel threshold |
| Real changes   | Manual/automatic scrolling with stationary pointer, viewport/content resize, target removal/disable/accept changes, new empty container                                |
| Rendering      | Controlled and optimistic sorting; input during a pending render; different measurement delivery orders; multiple nested commits; cancel/drop/destroy while pending    |
| Geometry       | Clone/move/overlay feedback, source and destination resizing, scale/modifiers, table sizing, frames and reduced-motion/default animations                              |
| Compatibility  | Original custom detector instances and inputs, custom priorities/types, preventDefault handlers, numeric/string IDs, keyboard sorting and source retargeting           |
| Cost           | One coherent decision per relevant input/revision; bounded affected measurements; compare read/call counts with baseline                                               |

Run the existing sortable browser suites across framework adapters as the implementation reaches those layers. Assert public declaration/export compatibility against the baseline. Retain the original PR comparison as historical evidence, not a runtime mode.

## Decisions and limits

- The recommended starting point is **reliable observer/notifier transactions plus stable default query geometry**, with descendant exclusion in parallel. Neither a notifier-only threshold nor a metric-only change covers the measured cases.
- Coherent snapshots and revision numbers prevent stale/reentrant work; they do not, by themselves, make an unstable affinity function stable.
- Do not gate new input on `winner(previousPointer, newGeometry) === winner(currentPointer, newGeometry)`. Equal winners in a changed layout do not prove a reversal is unintentional, particularly with unequal item sizes.
- Preserve custom priority ordering. The nested example shows why a new shape candidate can defeat a pointer candidate; swapping those ordering rules globally would be a separate behavior decision.
- There is no general way for the current generic detector API to distinguish two indistinguishable observations caused by user layout logic versus arbitrary external mutation. Promise the measured cases and explicit invariants; do not claim universal convergence for custom detectors that intentionally change their winner after every placement.
- The key implementation decisions still requiring a spike are logical-footprint rebasing and its private integration with default algorithms, plus ties/overlaps for boundary-based affinity. The reproduction suite makes those experiments falsifiable without accepting a loss in vertical-list responsiveness.

## Historical validation before implementation

The compact [measured results](evidence.json) include each scenario's target sequence, source sizes or sortable indices, and the path to its complete browser trace.

- All ten buildable packages built from the baseline.
- Abstract suite: 38 passed, including 12 new geometry/lifecycle characterizations.
- Browser suite: 14 passed, seven scenarios against each notifier.
- Targeted TypeScript check and formatting for the new stories and browser harness passed.
- At this investigation stage, no production source, public exports, dependencies, changesets or PR contents had changed. Subsequent implementation is documented separately.
