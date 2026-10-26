import React, { useRef, useEffect, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';
import type { Stroke, StrokeTool, EditorMode } from '../../types/notebook';
import { useNotebookStore } from '../../store/useNotebookStore';

interface DrawingCanvasProps {
  width: number;
  height: number;
  strokes: Stroke[];
  editorMode: EditorMode;
  drawingTool: StrokeTool;
  strokeColor: string;
  strokeSize: number;
  isVertical: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  strokes,
  editorMode,
  drawingTool,
  strokeColor,
  strokeSize,
  isVertical,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const activePointsRef = useRef<[number, number, number][]>([]);
  const activeStrokeIdRef = useRef<string | null>(null);

  const { addStroke, removeStrokes, extendPageHeight } = useNotebookStore();

  // Helper to render any stroke or geometric shape to canvas context
  const drawStrokeToContext = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
      // Geometric Shape: Rectangle
      if (stroke.tool === 'rectangle') {
        if (stroke.points.length < 2) return;
        const [p0, p1] = stroke.points;
        const x = Math.min(p0[0], p1[0]);
        const y = Math.min(p0[1], p1[1]);
        const w = Math.abs(p1[0] - p0[0]);
        const h = Math.abs(p1[1] - p0[1]);
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineJoin = 'round';
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
        return;
      }

      // Geometric Shape: Circle / Ellipse
      if (stroke.tool === 'circle') {
        if (stroke.points.length < 2) return;
        const [p0, p1] = stroke.points;
        const cx = (p0[0] + p1[0]) / 2;
        const cy = (p0[1] + p1[1]) / 2;
        const rx = Math.abs(p1[0] - p0[0]) / 2;
        const ry = Math.abs(p1[1] - p0[1]) / 2;
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Geometric Shape: Triangle
      if (stroke.tool === 'triangle') {
        if (stroke.points.length < 2) return;
        const [p0, p1] = stroke.points;
        const minX = Math.min(p0[0], p1[0]);
        const maxX = Math.max(p0[0], p1[0]);
        const minY = Math.min(p0[1], p1[1]);
        const maxY = Math.max(p0[1], p1[1]);
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo((minX + maxX) / 2, minY);
        ctx.lineTo(maxX, maxY);
        ctx.lineTo(minX, maxY);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        return;
      }

      // Freehand Pen or Highlighter (using perfect-freehand)
      const isHighlighter = stroke.tool === 'highlighter';
      const outline = getStroke(stroke.points, {
        size: stroke.size,
        thinning: isHighlighter ? 0 : 0.6,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: true,
      });

      if (outline.length === 0) return;

      ctx.save();
      if (isHighlighter) {
        ctx.globalAlpha = 0.45;
        ctx.globalCompositeOperation = 'multiply';
      } else {
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = stroke.color;

      ctx.beginPath();
      ctx.moveTo(outline[0][0], outline[0][1]);
      for (let i = 1; i < outline.length; i++) {
        ctx.lineTo(outline[i][0], outline[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    []
  );

  // Redraw all committed strokes to offscreen canvas
  const redrawCommittedStrokes = useCallback(() => {
    const dpr = window.devicePixelRatio || 1;
    let offscreen = offscreenCanvasRef.current;
    if (!offscreen) {
      offscreen = document.createElement('canvas');
      offscreenCanvasRef.current = offscreen;
    }

    offscreen.width = Math.floor(width * dpr);
    offscreen.height = Math.floor(height * dpr);

    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.setTransform(1, 0, 0, 1, 0, 0);
    offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
    offCtx.scale(dpr, dpr);

    for (const stroke of strokes) {
      drawStrokeToContext(offCtx, stroke);
    }

    // Paint offscreen to visible canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreen, 0, 0);
  }, [width, height, strokes, drawStrokeToContext]);

  useEffect(() => {
    redrawCommittedStrokes();
  }, [redrawCommittedStrokes]);

  // Handle pointer down (drawing or erasing)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (editorMode === 'type' || editorMode === 'move') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    if (editorMode === 'draw') {
      isDrawingRef.current = true;
      activeStrokeIdRef.current = 'stroke-' + crypto.randomUUID();

      const isShape = drawingTool === 'rectangle' || drawingTool === 'circle' || drawingTool === 'triangle';
      if (isShape) {
        activePointsRef.current = [
          [x, y, 1],
          [x, y, 1],
        ];
      } else {
        activePointsRef.current = [[x, y, pressure]];
      }
    } else if (editorMode === 'erase') {
      isDrawingRef.current = true;
      eraseAtPoint(x, y);
    }
  };

  // Eraser hit-testing for both freehand strokes and shapes
  const eraseAtPoint = (x: number, y: number) => {
    const eraserRadius = 20;
    const toRemove: string[] = [];

    for (const stroke of strokes) {
      // If geometric shape: check bounding box or endpoints
      if (stroke.tool === 'rectangle' || stroke.tool === 'circle' || stroke.tool === 'triangle') {
        if (stroke.points.length >= 2) {
          const [p0, p1] = stroke.points;
          const minX = Math.min(p0[0], p1[0]) - eraserRadius;
          const maxX = Math.max(p0[0], p1[0]) + eraserRadius;
          const minY = Math.min(p0[1], p1[1]) - eraserRadius;
          const maxY = Math.max(p0[1], p1[1]) + eraserRadius;
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            toRemove.push(stroke.id);
            continue;
          }
        }
      }

      // Freehand stroke points check
      for (const [px, py] of stroke.points) {
        const distSq = (px - x) * (px - x) + (py - y) * (py - y);
        if (distSq <= eraserRadius * eraserRadius) {
          toRemove.push(stroke.id);
          break;
        }
      }
    }

    if (toRemove.length > 0) {
      removeStrokes(toRemove);
    }
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;

    if (editorMode === 'erase') {
      eraseAtPoint(x, y);
      return;
    }

    if (editorMode === 'draw') {
      const isShape = drawingTool === 'rectangle' || drawingTool === 'circle' || drawingTool === 'triangle';

      if (isShape) {
        activePointsRef.current = [activePointsRef.current[0], [x, y, 1]];
      } else {
        activePointsRef.current.push([x, y, pressure]);
      }

      // Check vertical auto-extend
      if (isVertical && y > height - 200) {
        extendPageHeight(350);
      }

      // Render live active stroke/shape over cached offscreen canvas
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext('2d');
      const offscreen = offscreenCanvasRef.current;

      if (ctx && offscreen) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreen, 0, 0);

        ctx.scale(dpr, dpr);
        drawStrokeToContext(ctx, {
          id: 'temp',
          tool: drawingTool,
          color: strokeColor,
          size: strokeSize,
          points: activePointsRef.current,
        });
      }
    }
  };

  // Handle pointer up
  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (editorMode === 'draw' && activePointsRef.current.length > 0) {
      const isShape = drawingTool === 'rectangle' || drawingTool === 'circle' || drawingTool === 'triangle';
      // For shapes, ensure it's not a microscopic click
      if (isShape && activePointsRef.current.length >= 2) {
        const [p0, p1] = activePointsRef.current;
        const dist = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        if (dist < 5) {
          activePointsRef.current = [];
          activeStrokeIdRef.current = null;
          redrawCommittedStrokes();
          return;
        }
      }

      const newStroke: Stroke = {
        id: activeStrokeIdRef.current || 'stroke-' + crypto.randomUUID(),
        tool: drawingTool,
        color: strokeColor,
        size: strokeSize,
        points: activePointsRef.current,
      };
      addStroke(newStroke);
      activePointsRef.current = [];
      activeStrokeIdRef.current = null;
    }
  };

  const isInteractive = editorMode === 'draw' || editorMode === 'erase';

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas-layer"
      style={{
        position: 'absolute',
        inset: 0,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 5,
        pointerEvents: isInteractive ? 'auto' : 'none',
        cursor:
          editorMode === 'draw'
            ? 'crosshair'
            : editorMode === 'erase'
              ? 'cell'
              : 'default',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};
