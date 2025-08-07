export  function Modal({ title, content, onClose }) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80  hidden";
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">${title}</h2>
        <button class="text-gray-600 hover:text-black" id="close-modal">&times;</button>
      </div>
      <div id="modal-content">${content}</div>
    </div>
  `;

  modal.querySelector("#close-modal").addEventListener("click", () => {
    modal.classList.add("hidden");
    onClose?.();
  });

  return modal;
}