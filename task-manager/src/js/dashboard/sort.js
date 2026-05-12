const priorityOrder = {
    "Alta": 3,
    "Média": 2,
    "Baixa": 1
};

export function sortColumn(column) {

    const cards = [
        ...column.querySelectorAll(".task-card")
    ];

    cards.sort((a, b) => {

        const priorityA =
            a.querySelector(".priority-tag")
                .textContent
                .trim();

        const priorityB =
            b.querySelector(".priority-tag")
                .textContent
                .trim();

        return (
            priorityOrder[priorityA] -
            priorityOrder[priorityB]
        );

    });

    cards.forEach(card => {

        column.appendChild(card);

    });

}