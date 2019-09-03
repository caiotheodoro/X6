import { detector } from './detector'
import { isAncestorNode } from '../util'
import { Graph } from '../core'
import { Shape } from '../shape'
import { CellState } from '../core/cell-state'
import { DomEvent } from './dom-event'

export class CustomMouseEvent {
  e: MouseEvent
  state: CellState | null
  consumed: boolean = false

  /**
   * The x-coordinate of the event in the graph.
   */
  graphX: number

  /**
   * The y-coordinate of the event in the graph.
   */
  graphY: number

  constructor(e: MouseEvent, state?: CellState | null) {
    this.e = e
    this.state = state || null
  }

  getEvent() {
    return this.e
  }

  getSource() {
    return DomEvent.getSource(this.e) as HTMLElement
  }

  isSource(shape: Shape | null) {
    if (shape != null) {
      return isAncestorNode(shape.elem as HTMLElement, this.getSource())
    }

    return false
  }

  getClientX() {
    return DomEvent.getClientX(this.e)
  }

  getClientY() {
    return DomEvent.getClientY(this.e)
  }

  getGraphX() {
    return this.graphX
  }

  getGraphY() {
    return this.graphY
  }

  getState() {
    return this.state
  }

  getCell() {
    const state = this.getState()
    return state ? state.cell : null
  }

  isPopupTrigger() {
    return DomEvent.isPopupTrigger(this.e)
  }

  isConsumed() {
    return this.consumed
  }

  consume(preventDefault?: boolean) {
    const shouldPreventDefault = preventDefault != null
      ? preventDefault
      : DomEvent.isMouseEvent(this.e)

    if (shouldPreventDefault && this.e.preventDefault) {
      this.e.preventDefault()
    }

    // Workaround for images being dragged in IE
    // Does not change returnValue in Opera
    if (detector.IS_IE) {
      this.e.returnValue = true
    }

    this.consumed = true
  }
}

export namespace CustomMouseEvent {
  /**
	 * Redirects the mouse events from the given DOM node to the graph
	 * dispatch loop using the event and given state as event arguments.
	 */
  export function redirectMouseEvents(
    elem: HTMLElement | SVGElement,
    graph: Graph,
    state: CellState | ((e: MouseEvent) => CellState) | null,
    onMouseDown?: ((e: MouseEvent) => any) | null,
    onMouseMove?: ((e: MouseEvent) => any) | null,
    onMouseUp?: ((e: MouseEvent) => any) | null,
    onDblClick?: ((e: MouseEvent) => any) | null,
  ) {
    const getState = (e: MouseEvent) => {
      return (typeof state === 'function') ? state(e) : state
    }

    DomEvent.addMouseListeners(
      elem,
      (e: MouseEvent) => {
        if (onMouseDown) {
          onMouseDown(e)
        } else if (!DomEvent.isConsumed(e)) {
          graph.fireMouseEvent(
            DomEvent.MOUSE_DOWN,
            new CustomMouseEvent(e, getState(e)),
          )
        }
      },
      (e: MouseEvent) => {
        if (onMouseMove) {
          onMouseMove(e)
        } else if (!DomEvent.isConsumed(e)) {
          graph.fireMouseEvent(
            DomEvent.MOUSE_MOVE,
            new CustomMouseEvent(e, getState(e)),
          )
        }
      },
      (e: MouseEvent) => {
        if (onMouseUp) {
          onMouseUp(e)
        } else if (!DomEvent.isConsumed(e)) {
          graph.fireMouseEvent(
            DomEvent.MOUSE_UP,
            new CustomMouseEvent(e, getState(e)),
          )
        }
      },
    )

    DomEvent.addListener(elem, 'dblclick', (e: MouseEvent) => {
      if (onDblClick) {
        onDblClick(e)
      } else if (!DomEvent.isConsumed(e)) {
        const state = getState(e)
        graph.eventManager.dblClick(e, state ? state.cell : null)
      }
    })
  }
}
