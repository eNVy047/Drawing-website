"use client";

import React, { useState } from "react";
import {
  BsArrowLeft,
  BsArrows,
  BsArrowRight,
  BsArrowUpRight,
} from "react-icons/bs";
import { GiRapidshareArrow, GiTronArrow } from "react-icons/gi";

// --- CONFIG ARRAYS (Unchanged) ---
const COLORS = ["#1a1a1a", "#e53935", "#43a047", "#1e88e5", "#fb8c00"];
const BACKGROUND_COLORS = [
  "transparent",
  "#FAC7BC",
  "#C8FACC",
  "#CAF0F8",
  "#FFF4C1",
];

const FILLS = [
  {
    id: "pattern",
    label: "Pattern",
    style:
      "border border-gray-400 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0)_2px,rgba(0,0,0)_4px)]",
  },
  {
    id: "none",
    label: "None",
    style:
      "border border-gray-400 bg-[repeating-linear-gradient(45deg,rgba(0,0,0)_0_1px,transparent_1px_8px),repeating-linear-gradient(-45deg,rgba(0,0,0)_0_1px,transparent_1px_8px)]",
  },
  {
    id: "solid",
    label: "Solid",
    style: "bg-gray-900",
  },
];

const STROKE_WIDTHS = [
  {
    id: "thin",
    label: "Thin",
    style: "border border-gray-300",
    innerStyle: "h-0.5 w-6 bg-gray-800",
  },
  {
    id: "medium",
    label: "Medium",
    style: "border border-gray-300",
    innerStyle: "h-1 w-6 bg-blue-800",
  },
  {
    id: "thick",
    label: "Thick",
    style: "border border-gray-300",
    innerStyle: "h-1.5 w-6 bg-gray-900",
  },
];

const STROKE_STYLES = [
  {
    id: "solid",
    label: "Solid",
    style: "border border-gray-300",
    innerStyle: "h-0.5 w-6 bg-blue-800",
  },
  {
    id: "dashed",
    label: "Dashed",
    style: "border border-gray-300",
    innerStyle:
      "h-0.5 w-6 border-t border-dashed border-blue-800 bg-transparent",
  },
  {
    id: "dotted",
    label: "Dotted",
    style: "border border-gray-300",
    innerStyle:
      "h-0.5 w-6 border-t border-dotted border-gray-900 bg-transparent",
  },
];

const EDGE_STYLES = [
  {
    id: "sharp",
    label: "Sharp",
    style: "bg-white border border-gray-300 px-1",
    innerStyle: "h-4 w-4 border",
  },
  {
    id: "rounded",
    label: "Rounded",
    style: "bg-white border border-gray-300 px-1",
    innerStyle: "h-4 w-4 border rounded",
  },
];

const FONT_FAMILIES = [
  { id: "arial", label: "A", style: "font-sans border border-gray-300 px-1" },
  { id: "times", label: "T", style: "font-serif border border-gray-300 px-1" },
  { id: "courier", label: "C", style: "font-mono border border-gray-300 px-1" },
];

const FONT_SIZES = [
  { id: "small", label: "S", style: "text-sm border border-gray-300 px-1" },
  { id: "medium", label: "M", style: "text-base border border-gray-300 px-1" },
  { id: "large", label: "L", style: "text-lg border border-gray-300 px-1" },
  { id: "xlarge", label: "XL", style: "text-xl border border-gray-300 px-1" },
];

const ARROW_TYPES = [
  { id: "line", Icon: BsArrowUpRight },
  { id: "double", Icon: GiRapidshareArrow },
  { id: "dashed", Icon: GiTronArrow },
];

const ARROW_HEADS = [
  { id: "1", Icon: BsArrowLeft },
  { id: "2", Icon: BsArrows },
  { id: "3", Icon: BsArrowRight },
];

// --- INTERFACE FIX ---
interface ToolSelectorProps {
  activeTool: string;
  onClose: () => void;
  onColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onFillColorChange?: (color: string) => void;
}

// --- COMPONENT START ---
const ToolSelector: React.FC<ToolSelectorProps> = ({
  activeTool,
  onClose,
  onColorChange,
  onStrokeWidthChange,
  onFillColorChange,
}) => {
  const [strokeColor, setStrokeColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [selectedFill, setSelectedFill] = useState(FILLS[0].id);
  const [selectedArrow, setSelectedArrow] = useState("line");
  const [selectedFillColor, setSelectedFillColor] = useState(
    BACKGROUND_COLORS[0]
  );

  // --- HANDLERS ---
  const updateColor = (color: string): void => {
    setStrokeColor(color);
    onColorChange?.(color);
  };

  const handleFillChange = (fillId: string): void => {
    setSelectedFill(fillId);
  };

  const handleStrokeWidthChange = (id: string): void => {
    const widthMap: Record<string, number> = {
      thin: 1,
      medium: 2,
      thick: 3,
    };
    const width = widthMap[id] ?? 2;
    setStrokeWidth(width);
    onStrokeWidthChange?.(width);
  };

  // --- TOOL LOGIC ---
  const isStrokeTool = ["pencil", "box", "circle", "arrow", "line", "eraser"].includes(activeTool);
  const isFillableShape = ["box", "circle"].includes(activeTool);
  const isTextTool = activeTool === "text";
  const isArrowTool = activeTool === "arrow";
  const isOpacityTool = isStrokeTool || isFillableShape || isTextTool;

  return (
    <div
      className="
        absolute top-20 w-64 left-5
        bg-white rounded-xl shadow-2xl border border-gray-200
        p-5 overflow-y-auto max-h-[80vh]
        transition-all duration-300 ease-in-out
      "
    >
      {/* ========================================
        STROKE SETTINGS
      ======================================== */}
      {(isStrokeTool || isFillableShape) && (
        <section>
          {/* Stroke Color */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Stroke Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-md border-2 transition-transform duration-150 ${
                    strokeColor === c
                      ? "border-indigo-500 scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Stroke Width */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Stroke Width
            </h4>
            <div className="flex flex-wrap gap-2">
              {STROKE_WIDTHS.map((width) => (
                <button
                  key={width.id}
                  type="button"
                  onClick={() => handleStrokeWidthChange(width.id)}
                  className={`w-7 h-7 rounded-md transition-transform duration-150
                ${
                  strokeWidth ===
                  (width.id === "thin" ? 1 : width.id === "medium" ? 2 : 3)
                    ? "ring-2 ring-indigo-500 ring-offset-2 scale-105"
                    : "hover:scale-105"
                } ${width.style}`}
                >
                  <div className={`${width.innerStyle} rounded`}></div>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* ========================================
        FILL SETTINGS (BOX/CIRCLE)
      ======================================== */}
      {isFillableShape && (
        <section>
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Background Color
            </h4>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedFillColor(c);
                    onFillColorChange?.(c);
                  }}
                  style={c !== "transparent" ? { backgroundColor: c } : {}}
                  className={`relative w-7 h-7 rounded-md border-2 overflow-hidden transition-transform duration-150 ${
                    selectedFillColor === c
                      ? "border-indigo-500 scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                >
                  {c === "transparent" && (
                    <div className="absolute inset-0 bg-white">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_8px)]"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* ========================================
        ARROW SETTINGS
      ======================================== */}
      {isArrowTool && (
        <section>
          {/* Arrow Type */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Arrow Type
            </h4>
            <div className="flex flex-wrap gap-2">
              {ARROW_TYPES.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedArrow(id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border-2 transition-transform duration-150 bg-zinc-200
              ${
                selectedArrow === id
                  ? "border-indigo-500 scale-105"
                  : "border-transparent hover:scale-105"
              }`}
                >
                  <Icon className="text-gray-800" size={20} />
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* ========================================
        TEXT SETTINGS
      ======================================== */}
      {isTextTool && (
        <section>
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Font Family
            </h4>
            <div className="flex gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleFillChange(font.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md transition-transform duration-150 text-black
              ${
                selectedFill === font.id
                  ? "ring-2 ring-indigo-500 ring-offset-2 scale-105"
                  : "hover:scale-105"
              } ${font.style}`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* ========================================
        OPACITY SLIDER
      ======================================== */}
      {isOpacityTool && (
        <section className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Opacity</h4>
            <span className="text-sm text-gray-600">{opacity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">0</span>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-xs text-gray-600">100</span>
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolSelector;
