import Sortable from "sortablejs";

import { columns } from "./dom.js";

import { updateCounts } from "./counters.js";

import { saveTasks } from "./storage.js";

import { sortColumn } from "./sort.js";

export function setupDragAndDrop() {

    Object.values(columns).forEach(column => {

        if (!column) return;

        Sortable.create(column, {

            group: "kanban",

            animation: 200,

            ghostClass: "opacity-50",

            dragClass: "rotate-2",

            onEnd: () => {

                updateCounts();

                saveTasks();

            }

        });

    });

}