// src/js/kanban/sort.js

const priorityOrder = {
    "ALTA": 1,
    "MÉDIA": 2,
    "BAIXA": 3
};

export function sortColumn(column) {
    if (!column) return;

    // 🌟 CORREÇÃO DE SELETORES: Pega todos os elementos filhos diretos da coluna (que são os cards)
    const cards = Array.from(column.children);

    if (cards.length <= 1) return; // Não precisa ordenar se tiver 0 ou 1 card

    cards.sort((a, b) => {
        // 🌟 CORREÇÃO DA BUSCA: Acha a tag span de prioridade dentro do card e limpa o texto
        const spanA = a.querySelector("span");
        const spanB = b.querySelector("span");

        const priorityA = spanA ? spanA.textContent.trim().toUpperCase() : "MÉDIA";
        const priorityB = spanB ? spanB.textContent.trim().toUpperCase() : "MÉDIA";

        // Mapeamento para aceitar qualquer variação vinda do card
        const translation = {
            "HIGH": "ALTA", "ALTA": "ALTA",
            "MEDIUM": "MÉDIA", "MÉDIA": "MÉDIA", "MEDIA": "MÉDIA",
            "LOW": "BAIXA", "BAIXA": "BAIXA"
        };

        const keyA = translation[priorityA] || "MÉDIA";
        const keyB = translation[priorityB] || "MÉDIA";

        return (
            (priorityOrder[keyA] || 999) -
            (priorityOrder[keyB] || 999)
        );
    });

    // Reordena os elementos na árvore do DOM mantendo os inputs/comentários intactos
    cards.forEach(card => {
        column.appendChild(card);
    });
}