// MaskCanvas.tsx - Framer Compatible Version
// Replaced react-konva with native HTML5 Canvas (Framer doesn't support react-konva)

import React, { useRef, useEffect, useCallback } from "react"

interface MaskCanvasProps {
  imageUrl: string
  width: number
  height: number
  lines: any[]
  setLines: (lines: any[]) => void
  isDrawing: boolean
}

export const MaskCanvas: React.FC<MaskCanvasProps> = ({
  imageUrl,
  width,
  height,
  lines,
  setLines,
  isDrawing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  // Draw everything on canvas whenever lines or image change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    // Draw background image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)

      // Draw all lines on top
      lines.forEach((line) => {
        if (!line.points || line.points.length < 2) return
        ctx.beginPath()
        ctx.strokeStyle = "#10b981"
        ctx.lineWidth = 20
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalAlpha = 0.6
        ctx.moveTo(line.points[0], line.points[1])
        for (let i = 2; i < line.points.length; i += 2) {
          ctx.lineTo(line.points[i], line.points[i + 1])
        }
        ctx.stroke()
        ctx.globalAlpha = 1
      })
    }
    img.src = imageUrl
  }, [imageUrl, width, height, lines])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    isDrawingRef.current = true
    const pos = getPos(e)
    setLines([...lines, { points: [pos.x, pos.y] }])
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !isDrawing) return
    const pos = getPos(e)
    const updatedLines = [...lines]
    const lastLine = { ...updatedLines[updatedLines.length - 1] }
    lastLine.points = [...lastLine.points, pos.x, pos.y]
    updatedLines[updatedLines.length - 1] = lastLine
    setLines(updatedLines)
  }

  const handleMouseUp = () => {
    isDrawingRef.current = false
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ cursor: isDrawing ? "crosshair" : "default", display: "block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    />
  )
}
