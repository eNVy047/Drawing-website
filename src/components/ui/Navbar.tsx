import React, { useState, useRef, useEffect } from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { FiDownload, FiImage, FiTrash2 } from "react-icons/fi";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { MdOutlineWbSunny, MdDarkMode } from "react-icons/md";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareLink = "https://xoraxi.com"; // replace dynamically

  const [, setTheme] = useState<'light' | 'dark'>('light');
  const [links] = useState({
    github: "https://github.com/eNVy047",
    discord: "https://discord.com/users/1400075627997958216?message=Hello%20I%20have%20a%20question%20about..."
  });



  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setMenuOpen(false);
  };
  
  const clearCanvas = () => {
    // Use Board's reset implementation so history and autosave are cleared too
    if (window.clearCanvas) {
      window.clearCanvas();
    } else {
      // Fallback: basic clear
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setMenuOpen(false);
  };



  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      // Optional: Add dark mode styles to canvas or other elements
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.backgroundColor = '#000000'; // dark gray background
      }
    } else {
      document.documentElement.classList.remove('dark');
      // Reset to light mode styles
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.backgroundColor = 'white'; // light background
      }
    }
    localStorage.setItem('theme', newTheme);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      toggleTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
      toggleTheme('dark');
    }
  }, []);

  // close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Navbar Buttons */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-50">
        {/* Menu Button */}
        <div className="relative pointer-events-auto" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-white shadow-md border border-gray-200 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <HiMenuAlt2 className="text-xl text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white shadow-xl rounded-2xl border border-gray-200 py-3 z-50">
              <div className="flex flex-col text-sm text-gray-700">
                <MenuItem icon={<FiDownload />} label="Save to..." shortcut="Ctrl+S" />
                <MenuItem icon={<FiImage />} label="Export image..." shortcut="Ctrl+Shift+E" />
                <MenuItem icon={<FiTrash2 />} onClick={clearCanvas} label="Reset canvas" divider />

                <MenuItem icon={<FaGithub />} onClick={() => handleLinkClick(links.github)} label="GitHub" />
                <MenuItem icon={<FaDiscord />} onClick={() => handleLinkClick(links.discord)} label="Discord chat" divider />

                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleTheme('light')} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                      <MdOutlineWbSunny className="text-yellow-500" />
                    </button>
                    <button onClick={() => toggleTheme('dark')} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                      <MdDarkMode className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={() => setShowPopup(true)}
          className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition text-sm font-medium"
        >
          Share
        </button>
      </div>

      {/* Share Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[320px] text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Share this link
            </h3>

            <div className="bg-gray-100 text-gray-700 text-sm p-2 rounded-md truncate mb-4 border border-gray-200">
              {shareLink}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleCopy}
                className={`${
                  copied
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white text-sm px-4 py-2 rounded-md transition`}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-md transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Reusable Menu Item component
const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  divider?: boolean;
  onClick?: () => void;
}> = ({ icon, label, shortcut, divider, onClick }) => (
  <>
    <button
      onClick={onClick}
      className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 transition"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-700 text-base">{icon}</span>
        <span>{label}</span>
      </div>
      {shortcut && <span className="text-xs text-gray-500">{shortcut}</span>}
    </button>
    {divider && <div className="border-t border-gray-200 my-2" />}
  </>
);

export default Navbar;
