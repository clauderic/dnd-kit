import { Modifier, type DragOperation } from '@dnd-kit/abstract'
import type { DragDropManager } from '@dnd-kit/dom'
import { getEventCoordinates } from '@dnd-kit/utilities'

export class SnapCenterToCursor extends Modifier<DragDropManager> {
  apply({ shape, transform, activatorEvent }: DragOperation) {
    if (!activatorEvent || !shape) {
      return transform
    }
    const activatorCoordinates = getEventCoordinates(activatorEvent)
    if (!activatorCoordinates) {
      return transform
    }

    const { initial, current } = shape
    const { left, top } = initial.boundingRectangle
    const { height, width } = current.boundingRectangle

    const offsetX = activatorCoordinates.x - left
    const offsetY = activatorCoordinates.y - top

    return {
      ...transform,
      x: transform.x + offsetX - width / 2,
      y: transform.y + offsetY - height / 2,
    }
  }
}
