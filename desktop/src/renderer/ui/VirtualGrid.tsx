import { type ReactNode, type UIEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { StudyCard } from '@shared/study-cards'

type VirtualGridProps = {
  total: number
  resetKey: string
  getItem: (index: number) => StudyCard | undefined
  requestRange: (from: number, to: number) => void
  renderItem: (card: StudyCard) => ReactNode
  renderPlaceholder: () => ReactNode
}

const MIN_COLUMN_WIDTH = 215
const GAP_X = 20
const GAP_Y = 24
const PAD_X = 32
const PAD_Y = 28
const FOOTER_HEIGHT = 34
const OVERSCAN_ROWS = 2
const MAX_SCROLL_HEIGHT = 15_000_000

type Viewport = {
  width: number
  height: number
  scrollTop: number
}

export const VirtualGrid = ({ total, resetKey, getItem, requestRange, renderItem, renderPlaceholder }: VirtualGridProps) => {
  const scroller = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0, scrollTop: 0 })

  useLayoutEffect(() => {
    const element = scroller.current
    if (!element) {
      return
    }
    const measure = () =>
      setViewport({ width: element.clientWidth, height: element.clientHeight, scrollTop: element.scrollTop })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = 0
    }
    setViewport((value) => ({ ...value, scrollTop: 0 }))
  }, [resetKey])

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setViewport((value) => ({ ...value, scrollTop })))
  }

  const innerWidth = Math.max(0, viewport.width - PAD_X * 2)
  const columns = Math.max(1, Math.floor((innerWidth + GAP_X) / (MIN_COLUMN_WIDTH + GAP_X)))
  const columnWidth = (innerWidth - GAP_X * (columns - 1)) / columns
  const tileHeight = (columnWidth * 2) / 3 + FOOTER_HEIGHT
  const rowHeight = tileHeight + GAP_Y
  const rows = Math.ceil(total / columns)
  const contentHeight = rows > 0 ? PAD_Y * 2 + rows * rowHeight - GAP_Y : 0
  const physicalHeight = Math.min(contentHeight, MAX_SCROLL_HEIGHT)
  const scrollRange = Math.max(1, physicalHeight - viewport.height)
  const scale = contentHeight > physicalHeight ? (contentHeight - viewport.height) / scrollRange : 1
  const logicalTop = viewport.scrollTop * scale
  const firstRow = Math.max(0, Math.floor((logicalTop - PAD_Y) / rowHeight) - OVERSCAN_ROWS)
  const lastRow = Math.min(rows - 1, Math.ceil((logicalTop + viewport.height - PAD_Y) / rowHeight) + OVERSCAN_ROWS)

  useEffect(() => {
    if (viewport.width > 0 && rows > 0) {
      requestRange(firstRow * columns, (lastRow + 1) * columns - 1)
    }
  }, [firstRow, lastRow, columns, rows, viewport.width, requestRange])

  const rowElements: ReactNode[] = []
  if (viewport.width > 0) {
    for (let row = firstRow; row <= lastRow; row += 1) {
      const cells: ReactNode[] = []
      for (let column = 0; column < columns; column += 1) {
        const index = row * columns + column
        if (index >= total) {
          break
        }
        const card = getItem(index)
        cells.push(card ? renderItem(card) : <li key={`placeholder-${index}`}>{renderPlaceholder()}</li>)
      }
      rowElements.push(
        <ul
          key={row}
          className="absolute grid"
          style={{
            top: viewport.scrollTop + PAD_Y + row * rowHeight - logicalTop,
            left: PAD_X,
            width: innerWidth,
            height: tileHeight,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            columnGap: GAP_X,
          }}
        >
          {cells}
        </ul>,
      )
    }
  }

  return (
    <div ref={scroller} onScroll={handleScroll} className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="relative" style={{ height: physicalHeight }}>
        {rowElements}
      </div>
    </div>
  )
}
