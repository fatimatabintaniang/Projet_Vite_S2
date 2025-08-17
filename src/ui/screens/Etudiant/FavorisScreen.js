import { AuthService } from "../../../services/authService.js";
import FavoriService from "../../../services/FavoriService.js";

export default class FavorisScreen {
    constructor(container) {
        this.container = container;
        this.authSvc = new AuthService();
        this.favoriSvc = new FavoriService();
    }

    async render() {
        const user = this.authSvc.getCurrentUser();
        if (!user) return this.container.innerHTML = "<p>Veuillez vous connecter</p>";

        this.container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-2xl font-bold text-indigo-700 mb-6">Mes livres favoris</h1>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="favorisContainer">
                    <div class="text-center py-8">Chargement en cours...</div>
                </div>
            </div>
        `;

        await this.loadFavoris();
    }

    async loadFavoris() {
        try {
            const user = this.authSvc.getCurrentUser();
            const favoris = await this.favoriSvc.getFavorisByUser(user.id);
            
            const container = document.getElementById('favorisContainer');
            
            if (!favoris || favoris.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-gray-500 mb-4">Vous n'avez aucun livre favori pour le moment</p>
                        <a href="#livreEtudiant" class="text-indigo-600 hover:underline">
                            Parcourir les livres
                        </a>
                    </div>
                `;
                return;
            }

            container.innerHTML = favoris.map(favori => {
                // Vérification que le livre existe dans les données
                if (!favori.livre) {
                    console.warn("Livre manquant pour le favori:", favori.id);
                    return '';
                }
                return this.createFavoriCard(favori);
            }).join('');

            // Ajouter les écouteurs d'événements
            this.setupEventListeners();

        } catch (error) {
            console.error("Erreur loadFavoris:", error);
            document.getElementById('favorisContainer').innerHTML = 
                '<p class="col-span-full text-center py-12 text-red-500">Erreur de chargement des favoris</p>';
        }
    }

    createFavoriCard(favori) {
        const livre = favori.livre || {}; // Fallback si livre est undefined
        
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="relative">
                    <img src="${livre.image || 'https://via.placeholder.com/300x200?text=Couverture+non+disponible'}" 
                         alt="${livre.titre || 'Livre sans titre'}" 
                         class="w-full h-48 object-cover">
                </div>
                
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-1 truncate">${livre.titre || 'Titre inconnu'}</h3>
                    <p class="text-gray-600 text-sm mb-2">${livre.auteur || 'Auteur inconnu'}</p>
                    
                    <div class="flex justify-between mt-4">
                        <button class="remove-favori-btn flex items-center text-sm bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                                data-id="${favori.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Retirer
                        </button>
                        
                        <a href="#/livre/${livre.id}" class="flex items-center text-sm bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Lire
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.querySelectorAll('.remove-favori-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const favoriId = e.target.closest('button').dataset.id;
                try {
                    await this.favoriSvc.removeFavori(favoriId);
                    this.loadFavoris(); // Recharger la liste après suppression
                } catch (error) {
                    console.error("Erreur suppression favori:", error);
                    alert("Erreur lors de la suppression du favori");
                }
            });
        });
    }
}