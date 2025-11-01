"use client";
import React, { useState } from "react";
import {
  RxArrowRight,
  RxBorderSolid,
  RxBox,
  RxCircle,
  RxCursorArrow,
  RxEraser,
  RxHand,
  RxPencil1,
  RxText,
  RxImage,
  RxLockClosed,
} from "react-icons/rx";
// Assuming this path is correct for your ToolSelector
import ToolSelector from "./toolSelector"; 

// --- TOOL CONFIGURATION (Unchanged) ---
interface Tool {
  id: string;
  Icon: React.ComponentType<{ size?: number }>;
  hasSelector?: boolean;
}

const TOOLS: Tool[] = [
  { id: "lock", Icon: RxLockClosed },
  { id: "hand", Icon: RxHand },
  { id: "cursor", Icon: RxCursorArrow },
  { id: "box", Icon: RxBox, hasSelector: true },
  { id: "circle", Icon: RxCircle, hasSelector: true },
  { id: "arrow", Icon: RxArrowRight, hasSelector: true },
  { id: "line", Icon: RxBorderSolid, hasSelector: true },
  { id: "pencil", Icon: RxPencil1, hasSelector: true },
  { id: "text", Icon: RxText , hasSelector: true },
  { id: "image", Icon: RxImage }, // Tool to target for the new modal
  { id: "eraser", Icon: RxEraser },
];

// --- NEW COMPONENT: IMAGE UPLOADER MODAL ---

interface ImageUploaderModalProps {
  onClose: () => void;
  onImageSelected: (url: string | File) => void;
}

/**
 * A simple modal component for image upload or URL input.
 * This is a placeholder for the full upload logic.
 */
const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({
  onClose,
  onImageSelected,
}) => {
  const [imageUrl, setImageUrl] = useState("");

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageSelected(imageUrl.trim());
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For simplicity, we'll just log the file name here.
      // In a real app, you would upload the file to a server and get a URL.
      // For now, let's treat it as a file object for the canvas system to handle.
      onImageSelected(file); 
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
        <h3 className="text-xl font-semibold mb-4 text-bl">🖼️ Insert Image</h3>
        
        {/* URL Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., https://example.com/photo.jpg"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-black"
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim()}
            className="mt-2 w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Insert from URL
          </button>
        </div>

        <div className="flex items-center justify-center my-4">
          <span className="text-gray-400">— OR —</span>
        </div>

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


// --- UPDATED TOOLBAR COMPONENT ---

export  interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onFillColorChange: (color: string) => void;
  onImageSelected: (source: string | File) => void;
  onClearCanvas?: () => void;
}

const Toolbar = ({ activeTool, setActiveTool, onColorChange, onStrokeWidthChange, onFillColorChange, onImageSelected }: ToolbarProps) => {
  const [showSelector, setShowSelector] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // New state for modal

  const handleToolClick = (tool: Tool): void => {
    // Set the active tool
    setActiveTool(tool.id);
    
    // For tools that need additional configuration, show the selector
    if (tool.id === "image") {
      setShowImageModal(true);
      setShowSelector(false); // Close the property selector
    } else {
      setShowImageModal(false); // Ensure modal is closed for other tools
      // Only show the property selector if the tool has it
      setShowSelector(!!tool.hasSelector);
    }
  };

  const handleImageSelected = (source: string | File) => {
    onImageSelected(source);
  };

  return (
    <div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center px-4 py-2 space-x-3 bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 rounded-xl z-50 h-12">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={`p-2 rounded-xl transition-all ${
              activeTool === tool.id
                ? "bg-indigo-100 text-indigo-600 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <tool.Icon size={17} />
          </button>
        ))}
      </div>

      {/* RENDER ToolSelector for shapes/lines */}
      {showSelector && (
        <ToolSelector
          activeTool={activeTool}
          onClose={() => setShowSelector(false)}
          onColorChange={onColorChange}
          onStrokeWidthChange={onStrokeWidthChange}
          onFillColorChange={onFillColorChange}
        />
      )}

      {/* RENDER ImageUploaderModal */}
      {showImageModal && (
        <ImageUploaderModal
          onClose={() => setShowImageModal(false)}
          onImageSelected={handleImageSelected}
        />
      )}
    </div>
  );
};

export default Toolbar;