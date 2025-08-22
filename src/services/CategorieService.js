import { ApiClient } from "../data/Api-Client.js";

export default class CategorieService {
  constructor(baseUrl = "http://localhost:3000") {
    this.api = new ApiClient(baseUrl);
  }

  // Méthodes pour la gestion des catégories
  async getAllCategories() {
    try {
      const response = await this.api.get('categories');
      return response.data || [];
    } catch (error) {
      console.error("Erreur getAllCategories:", error);
      throw new Error("Impossible de charger les catégories. Veuillez réessayer.");
    }
  }


  //Methode pour creer une catégorie
  async createCategory(categoryData) {
    try {
      const response = await this.api.post('categories', categoryData);
      return response;
    } catch (error) {
      console.error("Erreur createCategory:", error);
      throw new Error("Erreur lors de la création de la catégorie.");
    }
  }


  // Methode pour mettre à jour une catégorie
async updateCategory(id, categoryData) {
  try {
    const response = await this.api.put(`categories/${id}`, categoryData);
    return response;
  } catch (error) {
    console.error("Erreur updateCategory:", error);
    throw error;
  }
}


  // Méthode pour supprimer une catégorie
async softDeleteCategory(id) {
  try {
    const response = await this.api.patch(`categories/${id}`, { deleted: true });
    return response;
  } catch (error) {
    console.error("Erreur softDeleteCategory:", error);
    throw new Error("Erreur lors de la suppression de la catégorie.");
  }
}


  // Méthode pour restaurer une catégorie supprimée
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
