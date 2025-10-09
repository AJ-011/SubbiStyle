import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CulturalStoryPrompt {
  garmentName: string;
  origin: string;
  craftTechnique: string;
  artisanName: string;
  materials: string[];
  culturalContext?: string;
}

export interface GeneratedCulturalContent {
  craftHistory: {
    title: string;
    content: string;
    timelinePoints: Array<{
      period: string;
      description: string;
    }>;
  };
  recipe?: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    culturalSignificance: string;
  };
  vocabulary: Array<{
    word: string;
    definition: string;
    pronunciation?: string;
  }>;
  myth: {
    title: string;
    content: string;
    moralLesson?: string;
  };
}

export async function generateCulturalContent(prompt: CulturalStoryPrompt): Promise<GeneratedCulturalContent> {
  try {
    const systemPrompt = `You are a cultural anthropologist and storytelling expert specializing in traditional crafts and textile arts. Generate authentic, respectful cultural content about traditional artisan practices. Always approach cultural content with sensitivity and accuracy.`;

    const userPrompt = `Generate comprehensive cultural content for a ${prompt.garmentName} from ${prompt.origin}, made using ${prompt.craftTechnique} technique by artisan ${prompt.artisanName}. Materials used: ${prompt.materials.join(', ')}. ${prompt.culturalContext ? 'Additional context: ' + prompt.culturalContext : ''}

Please provide:
1. Craft history and technique explanation
2. A traditional recipe from the region (food, dye, or cultural preparation)
3. 5-7 vocabulary words from the local language/dialect related to the craft
4. A traditional myth or legend from the culture

Format as JSON with the exact structure provided in the interface.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as GeneratedCulturalContent;
  } catch (error) {
    console.error('Error generating cultural content:', error);
    throw new Error(`Failed to generate cultural content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateCraftDescription(technique: string, origin: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert in traditional craft techniques. Provide detailed, educational descriptions of artisan methods."
        },
        {
          role: "user",
          content: `Describe the traditional ${technique} technique from ${origin}. Include historical context, materials, process steps, and cultural significance. Keep it engaging and educational for consumers interested in ethical fashion.`
        }
      ],
      max_completion_tokens: 1024,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating craft description:', error);
    throw new Error(`Failed to generate craft description: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function enhanceArtisanStory(artisanName: string, craft: string, location: string, experience: number): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a journalist specializing in artisan profiles. Create compelling, respectful narratives about traditional craftspeople."
        },
        {
          role: "user",
          content: `Write an inspiring artisan profile for ${artisanName}, a ${craft} master from ${location} with ${experience} years of experience. Focus on their dedication to preserving traditional techniques and supporting their community. Keep it authentic and respectful.`
        }
      ],
      max_completion_tokens: 512,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error enhancing artisan story:', error);
    throw new Error(`Failed to enhance artisan story: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
