import { ApiClient } from "../data/Api-Client.js";

export default class TelechargementService {
    constructor(baseUrl = "http://localhost:3000") {
        this.api = new ApiClient(baseUrl);
    }

    // Méthode pour récupérer le nombre de téléchargements d'un utilisateur
    async getUserDownloadsCount(userId) {
        try {
            const response = await this.api.get(`telechargements?id_utilisateur=${userId}`);
            return response.data.length;
        } catch (error) {
            console.error("Erreur getUserDownloadsCount:", error);
            return 0;
        }
    }
// Méthode pour récupérer les téléchargements d'un utilisateur
    async getUserDownloads(userId) {
        try {
            const response = await this.api.get(`telechargements?id_utilisateur=${userId}&_expand=livre`);
            return response.data;
        } catch (error) {
            console.error("Erreur getUserDownloads:", error);
            return [];
        }
    }
// Méthode pour enregistrer un téléchargement
async enregistrerTelechargement(livreId, userId) {
    try {
        const response = await this.api.post('telechargements', {
            id_livre: livreId,
            id_utilisateur: userId,
            date_telechargement: new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        console.error("Erreur enregistrerTelechargement:", error);
        throw error;
    }
}
// Méthode pour récupérer le nombre total de téléchargements
async getTotalTelechargements() {
    try {
       
        const allDownloads = await this.api.get('telechargements');
        return allDownloads.data.length;
    } catch (error) {
        console.error("Erreur getTotalTelechargements:", error);
        return 0; // Valeur par défaut en cas d'erreur
    }
}
}