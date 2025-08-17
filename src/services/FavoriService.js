
import { ApiClient } from "../data/Api-Client.js";

export default class FavoriService {
    constructor(baseUrl = "http://localhost:3000") {
        this.api = new ApiClient(baseUrl);
    }

async getFavorisByUser(userId) {
    try {
        // 1. Récupérer les favoris
        const favorisResponse = await this.api.get(`favorie?id_utilisateur=${userId}`);
        const favoris = favorisResponse.data;
        
        // 2. Récupérer tous les livres
        const livresResponse = await this.api.get('livres');
        const livres = livresResponse.data;
        
        // 3. Combiner les données
        return favoris.map(favori => ({
            ...favori,
            livre: livres.find(l => l.id === favori.id_livre) || null
        }));
    } catch (error) {
        console.error("Erreur getFavorisByUser:", error);
        return [];
    }
}

    async addFavori(livreId, userId) {
        try {
            const response = await this.api.post('favorie', {
                id_livre: livreId,
                id_utilisateur: userId,
                date_ajout: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("Erreur addFavori:", error);
            throw error;
        }
    }

    async removeFavori(favoriId) {
        try {
            const response = await this.api.delete(`favorie/${favoriId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur removeFavori:", error);
            throw error;
        }
    }

    async isFavori(livreId, userId) {
        try {
            const response = await this.api.get(`favorie?id_livre=${livreId}&id_utilisateur=${userId}`);
            return response.data.length > 0;
        } catch (error) {
            console.error("Erreur isFavori:", error);
            return false;
        }
    }

    async getUserFavorisCount(userId) {
    try {
        const response = await this.api.get(`favorie?id_utilisateur=${userId}`);
        return response.data.length;
    } catch (error) {
        console.error("Erreur getUserFavorisCount:", error);
        return 0;
    }
}
}