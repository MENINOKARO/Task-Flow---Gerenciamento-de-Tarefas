const priorityOrder = {
    "Alta": 1,
    "Média": 2,
    "Baixa": 3
};

export function sortColumn(column) {

    const cards = [
        ...column.querySelectorAll(".task-card")
    ];

    cards.sort((a, b) => {

        const priorityA =
            a.querySelector(".priority-tag")
                ?.textContent
                ?.trim() || "Baixa";

        const priorityB =
            b.querySelector(".priority-tag")
                ?.textContent
                ?.trim() || "Baixa";

        return (
            (priorityOrder[priorityA] || 999) -
            (priorityOrder[priorityB] || 999)
        );

    });

    cards.forEach(card => {
        column.appendChild(card);
    });

}