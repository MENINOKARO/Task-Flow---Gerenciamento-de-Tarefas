import { 
    columns,
    countTodo,
    countDoing,
    countTesting,
    countReview,
    countDone
} from "./dom.js";

export function updateCounts() {

    if (columns.todo) {

        countTodo.innerText =
            columns.todo.children.length;

    }

    if (columns.doing) {

        countDoing.innerText =
            columns.doing.children.length;

    }

    if (columns.done) {

        countDone.innerText =
            columns.done.children.length;

    }

}