import { activeConfig } from '../utils/config.js';

export class CloudinaryClient {
  constructor() {
    const { cloudName, uploadPreset } = activeConfig.cloudinary;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    this.uploadPreset = uploadPreset;
     this.timeout = 15000;
    
  }

  async uploadImage(file) {
    if (!file) throw new Error('Fichier requis pour upload');
    
    if (!(file instanceof File || file instanceof Blob)) {
      throw new Error('Le paramètre doit être un File ou Blob');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    
    // Ajout d'un timestamp pour éviter le cache
    formData.append('timestamp', Date.now());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Cloudinary: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Détails erreur Cloudinary:', {
        error: error.message,
        fileInfo: {
          name: file.name,
          type: file.type,
          size: file.size
        },
        config: {
          cloudName: this.cloudName,
          uploadPreset: this.uploadPreset,
          endpoint: this.uploadUrl
        }
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La connexion a pris trop de temps');
      }
      throw new Error(`Échec upload: ${error.message}`);
    }
  }
}