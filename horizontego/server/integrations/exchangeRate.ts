/**
 * ExchangeRate API Integration
 * Free tier: 1500 requests/month
 * https://www.exchangerate-api.com/
 */

const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest";

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRates(baseCurrency: string = "BRL"): Promise<ExchangeRateResponse> {
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_URL}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ExchangeRate] Error fetching rates:", error);
    throw error;
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  try {
    const data = await fetchExchangeRates(from);
    const rate = data.rates[to];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`);
    }

    return amount * rate;
  } catch (error) {
    console.error("[ExchangeRate] Error converting currency:", error);
    throw error;
  }
}
