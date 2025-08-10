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
            <!-- Recent Activity (2/3 width) -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    Nombre de consultations par mois
                  </h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr class="hover:bg-gray-50 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                              <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">Fatimata Binta</div>
                              <div class="text-sm text-gray-500">niang@gmail.com</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Création de rôle
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:45 AM</td>
                      </tr>
                      <tr class="hover:bg-gray-50 transition-colors duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10">
                              <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">Mamy Diallo</div>
                              <div class="text-sm text-gray-500">mamy@gmail.com</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Modification permission
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">09:30 AM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 text-right">
                  <button class="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Voir toute l'activité &rarr;
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick Actions (1/3 width) -->
            <div class="space-y-6">
              <!-- Quick Actions Card -->
              <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 5a1 1 0 10-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V7zM11 13h2v2h-2v-2z" clip-rule="evenodd" />
                    </svg>
                    Top Livres les plus lus
                  </h2>
                </div>
                <div class="p-6 space-y-4">
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                    Ajouter Utilisateur
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947z" clip-rule="evenodd" />
                    </svg>
                    Gérer les Rôles
                  </button>
                  <button class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    Voir les Permissions
                  </button>
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


}