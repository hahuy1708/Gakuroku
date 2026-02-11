import axios from "axios";
import { Word } from "@/types/dictionary";

const API_URL = "http://localhost:8000/api";

export const dictionaryService = {
  async search(keyword: string): Promise<Word[]> {
    const response = await axios.get(`${API_URL}/search`, {
      params: { keyword }
    });
    return response.data;
  }
};