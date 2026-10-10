
export function drawExpense(expense) {
  return (
    expense.description +
    " - " +
    expense.category +
    " - KSh " +
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

  return "Total spent: KSh " + total;
}
