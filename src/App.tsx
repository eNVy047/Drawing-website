import { useState } from 'react'
import Navbar from './components/ui/Navbar'
import Toolbar from './components/toolbar'
import BottomControls from './components/ui/BottomControls'
import './App.css'
import Board from './components/board'

function App() {
  const [activeTool, setActiveTool] = useState<string>("pencil");
  const [strokeColor, setStrokeColor] = useState("#1a1a1a");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("transparent");

  const handleClearCanvas = () => {
    if (window.clearCanvas) {
      window.clearCanvas();
    }
  };

  return (
    <>
      <div>
        <Navbar />
        <Board 
          tool={activeTool} 
          strokeColor={strokeColor} 
          strokeWidth={strokeWidth}
          fillColor={fillColor}
        />
        <Toolbar 
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onColorChange={setStrokeColor}
          onStrokeWidthChange={setStrokeWidth}
          onFillColorChange={setFillColor}
          onClearCanvas={handleClearCanvas}
        />
        <div>
          <BottomControls />
        </div>
      </div>
    </>
  )
}

export default App
