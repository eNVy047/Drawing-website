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
  const [imageSource, setImageSource] = useState<string | File | null>(null);

  const handleClearCanvas = () => {
    if (window.clearCanvas) {
      window.clearCanvas();
    }
  };

  const handleImageSelected = (source: string | File) => {
    setImageSource(source);
    // Ensure the image tool is active for placement
    setActiveTool("image");
  };

  const handleImageConsumed = () => {
    setImageSource(null);
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
          imageSource={imageSource ?? undefined}
          onImageConsumed={handleImageConsumed}
        />
        <Toolbar 
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onColorChange={setStrokeColor}
          onStrokeWidthChange={setStrokeWidth}
          onFillColorChange={setFillColor}
          onImageSelected={handleImageSelected}
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
