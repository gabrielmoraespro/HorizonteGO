import axios from 'axios';
import * as cheerio from 'cheerio';
import { getDb } from '../db';
import { jobs } from '../../drizzle/schema';

interface PickingJob {
  title: string;
  company: string;
  location: string;
  country: string;
  countryId: number;
  description: string;
  url: string;
}

const COUNTRY_MAP: Record<string, number> = {
  'Canada': 1,
  'Norway': 2,
  'Australia': 3,
  'New Zealand': 4,
};

export async function scrapePickingJobs(): Promise<number> {
  try {
    const response = await axios.get('https://www.pickingjobs.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const jobListings: PickingJob[] = [];

    // Extrair listagens de fazendas/empregadores
    $('.farm-listing, .job-listing').each((_, element) => {
      const $el = $(element);
      const title = $el.find('.farm-name, .job-title').text().trim();
      const company = $el.find('.company-name').text().trim() || title;
      const location = $el.find('.location').text().trim();
      const country = $el.find('.country').text().trim();
      const description = $el.find('.description').text().trim();
      const url = $el.find('a').attr('href') || '';

      if (title && country) {
        const countryId = COUNTRY_MAP[country] || 0;
        if (countryId > 0) {
          jobListings.push({
            title,
            company,
            location,
            country,
            countryId,
            description,
            url: url.startsWith('http') ? url : `https://www.pickingjobs.com${url}`,
          });
        }
      }
    });

    console.log(`[PickingJobs] Encontradas ${jobListings.length} vagas`);

    const db = await getDb();
    if (!db) {
      console.error('[PickingJobs] Database not available');
      return 0;
    }

    let savedCount = 0;

    for (const job of jobListings) {
      try {
        await db.insert(jobs).values({
          title: job.title,
          company: job.company,
          countryId: job.countryId,
          location: job.location,
          description: job.description,
          requirements: 'Varia conforme a fazenda/empregador',
          benefits: 'Geralmente inclui acomodação e refeições',
          salary: 'Varia conforme a posição',
          sourceUrl: job.url,
          sourceName: 'PickingJobs.com',
          isVerified: true,
          isActive: true,
          externalId: job.url,
        }).onDuplicateKeyUpdate({
          set: {
            title: job.title,
            description: job.description,
          },
        });

        savedCount++;
        console.log(`[PickingJobs] Vaga salva: ${job.title} - ${job.country}`);
      } catch (error) {
        console.error(`[PickingJobs] Erro ao salvar vaga ${job.title}:`, error);
      }
    }

    console.log(`[PickingJobs] Total de vagas salvas: ${savedCount}`);
    return savedCount;
  } catch (error) {
    console.error('[PickingJobs] Erro no scraper:', error);
    return 0;
  }
}
