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