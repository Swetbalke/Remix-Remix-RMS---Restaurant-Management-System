export const aiService = {
  async generateInstagramCaption(itemName: string, description: string) {
    const res = await fetch('/api/ai/caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName, description })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.caption;
  },

  async getBusinessInsights(analyticsData: any) {
    const res = await fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyticsData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load insights");
    return data;
  },

  async predictDemand(historicalData: any) {
    // Left as placeholder for now
    return [];
  }
};
