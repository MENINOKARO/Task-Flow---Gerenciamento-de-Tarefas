export function showMessage(elementId, text, type) {
    const msg = document.querySelector(elementId);

    msg.innerText = text;

    msg.className = "p-3 rounded-md text-sm font-medium mb-4 text-center";

    if (type === "error") {
        msg.classList.add("bg-red-100", "text-red-700");
    } else {
        msg.classList.add("bg-green-100", "text-green-700");
    }

    msg.classList.remove("hidden");
}