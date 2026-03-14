import React, { useRef, useEffect } from "react"

interface Line {
  points: number[]
}

interface Props {
  imageUrl: string
  width: number
  height: number
  lines: Line[]
  setLines: (lines: Line[]) => void
  isDrawing: boolean
}

export function MaskCanvas({
  imageUrl,
  width,
  height,
  lines,
  setLines,
  isDrawing
}: Props) {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.src = imageUrl

    img.onload = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      ctx.strokeStyle = "red"
      ctx.lineWidth = 5
      ctx.lineCap = "round"

      lines.forEach((line) => {
        ctx.beginPath()

        for (let i = 0; i < line.points.length; i += 2) {
          const x = line.points[i]
          const y = line.points[i + 1]

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.stroke()
      })
    }
  }, [lines, imageUrl, width, height])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    drawing.current = true

    const { x, y } = getPos(e)

    setLines([...lines, { points: [x, y] }])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return

    const { x, y } = getPos(e)

    const updated = [...lines]
    const last = updated[updated.length - 1]

    last.points = [...last.points, x, y]

    setLines(updated)
  }

  const handleMouseUp = () => {
    drawing.current = false
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: width,
        height: height,
        cursor: "crosshair"
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}
