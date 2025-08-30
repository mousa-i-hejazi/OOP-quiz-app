# Technical Requirement

This document translates the user stories into concrete technical items.

## 1) Display all questions at once

- Render all questions inside `#quiz` in a single DOM pass.
- Each question is an **article.card** with title and options.
- Use **radio** inputs named per-question (e.g., `q-1`) to allow a single selection per question.

## 2) Multiple options per question (MCQ/True-False)

- Base class: `Question` with `id`, `text`, `options`, `correctIndex`, `isCorrect()`.
- Subclasses:
  - `MultipleChoiceQuestion` (no changes beyond type)
  - `TrueFalseQuestion` (provides fixed `['True', 'False']` options)

## 3) Reset button

- `Quiz.resetAnswers()`:
  - Sets `Attempt.answers = {}`
  - Persists the cleared state to localStorage
  - Re-renders question cards

## 4) Submit button

- `Quiz.submit()`:
  - Sets `Attempt.finished = true`
  - Computes score via `Attempt.score(questions)`
  - Renders results (score, percent, pass/fail)
  - Disables all inputs and the submit button

## 5) Final score + pass/fail

- Pass threshold configured at **70%** via `pass = 0.7`.
- `Attempt.score` returns `{ correct, total, ratio, passed }`.

## 6) Temporary persistence during active attempt

- Storage key: `oop_quiz`.
- Persist the `Attempt` snapshot after **every selection** and on **reset/submit**.

## 7) Start fresh after finishing

- Restore state. If `saved.finished === true`:
  - Clear localStorage
  - Create a new `Attempt`
  - Persist the new attempt

## 8) OOP Principles

- **Encapsulation**: `Attempt`, `Quiz`, `StorageManager` hide their internal data behind methods.
- **Inheritance**: `MultipleChoiceQuestion` and `TrueFalseQuestion` extend `Question`.
- **Polymorphism**: `getType()` allows future specialized rendering/behavior per question type.
- **Abstraction**: `Quiz` orchestrates without exposing storage implementation.

## 9) DOM Manipulation

- Create elements with `document.createElement`.
- Attach event listeners for radio changes, reset, and submit.

## 10) Data

- Provide at least 10 questions (mixed MCQ/TF) in `QUESTIONS` array.
