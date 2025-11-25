import { drizzle } from "drizzle-orm/mysql2";
import { countries, checklistSteps, securityTips } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Insert countries
  console.log("Adding countries...");
  await db.insert(countries).values([
    {
      name: "Canadá",
      code: "CAN",
      currency: "CAD",
      flagEmoji: "🇨🇦",
      description: "O Canadá oferece diversas oportunidades para seasonal workers, especialmente em agricultura, turismo e hospitalidade.",
    },
    {
      name: "Noruega",
      code: "NOR",
      currency: "NOK",
      flagEmoji: "🇳🇴",
      description: "A Noruega busca trabalhadores sazonais principalmente para agricultura, pesca e turismo.",
    },
  ]).onDuplicateKeyUpdate({ set: { name: "Canadá" } }); // Avoid duplicates

  const [canadaResult] = await db.select().from(countries).where({ code: "CAN" }).limit(1);
  const [norwayResult] = await db.select().from(countries).where({ code: "NOR" }).limit(1);

  const canadaId = canadaResult?.id || 1;
  const norwayId = norwayResult?.id || 2;

  // Insert checklist steps for Canada
  console.log("Adding checklist steps for Canada...");
  await db.insert(checklistSteps).values([
    {
      countryId: canadaId,
      stage: "preparation",
      title: "Pesquisar sobre o Canadá",
      description: "Aprenda sobre cultura, clima e custo de vida no Canadá",
      orderIndex: 1,
    },
    {
      countryId: canadaId,
      stage: "preparation",
      title: "Verificar elegibilidade para visto de trabalho",
      description: "Confirme se você atende aos requisitos para trabalhar temporariamente no Canadá",
      orderIndex: 2,
    },
    {
      countryId: canadaId,
      stage: "documentation",
      title: "Obter passaporte válido",
      description: "Seu passaporte deve ter validade de pelo menos 6 meses",
      orderIndex: 3,
    },
    {
      countryId: canadaId,
      stage: "documentation",
      title: "Preparar documentos de identificação",
      description: "RG, CPF, comprovante de residência e outros documentos necessários",
      orderIndex: 4,
    },
    {
      countryId: canadaId,
      stage: "application",
      title: "Aplicar para vagas",
      description: "Envie currículos e cartas de apresentação para empregadores canadenses",
      orderIndex: 5,
    },
    {
      countryId: canadaId,
      stage: "application",
      title: "Solicitar visto de trabalho",
      description: "Após receber oferta de emprego, inicie o processo de visto",
      orderIndex: 6,
    },
    {
      countryId: canadaId,
      stage: "interview",
      title: "Preparar para entrevistas",
      description: "Pratique respostas comuns e pesquise sobre o empregador",
      orderIndex: 7,
    },
    {
      countryId: canadaId,
      stage: "approval",
      title: "Aguardar aprovação do visto",
      description: "O processo pode levar algumas semanas",
      orderIndex: 8,
    },
    {
      countryId: canadaId,
      stage: "boarding",
      title: "Comprar passagens aéreas",
      description: "Reserve seus voos com antecedência",
      orderIndex: 9,
    },
    {
      countryId: canadaId,
      stage: "boarding",
      title: "Organizar acomodação inicial",
      description: "Reserve hospedagem para as primeiras semanas",
      orderIndex: 10,
    },
  ]).onDuplicateKeyUpdate({ set: { title: "Updated" } });

  // Insert checklist steps for Norway
  console.log("Adding checklist steps for Norway...");
  await db.insert(checklistSteps).values([
    {
      countryId: norwayId,
      stage: "preparation",
      title: "Pesquisar sobre a Noruega",
      description: "Aprenda sobre cultura, clima e custo de vida na Noruega",
      orderIndex: 1,
    },
    {
      countryId: norwayId,
      stage: "preparation",
      title: "Verificar requisitos de visto",
      description: "Confirme os requisitos para trabalho sazonal na Noruega",
      orderIndex: 2,
    },
    {
      countryId: norwayId,
      stage: "documentation",
      title: "Obter passaporte válido",
      description: "Passaporte com validade mínima de 6 meses",
      orderIndex: 3,
    },
    {
      countryId: norwayId,
      stage: "application",
      title: "Aplicar para vagas em plataformas oficiais",
      description: "Use NAV.NO e outros sites oficiais",
      orderIndex: 4,
    },
    {
      countryId: norwayId,
      stage: "interview",
      title: "Participar de entrevistas",
      description: "Prepare-se para entrevistas por vídeo ou telefone",
      orderIndex: 5,
    },
    {
      countryId: norwayId,
      stage: "approval",
      title: "Aguardar aprovação",
      description: "Aguarde confirmação do empregador e aprovação de visto",
      orderIndex: 6,
    },
    {
      countryId: norwayId,
      stage: "boarding",
      title: "Planejar viagem",
      description: "Organize passagens e acomodação inicial",
      orderIndex: 7,
    },
  ]).onDuplicateKeyUpdate({ set: { title: "Updated" } });

  // Insert security tips
  console.log("Adding security tips...");
  await db.insert(securityTips).values([
    {
      category: "scam_alert",
      title: "Nunca pague taxas antecipadas",
      description: "Empregadores legítimos NUNCA pedem pagamento antecipado para processar sua candidatura ou garantir uma vaga. Se alguém pedir dinheiro antes de você começar a trabalhar, é golpe.",
      severity: "high",
      isActive: true,
    },
    {
      category: "scam_alert",
      title: "Cuidado com promessas irrealistas",
      description: "Desconfie de ofertas que prometem salários muito acima da média, aprovação garantida de visto ou processo extremamente rápido. Pesquise a média salarial do país e da posição.",
      severity: "high",
      isActive: true,
    },
    {
      category: "verification",
      title: "Verifique a empresa no site oficial",
      description: "Antes de aplicar, procure a empresa em sites oficiais de registro empresarial do país. No Canadá, use o Canada Business Registry. Na Noruega, use o Brønnøysundregistrene.",
      severity: "medium",
      isActive: true,
    },
    {
      category: "verification",
      title: "Confirme a vaga em sites governamentais",
      description: "Vagas legítimas geralmente aparecem em portais oficiais como Job Bank Canada ou NAV.NO. Se a vaga só existe em um site desconhecido, investigue mais.",
      severity: "medium",
      isActive: true,
    },
    {
      category: "safety_tip",
      title: "Use apenas canais oficiais de comunicação",
      description: "Prefira comunicação por email corporativo da empresa. Desconfie de ofertas feitas apenas por WhatsApp, Telegram ou redes sociais.",
      severity: "medium",
      isActive: true,
    },
    {
      category: "safety_tip",
      title: "Leia o contrato com atenção",
      description: "Antes de assinar qualquer contrato, leia todos os termos. Se possível, peça para um advogado revisar. Contratos legítimos são claros sobre salário, benefícios e condições de trabalho.",
      severity: "medium",
      isActive: true,
    },
    {
      category: "official_resource",
      title: "Consulte a embaixada ou consulado",
      description: "Em caso de dúvida, entre em contato com a embaixada ou consulado do país de destino no Brasil. Eles podem confirmar se um empregador é legítimo.",
      severity: "low",
      isActive: true,
    },
  ]).onDuplicateKeyUpdate({ set: { title: "Updated" } });

  console.log("✅ Database seeded successfully!");
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  });
