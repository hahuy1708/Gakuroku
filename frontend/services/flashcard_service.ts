// services/flashcard_service.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const flashcardService = {
  // --- LISTS ---
  async getLists() {
    const res = await axios.get(`${API_URL}/lists`);
    return res.data; 
  },
  
  async createList(name: string) {
    const res = await axios.post(`${API_URL}/lists`, { name });
    return res.data;
  },

  async deleteList(listId: number) {
    await axios.delete(`${API_URL}/lists/${listId}`);

  },

  async updateList(listId: number, name?: string, description?: string) {
    const res = await axios.patch(`${API_URL}/lists/${listId}`, { name, description });
    return res.data;
},

  // --- CARDS ---
  async addCardToList(listId: number, entryId: string, note: string = "") {
    const res = await axios.post(`${API_URL}/flashcards`, {
      list_id: listId,
      entry_id: entryId,
      note: note
    });
    return res.data;
  },

  async getCardsInList(listId: number) {
    const res = await axios.get(`${API_URL}/lists/${listId}/flashcards`);
    return res.data;
  },

  async deleteCard(cardId: number) {
    await axios.delete(`${API_URL}/flashcards/${cardId}`);
  },

  async updateCard(cardId: number, is_memorized: boolean, note: string) {
    const res = await axios.patch(`${API_URL}/flashcards/${cardId}`, { is_memorized, note });
    return res.data;
  }
};