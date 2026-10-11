
export function drawExpense(expense, currency) {
  return (
    expense.description +
    " - " +
    expense.category +
    " - " +
    currency + " " +
    expense.amount
  );
}

export function drawExpenses(expenses) {
  if (expenses.length === 0) {
    return "No expenses added yet.";
  }

  let result = "";

  expenses.forEach(function (expense) {
    result += drawExpense(expense) + "\n";
  });

  return result;
}

export function drawTotal(expenses) {
  let total = 0;

  expenses.forEach(function (expense) {
    total += Number(expense.amount);
  });

  return total;
}
