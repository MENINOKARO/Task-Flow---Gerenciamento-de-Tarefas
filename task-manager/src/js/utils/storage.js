import { columns } from "./dom.js";

export function saveTasks() {

    const tasks = [];

    Object.keys(columns).forEach(columnId => {

        const cards =
            columns[columnId]
                .querySelectorAll(".task-card");

        cards.forEach(card => {

            tasks.push({
                id: card.dataset.id,
                title: card.querySelector("h4").innerText,
                desc: card.querySelector("p").innerText,
                priority: card
                    .querySelector(".priority-tag")
                    .innerText,

                    dueDate: card.querySelector(".task-date")?.innerText || "",
                column: columnId
            });

        });

    });

    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );

}

export function getTasks() {

    return JSON.parse(
        localStorage.getItem("taskflow_tasks") || "[]"
    );

}