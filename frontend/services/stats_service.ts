import axios from "axios";

const API_URL = "http://localhost:8000/api";

export type HeatmapDataPoint = {
  date: string; // YYYY-MM-DD
  count: number;
};

export type OverviewStats = {
  total_reviews: number;
  mastered_words: number;
  current_streak: number;
  longest_streak: number;
};

export const statsService = {
  async getHeatmap(): Promise<HeatmapDataPoint[]> {
    const res = await axios.get(`${API_URL}/stats/heatmap`);
    return res.data;
  },

  async getOverview(): Promise<OverviewStats> {
    const res = await axios.get(`${API_URL}/stats/overview`);
    return res.data;
  },
};
