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
}