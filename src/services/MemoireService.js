import { ApiClient } from "../data/Api-Client.js";

export default class MemoireService {
  constructor(baseUrl = "http://localhost:3000") {
    this.api = new ApiClient(baseUrl);
  }

  async getAllMemoires() {
    try {
      const { data } = await this.api.get("memoire"); // Utilisation de ApiClient
      return data;
    } catch (error) {
      console.error("Erreur dans getAllMemoires:", error);
      throw error;
    }
  }

  async getMemoireById(id) {
    try {
      const { data } = await this.api.get(`memoire/${id}`);
      return data;
    } catch (error) {
      console.error("Erreur dans getMemoireById:", error);
      throw new Error("Mémoire non trouvé");
    }
  }

  async createMemoire(memoire) {
    try {
      return await this.api.post("memoire", memoire);
    } catch (error) {
      console.error("Erreur dans createMemoire:", error);
      throw error;
    }
  }

  async updateMemoire(id, memoire) {
    try {
      return await this.api.put("Memoire", id, memoire);
    } catch (error) {
      console.error("Erreur dans updateMemoire:", error);
      throw error;
    }
  }

  async deleteMemoire(id) {
    try {
      return await this.api.patch("memoire", id, { deleted: true });
    } catch (error) {
      console.error("Erreur dans deleteMemoire:", error);
      throw error;
    }
  }

  async softDeleteMemoire(){
    try {
      return await this.api.patch("memoire", { deleted: false });
      } catch (error) {
        console.error("Erreur dans softDeleteMemoire:", error);
        throw error
        }
  }
}