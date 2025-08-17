import { AuthService } from "../../../services/authService";
import UtilisateurService from "../../../services/UtilisateurService";
 import TelechargementService from "../../../services/TelechargementService";
import LivreService from "../../../services/LivreService";

export default class DashboardScreen{
 constructor(container) {
    this.container = container;
    this.authSvc = new AuthService();
    this.utilisateurSvc = new UtilisateurService(); 
     this.livreSvc = new LivreService();
     this.telechargementSvc = new TelechargementService();
  }
  async render() {
    this.container.innerHTML = this.getHTMLSkeleton();
    await this.renderStats();
    await this.loadMemoireStats();
    await this.loadDownloadStats();
    
  }

  getHTMLSkeleton() {
    return `
      <div class="min-h-screen bg-gray-50 ">
        <!-- Header with gradient background -->
        <div class=" ">
          <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-black">Tableau de Bord Administrateur</h1>
              <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-sm font-medium text-green-800">
                  <span class="w-2 h-2 mr-2 rounded-full bg-green-800 "></span>
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Stats Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Users Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14a2 2 0 100-4 2 2 0 000 4zm0 4a6 6 0 100-12 6 6 0 000 12zm0-16a10 10 0 110 20A10 10 0 0112 2z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Livres Disponibles</p>
                    <p id="nbLivres" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Roles Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8a4 4 0 100-8 4 4 0 000 8zm0 2a6 6 0 00-6 6v2a2 2 0 002 2h8a2 2 0 002-2v-2a6 6 0 00-6-6z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total enseignant</p>
                    <p id="nbEnseignant" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Permissions Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-green-100 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Etudiant</p>
                    <p id="nbEtudiant" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Card -->
            <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="p-3 rounded-full bg-orange-100 text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5a1 1 0 00-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V7zM11 13h2v2h-2v-2z" />
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Telechargement</p>
                    <p id="nbTelechargement" class="text-2xl font-semibold text-gray-900">...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div class="lg:col-span-2">
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        Statistiques sur les mémoires déposés
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de mémoires</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier dépôt</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200" id="memoireStatsBody">
    <tr>
        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
            Chargement des données...
        </td>
    </tr>
</tbody>
      </table>
    </div>
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
      <button class="text-sm font-medium text-blue-600 hover:text-blue-500">
        Voir toutes les statistiques &rarr;
      </button>
    </div>
  </div>
</div>

            <!-- Quick Actions (1/3 width) -->
            <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 5a1 1 0 10-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V7zM11 13h2v2h-2v-2z" clip-rule="evenodd" />
      </svg>
      Statistiques de téléchargement
    </h2>
  </div>
  <div class="p-6">
    <div class="space-y-4" id="downloadStatsContainer">
      <div class="text-center text-gray-500">
        Chargement des statistiques...
      </div>
    </div>
  </div>
</div>

            </div>
          </div>
        </main>
      </div>
    `;
  }

async renderStats() {
    try {
        // Récupération en parallèle pour meilleures performances
        const [nbEnseignants, nbEtudiants, nbLivres, nbTelechargements] = await Promise.all([
            this.utilisateurSvc.getCountByRole('2'),
            this.utilisateurSvc.getCountByRole('3'),
            this.livreSvc.getTotalLivres(),
            this.telechargementSvc.getTotalTelechargements()
        ]);
        
        // Mise à jour de l'UI
        document.getElementById('nbEnseignant').textContent = nbEnseignants;
        document.getElementById('nbEtudiant').textContent = nbEtudiants;
        document.getElementById('nbLivres').textContent = nbLivres;
        document.getElementById('nbTelechargement').textContent = nbTelechargements;
        
        // Ajoutez des animations pour le feedback visuel
        this.animateCounters();
        
    } catch (error) {
        console.error("Erreur stats:", error);
        this.showErrorState();
    }
}

// Méthodes supplémentaires
animateCounters() {
    const counters = ['nbEnseignant', 'nbEtudiant', 'nbLivres', 'nbTelechargement'];
    counters.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('animate-bounce', 'text-blue-600');
            setTimeout(() => {
                element.classList.remove('animate-bounce', 'text-blue-600');
            }, 1000);
        }
    });
}

showErrorState() {
    const elements = ['nbEnseignant', 'nbEtudiant', 'nbLivres', 'nbTelechargement'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = 'Erreur';
            el.classList.add('text-red-500');
        }
    });
}


async loadMemoireStats() {
    try {
        const stats = await this.livreSvc.getMemoireStats();
        this.renderMemoireStats(stats);
    } catch (error) {
        console.error("Erreur chargement stats mémoires:", error);
        this.showMemoireStatsError();
    }
}

renderMemoireStats(stats) {
    const tbody = document.getElementById('memoireStatsBody');
    if (!tbody) return;
    
    tbody.innerHTML = stats.length === 0
        ? `<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Aucun mémoire trouvé</td></tr>`
        : stats.map(stat => `
            <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${stat.annee}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${stat.specialite}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stat.count}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${stat.lastDownload 
                        ? new Date(stat.lastDownload).toLocaleDateString('fr-FR') 
                        : 'Non téléchargé'}
                </td>
            </tr>
        `).join('');
}

showMemoireStatsError() {
    const tbody = document.querySelector('.min-w-full.divide-y.divide-gray-200 tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-sm text-red-500">
                    Erreur lors du chargement des données
                </td>
            </tr>
        `;
    }
}

async loadDownloadStats() {
    try {
        // Récupérer le total des téléchargements
        const totalDownloads = await this.telechargementSvc.getTotalTelechargements();
        
        // Récupérer les livres les plus téléchargés
        const popularBooks = await this.livreSvc.getPopularBooks(5); // Top 5
        
        this.renderDownloadStats(popularBooks, totalDownloads);
    } catch (error) {
        console.error("Erreur chargement stats téléchargements:", error);
        this.showDownloadStatsError();
    }
}

renderDownloadStats(books, totalDownloads) {
    const container = document.getElementById('downloadStatsContainer');
    if (!container) return;
    
    if (books.length === 0 || totalDownloads === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500">
                Aucune donnée de téléchargement disponible
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="mb-4 text-center">
            <span class="text-sm text-gray-500">Total téléchargements: </span>
            <span class="font-semibold">${totalDownloads}</span>
        </div>
        ${books.map(book => {
            const percentage = totalDownloads > 0 
                ? Math.round((book.downloadCount / totalDownloads) * 100) 
                : 0;
                
            return `
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium text-gray-700 truncate">${book.titre}</span>
                        <span class="text-gray-500">
                            ${book.downloadCount || 0} (${percentage}%)
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-[#F998A9] h-2.5 rounded-full" 
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

showDownloadStatsError() {
    const container = document.getElementById('downloadStatsContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center text-red-500">
                Erreur lors du chargement des statistiques
            </div>
        `;
    }
}
}