#!/usr/bin/env node
/**
 * Script para importar vagas do arquivo JSON para o banco de dados
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { jobs, countries } from '../drizzle/schema.ts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('='.repeat(60));
  console.log('Importação de Vagas do JSON para o Banco de Dados');
  console.log('='.repeat(60));
  console.log();

  // Conectar ao banco
  const db = drizzle(process.env.DATABASE_URL);
  
  // Ler arquivo JSON
  const jsonPath = join(__dirname, 'vagas_horizontego.json');
  console.log(`Lendo arquivo: ${jsonPath}`);
  const vagasData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`Total de vagas no arquivo: ${vagasData.length}\n`);

  // Buscar ID da Noruega
  const norwayResult = await db.select().from(countries).where(eq(countries.code, 'NOR')).limit(1);
  if (norwayResult.length === 0) {
    console.error('❌ País Noruega (NOR) não encontrado no banco de dados!');
    console.log('Execute o script de seed primeiro: pnpm tsx scripts/seed-db.mjs');
    process.exit(1);
  }
  const norwayId = norwayResult[0].id;
  console.log(`✓ País Noruega encontrado (ID: ${norwayId})\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const vaga of vagasData) {
    try {
      // Verificar se vaga já existe (por applicationUrl)
      if (vaga.applicationUrl) {
        const existing = await db.select().from(jobs).where(eq(jobs.sourceUrl, vaga.applicationUrl)).limit(1);
        if (existing.length > 0) {
          console.log(`⊘ Vaga já existe: ${vaga.title?.substring(0, 50)}...`);
          skipped++;
          continue;
        }
      }

      // Preparar dados para inserção
      const jobData = {
        countryId: norwayId,
        title: vaga.title || 'Título não disponível',
        company: vaga.company || null,
        location: vaga.location || null,
        description: vaga.description || 'Descrição não disponível',
        requirements: vaga.requirements && vaga.requirements.length > 0 
          ? vaga.requirements.join('\n') 
          : null,
        salary: vaga.salary || null,
        benefits: vaga.benefits && vaga.benefits.length > 0 
          ? JSON.stringify(vaga.benefits) 
          : null,
        sourceUrl: vaga.applicationUrl || null,
        sourceName: vaga.source || 'arbeidsplassen.nav.no',
        isActive: true,
        isVerified: vaga.verified || true,
        postedAt: vaga.postedDate ? new Date(vaga.postedDate) : new Date(),
      };

      // Inserir no banco
      await db.insert(jobs).values(jobData);
      console.log(`✓ Importada: ${vaga.title?.substring(0, 50)}...`);
      imported++;

    } catch (error) {
      console.error(`✗ Erro ao importar vaga "${vaga.title?.substring(0, 30)}...": ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RESUMO DA IMPORTAÇÃO');
  console.log('='.repeat(60));
  console.log(`✓ Importadas: ${imported}`);
  console.log(`⊘ Ignoradas (duplicadas): ${skipped}`);
  console.log(`✗ Erros: ${errors}`);
  console.log(`Total processadas: ${vagasData.length}`);
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
