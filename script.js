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