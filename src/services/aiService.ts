import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const aiService = {
  async generateInstagramCaption(itemName: string, description: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a catchy Instagram caption for a restaurant dish called "${itemName}". Description: ${description}. Include relevant emojis and hashtags.`,
    });
    return response.text;
  },

  async getBusinessInsights(analyticsData: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    return JSON.parse(response.text || "[]");
  },

  async predictDemand(historicalData: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this historical sales data, predict the demand for the next 7 days. Return a list of predicted daily revenues: ${JSON.stringify(historicalData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              predictedRevenue: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }
};
