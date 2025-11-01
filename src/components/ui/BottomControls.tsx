import React, { useEffect } from "react";
import { GrUndo, GrRedo } from "react-icons/gr";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { TbZoomReset } from "react-icons/tb";

// Define the type for the global window object with our functions
declare global {
  interface Window {
    handleUndo?: () => void;
    handleRedo?: () => void;
    setZoom?: (zoom: number) => void;
    resetZoom?: () => void;
    currentZoom?: number;
  }
}

const BottomControls = () => {
  const [zoomLevel, setZoomLevel] = React.useState(100);

  // Update local zoom level when window.currentZoom changes
  useEffect(() => {
    const updateZoomFromBoard = () => {
      if (window.currentZoom !== undefined) {
        // Round to nearest integer for display
        setZoomLevel(Math.round(window.currentZoom));
      }
    };
    
    // Initial sync
    updateZoomFromBoard();
    
    // Set up interval to check for zoom changes
    const intervalId = setInterval(updateZoomFromBoard, 50); // More frequent updates for smoother display
    
    return () => clearInterval(intervalId);
  }, []);

  const increaseZoom = () => {
    if (window.setZoom) {
      // Increase by 10% of current zoom for smoother transitions
      const step = Math.max(5, Math.round(zoomLevel * 0.1));
      const newZoom = Math.min(zoomLevel + step, 1000);
      window.setZoom(newZoom);
      setZoomLevel(newZoom);
    }
  };
  
  const decreaseZoom = () => {
    if (window.setZoom) {
      // Decrease by 10% of current zoom for smoother transitions
      const step = Math.max(5, Math.round(zoomLevel * 0.1));
      const newZoom = Math.max(zoomLevel - step, 10);
      window.setZoom(newZoom);
      setZoomLevel(newZoom);
    }
  };
  
  const resetZoom = () => {
    if (window.resetZoom) {
      window.resetZoom();
      setZoomLevel(100);
    }
  };

  const handleUndo = () => {
    if (window.handleUndo) {
      window.handleUndo();
    }
  };

  const handleRedo = () => {
    if (window.handleRedo) {
      window.handleRedo();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3">
      {/* Undo / Redo */}
      <div className="flex items-center gap-2 bg-white shadow-lg rounded-xl border border-gray-200 px-2 py-1">
        <button
          onClick={handleUndo}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Undo (Ctrl+Z)"
        >
          <GrUndo className="text-gray-700 text-lg" />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Redo (Ctrl+Shift+Z)"
        >
          <GrRedo className="text-gray-700 text-lg" />
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-3 bg-white shadow-lg rounded-xl border border-gray-200 px-2 py-1">
        <button
          onClick={decreaseZoom}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Zoom Out (Ctrl+-)"
        >
          <AiOutlineMinus className="text-gray-700 text-lg" />
        </button>

        <div className="text-sm font-medium text-gray-800 w-12 text-center">
          {Math.round(zoomLevel)}%
        </div>

        <button
          onClick={resetZoom}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Reset Zoom (Ctrl+0)"
        >
          <TbZoomReset className="text-gray-700 text-lg" />
        </button>

        <button
          onClick={increaseZoom}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Zoom In (Ctrl+=)"
        >
          <AiOutlinePlus className="text-gray-700 text-lg" />
        </button>
      </div>
    </div>
  );
};

export default BottomControls;