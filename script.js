class StorageManager {
  constructor(key) {
    this.key = key;
  }
  load() {
    const storedData = localStorage.getItem(this.key);
    return storedData ? JSON.parse(storedData) : null;
  }
  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }
  clear() {
    localStorage.removeItem(this.key);
  }
}
class Question {
  constructor({ id, text, options, correctIndex }) {
    this.id = id;
    this.text = text;
    this.options = options;
    this.correctIndex = correctIndex;
  }
  getType() {
    return "base";
  }
  isCorrect(answerIndex) {
    return Number(answerIndex) === this.correctIndex;
  }
}

class MultipleChoiceQuestion extends Question {
  getType() {
    return "mcq";
  }
}

class TrueFalseQuestion extends Question {
  constructor({ id, text, correctIndex }) {
    this.id = id;
    this.text = text;
    this.options = ["True", "False"];
    this.correctIndex = correctIndex;
  }
  getType() {
    return "truefalse";
  }
}
class Attempt {
  constructor({ pass = 0.7 } = {}) {
    this.id = Math.random();
    this.answers = {};
    this.finished = false;
    this.pass = pass;
  }
  answer(questionId, optionIndex) {
    if (this.finished) return;
    this.answers[questionId] = Number(optionIndex);
  }
  reset() {
    if (this.finished) return;
    this.answers = {};
  }
  finish() {
    this.finished = true;
  }
  score(questions) {
    let correct = 0;
    for (const q of questions) {
      if (q.isCorrect(this.answers[q.id])) correct++;
    }
    const total = questions.length;
    const ratio = total ? correct / total : 0;
    return { correct, total, ratio, passed: ratio >= this.pass };
  }
}
class Quiz {
  constructor({ questions, pass = 0.7, storageKey = "quiz" }) {
    this.questions = questions;
    this.rootEl = rootEl;
    this.attempt = new Attempt({ pass });
    this.restoreOrCreateAttempt();
    this.render();
  }

  restoreOrCreateAttempt() {
    const saved = this.storage.load();
    if (saved && saved.finished) {
      this.storage.clear();
      this.attempt = new Attempt({ pass: saved.pass || 0.7 });
      this.persist();
    } else if (saved) {
      this.attempt = Object.assign(new Attempt(), saved);
    } else {
      this.persist();
    }
  }

  persist() {
    this.storage.save({
      id: this.attempt.id,
      answers: this.attempt.answers,
      finished: this.attempt.finished,
      pass: this.attempt.pass,
    });
  }

  setAnswer(qid, optionIndex) {
    this.attempt.answer(qid, optionIndex);
    this.persist();
  }

  resetAnswers() {
    this.attempt.reset();
    this.persist();
    this.renderQuestionsOnly();
  }

  submit() {
    this.attempt.finish();
    const result = this.attempt.score(this.questions);
    this.persist();
    this.rootEl
      .querySelectorAll('input[type="radio"]')
      .forEach((el) => (el.disabled = true));
    document.getElementById("submit-btn").disabled = true;
  }
  render() {
    this.rootEl.innerHTML = "";

    const questionCards = this.questions.map((q) => this.renderQuestionCard(q));
    this.rootEl.append(...questionCards);

    this.attachControls();

    if (this.attempt.finished) {
      const result = this.attempt.score(this.questions);
      this.renderResult(result);
      this.rootEl
        .querySelectorAll('input[type="radio"]')
        .forEach((el) => (el.disabled = true));
      document.getElementById("submit-btn").disabled = true;
    }
  }

  renderQuestionsOnly() {
    this.rootEl.innerHTML = "";

    const questionCards = this.questions.map((q) => this.renderQuestionCard(q));
    this.rootEl.append(...questionCards);
  }

  renderQuestionCard(question) {
    const card = document.createElement("article");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = `Q${question.id}. ${question.text}`;
    card.appendChild(title);

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options";

    question.options.forEach((opt, idx) => {
      const optionId = `q${question.id}_opt${idx}`;
      const optDiv = document.createElement("div");
      optDiv.className = "option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q-${question.id}`;
      radio.id = optionId;
      radio.value = idx;
      radio.checked = this.attempt.answers[question.id] === idx;
      radio.addEventListener("change", () => this.setAnswer(question.id, idx));

      const label = document.createElement("label");
      label.setAttribute("for", optionId);
      label.textContent = opt;

      optDiv.appendChild(radio);
      optDiv.appendChild(label);
      optionsContainer.appendChild(optDiv);
    });

    card.appendChild(optionsContainer);
    return card;
  }

  renderResult({ correct, total, ratio, passed }) {
    const resultEl = document.getElementById("result");
    resultEl.classList.remove("hidden", "pass", "fail");
    resultEl.classList.add(passed ? "pass" : "fail");
    const pct = Math.round(ratio * 100);
    resultEl.innerHTML = `
      <h3>Final Result</h3>
      <p>Score: <strong>${correct}</strong> / <strong>${total}</strong> (${pct}%)</p>
      <p>Status: <strong>${passed ? "PASS" : "FAIL"}</strong>
      <br>
       (To pass, you must score ≥ ${Math.round(this.attempt.pass * 100)}%)
       </p>
      <p>Refresh the page to start a fresh attempt.</p>
    `;
  }

  attachControls() {
    const resetBtn = document.getElementById("reset-btn");
    const submitBtn = document.getElementById("submit-btn");
    resetBtn.onclick = () => this.resetAnswers();
    submitBtn.onclick = () => this.submit();
  }
}
const QUESTIONS = [
  new MultipleChoiceQuestion({
    id: 1,
    text: "Which HTML element is used to include JavaScript code?",
    options: ["<script>", "<js>", "<javascript>", "<code>"],
    correctIndex: 0,
  }),
  new MultipleChoiceQuestion({
    id: 2,
    text: "Which method adds an item to the end of a JavaScript array?",
    options: ["push()", "append()", "add()", "insert()"],
    correctIndex: 0,
  }),
  new MultipleChoiceQuestion({
    id: 3,
    text: "Which method adds an item to the start of a JavaScript array?",
    options: ["push()", "append()", "add()", "unshift()"],
    correctIndex: 3,
  }),
  new TrueFalseQuestion({
    id: 4,
    text: "const variables in JavaScript cannot be reassigned.",
    correctIndex: 0,
  }),
  new MultipleChoiceQuestion({
    id: 5,
    text: "Which ES6 feature allows extracting properties from objects into variables?",
    options: ["Hoisting", "Destructuring", "Currying", "Shadowing"],
    correctIndex: 1,
  }),
  new MultipleChoiceQuestion({
    id: 6,
    text: "Which method selects an element by its ID",
    options: [
      "document.getElementById()",
      "document.querySelectorAll()",
      "document.getElementsByClassName()",
      "document.querySelector()",
    ],
    correctIndex: 0,
  }),
  new TrueFalseQuestion({
    id: 7,
    text: "pop() removes the first element of an array",
    correctIndex: 1,
  }),
  new MultipleChoiceQuestion({
    id: 8,
    text: "Which array method creates a new array with elements that pass a test?",
    options: ["map()", "reduce()", "filter()", "forEach()"],
    correctIndex: 2,
  }),
  new TrueFalseQuestion({
    id: 9,
    text: "localStorage persists data even after the browser is closed.",
    correctIndex: 0,
  }),
  new MultipleChoiceQuestion({
    id: 10,
    text: "Which keyword is used to create a class in JavaScript?",
    options: ["object", "prototype", "class", "struct"],
    correctIndex: 2,
  }),
];
