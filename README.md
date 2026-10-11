Expense Tracker with Live Currency Conversion

A small web app for recording expenses in different currencies and seeing everything converted into your home currency, using live exchange rates.


Built by Naima and Eddie NAME as a Moringa School pair project.

Features

- Choose a home currency; all totals are shown in it.
- Add an expense with a description, amount, currency and category.
- See each expense in its original currency and converted to your home currency.
- Filter the list by category.
- Delete an expense.
- See the total for the expenses currently shown.
- Live exchange rates fetched from an API, with clear messages when something goes wrong.

Built With

- HTML, CSS and JavaScript (ES modules, no framework)
- [Exchange Rate API](https://www.exchangerate-api.com) (`open.er-api.com`) for live rates
- Vitest for unit tests and ESLint for linting
- GitHub Pages for deployment

Getting Started

Prerequisites

- Node.js and npm
- VS Code with the Live Server extension

Run it locally

1. Clone the repository and open the folder in VS Code.
2. Install the dependencies:
   ```
   npm install
   ```
3. Right-click `index.html` and choose **Open with Live Server**.

The app uses JavaScript modules, which browsers can block when `index.html` is opened directly from your files. Use Live Server, or the live demo link above.

Run the tests and the linter

```
npm test
npm run lint
```

How It Works

The app keeps all its data in one state object. When something changes (an expense is added, the filter changes, rates arrive), the code creates an updated copy of the state and redraws the page from it.

Project structure


src/
  api.js     fetches exchange rates and turns failures into readable errors
  main.js    handles user actions, holds the state and redraws the page
  state.js   the shape of the state and functions that return updated copies
  ui.js      formats how each expense is written
 utils.js   the maths: currency conversion and totals


Design decisions

-The total covers only the expenses currently shown.** If you filter by a category, the total matches the visible rows.
-A missing rate is never guessed.** If no rate is available for an expense, it shows "rate unavailable" and is left out of the total, so no wrong number is displayed.
-Changing the home currency fetches new rates.** Old rates are cleared first, because they were measured against the previous base currency.
-Expenses are deleted by id, not by position,** so the right one is removed even when a filter is active.

Error handling

`fetchRates` distinguishes three kinds of failure, each with its own message:

1. The network is down or the service can't be reached.
2. The server answers with an HTTP error status (for example 429 for too many requests).
3. The server answers normally but the response says the request failed (for example an invalid currency code).

Known Limitations and What I'd Improve

- **Expenses are lost when the page is refreshed.** Saving them with `localStorage` is the next improvement.
- **The total silently leaves out expenses with no available rate.** A visible note saying how many were skipped would make this clearer.
- **The free API limits how often it can be called.** Reloading many times quickly can trigger a rate-limit error.
- **If the home currency is changed twice quickly, an older response could arrive last** and replace newer rates.
- Expenses can be added and deleted but not edited.

What We Learned

- Fetching data with `fetch`, `async`/`await` and `try`/`catch`, and why `response.ok` must be checked separately from network errors.
- Splitting a project into ES modules with clear responsibilities.
- Keeping data in a state object and updating it with copies (the spread operator) instead of changing it in place.
- Handling many buttons with one event listener (event delegation).
- Writing unit tests, linting the code and deploying with GitHub Pages.
- Working as a pair: agreeing on function names and what each file exports before connecting the pieces.

Credits

Exchange rates provided by [ExchangeRate-API](https://www.exchangerate-api.com).
