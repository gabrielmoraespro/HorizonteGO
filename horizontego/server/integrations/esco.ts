/**
 * ESCO (European Skills, Competences, Qualifications and Occupations) API Integration
 * Free public API for occupation and skills data
 * https://ec.europa.eu/esco/api
 */

const ESCO_API_BASE = "https://ec.europa.eu/esco/api";

export interface ESCOOccupation {
  uri: string;
  code: string;
  title: string;
  description: string;
  alternativeLabels?: string[];
  iscoGroup?: string;
}

export interface ProfessionEquivalence {
  title: string;
  sector: string;
  description: string;
  escoCode: string;
  internationalEquivalents: string[];
}

/**
 * Search for occupations in ESCO database
 */
export async function searchESCOOccupations(query: string, language: string = "en"): Promise<ESCOOccupation[]> {
  try {
    const url = `${ESCO_API_BASE}/search?text=${encodeURIComponent(query)}&language=${language}&type=occupation&limit=10`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ESCO API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse ESCO response format
    const occupations: ESCOOccupation[] = [];
    if (data._embedded && data._embedded.results) {
      for (const result of data._embedded.results) {
        occupations.push({
          uri: result.uri,
          code: result.code || "",
          title: result.title,
          description: result.description || "",
          alternativeLabels: result.alternativeLabels || [],
          iscoGroup: result.iscoGroup || "",
        });
      }
    }

    return occupations;
  } catch (error) {
    console.error("[ESCO] Error searching occupations:", error);
    return [];
  }
}

/**
 * Get occupation details by URI
 */
export async function getESCOOccupation(uri: string, language: string = "en"): Promise<ESCOOccupation | null> {
  try {
    const response = await fetch(`${uri}?language=${language}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ESCO API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      uri: data.uri,
      code: data.code || "",
      title: data.title,
      description: data.description || "",
      alternativeLabels: data.alternativeLabels || [],
      iscoGroup: data.iscoGroup || "",
    };
  } catch (error) {
    console.error("[ESCO] Error fetching occupation:", error);
    return null;
  }
}

/**
 * Find profession equivalence for seasonal worker jobs
 */
export async function findProfessionEquivalence(jobTitle: string): Promise<ProfessionEquivalence | null> {
  try {
    const occupations = await searchESCOOccupations(jobTitle, "en");
    
    if (occupations.length === 0) {
      return null;
    }

    const topMatch = occupations[0];
    
    return {
      title: topMatch.title,
      sector: topMatch.iscoGroup || "General",
      description: topMatch.description,
      escoCode: topMatch.code,
      internationalEquivalents: topMatch.alternativeLabels || [],
    };
  } catch (error) {
    console.error("[ESCO] Error finding equivalence:", error);
    return null;
  }
}
