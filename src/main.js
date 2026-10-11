
import { fetchRates } from './api.js';
import { convert, calculateTotal } from './utils.js';
import {
  createInitialState,
  addExpense,
  removeExpense,
  setRates,
  setStatus,
  setHomeCurrency,
} from './state.js';
import { drawExpense } from './ui.js';

// State
let state = createInitialState();

// HTML elements — these match index.html
const expenseForm = document.querySelector('#entryForm');
const expenseListContainer = document.querySelector('#expensesContainer');
const totalContainer = document.querySelector('#totalAmount');
const homeCurrencySelect = document.querySelector('#homeCurrency');

// Check that the required HTML elements exist
if (!expenseForm || !expenseListContainer || !totalContainer || !homeCurrencySelect) {
  throw new Error('An HTML element is missing. Check the IDs in index.html.');
}

// Show expenses on the page
function showList(expenses) {
  expenseListContainer.textContent = '';

  if (expenses.length === 0) {
    expenseListContainer.textContent = 'No expenses added yet.';
    return;
  }

  expenses.forEach((expense) => {
    const row = document.createElement('div');
    row.className = 'expense-item';

    const info = document.createElement('span');
    const convertedAmount = Number(expense.convertedAmount);

    let convertedText = 'Rate unavailable';

    if (Number.isFinite(convertedAmount)) {
      convertedText =
        `${expense.homeCurrency} ${convertedAmount.toFixed(2)}`;
    }

    info.textContent =
      `${drawExpense(expense, expense.currency)} → ${convertedText}`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.id = expense.id;

    row.append(info, deleteButton);
    expenseListContainer.appendChild(row);
  });
}

// Show the total
function showTotal(total) {
  totalContainer.textContent =
    `${Number(total).toFixed(2)} ${state.homeCurrency}`;
}

// Update the page
function render() {
  const convertedExpenses = state.expenses.map((expense) => {
    let convertedAmount = null;

    if (expense.currency === state.homeCurrency) {
      convertedAmount = Number(expense.amount);
    } else {
      const rate = state.rates[expense.currency];

      if (Number.isFinite(rate)) {
        convertedAmount = convert(
          Number(expense.amount),
          rate,
          1
        );
      }
    }

    return {
      ...expense,
      convertedAmount,
      homeCurrency: state.homeCurrency,
    };
  });

  const amounts = convertedExpenses
    .map((expense) => expense.convertedAmount)
    .filter((amount) => Number.isFinite(amount));

  const total = calculateTotal(amounts);

  showList(convertedExpenses);
  showTotal(total);
}

// Load exchange rates
async function loadRates(currency) {
  state = setRates(state, {});
  state = setStatus(state, 'loading', null);

  try {
    const rates = await fetchRates(currency);
    state = setRates(state, rates);
    state = setStatus(state, 'idle', null);
  } catch (error) {
    state = setStatus(state, 'error', error.message);
    console.error('Could not load exchange rates:', error);
  }

  render();
}

// Add an expense
expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const titleInput = document.querySelector('#description');
  const amountInput = document.querySelector('#number');
  const currencyInput = document.querySelector('#currency');
  const categoryInput = document.querySelector('#category');

  const description = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert('Please enter a description and a valid amount.');
    return;
  }

  const newExpense = {
    id: crypto.randomUUID(),
    description,
    amount,
    currency: currencyInput.value,
    category: categoryInput.value,
  };

  state = addExpense(state, newExpense);

  expenseForm.reset();
  render();
});

// Delete an expense
expenseListContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');

  if (!button) return;

  state = removeExpense(state, button.dataset.id);
  render();
});

// Change home currency
homeCurrencySelect.addEventListener('change', async (event) => {
  const currency = event.target.value;

  if (!currency) return;

  state = setHomeCurrency(state, currency);
  await loadRates(currency);
});

// Start the app
if (!homeCurrencySelect.value) {
  homeCurrencySelect.value = 'USD';
}

state = setHomeCurrency(state, homeCurrencySelect.value);
render();
loadRates(homeCurrencySelect.value);
