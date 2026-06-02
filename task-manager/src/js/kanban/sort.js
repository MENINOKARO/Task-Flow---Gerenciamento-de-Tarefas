const priorityOrder = {
    "ALTA": 1,
    "MÉDIA": 2,
    "BAIXA": 3
};

export function sortColumn(column) {
    if (!column) return;

    const cards = [
        ...column.querySelectorAll(".task-card, [data-priority]")
    ];

    cards.sort((a, b) => {
        // Busca a prioridade diretamente do atributo data-priority em maiúsculo
        const priorityA = (a.dataset.priority || "MEDIUM").toUpperCase();
        const priorityB = (b.dataset.priority || "MEDIUM").toUpperCase();

        // Mapeamento interno para garantir que valores salvos em inglês (high, medium, low) também funcionem
        const translation = {
            "HIGH": "ALTA", "ALTA": "ALTA",
            "MEDIUM": "MÉDIA", "MÉDIA": "MÉDIA",
            "LOW": "BAIXA", "BAIXA": "BAIXA"
        };

        const keyA = translation[priorityA] || "MÉDIA";
        const keyB = translation[priorityB] || "MÉDIA";

        return (
            (priorityOrder[keyA] || 999) -
            (priorityOrder[keyB] || 999)
        );
    });

    // Reordena os elementos na árvore do DOM
    cards.forEach(card => {
        column.appendChild(card);
    });
}