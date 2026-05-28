import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to call generateContent with retry and fallback model in case of transient 503/429 errors
async function generateContentWithRetry(ai: any, contents: string, systemPrompt: string, responseSchema: any) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 2; // Try up to 3 times per model
    let delay = 1000;

    while (retries >= 0) {
      try {
        console.log(`[Gemini SDK] Trying generateContent with model: ${model} (${retries} retries left)`);
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        
        // Ensure we got a valid text response
        if (response && response.text) {
          return response;
        }
        throw new Error("Empty response received from the model.");
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const errStatus = err?.status || err?.code;
        
        console.warn(`[Gemini SDK] Error with model ${model}: status=${errStatus}, msg=${errMsg}`);
        
        const isTransient = 
          errStatus === 503 || 
          errStatus === 429 || 
          errMsg.includes("503") || 
          errMsg.includes("429") || 
          errMsg.includes("UNAVAILABLE") || 
          errMsg.includes("high demand") || 
          errMsg.includes("temporary") ||
          errMsg.includes("Resource has been exhausted");
          
        if (isTransient && retries > 0) {
          console.log(`[Gemini SDK] Transient error detected. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
          retries--;
        } else {
          // Break the inner loop to try the next model immediately
          break;
        }
      }
    }
  }

  throw lastError;
}

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Warning: GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API endpoint to decompose users raw text goals to daily checklist milestones
app.post("/api/coach/decompose", async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Goal message expression is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(400).json({ 
      error: "Gemini API key is not configured yet. Please configure GEMINI_API_KEY in Settings > Secrets." 
    });
  }

  try {
    const ai = getGeminiClient();

    // Reconstruct the message log for context awareness
    const dialogHistory = history && Array.isArray(history) 
      ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.text}`).join("\n")
      : "";

    const systemPrompt = `You are Tracktion's premium AI Goal Coach and Decomposition Engine. Your job is to help users translate their vague, messy, or casual goals (e.g. 'i wanna code more', 'read things') into realistic, ultra-actionable daily roadmap plans.

Guidelines:
1. Examine the user's input. Check if the goal/current request is too vague, missing core details, or has no frequency / action metrics.
2. If it's too vague and you need more details to formulate a realistic 7-day path, set needsClarification=true and ask a friendly, supportive follow-up question. Keep your question concise (max 2 sentences) and highly encouraging.
3. If it is clear enough, decompose it into a full structured goal plan with needsClarification=false:
   - normalizedObjective: Title representing the habit/goal (e.g. '30-Min Daily Python Study' or '10,000 Step Afternoon Walk'). Keep it action-oriented.
   - description: A beautiful, brief, motivational overview description.
   - category: Must be one of: 'Wellness', 'Learning', 'Productivity', 'Fitness', 'Work', 'Creative', 'Health', 'Others'.
   - targetValue: Daily progress target number (e.g. 15, 30, 1, 2, 8).
   - unit: Unit of measurement (e.g. 'mins', 'pages', 'times', 'miles', 'lessons', 'cups').
   - frequency: 'daily' or 'weekly'.
   - isRecurring: true or false (true if they should repeat it across multiple days).
   - recurringDays: If isRecurring is true, select 2 to 5 short day labels that fit their schedule (e.g., ['Mon', 'Wed', 'Fri'] or ['Tue', 'Thu', 'Sat']).
   - color: Pick a color scheme matches the category: 'indigo', 'emerald', 'rose', 'amber', 'violet', 'sky'.
   - icon: One of: 'Heart', 'Trophy', 'BookOpen', 'Target', 'Calendar', 'Sparkles', 'Flame', 'CheckCircle2', 'Apple', 'Briefcase', 'GraduationCap', 'Code'.
   - tasks: An array of exactly 7 small tasks, representing tiny daily incremental tasks for each day from Day 1 to Day 7. Each task must map to a unique dayIndex from 0 (Day 1) to 6 (Day 7). Make sure the tasks are structured, ultra-easy, and linear to build strong momentum!`;

    const chatInput = `${dialogHistory ? `Conversation History So Far:\n${dialogHistory}\n\n` : ""}Current User Goal/Response: "${message}"`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        needsClarification: {
          type: Type.BOOLEAN,
          description: "True if the goal is too vague and needs a follow-up answer."
        },
        followupQuestion: {
          type: Type.STRING,
          description: "Encouraging, supportive follow-up question to clarify the user's goal if needsClarification is true."
        },
        goalPlan: {
          type: Type.OBJECT,
          description: "The full decomposed goal plan if needsClarification is false.",
          properties: {
            normalizedObjective: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            targetValue: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            frequency: { type: Type.STRING },
            isRecurring: { type: Type.BOOLEAN },
            recurringDays: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            color: { type: Type.STRING },
            icon: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A tiny, achievable, specific action for this day on the roadmap" },
                  dayIndex: { type: Type.INTEGER, description: "Day index from 0 (Day 1) to 6 (Day 7)" },
                  value: { type: Type.NUMBER }
                },
                required: ["title", "dayIndex", "value"]
              }
            }
          },
          required: [
            "normalizedObjective", 
            "description", 
            "category", 
            "targetValue", 
            "unit", 
            "frequency", 
            "isRecurring", 
            "color", 
            "icon", 
            "tasks"
          ]
        }
      },
      required: ["needsClarification"]
    };

    const response = await generateContentWithRetry(ai, chatInput, systemPrompt, responseSchema);

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini Goal Decomposition failed:", error);
    return res.status(500).json({ error: error.message || "An unexpected decomposition error occurred." });
  }
});

// Serve static elements or hot development server routes
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
