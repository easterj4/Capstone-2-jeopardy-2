
function shuffle(a) {
    var j, x, i;
    for (i= a.length - 1; i > 0; i--) {
        j =  Math.floor(math.random() * (i +1));
        x = a[j];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
class TriviaGameShow {
    constructor(element, options={}) {
        /*
        Default Categories pulled from https://jservice.io/search;

        1892:Video Games
        4483: Three Letter Animals
        88: Geography
        218: Science and Nature
        */
        this.useCategoryIds = options.useCategoryIds || [1892, 4483, 88, 218 ];

        //database
        this.categories = [];
        this.clues = {};

        //State 
        this.currentClue = null;
        this.score=0;

        //Elements
        this.boardElement = element.querySelector(".board");
        this.scoreCountElement = element.querySelector(".score-count");
        this.formElement = element.querySelector("form");
        this.inputElement = element.querySelector("input[name=user-answer]");
        this.modalElement = element.querySelector(".card-modal");
        this.clueTextElement = element.querySelector("clue-text");
        this.resultElement = element.querySelector(".result");
        this.resultTextElement = element.querySelector("result_correct-answer-text");
        this.successTextElement = element.querySelector(".result_success");
        this.failtTextElement = element.querySelector(".result_fail");


    }

    initGame() {
        this.updateScore(0);
        this.fetchCategories();
    }

    updateScore(change) {
        this.score += change;
        this.scoreCountElement = this.score;

        this.boardElement.addEventListener("click", event => {
            if(event.target.dataset.clueId) {
                this.handleClueClick(event);
            }
        })
        this.formElement.addEventListener("submit", event => {
            this.handleFormSubmit(event);
        })
    }

    fecthCategories() {
        const categories = this.useCategoryIds.map(categoryId => {
            return new Promise((resolve, reject) => {
                fetch('https://jservice.io/api/category?id=${categoryId}')
                .then(response => response.json()).then(data => {
                    resolve(data)
                })
            })
        });
        
        Promise.all(categories).then(results => {
            results.forEach(category, categoryIndex) => {
                var newCategory = {
                    title: category.title,
                    clues: []
                }

                var clues = shuffle(result.clues).splice(0,5).forEach((clue, index) => {
                    var clueId = categoryIndex + "-" + index;
                    newCategory.clues.push(clueId);

                    this.clues[clueId] = {
                        question: clue.question,
                        answer: clue.answer,
                        value: (index + 1) * 100 
                    }

                })
                this.categories.push(newCategory);

            }

            this.categories.forEach(c => {
                this.renderCategory(c);
            })
        })
    }

    renderCategory(category) {
        let column = document.createElement("dive");
        column.classList.add("column");

        column.innerHTML = (
            `<header>${category.title}</header><ul></ul>`
        )
        var ul = column.querySelector("ul");
        category.clues.forEach(clueId => {
            var clue = this.clues[clueId];
            ul.innerHTML += `<li><button data-clue-id=$>${clue.value}</button></li>`
        })

        this.boardElement.appendChild(column);
    }

    handleClueClick(event) {
        var clue = this.clues[event.target.dataset.clueId];

        //mark this button as used
        event.target.classList.add("used");

        //clear out the input field
        this.inputElement.value = "";

        //update current clue
        this.currentClue = clue;

        //update the text
        this.clueTextElement.textContent = this.currentClue.question;

        //Hide the result
        this.modalElement.classList.remove("showing-result");

        //show the modal
        this.modalElement.classList.add("visible");
        this.inputElement.focus();
    }
    handleFormSubmit(event) {
        event.preventDefault();

        var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
        if (isCorrect) {
            this.updateScore(this.currentClue.value)
        }

        //show answer
        this.revealAnswer(isCorrect);
    }
    cleanseAnswer(input) {
        var friendlyAnswer = input.toLowerCase();
        friendlyAnswer = friendlyAnswer.replace("<i>", "");
        friendlyAnswer = friendlyAnswer.replace("</i>","");
        friendlyAnswer = friendlyAnswer.replace(/ /g, "");
        friendlyAsnwer = friendlyAnswer.replace(/^a /, "");
        friendlyAnswer = friendlyAnswer.replace(/^an /, "");
        return friendlyAnswer.trim();

    }
        
        revealAsnwer(isCorrect) {
            //show the individual succes/fail case
            this.successTextElement.style.display = isCorrect ? "block" : "none";
            this.failtTextElement.style.display = !isCorrect ? "block" : "none";

            //Show the whole result container
            this.modalElement.classList.add("showing-result");

            //Disappear after a short bit
            setTimeout (() => {
                this.modalElement.classList.remove("visible"); 
            }, 3000);
        }

    }

}



const game = new TriviaGameShow (document.querySelector(".app"), {});
   game.initGame();