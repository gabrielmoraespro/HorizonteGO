/**
 * Scraper Recursivo para arbeidsplassen.nav.no
 * Extrai vagas de trabalho da Noruega para integração com HorizonteGO
 * Convertido de Python para TypeScript
 */

import * as cheerio from 'cheerio';
import { drizzle } from 'drizzle-orm/mysql2';
import { jobs, countries } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface JobData {
  job_id: string | null;
  url: string;
  scraped_at: string;
  country: string;
  source: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  job_title?: string;
  start_date?: string;
  employment_type?: string;
  work_hours?: string;
  language?: string;
  positions_available?: string;
  remote_work?: string;
  deadline?: string;
  application_email?: string;
  sector?: string;
  requirements?: string[];
  tasks?: string[];
  benefits?: string[];
  contact_email?: string;
  contact_phone?: string;
}

export class ArbeidsplassenScraper {
  private baseUrl = 'https://arbeidsplassen.nav.no';
  private searchUrl = `${this.baseUrl}/stillinger`;
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
  };
  private jobs: JobData[] = [];

  /**
   * Extrai links de vagas da página de listagem
   */
  private extractJobLinks(htmlContent: string): string[] {
    const $ = cheerio.load(htmlContent);
    const jobLinks: string[] = [];

    // Procurar por links que contenham /stillinger/stilling/
    $('a[href*="/stillinger/stilling/"]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const fullUrl = new URL(href, this.baseUrl).toString();
        if (!jobLinks.includes(fullUrl)) {
          jobLinks.push(fullUrl);
        }
      }
    });

    return jobLinks;
  }

  /**
   * Extrai o UUID da vaga da URL
   */
  private extractJobId(url: string): string | null {
    const match = url.match(/\/stilling\/([a-f0-9-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extrai detalhes completos de uma vaga
   */
  private parseJobDetail(url: string, htmlContent: string): JobData {
    const $ = cheerio.load(htmlContent);

    const jobData: JobData = {
      job_id: this.extractJobId(url),
      url,
      scraped_at: new Date().toISOString(),
      country: 'Norway',
      source: 'arbeidsplassen.nav.no',
    };

    // Título da vaga
    const titleElem = $('h1').first();
    if (titleElem.length) {
      jobData.title = titleElem.text().trim();
    }

    // Empresa
    const companyText = $('*:contains("Arbeidsgiver")').first();
    if (companyText.length) {
      const companyValue = companyText.parent().next();
      if (companyValue.length) {
        jobData.company = companyValue.text().trim();
      }
    }

    // Localização
    const locationText = $('*:contains("Sted")').first();
    if (locationText.length) {
      const locationValue = locationText.parent().next();
      if (locationValue.length) {
        jobData.location = locationValue.text().trim();
      }
    }

    // Descrição da vaga
    const descriptionElem = $('*:contains("Om stillinga"), *:contains("Om jobben")').first();
    if (descriptionElem.length) {
      const descriptionParts: string[] = [];
      descriptionElem.parent().nextAll().each((_, sibling) => {
        const tagName = $(sibling).prop('tagName')?.toLowerCase();
        if (tagName === 'p' || tagName === 'div') {
          const text = $(sibling).text().trim();
          if (text && !text.startsWith('Stillingstittel') && !text.startsWith('Oppstart')) {
            descriptionParts.push(text);
          }
        }
        if (descriptionParts.length > 5) return false; // break
      });
      jobData.description = descriptionParts.join(' ');
    }

    // Campos estruturados
    const fieldsMap: Record<string, keyof JobData> = {
      'Stillingstittel': 'job_title',
      'Oppstart': 'start_date',
      'Type ansettelse': 'employment_type',
      'Arbeidstid': 'work_hours',
      'Arbeidsspråk': 'language',
      'Antall stillinger': 'positions_available',
      'Hjemmekontor': 'remote_work',
      'Søk senest': 'deadline',
      'Send søknad til': 'application_email',
      'Sektor': 'sector',
    };

    Object.entries(fieldsMap).forEach(([norwegianLabel, englishKey]) => {
      const elem = $(`*:contains("${norwegianLabel}")`).first();
      if (elem.length) {
        const valueElem = elem.parent().next();
        if (valueElem.length) {
          (jobData as any)[englishKey] = valueElem.text().trim();
        }
      }
    });

    // Requisitos
    const requirementsElem = $('*:contains("Kvalifikasjonskrav")').first();
    if (requirementsElem.length) {
      const requirements: string[] = [];
      requirementsElem.parent().nextAll().each((_, sibling) => {
        const tagName = $(sibling).prop('tagName')?.toLowerCase();
        if (tagName === 'ul') {
          $(sibling).find('li').each((_, li) => {
            requirements.push($(li).text().trim());
          });
          return false; // break
        } else if (tagName === 'p') {
          requirements.push($(sibling).text().trim());
        }
      });
      if (requirements.length > 0) {
        jobData.requirements = requirements;
      }
    }

    // Tarefas
    const tasksElem = $('*:contains("Arbeidsoppgåver")').first();
    if (tasksElem.length) {
      const tasks: string[] = [];
      tasksElem.parent().nextAll().each((_, sibling) => {
        const tagName = $(sibling).prop('tagName')?.toLowerCase();
        if (tagName === 'ul') {
          $(sibling).find('li').each((_, li) => {
            tasks.push($(li).text().trim());
          });
          return false; // break
        }
      });
      if (tasks.length > 0) {
        jobData.tasks = tasks;
      }
    }

    // Benefícios
    const benefitsElem = $('*:contains("Vi tilbyr")').first();
    if (benefitsElem.length) {
      const benefits: string[] = [];
      benefitsElem.parent().nextAll().each((_, sibling) => {
        const tagName = $(sibling).prop('tagName')?.toLowerCase();
        if (tagName === 'ul') {
          $(sibling).find('li').each((_, li) => {
            benefits.push($(li).text().trim());
          });
          return false; // break
        } else if (tagName === 'p') {
          benefits.push($(sibling).text().trim());
        }
      });
      if (benefits.length > 0) {
        jobData.benefits = benefits;
      }
    }

    // Email de contato
    const emailMatch = htmlContent.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      jobData.contact_email = emailMatch[0];
    }

    // Telefone
    const phoneMatch = htmlContent.match(/\d{8}/);
    if (phoneMatch) {
      jobData.contact_phone = phoneMatch[0];
    }

    return jobData;
  }

  /**
   * Scrape uma página de listagem
   */
  private async scrapeListingPage(page: number = 1): Promise<string[]> {
    const url = page === 1 ? this.searchUrl : `${this.searchUrl}?page=${page}`;
    console.log(`Scraping página ${page} de listagem...`);

    try {
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const jobLinks = this.extractJobLinks(html);
      console.log(`Encontrados ${jobLinks.length} links de vagas na página ${page}`);

      return jobLinks;
    } catch (error) {
      console.error(`Erro ao scraping página ${page} de listagem:`, error);
      return [];
    }
  }

  /**
   * Scrape detalhes de uma vaga específica
   */
  private async scrapeJob(jobUrl: string): Promise<JobData | null> {
    try {
      console.log(`Scraping vaga: ${jobUrl}`);
      const response = await fetch(jobUrl, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const jobData = this.parseJobDetail(jobUrl, html);
      return jobData;
    } catch (error) {
      console.error(`Erro ao scraping vaga ${jobUrl}:`, error);
      return null;
    }
  }

  /**
   * Scrape múltiplas vagas com paginação
   */
  async scrapeAll(maxJobs: number = 50, delay: number = 2000): Promise<JobData[]> {
    console.log(`Iniciando scraping de até ${maxJobs} vagas...`);

    // Buscar múltiplas páginas até atingir o número desejado
    const allJobLinks: string[] = [];
    let currentPage = 1;
    const maxPages = 5; // Limite de páginas para evitar scraping excessivo

    while (allJobLinks.length < maxJobs && currentPage <= maxPages) {
      const pageLinks = await this.scrapeListingPage(currentPage);
      
      if (pageLinks.length === 0) {
        console.log(`Nenhuma vaga encontrada na página ${currentPage}. Parando.`);
        break;
      }
      
      allJobLinks.push(...pageLinks);
      console.log(`Total acumulado: ${allJobLinks.length} vagas`);
      
      if (allJobLinks.length >= maxJobs) {
        break;
      }
      
      currentPage++;
      // Delay entre páginas para não sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Limitar ao número máximo e remover duplicatas
    const uniqueLinks = Array.from(new Set(allJobLinks));
    const limitedLinks = uniqueLinks.slice(0, maxJobs);

    console.log(`\nProcessando ${limitedLinks.length} vagas...`);

    for (let i = 0; i < limitedLinks.length; i++) {
      const jobUrl = limitedLinks[i];
      console.log(`\n[${i + 1}/${limitedLinks.length}] `);

      const jobData = await this.scrapeJob(jobUrl);

      if (jobData) {
        this.jobs.push(jobData);
        console.log(`✓ Vaga extraída: ${jobData.title?.substring(0, 50) || 'N/A'}...`);
      } else {
        console.log('✗ Falha ao extrair vaga');
      }

      // Delay para não sobrecarregar o servidor
      if (i < limitedLinks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`\n\nScraping concluído! Total de vagas extraídas: ${this.jobs.length}`);
    return this.jobs;
  }

  /**
   * Salva vagas no banco de dados
   */
  async saveToDB(): Promise<void> {
    if (this.jobs.length === 0) {
      console.log('Nenhuma vaga para salvar.');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('Salvando vagas no banco de dados...');
    console.log('='.repeat(60));

    const db = drizzle(process.env.DATABASE_URL!);

    // Buscar ID da Noruega
    const norwayResult = await db.select().from(countries).where(eq(countries.code, 'NOR')).limit(1);
    if (norwayResult.length === 0) {
      console.error('❌ País Noruega (NOR) não encontrado no banco de dados!');
      return;
    }
    const norwayId = norwayResult[0].id;

    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const job of this.jobs) {
      try {
        // Verificar se vaga já existe
        if (job.url) {
          const existing = await db.select().from(jobs).where(eq(jobs.sourceUrl, job.url)).limit(1);
          if (existing.length > 0) {
            console.log(`⊘ Vaga já existe: ${job.title?.substring(0, 50)}...`);
            skipped++;
            continue;
          }
        }

        // Preparar dados
        const jobData = {
          countryId: norwayId,
          title: job.title || 'Título não disponível',
          company: job.company || null,
          location: job.location || null,
          description: job.description || 'Descrição não disponível',
          requirements: job.requirements?.join('\n') || null,
          salary: null,
          benefits: job.benefits ? JSON.stringify(job.benefits) : null,
          sourceUrl: job.url,
          sourceName: job.source,
          isActive: true,
          isVerified: true,
          postedAt: new Date(),
        };

        await db.insert(jobs).values(jobData);
        console.log(`✓ Salva: ${job.title?.substring(0, 50)}...`);
        saved++;
      } catch (error: any) {
        console.error(`✗ Erro ao salvar "${job.title?.substring(0, 30)}...": ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('RESUMO');
    console.log('='.repeat(60));
    console.log(`✓ Salvas: ${saved}`);
    console.log(`⊘ Ignoradas (duplicadas): ${skipped}`);
    console.log(`✗ Erros: ${errors}`);
    console.log('='.repeat(60));
  }

  /**
   * Retorna lista de vagas extraídas
   */
  getJobs(): JobData[] {
    return this.jobs;
  }
}

/**
 * Função principal para execução standalone
 */
export async function runScraper(maxJobs: number = 50): Promise<void> {
  console.log('='.repeat(60));
  console.log('Scraper de Vagas - arbeidsplassen.nav.no');
  console.log('='.repeat(60));
  console.log();

  const scraper = new ArbeidsplassenScraper();
  await scraper.scrapeAll(maxJobs, 2000);
  await scraper.saveToDB();
}

// Permitir execução standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const maxJobs = process.argv[2] ? parseInt(process.argv[2]) : 50;
  runScraper(maxJobs).catch(console.error);
}
