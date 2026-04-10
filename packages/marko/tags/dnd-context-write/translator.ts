/**
 * Translator for <dnd-context-write manager=manager/>.
 *
 * Fires during drag-drop-provider.marko's compilation (translate phase).
 * At that point scopeIdentifier = the provider's own scope variable.
 *
 * Injects a RENDER statement (not effect) bound to the manager's reactive
 * bindings:
 *
 *   scope["#ClosestBranch"]["__dnd_manager"] = manager;
 *
 * Render statements execute during signal propagation ($input phase),
 * which is BEFORE the effects phase. This guarantees the manager is on
 * the branch before any consumer tag's onMount or onUpdate fires.
 *
 * The tag is fully removed after injection.
 */

import {types as t} from '@marko/compiler';
import {addStatement} from '@marko/runtime-tags/translator/util/signals';
import {getSection} from '@marko/runtime-tags/translator/util/sections';
import {isOutputDOM} from '@marko/runtime-tags/translator/util/marko-config';
import {scopeIdentifier} from '@marko/runtime-tags/translator/visitors/program';

const CLOSEST_BRANCH = '#ClosestBranch';
const DND_MANAGER_KEY = '__dnd_manager';

export function enter(_tag: t.NodePath<t.MarkoTag>): void {
  // No-op: all work is in exit.
}

export function exit(tag: t.NodePath<t.MarkoTag>): void {
  if (!isOutputDOM()) {
    // SSR: DnD is client-only. No context writing needed for HTML output.
    tag.remove();
    return;
  }

  const section = getSection(tag);

  // Find the `manager` attribute value expression and its reactive bindings.
  const managerAttr = tag.node.attributes.find(
    (a): a is t.MarkoAttribute =>
      t.isMarkoAttribute(a) && a.name === 'manager'
  );

  if (!managerAttr) {
    throw tag.buildCodeFrameError(
      '[dnd-kit/marko] <dnd-context-write> requires a `manager` attribute.'
    );
  }

  const managerExpr = managerAttr.value as t.Expression;
  const referencedBindings = (managerExpr as any).extra?.referencedBindings;

  // Generate: scope["#ClosestBranch"]["__dnd_manager"] = manager
  const statement = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        t.memberExpression(
          scopeIdentifier,
          t.stringLiteral(CLOSEST_BRANCH),
          true /* computed */
        ),
        t.stringLiteral(DND_MANAGER_KEY),
        true /* computed */
      ),
      managerExpr
    )
  );

  // RENDER type: executes during signal propagation (input phase), not effects.
  // This ensures manager is on the branch before any consumer effects run.
  addStatement('render', section, referencedBindings, statement);

  tag.remove();
}
