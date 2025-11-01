import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Define socket type globally
declare global {
  interface Window {
    socket?: {
      emit: (event: string, data: any) => void;
      on: (event: string, callback: (data: any) => void) => void;
      off: (event: string, callback: (data: any) => void) => void;
    };
    handleUndo?: () => void;
    handleRedo?: () => void;
    setZoom?: (zoom: number) => void;
    resetZoom?: () => void;
    currentZoom?: number;
    clearCanvas?: () => void;
  }
}

interface Point {
  x: number;
  y: number;
}

// Shape interfaces for different drawing tools
interface Shape {
  id: string;
  type: string;
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

interface TextShape extends Shape {
  text: string;
  fontSize: number;
}

interface BoardProps {
  tool: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

const Board = ({ tool, strokeColor, strokeWidth, fillColor = "transparent" }: BoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldDraw = useRef(false);
  const isPanning = useRef(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const startPoint = useRef<Point>({ x: 0, y: 0 });
  const currentShape = useRef<Shape | null>(null);
  const [textOverlay, setTextOverlay] = useState<{ point: Point; value: string } | null>(null);

  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [zoom, setZoom] = useState<number>(100); // 100% default zoom
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });

  // Clear the canvas completely
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    // Save the current transform
    const currentTransform = ctx.getTransform();
    
    // Reset canvas with current dimensions
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    
    // Reset history
    setDrawHistory([]);
    setHistoryStep(0);
    
    // Restore the transform for future drawing
    ctx.setTransform(currentTransform);
  };

  // Expose clear function to window for testing
  useEffect(() => {
    window.clearCanvas = clearCanvas;
    return () => {
      delete window.clearCanvas;
    };
  }, []);

  // Initialize canvas
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set initial canvas styles
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    }

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        // Save current image data
        const ctx = canvas.getContext("2d");
        let imageData;
        if (ctx) {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        // Resize canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Restore image data and styles
        if (ctx && imageData) {
          ctx.putImageData(imageData, 0, 0);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [strokeColor, strokeWidth]);

  // Update stroke styles when props change
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
    }
  }, [strokeColor, strokeWidth]);

  // Save current canvas state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Save current transform
    const currentTransform = ctx.getTransform();
    
    // Reset transform for saving the entire canvas state
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Get image data from the entire canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Restore the transform for future drawing
    ctx.setTransform(currentTransform);
    
    // Update history
    const newHistory = drawHistory.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    setDrawHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Handle undo action
  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      redrawCanvas(drawHistory[newStep]);
    } else if (historyStep === 0) {
      // Clear canvas if at first step
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      }
      setHistoryStep(-1);
    }
  };

  // Handle redo action
  const handleRedo = () => {
    if (historyStep < drawHistory.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      redrawCanvas(drawHistory[newStep]);
    }
  };

  // Expose undo/redo functions to window
  useEffect(() => {
    window.handleUndo = handleUndo;
    window.handleRedo = handleRedo;
    return () => {
      delete window.handleUndo;
      delete window.handleRedo;
    };
  }, [historyStep, drawHistory]);

  // Redraw canvas from history
  const redrawCanvas = (imageData: ImageData | undefined) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear the canvas first
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Create a temporary canvas to hold the image data
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (tempCtx) {
      // Draw the image data to the temporary canvas
      tempCtx.putImageData(imageData, 0, 0);
      
      // Apply the current transform to the main canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply zoom and pan transformations
      const zoomFactor = zoom / 100;
      ctx.setTransform(
        zoomFactor, 0, 
        0, zoomFactor, 
        panOffset.x, panOffset.y
      );
      
      // Draw the temporary canvas onto the main canvas with the transform applied
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();
    }
  };

  // Handle zoom changes
  useEffect(() => {
    window.setZoom = (newZoom: number) => {
      setZoom(newZoom);
      window.currentZoom = newZoom;
    };
    
    window.resetZoom = () => {
      setZoom(100);
      setPanOffset({ x: 0, y: 0 });
      window.currentZoom = 100;
    };
    
    window.currentZoom = zoom;
    
    return () => {
      delete window.setZoom;
      delete window.resetZoom;
      delete window.currentZoom;
    };
  }, []);

  // Debug zoom and pan values
  useEffect(() => {
    console.log("Zoom:", zoom, "Pan:", panOffset);
    redrawCanvas(drawHistory[historyStep]);
  }, [zoom, panOffset, historyStep, drawHistory]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvasCoords = (x: number, y: number): Point => {
    const zoomFactor = zoom / 100;
    return {
      x: (x - panOffset.x) / zoomFactor,
      y: (y - panOffset.y) / zoomFactor
    };
  };

  // Draw a shape on the canvas
  const drawShape = (shape: Shape) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !shape.points.length) return;

    ctx.save();
    
    // Set drawing styles
    ctx.strokeStyle = shape.strokeColor;
    ctx.lineWidth = shape.strokeWidth;
    
    // Special handling for eraser
    if (shape.type === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = shape.strokeWidth + 2; // Make eraser slightly larger
    }

    // Begin drawing path
    ctx.beginPath();

    // Draw different shapes based on type
    switch (shape.type) {
      case "pencil":
      case "eraser":
        // Move to the first point
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        
        // Draw lines to each subsequent point
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
        break;

      case "line":
        if (shape.points.length >= 2) {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          ctx.lineTo(
            shape.points[shape.points.length - 1].x,
            shape.points[shape.points.length - 1].y
          );
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (shape.points.length >= 2) {
          const startX = shape.points[0].x;
          const startY = shape.points[0].y;
          const endX = shape.points[shape.points.length - 1].x;
          const endY = shape.points[shape.points.length - 1].y;
          
          const width = endX - startX;
          const height = endY - startY;
          
          if (shape.fillColor && shape.fillColor !== "transparent") {
            ctx.fillStyle = shape.fillColor;
            ctx.fillRect(startX, startY, width, height);
          }
          
          ctx.strokeRect(startX, startY, width, height);
        }
        break;

      case "circle":
        if (shape.points.length >= 2) {
          const startX = shape.points[0].x;
          const startY = shape.points[0].y;
          const endX = shape.points[shape.points.length - 1].x;
          const endY = shape.points[shape.points.length - 1].y;
          
          const radius = Math.sqrt(
            Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
          );
          
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
          
          if (shape.fillColor && shape.fillColor !== "transparent") {
            ctx.fillStyle = shape.fillColor;
            ctx.fill();
          }
          
          ctx.stroke();
        }
        break;

      case "arrow":
        if (shape.points.length >= 2) {
          const startX = shape.points[0].x;
          const startY = shape.points[0].y;
          const endX = shape.points[shape.points.length - 1].x;
          const endY = shape.points[shape.points.length - 1].y;
          
          // Draw the line
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          
          // Draw the arrowhead
          const headLength = 15;
          const angle = Math.atan2(endY - startY, endX - startX);
          
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI / 6),
            endY - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI / 6),
            endY - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = shape.strokeColor;
          ctx.fill();
        }
        break;

      default:
        break;
    }
    
    ctx.restore();
  };

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to canvas coordinates
    const canvasCoords = screenToCanvasCoords(x, y);
    
    // Handle different tools
    if (tool === "hand") {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = "grabbing";
    } else if (tool === "text") {
      setTextOverlay({ point: canvasCoords, value: "" });
    } else {
      shouldDraw.current = true;
      startPoint.current = canvasCoords;
      
      // Initialize current shape
      currentShape.current = {
        id: uuidv4(),
        type: tool === "eraser" ? "eraser" : tool,
        points: [canvasCoords],
        strokeColor,
        strokeWidth,
        fillColor,
      };
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to canvas coordinates
    const canvasCoords = screenToCanvasCoords(x, y);
    
    // Handle panning
    if (isPanning.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    
    // Handle drawing
    if (shouldDraw.current && currentShape.current) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Add point to current shape
      currentShape.current.points.push(canvasCoords);
      
      // Redraw from history
      if (historyStep >= 0 && historyStep < drawHistory.length) {
        redrawCanvas(drawHistory[historyStep]);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw current shape
      drawShape(currentShape.current);
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle panning end
    if (isPanning.current) {
      isPanning.current = false;
      canvas.style.cursor = "grab";
      return;
    }
    
    // Handle drawing end
    if (shouldDraw.current && currentShape.current) {
      shouldDraw.current = false;
      
      // Save to history
      saveToHistory();
      
      // Reset current shape
      currentShape.current = null;
    }
  };

  // Handle mouse leave event
  const handleMouseLeave = () => {
    handleMouseUp();
  };

  // Handle text input
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textOverlay) {
      setTextOverlay({ ...textOverlay, value: e.target.value });
    }
  };

  // Handle text submit
  const handleTextSubmit = () => {
    if (!textOverlay || !textOverlay.value.trim()) {
      setTextOverlay(null);
      return;
    }
    
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    // Draw text on canvas
    ctx.save();
    ctx.font = "16px Arial";
    ctx.fillStyle = strokeColor;
    ctx.fillText(textOverlay.value, textOverlay.point.x, textOverlay.point.y);
    ctx.restore();
    
    // Save to history
    saveToHistory();
    
    // Clear text overlay
    setTextOverlay(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          cursor:
            tool === "hand"
              ? isPanning.current ? "grabbing" : "grab"
              : tool === "text"
              ? "text"
              : tool === "eraser"
              ? "crosshair"
              : "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      {textOverlay && (
        <div
          className="absolute"
          style={{
            left: textOverlay.point.x,
            top: textOverlay.point.y,
          }}
        >
          <textarea
            autoFocus
            className="border border-gray-300 p-1"
            value={textOverlay.value}
            onChange={handleTextInput}
            onBlur={handleTextSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Board;