
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

    const width = maxX - minX;
    const height = maxY - minY;
    // Tighter margins to maximize space
    const margin = Math.max(width, height) * 0.05;

    return `${minX - margin} ${minY - margin} ${width + margin * 2} ${height + margin * 2}`;
  }, [data]);

  // Use 8 as the base units for 8px font in the blueprint context
  const labelFontSize = 8; 

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
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          {/* Furniture & Fixtures - Consistent 2px strokes */}
          {[...(data.furniture || []), ...(data.fixtures || [])].map((item, i) => (
            <rect
              key={`item-${i}`}
              x={item.x - item.width / 2}
              y={item.y - item.height / 2}
              width={item.width}
              height={item.height}
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.3"
              transform={('rotation' in item) ? `rotate(${item.rotation || 0}, ${item.x}, ${item.y})` : undefined}
            />
          ))}

          {/* Windows - 2px stroke weight */}
          {data.windows?.map((w, i) => (
            <g key={`win-${i}`}>
              <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="white" strokeWidth="2" opacity="0.5" />
              <line 
                x1={w.x1 + 4} 
                y1={w.y1 + 4} 
                x2={w.x2 + 4} 
                y2={w.y2 + 4} 
                stroke="white" 
                strokeWidth="2" 
                opacity="0.2" 
              />
            </g>
          ))}

          {/* Main Walls - Unified 2px stroke as requested */}
          {data.walls.map((wall, i) => (
            <line
              key={`wall-${i}`}
              x1={wall.x1}
              y1={wall.y1}
              x2={wall.x2}
              y2={wall.y2}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="square"
            />
          ))}

          {/* Doors - 2px stroke weight */}
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
                  strokeDasharray="4,2"
                  opacity="0.6"
                />
                <path
                  d={`M ${door.x1} ${door.y1} A ${dist} ${dist} 0 0 1 ${door.x2} ${door.y2}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.4"
                  strokeDasharray="6,3"
                />
              </g>
            );
          })}

          {/* Room Labels - 8px as requested */}
          {data.rooms.map((room, i) => (
            <g key={`room-${i}`}>
              <text
                x={room.x}
                y={room.y}
                fill="white"
                fontSize={labelFontSize}
                fontWeight="400"
                textAnchor="middle"
                dominantBaseline="middle"
                className="uppercase tracking-[0.15em]"
              >
                {room.name}
              </text>
              {room.area && (
                <text
                  x={room.x}
                  y={room.y + labelFontSize + 4}
                  fill="white"
                  fontSize={labelFontSize}
                  fontWeight="300"
                  textAnchor="middle"
                  opacity="0.6"
                  className="font-mono"
                >
                  {room.area}
                </text>
              )}
            </g>
          ))}

          {/* Drafting Metadata - Consistent 8px font */}
          <g opacity="0.4" className="font-mono">
            <text x="0" y="-15" fill="white" fontSize="8" className="uppercase tracking-widest">
              DOC_ID: ARCH_PRJ_A // REV_01 // SECURE_GEN
            </text>
            <text x="0" y="1035" fill="white" fontSize="8" className="uppercase tracking-widest">
              SCALE: {data.metadata?.scale || '1:100'} // ALL DIMENSIONS MM
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};

export default FloorplanCanvas;
