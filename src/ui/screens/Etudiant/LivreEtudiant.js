import { AuthService } from "../../../services/authService";
import LivreService from "../../../services/LivreService";
import TelechargementService from "../../../services/TelechargementService";
import FavoriService from "../../../services/FavoriService.js";

export default class StudentBooksScreen {
    constructor(container) {
        this.container = container;
        this.authSvc = new AuthService();
        this.livreSvc = new LivreService();
        this.telechargementSvc = new TelechargementService();
        this.favoriSvc = new FavoriService();
    }

    async render() {
        const user = this.authSvc.getCurrentUser();
        if (!user) return this.container.innerHTML = "<p>Veuillez vous connecter</p>";

        this.container.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold text-indigo-700 mb-8">Bibliothèque Étudiante</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="livresContainer">
                    <!-- Livres seront chargés ici -->
                    <div class="text-center py-8">Chargement en cours...</div>
                </div>
            </div>
        `;

        await this.loadLivres();
    }

async loadLivres() {
    try {
        const user = this.authSvc.getCurrentUser();
        const [livresWithRelations, favoris] = await Promise.all([
            this.livreSvc.getLivresForStudent(),
            this.favoriSvc.getFavorisByUser(user.id)
        ]);
        
        // Marquer les favoris
        const livres = livresWithRelations.map(livre => ({
            ...livre,
            isFavori: favoris.some(f => f.id_livre === livre.id)
        }));

        const container = document.getElementById('livresContainer');
        
        if (livres.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center py-12 text-gray-500">Aucun livre disponible</p>';
            return;
        }

        container.innerHTML = livres.map(livre => this.createBookCard(livre)).join('');
        this.setupEventListeners();
    } catch (error) {
        console.error("Erreur loadLivres:", error);
        document.getElementById('livresContainer').innerHTML = 
            '<p class="col-span-full text-center py-12 text-red-500">Erreur de chargement des livres</p>';
    }
}

    async toggleFavori(livreId) {
        const user = this.authSvc.getCurrentUser();
        try {
            const isFavori = await this.favoriSvc.isFavori(livreId, user.id);
            
            if (isFavori) {
                const favoris = await this.favoriSvc.getFavorisByUser(user.id);
                const favori = favoris.find(f => f.id_livre === livreId);
                if (favori) {
                    await this.favoriSvc.removeFavori(favori.id);
                }
            } else {
                await this.favoriSvc.addFavori(livreId, user.id);
            }
            
            this.loadLivres(); 
        } catch (error) {
            console.error("Erreur toggleFavori:", error);
            alert("Erreur lors de la mise à jour des favoris");
        }
    }

createBookCard(livre) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300" data-id="${livre.id}">
            <div class="relative">
                <img src="${livre.image || 'https://via.placeholder.com/300x200?text=Couverture'}" 
                     alt="${livre.titre}" 
                     class="w-full h-48 object-cover">
                
                <div class="absolute top-2 right-2 flex space-x-2">
                    <button class="favori-btn p-2 bg-white rounded-full shadow-md hover:bg-yellow-100" 
                            title="${livre.isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${livre.isFavori ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}" 
                             viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1 truncate">${livre.titre}</h3>
                <p class="text-gray-600 text-sm mb-2">${livre.auteur || 'Auteur inconnu'}</p>
                
                <div class="flex flex-wrap gap-1 mb-3">
                    ${livre.categorie ? `
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        ${livre.categorie.nom}
                    </span>
                    ` : ''}
                    
                    ${livre.niveau ? `
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        ${livre.niveau.libelle}
                    </span>
                    ` : ''}
                </div>
                
                <div class="flex justify-between mt-4">
                    <button class="telecharger-btn flex items-center text-sm bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700">
                        Télécharger
                    </button>
                    
                    <button class="lire-btn flex items-center text-sm bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700">
                        Lire
                    </button>
                </div>
            </div>
        </div>
    `;
}

    setupEventListeners() {
        // Favori
    document.querySelectorAll('.favori-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const livreId = e.target.closest('[data-id]').dataset.id;
            await this.toggleFavori(livreId); // Utilisez la méthode de la classe
        });
    });

        // Marquer comme lu
        document.querySelectorAll('.lu-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const livreId = e.target.closest('[data-id]').dataset.id;
                // Implémentez cette fonctionnalité selon votre backend
                alert(`Marqué comme lu: ${livreId}`);
            });
        });

        // Téléchargement
        document.querySelectorAll('.telecharger-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const livreId = e.target.closest('[data-id]').dataset.id;
                try {
                    await this.telechargementSvc.enregistrerTelechargement(
                        livreId, 
                        this.authSvc.getCurrentUser().id
                    );
                    alert("Téléchargement enregistré !");
                } catch (error) {
                    console.error("Erreur téléchargement:", error);
                }
            });
        });

        // Lire le livre
        document.querySelectorAll('.lire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const livreId = e.target.closest('[data-id]').dataset.id;
                // Rediriger vers la page de lecture ou ouvrir un modal
                window.location.hash = `#/livre/${livreId}`;
            });
        });
    }
}