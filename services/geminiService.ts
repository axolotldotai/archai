
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
          text: `You are a world-class architectural engineer. 
          Transform the provided image into a highly detailed, professional technical floorplan.
          
          Technical Requirements:
          1. Analyze spatial relationships and scale deeply.
          2. Use a coordinate system from 0 to 1000. 
          3. IMPORTANT: Scale the drawing to occupy at least 80% of the 1000x1000 coordinate space. Do not leave large empty margins.
          4. Include:
             - 'walls': Primary structural boundaries (thick lines).
             - 'doors': Entryways and internal transitions.
             - 'windows': Glazed openings in walls.
             - 'rooms': Clearly labeled functional zones with precise centering.
             - 'furniture': Block out major elements like beds, sofas, tables, or counters.
          5. Ensure the plan is "watertight" (walls connect properly).
          6. Add architectural metadata.`
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
                name: { type: Type.STRING }
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
