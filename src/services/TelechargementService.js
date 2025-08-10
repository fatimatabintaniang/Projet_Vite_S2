import { ApiClient } from "../data/Api-Client.js";

export default class TelechargementService {
    constructor(baseUrl = "http://localhost:3000") {
        this.api = new ApiClient(baseUrl);
    }

    async getTotalTelechargements() {
        try {
            const response = await this.api.get('telechargements');
            return response.data.length; 
        } catch (error) {
            console.error("Erreur getTotalTelechargements:", error);
            return 0;
        }
    }

 
}