
import React, { useState } from 'react';
import { generateFloorplan } from './services/geminiService';
import { FloorplanData, Status } from './types';
import FloorplanCanvas from './components/FloorplanCanvas';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState<FloorplanData | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setStatus('loading');
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);

      try {
        const result = await generateFloorplan(base64);
        setData(result);
        setStatus('success');
      } catch (err) {
        console.error(err);
        setError('Analysis failed.');
        setStatus('error');
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  // 520 / 1920 = 27.083%
  // 1400 / 1920 = 72.917%
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Panel - 520px equivalent ratio */}
      <div 
        className="w-[27.083vw] h-full bg-[#F4F3F1] flex items-center justify-center relative cursor-pointer"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        
        {image ? (
          <div className="w-full h-full flex items-center justify-center p-12">
            <img src={image} className="max-w-full max-h-full object-contain opacity-80" alt="Source" />
            <button 
              onClick={(e) => { e.stopPropagation(); setImage(null); setData(null); setStatus('idle'); }}
              className="absolute top-8 left-8 text-xs uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
            >
              [ reset ]
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center pointer-events-none">
            {/* The simple plus sign from the reference image */}
            <div className="relative w-8 h-8 mb-4">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black opacity-60"></div>
              <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black opacity-60"></div>
            </div>
            <p className="text-sm tracking-widest opacity-60 font-light">Drag image here</p>
          </div>
        )}
      </div>

      {/* Right Panel - 1400px equivalent ratio */}
      <div className="w-[72.917vw] h-full grid-blueprint relative">
        <FloorplanCanvas data={data} loading={status === 'loading'} />
      </div>
    </div>
  );
};

export default App;
