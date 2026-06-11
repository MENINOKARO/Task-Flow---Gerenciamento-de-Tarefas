import { searchInput } from "../utils/dom.js";

export function setupSearch() {

    searchInput.addEventListener(
        "input",
        (e) => {

            const term =
                e.target.value.toLowerCase();

            const allCards =
                document.querySelectorAll(".task-card");

            allCards.forEach(card => {

                const title =
                    card.querySelector("h4")
                        .innerText
                        .toLowerCase();

                const desc =
                    card.querySelector("p")
                        .innerText
                        .toLowerCase();

                card.style.display =
                    (
                        title.includes(term) ||
                        desc.includes(term)
                    )
                        ? "block"
                        : "none";

            });

        }
    );

}