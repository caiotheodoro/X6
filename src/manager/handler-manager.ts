import { Graph, CellState } from '../core'
import { BaseManager } from './manager-base'
import {
  TooltipHandler,
  ConnectionHandler,
  SelectionHandler,
  GraphHandler,
  PanningHandler,
  PopupMenuHandler,
  NodeHandler,
  EdgeHandler,
  ElbowEdgeHandler,
  EdgeSegmentHandler,
} from '../handler'
import { EdgeStyle } from '../stylesheet'

export class HandlerManager extends BaseManager {
  private inited: boolean = false

  constructor(graph: Graph) {
    super(graph)
    this.initHandlers()
  }

  private initHandlers() {
    if (this.inited) {
      return
    }

    this.inited = true

    this.graph.tooltipHandler = this.createTooltipHandler()
    this.graph.disableTooltips()

    this.graph.selectionHandler = this.createSelectionHandler()

    this.graph.connectionHandler = this.createConnectionHandler()
    this.graph.disableConnection()

    this.graph.graphHandler = this.createGraphHandler()

    this.graph.panningHandler = this.createPanningHandler()
    this.graph.panningHandler.disablePanning()

    this.graph.popupMenuHandler = this.createPopupMenuHandler()
  }

  protected createTooltipHandler() {
    return (this.hooks.createTooltipHandler != null &&
      this.hooks.createTooltipHandler(this.graph) ||
      new TooltipHandler(this.graph)
    )
  }

  protected createConnectionHandler() {
    return (this.hooks.createConnectionHandler != null &&
      this.hooks.createConnectionHandler(this.graph) ||
      new ConnectionHandler(this.graph)
    )
  }

  protected createSelectionHandler() {
    return (this.hooks.createSelectionHandler != null &&
      this.hooks.createSelectionHandler(this.graph) ||
      new SelectionHandler(this.graph)
    )
  }

  protected createGraphHandler() {
    return (this.hooks.createGraphHandler != null &&
      this.hooks.createGraphHandler(this.graph) ||
      new GraphHandler(this.graph)
    )
  }

  protected createPanningHandler() {
    return (this.hooks.createPanningHandler != null &&
      this.hooks.createPanningHandler(this.graph) ||
      new PanningHandler(this.graph)
    )
  }

  protected createPopupMenuHandler() {
    return (this.hooks.createPopupMenuHandler != null &&
      this.hooks.createPopupMenuHandler(this.graph) ||
      new PopupMenuHandler(this.graph)
    )
  }

  createCellHandler(state: CellState | null) {
    if (state != null) {
      if (this.model.isEdge(state.cell)) {
        const sourceState = state.getVisibleTerminalState(true)
        const targetState = state.getVisibleTerminalState(false)
        const geo = this.graph.getCellGeometry(state.cell)

        const edgeStyle = this.view.getEdgeFunction(
          state, geo != null ? geo.points : null, sourceState!, targetState!,
        )
        return this.createEdgeHandler(state, edgeStyle)
      }

      return this.createNodeHandler(state)
    }

    return null
  }

  protected createNodeHandler(state: CellState) {
    return (this.hooks.createNodeHandler != null &&
      this.hooks.createNodeHandler(this.graph, state) ||
      new NodeHandler(this.graph, state)
    )
  }

  protected createEdgeHandler(state: CellState, edgeStyle: any) {
    let result = null

    if (
      edgeStyle === EdgeStyle.loop ||
      edgeStyle === EdgeStyle.elbowConnector ||
      edgeStyle === EdgeStyle.sideToSide ||
      edgeStyle === EdgeStyle.topToBottom) {
      result = this.createElbowEdgeHandler(state)
    } else if (
      edgeStyle === EdgeStyle.segmentConnector ||
      edgeStyle === EdgeStyle.orthConnector
    ) {
      result = this.createEdgeSegmentHandler(state)
    } else {
      return (this.hooks.createEdgeHandler != null &&
        this.hooks.createEdgeHandler(this.graph, state) ||
        new EdgeHandler(this.graph, state)
      )
    }

    return result
  }

  protected createEdgeSegmentHandler(state: CellState) {
    return (this.hooks.createEdgeSegmentHandler != null &&
      this.hooks.createEdgeSegmentHandler(this.graph, state) ||
      new EdgeSegmentHandler(this.graph, state)
    )
  }

  protected createElbowEdgeHandler(state: CellState) {
    return (this.hooks.createElbowEdgeHandler != null &&
      this.hooks.createElbowEdgeHandler(this.graph, state) ||
      new ElbowEdgeHandler(this.graph, state)
    )
  }
}
