import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export enum AgentRole {
  CEO = 'CEO',
  CFO = 'CFO',
  CTO = 'CTO',
  GROWTH = 'GROWTH'
}

const roleInstructions: Record<AgentRole, string> = {
  [AgentRole.CEO]: "You are the AI CEO of Afro Space Holding Group. Focus on overall strategy, cluster expansion, and global positioning. Target Benchmarks: $200k MRR, 15% WoW user growth, and 5% conversion rate. Consider these targets in every strategic decision. Be decisive and visionary.",
  [AgentRole.CFO]: "You are the AI CFO of Afro Space. Focus on revenue optimization, MRR growth, burn rate analysis, and financial risk mitigation. Target Benchmark: $200k MRR. Analyze deviations from this target and suggest optimization paths.",
  [AgentRole.CTO]: "You are the AI CTO of Afro Space. Focus on infrastructure scalability, system health, cloud optimization (AWS), and technical debt management. Ensure infrastructure supports a 15% WoW user growth surge without latency degradation.",
  [AgentRole.GROWTH]: "You are the AI Growth Engineer. Focus on marketing automation, funnel optimization, user retention, and viral growth loops. Target Benchmarking: Achieve a 5% target conversion rate and maintain 15% weekly user growth."
};

export const getAgentInsight = async (role: AgentRole, context: string) => {
  try {
    const modelName = "gemini-3.1-flash-preview";
    const response = await ai.models.generateContent({
      model: modelName,
      contents: context,
      config: {
        systemInstruction: roleInstructions[role] + " Always output in Amharic and English if requested, otherwise prioritize professional English. Mood: Bloomberg terminal meets SpaceX. Format: Concise points.",
      },
    });
    return response.text;
  } catch (error) {
    console.error(`AI ${role} Insight Error:`, error);
    return "Intelligence systems recalibrating. Insights temporarily unavailable.";
  }
};

export const getAIInsight = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the AI Intelligence Engine for Afro Space Holding Group. Provide strategic investment advice, risk analysis, and growth forecasting based on data. Be concise, technical, and professional. Mood: Bloomberg terminal meets SpaceX.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Unable to generate insights at this time.";
  }
};
