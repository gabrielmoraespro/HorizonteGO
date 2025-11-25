import { scrapeNavNo } from './navno';
import { scrapePickingJobs } from './pickingjobs';
import { fetchLMIACompanies } from './lmia';

export async function runAllScrapers(): Promise<void> {
  console.log('[Scrapers] Iniciando execução de todos os scrapers...');
  
  const startTime = Date.now();

  try {
    // Executar scrapers em paralelo
    const [navCount, pickingCount, lmiaCount] = await Promise.allSettled([
      scrapeNavNo().catch(err => {
        console.error('[Scrapers] Erro no NAV.NO:', err);
        return 0;
      }),
      scrapePickingJobs().catch(err => {
        console.error('[Scrapers] Erro no PickingJobs:', err);
        return 0;
      }),
      fetchLMIACompanies().catch(err => {
        console.error('[Scrapers] Erro no LMIA:', err);
        return 0;
      }),
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[Scrapers] Execução concluída em ${duration}s`);
    console.log(`[Scrapers] NAV.NO: ${navCount.status === 'fulfilled' ? navCount.value : 0} vagas`);
    console.log(`[Scrapers] PickingJobs: ${pickingCount.status === 'fulfilled' ? pickingCount.value : 0} vagas`);
    console.log(`[Scrapers] LMIA: ${lmiaCount.status === 'fulfilled' ? lmiaCount.value : 0} empresas`);
  } catch (error) {
    console.error('[Scrapers] Erro geral:', error);
  }
}

// Executar scrapers se chamado diretamente
if (require.main === module) {
  runAllScrapers()
    .then(() => {
      console.log('[Scrapers] Processo finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Scrapers] Erro fatal:', error);
      process.exit(1);
    });
}
