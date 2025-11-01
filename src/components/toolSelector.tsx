"use client";

import React, { useState } from "react";
import {
  BsArrowLeft,
  BsArrows,
  BsArrowRight,
  BsArrowUpRight,
} from "react-icons/bs";
import { GiRapidshareArrow, GiTronArrow } from "react-icons/gi";
import { FiX } from "react-icons/fi";

// --- CONFIG ARRAYS ---
const COLORS = ["#1a1a1a", "#e53935", "#43a047", "#1e88e5", "#fb8c00"];
const BACKGROUND_COLORS = [
  "transparent",
  "#FAC7BC",
  "#C8FACC",
  "#CAF0F8",
  "#FFF4C1",
];

// const FILLS = [
//   { id: "pattern", label: "Pattern" },
//   { id: "none", label: "None" },
//   { id: "solid", label: "Solid" },
// ];

const STROKE_WIDTHS = [
  { id: "thin", label: "Thin", innerStyle: "h-0.5 w-6 bg-gray-800" },
  { id: "medium", label: "Medium", innerStyle: "h-1 w-6 bg-blue-800" },
  { id: "thick", label: "Thick", innerStyle: "h-1.5 w-6 bg-gray-900" },
];

const STROKE_STYLES = [
  { id: "solid", label: "Solid", style: "bg-gray-800 h-0.5 w-6" },
  {
    id: "dashed",
    label: "Dashed",
    style: "border-t-2 border-dashed border-gray-800 w-6",
  },
  {
    id: "dotted",
    label: "Dotted",
    style: "border-t-2 border-dotted border-gray-800 w-6",
  },
];

const EDGE_STYLES = [
  { id: "sharp", label: "Sharp", style: "border border-gray-400" },
  { id: "rounded", label: "Rounded", style: "border border-gray-400 rounded-md" },
];

const FONT_FAMILIES = [
  { id: "arial", label: "A", style: "font-sans border border-gray-300 px-1" },
  { id: "times", label: "T", style: "font-serif border border-gray-300 px-1" },
  { id: "courier", label: "C", style: "font-mono border border-gray-300 px-1" },
];

const FONT_SIZES = [
  { id: "small", label: "S", style: "text-sm" },
  { id: "medium", label: "M", style: "text-base" },
  { id: "large", label: "L", style: "text-lg" },
  { id: "xlarge", label: "XL", style: "text-xl" },
];

const ARROW_TYPES = [
  { id: "line", Icon: BsArrowUpRight },
  { id: "double", Icon: GiRapidshareArrow },
  { id: "dashed", Icon: GiTronArrow },
];

const ARROW_HEADS = [
  { id: "left", Icon: BsArrowLeft },
  { id: "both", Icon: BsArrows },
  { id: "right", Icon: BsArrowRight },
];

// --- PROPS INTERFACE ---
interface ToolSelectorProps {
  activeTool: string;
  onClose: () => void;
  onColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onFillColorChange?: (color: string) => void;
}

// --- COMPONENT ---
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
  const [selectedFillColor, setSelectedFillColor] = useState(
    BACKGROUND_COLORS[0]
  );
  const [selectedStrokeStyle, setSelectedStrokeStyle] = useState("solid");
  const [selectedEdge, setSelectedEdge] = useState("sharp");
  const [selectedFont, setSelectedFont] = useState("arial");
  const [selectedFontSize, setSelectedFontSize] = useState("medium");
  const [selectedArrow, setSelectedArrow] = useState("line");
  const [selectedArrowHead, setSelectedArrowHead] = useState("right");

  // --- HANDLERS ---
  const updateColor = (color: string): void => {
    setStrokeColor(color);
    onColorChange?.(color);
  };

  const handleStrokeWidthChange = (id: string): void => {
    const widthMap: Record<string, number> = { thin: 1, medium: 2, thick: 3 };
    const width = widthMap[id] ?? 2;
    setStrokeWidth(width);
    onStrokeWidthChange?.(width);
  };

  // --- TOOL FLAGS ---
  const isStrokeTool = ["pencil", "box", "circle", "arrow", "line", "eraser"].includes(activeTool);
  const isFillableBox = activeTool === "box";
  const isCircleTool = activeTool === "circle";
  const isTextTool = activeTool === "text";
  const isArrowTool = activeTool === "arrow";

  return (
    <div
      className="
        absolute top-20 w-64 left-5
        bg-white rounded-xl shadow-2xl border border-gray-200
        p-5 overflow-y-auto max-h-[80vh]
        transition-all duration-300 ease-in-out
      "
    >
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tool Options</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* --- STROKE SETTINGS --- */}
      {(isStrokeTool || isFillableBox || isCircleTool) && (
        <>
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
                  onClick={() => handleStrokeWidthChange(width.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md border transition-transform duration-150
                    ${
                      strokeWidth ===
                      (width.id === "thin" ? 1 : width.id === "medium" ? 2 : 3)
                        ? "ring-2 ring-indigo-500 scale-105"
                        : "hover:scale-105"
                    }`}
                >
                  <div className={width.innerStyle}></div>
                </button>
              ))}
            </div>
          </section>

          {/* Stroke Style */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Stroke Style
            </h4>
            <div className="flex gap-2">
              {STROKE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStrokeStyle(style.id)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border transition-transform duration-150 ${
                    selectedStrokeStyle === style.id
                      ? "ring-2 ring-indigo-500 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <div className={style.style}></div>
                </button>
              ))}
            </div>
          </section>

          {/* Edge Style → only for BOX, not CIRCLE */}
          {isFillableBox && (
            <section className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Edge Style
              </h4>
              <div className="flex gap-2">
                {EDGE_STYLES.map((edge) => (
                  <button
                    key={edge.id}
                    onClick={() => setSelectedEdge(edge.id)}
                    className={`w-9 h-9 flex items-center justify-center rounded-md transition-transform duration-150 ${
                      selectedEdge === edge.id
                        ? "ring-2 ring-indigo-500 scale-105"
                        : "hover:scale-105"
                    } ${edge.style}`}
                  >
                    <div className="w-3 h-3 bg-gray-400"></div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* --- FILL SETTINGS (Only BOX) --- */}
      {isFillableBox && (
        <section className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Fill Color
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
                  <div className="absolute inset-0 bg-white bg-[repeating-linear-gradient(45deg,#ccc,#ccc_2px,transparent_2px,transparent_8px)]"></div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* --- ARROW SETTINGS --- */}
      {isArrowTool && (
        <>
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

          {/* Arrow Head */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Arrow Heads
            </h4>
            <div className="flex gap-2">
              {ARROW_HEADS.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedArrowHead(id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border-2 transition-transform duration-150 bg-zinc-200
                ${
                  selectedArrowHead === id
                    ? "border-indigo-500 scale-105"
                    : "border-transparent hover:scale-105"
                }`}
                >
                  <Icon className="text-gray-800" size={18} />
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* --- TEXT SETTINGS --- */}
      {isTextTool && (
        <>
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Font Family
            </h4>
            <div className="flex gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.id}
                  onClick={() => setSelectedFont(font.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border transition-transform duration-150 ${
                    selectedFont === font.id
                      ? "ring-2 ring-indigo-500 scale-105"
                      : "hover:scale-105"
                  } ${font.style}`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font Size */}
          <section className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Font Size
            </h4>
            <div className="flex gap-2">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedFontSize(size.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border transition-transform duration-150 ${
                    selectedFontSize === size.id
                      ? "ring-2 ring-indigo-500 scale-105"
                      : "hover:scale-105"
                  } ${size.style}`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* --- OPACITY --- */}
      <section className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">Opacity</h4>
          <span className="text-sm text-gray-600">{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </section>
    </div>
  );
};

export default ToolSelector;
