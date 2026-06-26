import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // API Route: Verify status
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Route: Generate Content
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { model, prompt, config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on the server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.5-flash',
        contents: prompt,
        config: config || {},
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during Gemini generation' });
    }
  });

  // API Route: Chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { model, messages, config } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing on the server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare contents for generateContent.
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.5-flash',
        contents: formattedContents,
        config: config || {},
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during Gemini chat generation' });
    }
  });

  // API Route: Generate Tasks (Specific helper for Planner)
  app.post('/api/gemini/tasks', async (req, res) => {
    try {
      const { theme } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing on the server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Create a structured list of tasks to accomplish the following project/goal: "${theme}".
      Respond ONLY with a JSON array of task objects, matching the exact schema specified below. Do not include any markdown styling like \`\`\`json or surrounding text.
      
      Schema for each task:
      {
        "title": "Short descriptive task title",
        "description": "More detailed description of what needs to be done",
        "priority": "low" | "medium" | "high",
        "status": "todo" | "in_progress",
        "effort": "1-2h" | "4-6h" | "1-2d" | "3-5d"
      }
      
      Provide exactly 6 to 8 highly relevant, actionable tasks. Do not add any introductory or concluding text, only return valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      let jsonText = response.text || '[]';
      jsonText = jsonText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.substring(0, jsonText.length - 3);
      }
      jsonText = jsonText.trim();

      const tasks = JSON.parse(jsonText);
      res.json({ tasks });
    } catch (error: any) {
      console.error('Gemini Task Planner Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred during task map generation' });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('.', 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('.', 'dist', 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
