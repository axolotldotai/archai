
import React, { useMemo } from 'react';
import { FloorplanData } from '../types';

interface Props {
  data: FloorplanData | null;
  loading: boolean;
}

const FloorplanCanvas: React.FC<Props> = ({ data, loading }) => {
  // Calculate bounding box to auto-fit the floorplan to the view
  const viewBox = useMemo(() => {
    if (!data || data.walls.length === 0) return "0 0 1000 1000";

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    data.walls.forEach(w => {
      minX = Math.min(minX, w.x1, w.x2);
      maxX = Math.max(maxX, w.x1, w.x2);
      minY = Math.min(minY, w.y1, w.y2);
      maxY = Math.max(maxY, w.y1, w.y2);
    });

    // Add a small margin (5%) so the lines don't hit the exact edge of the SVG coordinate space
    const width = maxX - minX;
    const height = maxY - minY;
    const margin = Math.max(width, height) * 0.05;

    return `${minX - margin} ${minY - margin} ${width + margin * 2} ${height + margin * 2}`;
  }, [data]);

  return (
    <div className="w-full h-full relative flex items-center justify-center p-[50px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-white text-xs uppercase tracking-[0.4em] animate-pulse">
            DRAFTING BLUEPRINT...
          </div>
        </div>
      )}

      {data && (
        <svg
          viewBox={viewBox}
          className="w-full h-full drop-shadow-2xl"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          {/* Furniture - Subtle white outlines */}
          {data.furniture?.map((f, i) => (
            <rect
              key={`furn-${i}`}
              x={f.x - f.width / 2}
              y={f.y - f.height / 2}
              width={f.width}
              height={f.height}
              fill="none"
              stroke="white"
              strokeWidth="1"
              opacity="0.2"
            />
          ))}

          {/* Windows - Represented with stylized parallel lines */}
          {data.windows?.map((w, i) => (
            <g key={`win-${i}`}>
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="white" strokeWidth="6" opacity="0.3" />
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="#1D56CF" strokeWidth="2" />
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="white" strokeWidth="1" />
            </g>
          ))}

          {/* Main Walls - Solid thick white strokes */}
          {data.walls.map((wall, i) => (
            <line
              key={`wall-${i}`}
              x1={wall.x1}
              y1={wall.y1}
              x2={wall.x2}
              y2={wall.y2}
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}

          {/* Doors - Technical visualization of opening arcs */}
          {data.doors.map((door, i) => {
            const dx = door.x2 - door.x1;
            const dy = door.y2 - door.y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return (
              <g key={`door-${i}`}>
                <line
                  x1={door.x1}
                  y1={door.y1}
                  x2={door.x2}
                  y2={door.y2}
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                  opacity="0.6"
                />
                <path
                  d={`M ${door.x1} ${door.y1} A ${dist} ${dist} 0 0 1 ${door.x2} ${door.y2}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.4"
                  strokeDasharray="4,2"
                />
              </g>
            );
          })}

          {/* Room Labels & Dimensions */}
          {data.rooms.map((room, i) => (
            <g key={`room-${i}`}>
              <text
                x={room.x}
                y={room.y}
                fill="white"
                fontSize="16"
                fontWeight="500"
                textAnchor="middle"
                className="uppercase tracking-[0.2em]"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              >
                {room.name}
              </text>
              <text
                x={room.x}
                y={room.y + 20}
                fill="white"
                fontSize="9"
                fontWeight="300"
                textAnchor="middle"
                opacity="0.5"
                className="font-mono"
              >
                {Math.floor(Math.random() * 15 + 12)}m²
              </text>
            </g>
          ))}

          {/* Technical Borders / Drafting Metadata */}
          <g opacity="0.3" className="font-mono">
            <text x="0" y="-10" fill="white" fontSize="10" className="uppercase tracking-widest">
              ARCH_AI // DRAWING_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
            </text>
            <text x="0" y="1030" fill="white" fontSize="10" className="uppercase tracking-widest">
              SCALE: {data.metadata?.scale || '1:100'} // REF: {data.metadata?.description.slice(0, 30)}...
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};

export default FloorplanCanvas;
