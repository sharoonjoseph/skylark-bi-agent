const {
  GoogleGenAI
} = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function answerBusinessQuestion(
  question,
  summary
) {
  const prompt = `
You are the Skylark Drones Business
Intelligence Agent.

Your audience is a founder or executive.

You receive business metrics calculated
deterministically from live Monday.com
Deals and Work Orders boards.

RULES:

1. Use ONLY the supplied business data.
2. Never invent numbers.
3. If data is unavailable, explicitly say so.
4. Mention important data-quality caveats.
5. Provide business context and insights,
   not just raw values.
6. Keep answers executive-friendly.
7. Ask one concise clarifying question when
   the user's request is genuinely ambiguous.
8. Distinguish facts from interpretation.
9. Do not claim that missing values are zero.
10. When asked for a leadership update,
    structure it as:

Executive Summary
Sales / Pipeline
Operations
Risks
Recommended Actions

BUSINESS DATA:

${JSON.stringify(summary, null, 2)}

FOUNDER QUESTION:

${question}
`;

  const response =
    await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.7-flash",

      contents: prompt
    });

  return response.text;
}

module.exports = {
  answerBusinessQuestion
};
