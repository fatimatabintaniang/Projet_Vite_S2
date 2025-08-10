// src/services/livreService.js
import { ApiClient } from "../data/Api-Client.js";

export default class LivreService {
    constructor(baseUrl = "http://localhost:3000") {
        this.api = new ApiClient(baseUrl);
    }

    async getAllLivres() {
        try {
            const response = await this.api.get('livres?_expand=categorie&_expand=niveau&_expand=matiere');
            return response.data;
        } catch (error) {
            console.error("Erreur getAllLivres:", error);
            throw error;
        }
    }

    async getLivreById(id) {
        try {
            const response = await this.api.get(`livres/${id}?_expand=categorie&_expand=niveau&_expand=matiere`);
            return response.data;
        } catch (error) {
            console.error("Erreur getLivreById:", error);
            throw error;
        }
    }

    async createLivre(livreData) {
        try {
            const response = await this.api.post('livres', livreData);
            return response.data;
        } catch (error) {
            console.error("Erreur createLivre:", error);
            throw error;
        }
    }

    async updateLivre(id, livreData) {
        try {
            const response = await this.api.put(`livres/${id}`, livreData);
            return response.data;
        } catch (error) {
            console.error("Erreur updateLivre:", error);
            throw error;
        }
    }

    async deleteLivre(id) {
        try {
            const response = await this.api.delete(`livres/${id}`);
            return response.data;
        } catch (error) {
            console.error("Erreur deleteLivre:", error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await this.api.get('categories');
            return response.data;
        } catch (error) {
            console.error("Erreur getCategories:", error);
            throw error;
        }
    }

    async getNiveaux() {
        try {
            const response = await this.api.get('niveaux');
            return response.data;
        } catch (error) {
            console.error("Erreur getNiveaux:", error);
            throw error;
        }
    }

    async getMatieres() {
        try {
            const response = await this.api.get('matieres');
            return response.data;
        } catch (error) {
            console.error("Erreur getMatieres:", error);
            throw error;
        }
    }

    async uploadImage(file) {
        // Dans une vraie application, vous utiliseriez un service comme Cloudinary
        // Pour cet exemple, nous allons simuler un upload
        return new Promise((resolve) => {
            setTimeout(() => {
                const fakeUrl = `https://example.com/uploads/${file.name}`;
                resolve(fakeUrl);
            }, 1000);
        });
    }

    async getTotalLivres() {
        try {
            const response = await this.api.get('livres');
            return response.data.length; 
        } catch (error) {
            console.error("Erreur getTotalLivres:", error);
            return 0;
        }
    }
}