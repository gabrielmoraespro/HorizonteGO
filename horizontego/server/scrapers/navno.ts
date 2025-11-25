import puppeteer from 'puppeteer';
import { getDb } from '../db';
import { jobs } from '../../drizzle/schema';

interface NavJob {
  title: string;
  company: string;
  location: string;
  deadline: string;
  url: string;
  description?: string;
  requirements?: string;
  salary?: string;
}

export async function scrapeNavNo(): Promise<number> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Navegar para página de vagas
    await page.goto('https://arbeidsplassen.nav.no/stillinger', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Aguardar carregamento das vagas
    await page.waitForSelector('[data-testid="job-posting-card"]', { timeout: 30000 });

    // Extrair lista de vagas
    const jobListings = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="job-posting-card"]');
      const jobs: NavJob[] = [];

      cards.forEach((card) => {
        const titleEl = card.querySelector('h2 a');
        const companyEl = card.querySelector('[data-testid="company-name"]');
        const locationEl = card.querySelector('[data-testid="location"]');
        const deadlineEl = card.querySelector('[data-testid="deadline"]');

        if (titleEl && companyEl) {
          jobs.push({
            title: titleEl.textContent?.trim() || '',
            company: companyEl.textContent?.trim() || '',
            location: locationEl?.textContent?.trim() || '',
            deadline: deadlineEl?.textContent?.trim() || '',
            url: (titleEl as HTMLAnchorElement).href || '',
          });
        }
      });

      return jobs;
    });

    console.log(`[NAV.NO] Encontradas ${jobListings.length} vagas`);

    // Processar cada vaga para obter detalhes
    const db = await getDb();
    if (!db) {
      console.error('[NAV.NO] Database not available');
      return 0;
    }

    let savedCount = 0;

    for (const job of jobListings.slice(0, 50)) { // Limitar a 50 vagas por execução
      try {
        // Navegar para página da vaga
        await page.goto(job.url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });

        // Extrair detalhes completos
        const details = await page.evaluate(() => {
          const descriptionEl = document.querySelector('[data-testid="job-description"]');
          const requirementsEl = document.querySelector('[data-testid="job-requirements"]');
          const salaryEl = document.querySelector('[data-testid="salary"]');

          return {
            description: descriptionEl?.textContent?.trim() || '',
            requirements: requirementsEl?.textContent?.trim() || '',
            salary: salaryEl?.textContent?.trim() || '',
          };
        });

        // Salvar no banco (countryId 2 = Noruega)
        const fullDescription = `${details.description}\n\n**Prazo:** ${job.deadline}`;
        
        await db.insert(jobs).values({
          title: job.title,
          company: job.company,
          countryId: 2, // Noruega
          location: job.location,
          salary: details.salary || 'Não informado',
          description: fullDescription,
          requirements: details.requirements,
          benefits: 'Conforme legislação norueguesa',
          sourceUrl: job.url,
          sourceName: 'NAV.NO',
          isVerified: true,
          isActive: true,
          externalId: job.url,
        }).onDuplicateKeyUpdate({
          set: {
            title: job.title,
            description: fullDescription,
            requirements: details.requirements,
          },
        });

        savedCount++;
        console.log(`[NAV.NO] Vaga salva: ${job.title}`);

        // Delay para evitar sobrecarga
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[NAV.NO] Erro ao processar vaga ${job.title}:`, error);
      }
    }

    console.log(`[NAV.NO] Total de vagas salvas: ${savedCount}`);
    return savedCount;
  } catch (error) {
    console.error('[NAV.NO] Erro no scraper:', error);
    return 0;
  } finally {
    await browser.close();
  }
}
