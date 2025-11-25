#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import { checklistSteps } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// Atualizar URLs diretamente por stage
const updates = [
  {
    stage: 'preparation',
    title: 'Pesquisar%',
    url: 'https://workinnorway.no/en/About+this+site/Public+agencies+involved'
  },
  {
    stage: 'preparation',
    title: '%visto%',
    url: 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Working+conditions'
  },
  {
    stage: 'application',
    title: '%vagas%',
    url: 'https://arbeidsplassen.nav.no/stillinger?county=ØSTFOLD&v=5&county=VESTLAND&county=VESTFOLD&county=TRØNDELAG&county=TROMS&county=TELEMARK&county=SVALBARD&county=ROGALAND&county=OSLO&county=NORDLAND&county=MØRE+OG+ROMSDAL&county=INNLANDET&county=FINNMARK&county=BUSKERUD&county=AKERSHUS&county=AGDER&q=english'
  },
  {
    stage: 'approval',
    title: '%Aguardar%',
    url: 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Working+conditions'
  },
  {
    stage: 'boarding',
    title: '%viagem%',
    url: 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Living+in+Norway'
  },
];

console.log('Atualizando URLs...\n');

for (const update of updates) {
  try {
    const result = await db.execute(sql`
      UPDATE checklistSteps 
      SET url = ${update.url}
      WHERE countryId = 2 
        AND stage = ${update.stage}
        AND title LIKE ${update.title}
    `);
    
    console.log(`✓ ${update.stage}: ${result.rowsAffected} linhas atualizadas`);
  } catch (error) {
    console.error(`✗ Erro em ${update.stage}:`, error.message);
  }
}

console.log('\n✓ Concluído!');
process.exit(0);
