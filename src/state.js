
export function createInitialState() {
  return { expenses: [], filter: 'all', rates:{} ,homeCurrency: 'KES', status: 'idle', error: null };
}

export function addExpense(state, expense) {
  return { ...state, expenses: [...state.expenses, expense] };
}

export function removeExpense(state, id) {
  return {
    ...state,
    expenses: state.expenses.filter((expense) => expense.id !== id),
  };
}

export function setFilter(state, filter) {
  return { ...state, filter };
}

export function setRates(state, rates) {
  return { ...state, rates };
}

export function setStatus(state, status, error = null) {
  return { ...state, status, error };
}

export function setHomeCurrency(state, homeCurrency) {
  return { ...state, homeCurrency };
}