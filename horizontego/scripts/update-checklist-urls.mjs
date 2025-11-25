#!/usr/bin/env node
/**
 * Script para atualizar checklist com URLs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { checklistSteps, countries } from '../drizzle/schema.ts';
import { eq, and, like, sql } from 'drizzle-orm';

async function main() {
  console.log('Atualizando checklist com URLs...\n');

  const db = drizzle(process.env.DATABASE_URL);

  // Buscar ID da Noruega
  const norwayResult = await db.select().from(countries).where(eq(countries.code, 'NOR')).limit(1);
  if (norwayResult.length === 0) {
    console.error('❌ País Noruega (NOR) não encontrado!');
    process.exit(1);
  }
  const norwayId = norwayResult[0].id;
  console.log(`✓ País Noruega encontrado (ID: ${norwayId})\n`);

  // Mapeamento de palavras-chave para URLs
  const urlMappings = {
    // Preparação
    'Pesquisar': 'https://workinnorway.no/en/About+this+site/Public+agencies+involved',
    'requisitos de visto': 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Working+conditions',
    
    // Aplicação
    'Aplicar para vagas': 'https://arbeidsplassen.nav.no/stillinger?county=ØSTFOLD&v=5&county=VESTLAND&county=VESTFOLD&county=TRØNDELAG&county=TROMS&county=TELEMARK&county=SVALBARD&county=ROGALAND&county=OSLO&county=NORDLAND&county=MØRE+OG+ROMSDAL&county=INNLANDET&county=FINNMARK&county=BUSKERUD&county=AKERSHUS&county=AGDER&q=english',
    
    // Aprovação
    'Aguardar': 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Working+conditions',
    
    // Embarque
    'Planejar': 'https://workinnorway.no/en/Guide+for+citizens+from+countries+outside+EU+and+EEA/Living+and+working+in+Norway/Living+in+Norway',
  };

  let updated = 0;
  let notFound = 0;

  for (const [title, url] of Object.entries(urlMappings)) {
    try {
      // Primeiro buscar o step
      const steps = await db
        .select()
        .from(checklistSteps)
        .where(and(
          eq(checklistSteps.countryId, norwayId),
          like(checklistSteps.title, `%${title}%`)
        ));
      
      if (steps.length === 0) {
        console.log(`⊘ Não encontrado: ${title}`);
        notFound++;
        continue;
      }

      // Atualizar o step encontrado
      const result = await db
        .update(checklistSteps)
        .set({ url })
        .where(eq(checklistSteps.id, steps[0].id));

      if (result.rowsAffected > 0) {
        console.log(`✓ Atualizado: ${title}`);
        updated++;
      } else {
        console.log(`⊘ Não encontrado: ${title}`);
        notFound++;
      }
    } catch (error) {
      console.error(`✗ Erro ao atualizar "${title}": ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RESUMO');
  console.log('='.repeat(60));
  console.log(`✓ Atualizados: ${updated}`);
  console.log(`⊘ Não encontrados: ${notFound}`);
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
