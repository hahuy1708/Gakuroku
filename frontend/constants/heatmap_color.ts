
export const HEATMAP_COLORS = {
  levels: {
    0: "#ebedf0", 
    1: "#9be9a8",  
    2: "#40c463", 
    3: "#30a14e",  
    4: "#216e39",  
  },
  
  border: "rgba(27, 31, 35, 0.06)",
  
  text: "#57606a"
};

/**
 * @param count - number of flashcards studied in the day
 */
export const getHeatmapColor = (count: number): string => {
  if (count === 0) return HEATMAP_COLORS.levels[0];
  if (count <= 3) return HEATMAP_COLORS.levels[1];
  if (count <= 6) return HEATMAP_COLORS.levels[2];
  if (count <= 9) return HEATMAP_COLORS.levels[3];
  return HEATMAP_COLORS.levels[4];
};