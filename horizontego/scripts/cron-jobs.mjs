/**
 * Cron jobs para HorizonteGo
 * - Atualização diária de taxas de câmbio
 * - Execução de scrapers de vagas
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// ============= EXCHANGE RATES =============
async function updateExchangeRates() {
  console.log('[Cron] Atualizando taxas de câmbio...');
  
  try {
    // Buscar taxas da ExchangeRate API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
    const data = await response.json();
    
    if (!data.rates) {
      throw new Error('Resposta inválida da API');
    }

    // Atualizar taxas no banco
    const rates = [
      { fromCurrency: 'BRL', toCurrency: 'CAD', rate: (1 / data.rates.CAD).toFixed(4) },
      { fromCurrency: 'BRL', toCurrency: 'NOK', rate: (1 / data.rates.NOK).toFixed(4) },
      { fromCurrency: 'CAD', toCurrency: 'BRL', rate: data.rates.CAD.toFixed(4) },
      { fromCurrency: 'NOK', toCurrency: 'BRL', rate: data.rates.NOK.toFixed(4) },
      { fromCurrency: 'CAD', toCurrency: 'NOK', rate: (data.rates.NOK / data.rates.CAD).toFixed(4) },
      { fromCurrency: 'NOK', toCurrency: 'CAD', rate: (data.rates.CAD / data.rates.NOK).toFixed(4) },
    ];

    for (const rate of rates) {
      await db.execute(sql`
        INSERT INTO exchangeRates (fromCurrency, toCurrency, rate, updatedAt)
        VALUES (${rate.fromCurrency}, ${rate.toCurrency}, ${rate.rate}, NOW())
        ON DUPLICATE KEY UPDATE
          rate = VALUES(rate),
          updatedAt = VALUES(updatedAt)
      `);
    }

    console.log(`[Cron] ${rates.length} taxas de câmbio atualizadas com sucesso`);
    return true;
  } catch (error) {
    console.error('[Cron] Erro ao atualizar taxas de câmbio:', error);
    return false;
  }
}

// ============= JOB SCRAPERS =============
async function runScrapers() {
  console.log('[Cron] Executando scrapers de vagas...');
  
  try {
    // Importar e executar scraper do arbeidsplassen.nav.no
    const { runScraper } = await import('../server/scrapers/arbeidsplassen-scraper.ts');
    await runScraper(50); // Scrape até 50 vagas por execução
    
    console.log('[Cron] Scrapers executados com sucesso');
    return true;
  } catch (error) {
    console.error('[Cron] Erro ao executar scrapers:', error);
    return false;
  }
}

// ============= MAIN =============
async function main() {
  const task = process.argv[2];

  if (!task) {
    console.error('Uso: node cron-jobs.mjs [exchange|scrapers|all]');
    process.exit(1);
  }

  console.log(`[Cron] Iniciando tarefa: ${task}`);
  console.log(`[Cron] Data/Hora: ${new Date().toISOString()}`);

  let success = true;

  if (task === 'exchange' || task === 'all') {
    success = await updateExchangeRates() && success;
  }

  if (task === 'scrapers' || task === 'all') {
    success = await runScrapers() && success;
  }

  console.log(`[Cron] Tarefa concluída: ${success ? 'SUCESSO' : 'ERRO'}`);
  process.exit(success ? 0 : 1);
}

main();
