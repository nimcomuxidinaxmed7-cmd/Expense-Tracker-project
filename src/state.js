
let expenses = [];

export function addExpense(expense) {
  expenses = [...expenses, expense];
  return expenses;
}

export function removeExpense(id) {
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });
  return expenses;
}

export function setExpenses(newExpenses) {
  expenses = [...newExpenses];
  return expenses;
}

export function getExpenses() {
  return [...expenses];
}
