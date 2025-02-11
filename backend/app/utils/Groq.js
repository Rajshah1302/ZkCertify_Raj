const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: "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",
});

async function getGroqChatCompletion(prompt) {
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });

  const content = response.choices[0]?.message?.content?.trim();

  // Extract JSON if wrapped inside ```json ... ```
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  const cleanContent = jsonMatch ? jsonMatch[1] : content; // Extract or use as is
  console.log(cleanContent);
  try {
    return JSON.parse(cleanContent); 
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON: " + error.message);
  }
}

module.exports = { getGroqChatCompletion };
