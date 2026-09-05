import {afterEach, describe, expect, it} from 'bun:test';
import {
  CollisionPriority,
  CollisionType,
  DragDropManager,
  Droppable,
  Modifier,
} from '@dnd-kit/abstract';
import {Rectangle, type Shape} from '@dnd-kit/geometry';
import {
  defaultCollisionDetection,
  pointerIntersection,
  shapeIntersection,
} from '@dnd-kit/collision';

const managers: DragDropManager<any, any>[] = [];
afterEach(() => managers.splice(0).forEach((manager) => manager.destroy()));

function setup(shape = new Rectangle(180, 20, 100, 60)) {
  const manager = new DragDropManager();
  managers.push(manager);
  const {dragOperation} = manager;
  dragOperation.position.reset({x: 231, y: 50});
  dragOperation.shape = shape;
  const target = (id: string, shape: Shape) => {
    const droppable = new Droppable(
      {id, register: false, collisionDetector: defaultCollisionDetection},
      manager
    );
    droppable.shape = shape;
    return {droppable, dragOperation};
  };
  return {manager, dragOperation, target};
}

describe('Default collision geometry', () => {
  it('keeps gap affinity when auto-height columns gain and lose children', () => {
    const {target} = setup();
    const a = target('A', new Rectangle(0, 0, 220, 280));
    const b = target('B', new Rectangle(252, 0, 220, 128));
    const before = [
      defaultCollisionDetection(a)!,
      defaultCollisionDetection(b)!,
    ];
    expect(before[0].value).toBeGreaterThan(before[1].value);

    a.droppable.shape = new Rectangle(0, 0, 220, 204);
    b.droppable.shape = new Rectangle(252, 0, 220, 204);
    expect([
      defaultCollisionDetection(a),
      defaultCollisionDetection(b),
    ]).toEqual(before);
  });

  it('has finite scores at zero distance and equal scores for equidistant edges', () => {
    const {target} = setup(new Rectangle(0, 0, 400, 100));
    const a = target('A', new Rectangle(0, 0, 220, 100));
    const b = target('B', new Rectangle(242, 0, 1000, 10000));
    expect(shapeIntersection(a)!.value).toBe(shapeIntersection(b)!.value);
    const overlap = target('overlap', new Rectangle(200, 0, 100, 100));
    expect(shapeIntersection(overlap)!.value).toBe(1);
  });

  it('still requires positive intersection area, including at touching edges', () => {
    const {target} = setup(new Rectangle(180, 20, 40, 60));
    expect(
      shapeIntersection(target('touch', new Rectangle(220, 0, 10, 100)))
    ).toBeNull();
    expect(
      shapeIntersection(target('empty', new Rectangle(200, 20, 0, 60)))
    ).toBeNull();
  });

  it('keeps pointer containment and priority unchanged', () => {
    const {target} = setup();
    const input = target('inside', new Rectangle(220, 0, 20, 100));
    expect(defaultCollisionDetection(input)).toEqual(
      pointerIntersection(input)
    );
    expect(defaultCollisionDetection(input)!.priority).toBe(
      CollisionPriority.High
    );
    expect(defaultCollisionDetection(input)!.type).toBe(
      CollisionType.PointerIntersection
    );
  });

  it('destination resizing changes the visual but does not admit a new default candidate', () => {
    const {dragOperation, target} = setup(new Rectangle(200, 20, 40, 60));
    const input = target('left', new Rectangle(100, 0, 90, 100));
    expect(defaultCollisionDetection(input)).toBeNull();
    const resized = new Rectangle(160, 20, 120, 60);
    dragOperation.shape = resized;
    expect(defaultCollisionDetection(input)).toBeNull();
    expect(shapeIntersection(input)).not.toBeNull();
    expect(dragOperation.shape!.current).toBe(resized);
  });

  it('moves the established footprint on the first subpixel input', () => {
    const {dragOperation, target} = setup(new Rectangle(200, 20, 40, 60));
    const input = target('left', new Rectangle(100, 0, 100, 100));
    expect(defaultCollisionDetection(input)).toBeNull();
    dragOperation.position.current = {x: 230.75, y: 50};
    expect(defaultCollisionDetection(input)).not.toBeNull();
    dragOperation.position.current = {x: 231, y: 50};
    expect(defaultCollisionDetection(input)).toBeNull();
  });

  it('uses the resolved modifier transform and global scaled dimensions', () => {
    const initial = new Rectangle(200, 20, 40, 60);
    initial.scale = {x: 2, y: 2};
    const {manager, dragOperation, target} = setup(initial);
    class Offset extends Modifier {
      apply() {
        return {x: -20, y: 0};
      }
    }
    dragOperation.modifiers = [new Offset(manager)];
    const input = target('left', new Rectangle(100, 0, 100, 100));
    expect(defaultCollisionDetection(input)).not.toBeNull();
    expect(dragOperation.shape!.initial).toBe(initial);
    expect(initial.boundingRectangle.left).toBe(200);
    expect(initial.scale).toEqual({x: 2, y: 2});
  });

  it('rebases the footprint when shape history is explicitly reset', () => {
    const {dragOperation, target} = setup(new Rectangle(200, 20, 40, 60));
    const input = target('left', new Rectangle(100, 0, 90, 100));
    expect(defaultCollisionDetection(input)).toBeNull();
    dragOperation.shape = null;
    dragOperation.shape = new Rectangle(160, 20, 120, 60);
    expect(defaultCollisionDetection(input)).not.toBeNull();
  });

  it('preserves custom shape semantics and identities instead of using their bounds', () => {
    const {dragOperation, target} = setup();
    let received: Shape | undefined;
    class CustomShape extends Rectangle {
      intersectionArea(other: Shape) {
        received = other;
        return 0;
      }
    }
    const shape = new CustomShape(0, 0, 400, 100);
    dragOperation.shape = null;
    dragOperation.shape = shape;
    const input = target('A', new Rectangle(0, 0, 220, 100));
    expect(defaultCollisionDetection(input)).toBeNull();
    expect(Object.is(received, input.droppable.shape)).toBe(true);
    expect(dragOperation.shape!.current).toBe(shape);
  });
});
