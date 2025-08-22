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
        <div class="grid grid-cols-2 justify-between">
         <h1 class="text-3xl font-bold text-[#873A0E] mb-8">Bibliothèque Étudiante</h1>
            
            <!--  recherche -->
            <div class="mb-6">
                <div class="relative">
                    <input type="text" id="searchInput" placeholder="Rechercher par titre ou auteur..." 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#873A0E]">
                    <button id="searchButton" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#873A0E] text-white px-4 py-1 rounded-md hover:bg-[#6B2D0B]">
                        Rechercher
                    </button>
                </div>
            </div>
        </div>
           
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="livresContainer">
                <div class="text-center py-8">Chargement en cours...</div>
            </div>
        </div>
    `;

    await this.loadLivres();
    this.setupSearch(); // Initialiser la recherche
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

    setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    // Recherche lors du clic sur le bouton
    searchButton.addEventListener('click', () => {
        this.searchLivres(searchInput.value.trim());
    });
    
    // Recherche lors de la touche Entrée
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            this.searchLivres(searchInput.value.trim());
        }
    });
}

async searchLivres(searchTerm) {
    try {
        const container = document.getElementById('livresContainer');
        container.innerHTML = '<div class="text-center py-8">Recherche en cours...</div>';
        
        // Récupère tous les livres si le terme est vide
        if (!searchTerm) {
            await this.loadLivres();
            return;
        }
        
        const livres = await this.livreSvc.searchLivres(searchTerm);
        const user = this.authSvc.getCurrentUser();
        const favoris = await this.favoriSvc.getFavorisByUser(user.id);
        
        // Marquer les favoris
        const livresWithFavoris = livres.map(livre => ({
            ...livre,
            isFavori: favoris.some(f => f.id_livre === livre.id)
        }));
        
        if (livresWithFavoris.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center py-12 text-gray-500">Aucun résultat trouvé</p>';
            return;
        }
        
        container.innerHTML = livresWithFavoris.map(livre => this.createBookCard(livre)).join('');
        this.setupEventListeners();
    } catch (error) {
        console.error("Erreur searchLivres:", error);
        document.getElementById('livresContainer').innerHTML = 
            '<p class="col-span-full text-center py-12 text-red-500">Erreur lors de la recherche</p>';
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${livre.isFavori ? 'text-[#F998A9] fill-[#F998A9]' : 'text-gray-400'}" 
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
                    <button class="telecharger-btn flex items-center text-sm bg-[#873A0E] text-white px-3 py-2 rounded-md hover:bg-[#873A0E]">
                        Télécharger
                    </button>
                    
                   <button class="lire-btn flex items-center text-sm bg-[#F998A9] text-white px-3 py-2 rounded-md hover:bg-[#e87f92]"
                        data-fichier="${livre.chemin_fichier}">
                    Lire
                </button>
                </div>
            </div>
        </div>
    `;
}

openBookReader(livreId, fichier) {
    // Vérifiez le type de fichier pour déterminer comment l'ouvrir
    const extension = fichier.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') {
        // Pour les PDF, nous pouvons les ouvrir directement dans un nouvel onglet
        const pdfUrl = `${window.location.origin}/uploads/${fichier}`;
        window.open(pdfUrl, '_blank');
    } else {
        // Pour les autres formats (comme Word), vous pourriez:
        // 1. Utiliser un service en ligne comme Google Docs Viewer
        // 2. Télécharger le fichier
        // 3. Afficher un message d'erreur
        
        // Exemple avec Google Docs Viewer:
        const fileUrl = encodeURIComponent(`${window.location.origin}/uploads/${fichier}`);
        const googleViewerUrl = `https://docs.google.com/viewer?url=${fileUrl}&embedded=true`;
        
        // Ouvrir dans une nouvelle fenêtre
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lecteur de document</title>
                <style>
                    body, html { margin: 0; padding: 0; height: 100%; }
                    iframe { width: 100%; height: 100%; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${googleViewerUrl}"></iframe>
            </body>
            </html>
        `);
    }
    

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
        const fichier = e.target.getAttribute('data-fichier');
        
        // Ouvrir le fichier dans un nouvel onglet
        this.openBookReader(livreId, fichier);
    });
});
    }
}