import { AuthService } from "../../../services/authService";
import TelechargementService from "../../../services/TelechargementService";
import LivreService from "../../../services/LivreService";

export default class TelechargementsScreen {
    constructor(container) {
        this.container = container;
        this.authSvc = new AuthService();
        this.telechargementSvc = new TelechargementService();
        this.livreSvc = new LivreService();
    }

  async render() {
 const livres = await this.livreSvc.getAll();
    const telechargeables = livres.filter(l => l.chemin_fichier && !l.deleted);

     this.container.innerHTML = `
      <div class="p-4">
        <h1 class="text-xl font-bold mb-4">Mes Téléchargements</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${telechargeables.map(livre => `
            <div class="bg-white rounded-lg shadow-md p-4">
              <img src="${livre.image}" alt="${livre.titre}" class="w-full h-40 object-cover rounded-md mb-2">
              <h2 class="text-lg font-semibold">${livre.titre}</h2>
              <p class="text-gray-600">Auteur: ${livre.auteur}</p>
              <button 
                class="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onclick="window.open('${livre.chemin_fichier}', '_blank')"
              >
                Télécharger
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

    async loadTelechargements(userId) {
        try {
            const telechargements = await this.telechargementSvc.getUserDownloads(userId);
            
            if (telechargements.length === 0) {
                document.getElementById('telechargementsList').innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">Aucun téléchargement enregistré</td>
                    </tr>
                `;
                return;
            }

            // Récupérer les détails des livres en parallèle
            const telechargementsAvecLivres = await Promise.all(
                telechargements.map(async (tel) => {
                    const livre = await this.livreSvc.getLivreById(tel.id_livre);
                    return { ...tel, livre };
                })
            );

            document.getElementById('telechargementsList').innerHTML = 
                telechargementsAvecLivres.map(this.createTelechargementRow).join('');
        } catch (error) {
            console.error("Erreur loadTelechargements:", error);
            document.getElementById('telechargementsList').innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-red-500">Erreur de chargement des téléchargements</td>
                </tr>
            `;
        }
    }

    createTelechargementRow(telechargement) {
        const date = new Date(telechargement.date_telechargement);
        const dateFormatted = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <tr class="hover:bg-gray-50" data-id="${telechargement.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-md object-cover" 
                                 src="${telechargement.livre?.image || 'https://via.placeholder.com/40'}" 
                                 alt="${telechargement.livre?.titre}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${telechargement.livre?.titre || 'Livre inconnu'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${telechargement.livre?.auteur || 'Auteur inconnu'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${telechargement.format?.toUpperCase() || 'DOCX'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${dateFormatted}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a href="http://localhost:3000/uploads/${telechargement.livre?.chemin_fichier}" 
                       class="text-indigo-600 hover:text-indigo-900 mr-3" download>
                        Télécharger
                    </a>
                    <a href="#/livre/${telechargement.id_livre}" class="text-green-600 hover:text-green-900">
                        Voir
                    </a>
                </td>
            </tr>
        `;
    }
}