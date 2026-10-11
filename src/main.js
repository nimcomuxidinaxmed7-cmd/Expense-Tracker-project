import { fetchRates } from './api.js';
import { convert, calculateTotal } from './utils.js';
import {
  createInitialState,
  addExpense,
  removeExpense,
  setFilter,
  setRates,
  setStatus,
  setHomeCurrency,
} from './state.js';
import { drawExpense, drawExpenses } from './ui.js';

// --- State Holder ---
let state = createInitialState();

// --- DOM Element References ---
const expenseForm = document.querySelector('#expense-form');
const expenseListContainer = document.querySelector('#expense-list');
const totalContainer = document.querySelector('#total-display');
const statusContainer = document.querySelector('#status-display');
const categoryFilter = document.querySelector('#category-filter');
const homeCurrencySelect = document.querySelector('#home-currency');

// --- Small drawing helpers (they put text on the page) ---

// Draws the list. ui.js gives us the text for each row; we add the
// converted amount and a delete button around it.
function showList(expenses) {
  expenseListContainer.textContent = '';

  if (expenses.length === 0) {
    // drawExpenses([]) returns the "No expenses added yet." message
    expenseListContainer.textContent = drawExpenses([]);
    return;
  }

  // If the container is a <ul> or <ol>, rows must be <li>; otherwise use <div>
  const tag = expenseListContainer.tagName;
  const rowTag = tag === 'UL' || tag === 'OL' ? 'li' : 'div';

  expenses.forEach((exp) => {
    // A converted amount that isn't a real number means no rate was available
    const convertedText = Number.isFinite(exp.convertedAmount)
      ? `${exp.homeCurrency} ${exp.convertedAmount.toFixed(2)}`
      : 'rate unavailable';

    const row = document.createElement(rowTag);
    row.className = 'expense-item';

    const info = document.createElement('span');
    // drawExpense(exp, exp.currency) -> "Lunch - Food - USD 12"
    // textContent (not innerHTML) so a typed description can never run as code
    info.textContent = `${drawExpense(exp, exp.currency)} → ${convertedText}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    // These become data-action="delete" and data-id="..." in the HTML
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = exp.id;

    row.append(info, deleteBtn);
    expenseListContainer.append(row);
  });
}

function showTotal(total) {
  totalContainer.textContent = `Total: ${Number(total).toFixed(2)} ${state.homeCurrency}`;
}

function showStatus() {
  if (state.status === 'loading') {
    statusContainer.textContent = 'Loading exchange rates…';
  } else if (state.status === 'error') {
    statusContainer.textContent = `Could not load rates: ${state.error}`;
  } else {
    statusContainer.textContent = '';
  }
}

// --- Render Loop ---
function render() {
  // 1. Filter expenses
  const visibleExpenses = state.filter === 'all'
    ? state.expenses
    : state.expenses.filter((exp) => exp.category === state.filter);

  // 2. Copy each expense and add a converted amount (spread + convert)
  const convertedExpenses = visibleExpenses.map((exp) => {
    let convertedAmount;

    if (exp.currency === state.homeCurrency) {
      // Already in the home currency: no conversion needed
      convertedAmount = exp.amount;
    } else {
      const rate = state.rates[exp.currency];
      const homeRate = state.rates[state.homeCurrency];

      // A missing rate gives null ("unknown"), not a made-up number
      convertedAmount = (rate === undefined || homeRate === undefined)
        ? null
        : convert(exp.amount, rate, homeRate);
    }

    return {
      ...exp,
      convertedAmount,
      homeCurrency: state.homeCurrency,
    };
  });

  // 3. Total only the amounts we could actually convert
  const total = calculateTotal(
    convertedExpenses
      .map((e) => e.convertedAmount)
      .filter((amount) => Number.isFinite(amount))
  );

  // 4. Update the page
  showList(convertedExpenses);
  showTotal(total);
  showStatus();
}

// --- API Loader ---
async function loadRates(baseCurrency) {
  // Old rates belong to the old base currency, so clear them first
  state = setRates(state, {});
  state = setStatus(state, 'loading', null);
  render();

  try {
    const rates = await fetchRates(baseCurrency);
    state = setRates(state, rates);
    state = setStatus(state, 'idle', null);
  } catch (err) {
    // Rates are already empty, so we only record the error
    state = setStatus(state, 'error', err.message);
  }

  render();
}

// --- Event Listeners ---

// Form Submission (Add Expense)
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const titleInput = document.querySelector('#expense-title');
  const amountInput = document.querySelector('#expense-amount');
  const currencyInput = document.querySelector('#expense-currency');
  const categoryInput = document.querySelector('#expense-category');

  const description = titleInput.value.trim();
  if (description === '') {
    alert('Please enter a description for the expense.');
    return;
  }

  const amount = Number(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');
    return;
  }

  const newExpense = {
    id: crypto.randomUUID(),
    description, // ui.js reads expense.description
    amount,
    currency: currencyInput.value,
    category: categoryInput.value,
  };

  state = addExpense(state, newExpense);
  expenseForm.reset();
  render();
});

// Event Delegation for Deleting
expenseListContainer.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (!deleteBtn) return;

  const id = deleteBtn.dataset.id;
  state = removeExpense(state, id);
  render();
});

// Category Filter Change
categoryFilter.addEventListener('change', (e) => {
  state = setFilter(state, e.target.value);
  render();
});

// Home Currency Change
homeCurrencySelect.addEventListener('change', (e) => {
  const newBase = e.target.value;
  state = setHomeCurrency(state, newBase);
  loadRates(newBase);
});

// --- Initial Boot ---
loadRates(homeCurrencySelect.value || 'USD');