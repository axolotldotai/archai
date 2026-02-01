
import { GoogleGenAI, Type } from "@google/genai";
import { FloorplanData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFloorplan = async (base64Image: string): Promise<FloorplanData> => {
  const modelName = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        {
          text: `You are a world-class architectural drafter. 
          Transform the provided image into an extremely high-detail, technical blueprint.
          
          Technical Requirements:
          1. Spatial Resolution: Use a 0-1000 coordinate system.
          2. Scale: Occupy at least 95% of the available space. Maximize the drawing size to fill the frame.
          3. Structural Detail: 
             - 'walls': Include all internal partitions, exterior shells, and column structures.
             - 'doors': Show clear openings and swing directions for every portal.
             - 'windows': Detail window placements, including double-glazing lines.
          4. Functional Detail (MAXIMUM DENSITY):
             - 'furniture': Add detailed block-outs for every room (beds, wardrobes, desks, dining sets, sofa arrangements).
             - 'fixtures': Include comprehensive kitchen (counters, sink, stove, fridge), bathroom (toilet, vanity, tub/shower), and utility spaces.
             - 'details': Show floor patterns or textures where appropriate by adding extra thin lines (e.g., stairs, tiles).
          5. Labeling: 
             - Provide 'rooms' with names and precise (x,y) coordinates.
             - CRITICAL: Room labels must be placed in empty floor spaces. 
             - STALEMATE PREVENTION: Ensure no label overlaps with any wall, furniture, window, or other label. 
             - If a room is too small, place the label outside with a leader line (coordinate outside the wall).
          6. Blueprint Aesthetics: The output must look like a professional CAD drawing ready for construction.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          walls: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x1: { type: Type.NUMBER },
                y1: { type: Type.NUMBER },
                x2: { type: Type.NUMBER },
                y2: { type: Type.NUMBER }
              },
              required: ["x1", "y1", "x2", "y2"]
            }
          },
          rooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                name: { type: Type.STRING },
                area: { type: Type.STRING }
              },
              required: ["x", "y", "name"]
            }
          },
          doors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x1: { type: Type.NUMBER },
                y1: { type: Type.NUMBER },
                x2: { type: Type.NUMBER },
                y2: { type: Type.NUMBER }
              },
              required: ["x1", "y1", "x2", "y2"]
            }
          },
          windows: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x1: { type: Type.NUMBER },
                y1: { type: Type.NUMBER },
                x2: { type: Type.NUMBER },
                y2: { type: Type.NUMBER }
              },
              required: ["x1", "y1", "x2", "y2"]
            }
          },
          furniture: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                type: { type: Type.STRING },
                rotation: { type: Type.NUMBER }
              },
              required: ["x", "y", "width", "height", "type"]
            }
          },
          fixtures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                type: { type: Type.STRING }
              },
              required: ["x", "y", "width", "height", "type"]
            }
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              scale: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["scale", "description"]
          }
        },
        required: ["walls", "rooms", "doors", "metadata"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as FloorplanData;
};
