import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year, make, model, code } = req.body;

  if (!year || !make || !model || !code) {
    return res.status(400).json({ error: 'Missing required fields: year, make, model, code' });
  }

  const normalizedCode = code.trim().toUpperCase();

  const prompt = `You are an expert automotive diagnostic technician and OBD2 specialist with 20+ years of experience working on all makes and models.

Vehicle: ${year} ${make} ${model}
OBD2 Diagnostic Trouble Code: ${normalizedCode}

Analyze this diagnostic trouble code for this specific vehicle and provide comprehensive troubleshooting information tailored to this exact year, make, and model.

Return ONLY a valid JSON object with exactly this structure (no markdown code blocks, no text before or after the JSON):
{
  "code": "${normalizedCode}",
  "description": "Clear, plain-English description of what this code means for a ${year} ${make} ${model}",
  "system_affected": "The specific vehicle system affected (e.g., Engine Management, Fuel System, Transmission Control, Emissions/EVAP, ABS/Brake System)",
  "severity": "low",
  "common_symptoms": [
    "Symptom drivers would notice 1",
    "Symptom 2",
    "Symptom 3"
  ],
  "sensors_involved": [
    {
      "name": "Full sensor or component name",
      "location": "Specific location on a ${year} ${make} ${model}",
      "function": "What this sensor measures or controls",
      "likely_faulty": true
    }
  ],
  "possible_causes": [
    "Most likely cause listed first",
    "Second most likely cause",
    "Additional possible cause"
  ],
  "diagnostic_steps": [
    "1. Start with the simplest check: ...",
    "2. Next, inspect ...",
    "3. Use a multimeter to test ...",
    "4. Check for ..."
  ],
  "resolution_steps": [
    "1. If [cause]: replace/repair ...",
    "2. If [cause]: ...",
    "3. After repairs, clear the code and test drive to confirm fix"
  ],
  "estimated_repair_cost": "DIY: $XX-XX parts only | Shop: $XXX-XXX parts + labor",
  "diy_difficulty": "easy",
  "additional_notes": "Any ${year} ${make} ${model} specific known issues, technical service bulletins (TSBs), or recalls related to this code"
}

For severity, use exactly one of: "low", "medium", "high", "critical"
For diy_difficulty, use exactly one of: "easy", "moderate", "difficult", "professional_only"
Provide at least 3 sensors_involved entries when applicable. If only 1-2 sensors are involved, include related components.
Make the diagnostic and resolution steps specific and actionable, not generic.`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in response');
    }

    const raw = textBlock.text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const diagnosis = JSON.parse(jsonMatch[0]);
    return res.status(200).json(diagnosis);
  } catch (error) {
    console.error('Diagnosis error:', error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'API authentication failed. Check your ANTHROPIC_API_KEY.' });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse diagnosis response. Please try again.' });
    }

    return res.status(500).json({ error: 'Failed to get diagnosis. Please try again.' });
  }
}
