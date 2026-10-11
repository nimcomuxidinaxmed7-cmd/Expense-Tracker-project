const BASE_URL = 'https://open.er-api.com/v6/latest';


export async function fetchRates(baseCurrency) {
  let response;


    try {
    response = await fetch(`${BASE_URL}/${encodeURIComponent(baseCurrency)}`);
  } catch (networkError) {
    throw new Error('Unable to reach the exchange rate service. Please check your internet connection.',  {cause: networkError});
  }

  
  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Request failed'}`);
  }

  
  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error('Received an invalid response format from the exchange rate server.',  {cause: parseError});
  }

  
  if (data.result !== 'success') {
    const reason = data['error-type'] || data.message || 'Unknown rate service error';
    throw new Error(`Rate service error: ${reason}`);
  }

 
  return data.rates;
}