import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const DIAGNOSIS_SCHEMA = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    description: { type: 'string' },
    system_affected: { type: 'string' },
    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
    common_symptoms: { type: 'array', items: { type: 'string' } },
    sensors_involved: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          location: { type: 'string' },
          function: { type: 'string' },
          likely_faulty: { type: 'boolean' },
        },
        required: ['name', 'location', 'function', 'likely_faulty'],
        additionalProperties: false,
      },
    },
    possible_causes: { type: 'array', items: { type: 'string' } },
    diagnostic_steps: { type: 'array', items: { type: 'string' } },
    resolution_steps: { type: 'array', items: { type: 'string' } },
    estimated_repair_cost: { type: 'string' },
    diy_difficulty: { type: 'string', enum: ['easy', 'moderate', 'difficult', 'professional_only'] },
    additional_notes: { type: 'string' },
  },
  required: [
    'code', 'description', 'system_affected', 'severity',
    'common_symptoms', 'sensors_involved', 'possible_causes',
    'diagnostic_steps', 'resolution_steps', 'estimated_repair_cost',
    'diy_difficulty', 'additional_notes',
  ],
  additionalProperties: false,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel auto-parses JSON bodies, but guard against string body just in case
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { year, make, model, code } = body || {};

  if (!year || !make || !model || !code) {
    return res.status(400).json({ error: 'Missing required fields: year, make, model, code' });
  }

  const normalizedCode = String(code).trim().toUpperCase();

  const prompt = `You are an expert automotive diagnostic technician and OBD2 specialist with 20+ years of experience.

Vehicle: ${year} ${make} ${model}
OBD2 Code: ${normalizedCode}

Provide a comprehensive diagnosis for this specific vehicle. Include:
- What the code means for a ${year} ${make} ${model}
- Which sensors and components are involved, and their exact location on this vehicle
- Likely causes in order of probability
- Step-by-step diagnostic procedure
- How to fix it
- Estimated cost (DIY parts vs shop labor)
- Any known issues, TSBs, or recalls for this year/make/model related to this code`;

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: DIAGNOSIS_SCHEMA,
        },
      },
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return res.status(500).json({ error: 'No response from AI. Please try again.' });
    }

    const diagnosis = JSON.parse(textBlock.text);
    return res.status(200).json(diagnosis);
  } catch (error) {
    console.error('Diagnosis error:', error?.message ?? error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'API authentication failed. Check your ANTHROPIC_API_KEY.' });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }

    return res.status(500).json({ error: 'Failed to get diagnosis. Please try again.' });
  }
}
