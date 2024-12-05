import {DragOperation} from '@dnd-kit/abstract';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';
import {Group, Node, Root} from './NestedLists.tsx';

export function deepMove<T extends Root = Root>(
  root: T,
  operation: DragOperation
): T {
  const {source, target} = operation;
  if (!source || !target) return root;

  const sourceGroupId = source.data.group;
  const targetGroupId = target.data.group;

  console.debug(
    `Moving ${source.id} from ${sourceGroupId} to ${target.id} in ${targetGroupId}`
  );

  if (sourceGroupId === targetGroupId && source.id === target.id) {
    return root;
  }

  if (source.id === targetGroupId) {
    return root;
  }

  const clone = cloneDeep(root);

  // Helper function to find a group by its ID
  function findGroup(node: Node, groupId: string): Root | Group | null {
    if (node.type === 'group' || node.type === 'root') {
      if (node.id === groupId) {
        return node;
      }

      for (const child of node.items) {
        const result = findGroup(child, groupId);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  // Find the source group
  const sourceGroup = findGroup(clone, sourceGroupId);
  if (!sourceGroup) {
    throw new Error(`Source group ${sourceGroupId} not found`);
  }

  // Find and remove the source item from the source group
  const sourceIndex = sourceGroup.items.findIndex(
    (item) => item.id === source.id
  );
  if (sourceIndex === -1) {
    throw new Error(
      `Source item ${source.id} not found in group ${sourceGroupId}`
    );
  }
  const [sourceItem] = sourceGroup.items.splice(sourceIndex, 1);

  if (!targetGroupId) {
    if (target.type === 'root') {
      clone.items.splice(clone.items.length, 0, sourceItem);
    } else if (target.type === 'group') {
      const targetGroup = findGroup(clone, target.id as string);

      if (!targetGroup) {
        throw new Error(`Target group ${target.id} not found`);
      }

      targetGroup.items.splice(targetGroup.items.length, 0, sourceItem);
    }

    return clone;
  }

  // Find the target group
  const targetGroup = findGroup(clone, targetGroupId);
  if (!targetGroup) {
    return root;
  }

  // Find the index of the target item in the target group
  const targetIndex = targetGroup.items.findIndex(
    (item) => item.id === target.id
  );

  if (targetIndex === -1) {
    throw new Error(
      `Target item ${target.id} not found in group ${targetGroupId}`
    );
  }

  const position = operation.position.current;

  let isBelowTarget = false;

  // Because of the nested nature of groups and cards, we need to use special positioning logic
  if (target.shape) {
    if (targetGroupId === 'root') {
      if (target.type === 'group') {
        isBelowTarget = position.x < target.shape.center.x;
      } else {
        isBelowTarget = position.x > target.shape.center.x;
      }
    } else {
      if (target.type === 'group') {
        isBelowTarget = position.y < target.shape.center.y;
      } else {
        isBelowTarget = position.y > target.shape.center.y;
      }
    }
  }

  targetGroup.items.splice(
    isBelowTarget ? targetIndex : targetIndex + 1,
    0,
    sourceItem
  );

  return clone;
}
