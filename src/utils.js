
export function convert(amount, fromRate, toRate) {
  return (amount / fromRate) * toRate;
}

// Adds up an array of numbers. 
export function calculateTotal(amounts) {
  return amounts.reduce((sum, amount) => sum + amount, 0);
}