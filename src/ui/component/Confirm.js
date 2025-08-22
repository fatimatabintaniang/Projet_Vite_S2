
export const confirm = (message) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900">Confirmation</h3>
          <p class="text-sm text-gray-500 mt-1">${message}</p>
        </div>
        <div class="flex justify-end space-x-3">
          <button id="confirm-cancel" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
            Annuler
          </button>
          <button id="confirm-ok" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Confirmer
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const handleResponse = (result) => {
      modal.remove();
      resolve(result);
    };
    
    modal.querySelector('#confirm-ok').addEventListener('click', () => handleResponse(true));
    modal.querySelector('#confirm-cancel').addEventListener('click', () => handleResponse(false));
  });
};
