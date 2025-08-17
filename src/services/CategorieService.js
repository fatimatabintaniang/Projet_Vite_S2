import { ApiClient } from "../data/Api-Client.js";

export default class CategorieService {
  constructor(baseUrl = "http://localhost:3000") {
    this.api = new ApiClient(baseUrl);
  }

  async getAllCategories() {
    try {
      const response = await this.api.get('categories');
      return response.data || [];
    } catch (error) {
      console.error("Erreur getAllCategories:", error);
      throw new Error("Impossible de charger les catégories. Veuillez réessayer.");
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await this.api.post('categories', categoryData);
      return response;
    } catch (error) {
      console.error("Erreur createCategory:", error);
      throw new Error("Erreur lors de la création de la catégorie.");
    }
  }

async updateCategory(id, categoryData) {
  try {
    // Utilisez la route complète 'categories/id' au lieu de séparer les paramètres
    const response = await this.api.put(`categories/${id}`, categoryData);
    return response;
  } catch (error) {
    console.error("Erreur updateCategory:", error);
    throw error;
  }
}

async softDeleteCategory(id) {
  try {
    const response = await this.api.patch(`categories/${id}`, { deleted: true });
    return response;
  } catch (error) {
    console.error("Erreur softDeleteCategory:", error);
    throw new Error("Erreur lors de la suppression de la catégorie.");
  }
}

async restoreCategory(id) {
  try {
    const response = await this.api.patch(`categories/${id}`, { deleted: false });
    return response;
  } catch (error) {
    console.error("Erreur restoreCategory:", error);
    throw new Error("Erreur lors de la restauration de la catégorie.");
  }
}

}
