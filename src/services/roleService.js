import { ApiClient } from "../data/Api-Client.js";

export class RoleService {
  constructor() {
    this.api = new ApiClient("http://localhost:3000");
  }

  // Méthode pour lister tous les rôles
  async list() {
    try {
      const response = await this.api.get("roles");
      console.log("Roles reçus :", response.data); 
      return response.data; 
    } catch (error) {
      console.error("Erreur lors de la récupération des rôles :", error);
      throw error; 
    }
  }
}