import { ApiClient } from "../data/Api-Client.js";

export default class UtilisateurService {
  constructor(baseUrl) {
   this.api = new ApiClient("http://localhost:3000");
    this.cache = {
      utilisateurs: null,
      roles: null,
      lastFetch: null
    };
  }

  // Rafraîchit le cache si nécessaire (5 minutes de cache)
  async _refreshCacheIfNeeded() {
    const now = Date.now();
    if (!this.cache.lastFetch || (now - this.cache.lastFetch) > 300000) {
      const [utilisateurs, roles] = await Promise.all([
        this.api.get('utilisateurs'),
        this.api.get('roles')
      ]);
      
      this.cache = {
        utilisateurs: utilisateurs.data,
        roles: roles.data,
        lastFetch: now
      };
    }
  }

   async getAllUtilisateurs(forceRefresh = false) {
    if (forceRefresh) this.cache.lastFetch = null;
    await this._refreshCacheIfNeeded();
    
    return this.cache.utilisateurs.filter(u => {
      // Gère à la fois les booléens et les strings "true"/"false"
      const isDeleted = typeof u.deleted === 'string' 
        ? u.deleted.toLowerCase() === 'true'
        : Boolean(u.deleted);
      
      return !isDeleted;
    });
  }

  async getAllEnseignants() {
    const users = await this.getAllUtilisateurs();
    return users.filter(u => u.id_role === '2');
  }

  async getAllEtudiants() {
    const users = await this.getAllUtilisateurs();
    return users.filter(u => u.id_role === '3');
  }

  async getCountByRole(roleId) {
    const users = await this.getAllUtilisateurs();
    return users.filter(u => u.id_role === roleId).length;
  }

  async getUtilisateurById(id) {
    try {
      // Essaye d'abord d'utiliser le cache
      await this._refreshCacheIfNeeded();
      const cached = this.cache.utilisateurs.find(u => u.id === id);
      if (cached && !cached.deleted) return cached;
      
      // Si pas trouvé dans le cache, fetch depuis l'API
      const response = await this.api.get(`utilisateurs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur getUtilisateurById(${id}):`, error);
      return null;
    }
  }

  async createUtilisateur(userData) {
    try {
      const newUser = await this.api.post('utilisateurs', userData);
      // Invalide le cache
      this.cache.lastFetch = null;
      return newUser;
    } catch (error) {
      console.error('Erreur createUtilisateur:', error);
      throw error;
    }
  }

  async updateUtilisateur(id, updates) {
    try {
      const updated = await this.api.patch('utilisateurs', id, updates);
      // Met à jour le cache si nécessaire
      if (this.cache.utilisateurs) {
        const index = this.cache.utilisateurs.findIndex(u => u.id === id);
        if (index !== -1) {
          this.cache.utilisateurs[index] = updated;
        }
      }
      return updated;
    } catch (error) {
      console.error(`Erreur updateUtilisateur(${id}):`, error);
      throw error;
    }
  }

  async deleteUtilisateur(id) {
    try {
      // Soft delete
      await this.api.patch('utilisateurs', id, { deleted: true, deletedAt: new Date().toISOString() });
      // Met à jour le cache
      if (this.cache.utilisateurs) {
        const index = this.cache.utilisateurs.findIndex(u => u.id === id);
        if (index !== -1) {
          this.cache.utilisateurs[index].deleted = true;
          this.cache.utilisateurs[index].deletedAt = new Date().toISOString();
        }
      }
      return true;
    } catch (error) {
      console.error(`Erreur deleteUtilisateur(${id}):`, error);
      return false;
    }
  }

  async getRoleLibelle(roleId) {
    try {
      await this._refreshCacheIfNeeded();
      const role = this.cache.roles.find(r => r.id === roleId);
      return role ? role.libelle : 'Inconnu';
    } catch (error) {
      console.error(`Erreur getRoleLibelle(${roleId}):`, error);
      return 'Inconnu';
    }
  }

  async getStats() {
    try {
      const [enseignants, etudiants] = await Promise.all([
        this.getCountByRole('2'),
        this.getCountByRole('3')
      ]);
      
      return {
        totalEnseignants: enseignants,
        totalEtudiants: etudiants,
        totalUtilisateurs: enseignants + etudiants,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur getStats:', error);
      return {
        totalEnseignants: 0,
        totalEtudiants: 0,
        totalUtilisateurs: 0,
        error: true
      };
    }
  }
}