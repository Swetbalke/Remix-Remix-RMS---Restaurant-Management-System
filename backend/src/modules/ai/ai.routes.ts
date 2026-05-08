import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

router.post('/caption', asyncHandler(async (req: any, res: any) => {
  const { itemName, description } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(501).json({ error: 'Gemini API not configured' });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Generate a catchy Instagram caption for a restaurant dish called "${itemName}". Description: ${description}. Include relevant emojis and hashtags.`,
  });
  res.json({ caption: response.text });
}));

router.post('/insights', asyncHandler(async (req: any, res: any) => {
  const { analyticsData } = req.body;
  if (!process.env.GEMINI_API_KEY) return res.status(501).json({ error: 'Gemini API not configured' });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Analyze this restaurant analytics data and provide 3 actionable business insights: ${JSON.stringify(analyticsData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            action: { type: Type.STRING },
            impact: { type: Type.STRING }
          }
        }
      }
    }
  });
  res.json(JSON.parse(response.text || "[]"));
}));

export const aiRouter = router;
