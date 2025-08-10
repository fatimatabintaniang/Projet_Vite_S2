import { ApiClient } from "../data/Api-Client.js";

export default class CategorieService {
  constructor(baseUrl = "http://localhost:3000") {
    this.api = new ApiClient(baseUrl);
  }

  async getAllCategories() {
    try {
      const response = await this.api.get('categories');
      return response.data;
    } catch (error) {
      console.error("Erreur getAllCategories:", error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      const response = await this.api.get(`categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur getCategoryById:", error);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await this.api.post('categories', categoryData);
      return response.data;
    } catch (error) {
      console.error("Erreur createCategory:", error);
      throw error;
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await this.api.put(`categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Erreur updateCategory:", error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const response = await this.api.delete(`categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur deleteCategory:", error);
      throw error;
    }
  }
}