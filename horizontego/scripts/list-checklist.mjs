import { drizzle } from 'drizzle-orm/mysql2';
import { checklistSteps } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);
const steps = await db.select().from(checklistSteps).where(eq(checklistSteps.countryId, 2));
steps.forEach(s => console.log(`- ${s.stage}: ${s.title}`));
