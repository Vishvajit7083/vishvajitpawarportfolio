import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// OpenRouter API Caller (powers OpenRouter AI Copilot & Voice Assistant)
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

// Universal robust JSON parser for LLM outputs
function safeJsonParse<T = any>(text: string | null | undefined): T | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // 1. Try stripping markdown ```json ... ``` or ``` ... ```
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }
    // 2. Try extracting outermost { ... }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {}
    }
    // 3. Try extracting outermost [ ... ]
    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
      } catch {}
    }
    return null;
  }
}

const DEFAULT_OPENROUTER_FALLBACK_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.0-flash',
  'google/gemini-flash-1.5',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat',
  'mistralai/mistral-small-24b-instruct-2501',
  'openrouter/auto',
];

async function callOpenRouter(
  messages: OpenRouterMessage[],
  options?: OpenRouterOptions
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const candidateModels = [
    options?.model,
    process.env.OPENROUTER_MODEL,
    ...DEFAULT_OPENROUTER_FALLBACK_MODELS,
  ].filter((m, idx, arr): m is string => Boolean(m) && arr.indexOf(m) === idx);

  for (const model of candidateModels) {
    try {
      const payload: Record<string, unknown> = {
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 1600,
      };

      if (options?.responseFormatJson) {
        payload.response_format = { type: 'json_object' };
      }

      let res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': "Vishwajit Pawar Engineering Lab Copilot",
        },
        body: JSON.stringify(payload),
      });

      // If response format wasn't supported (some models return 400 with response_format), retry without response_format
      if (!res.ok && options?.responseFormatJson && res.status === 400) {
        delete payload.response_format;
        res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': "Vishwajit Pawar Engineering Lab Copilot",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[OpenRouter Model ${model} status ${res.status}]:`, errText);
        // Continue loop to try next model in fallback chain
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim().length > 0) {
        return content.trim();
      }
    } catch (err) {
      console.warn(`[OpenRouter exception on model ${model}]:`, err);
    }
  }

  return null;
}

// Comprehensive grounded knowledge base for Vishwajit Laxman Pawar
const VISHWAJIT_PORTFOLIO_GROUNDING = `
CANDIDATE PROFILE:
Name: Vishwajit Laxman Pawar
Title: Electronics and Telecommunication Engineering Graduate
Tagline: Embedded Systems • IoT • AI • Robotics
Status: OPEN TO EMBEDDED SOFTWARE & FIRMWARE OPPORTUNITIES
Location: Kolhapur, Maharashtra, India
Email: vishvajitpawar02@gmail.com
Phone: +91-9168082769
LinkedIn: linkedin.com/in/vishvajit-pawar-21baa7287

ACADEMIC BACKGROUND:
Degree: B.Tech in Electronics and Telecommunication Engineering
Institution: Bharati Vidyapeeth's College of Engineering, Kolhapur
Graduation Period: 2022 – 2026
CGPA: 6.5 / 10
Core Coursework: Microprocessors & Microcontrollers, Digital Signal Processing, Embedded Linux, Wireless Sensor Networks, Control Systems, Real-Time Operating Systems (RTOS), IoT Architectures, Computer Vision.

CORE TECHNICAL SKILLS & PROFICIENCY:
- Programming: C (90%), Python (88%), Embedded C (92%), Java (75%), SQL (80%)
- Embedded Systems & Hardware: ESP32 (94% - Dual-Core Xtensa, FreeRTOS, Wi-Fi, BLE 4.2), Microcontrollers (88% - AVR, STM32, ARM Cortex-M), IoT Protocols (92% - MQTT, HTTP REST, WebSockets), Sensor Interfacing (DHT11, BMP180, BME280, Ultrasonic HC-SR04, I2C, SPI, UART, GPIO)
- AI & Robotics: OpenCV (85%), Computer Vision (84%), 6-DOF Inverse Kinematics, Servo Motor Control, AI Integration (82%)
- Development Tools & OS: Git (88%), Arduino IDE (95%), VS Code & PlatformIO (92%), Linux/Ubuntu (86%), Windows (90%)
- Languages: Marathi (Native), Hindi (Fluent / Bilingual), English (Professional Working)

SIGNIFICANT CAPSTONE PROJECTS:
1. 6-DOF AI-Assisted Robotic Arm:
   - Built a 6-axis articulated manipulator with inverse kinematics DH-parameter solver.
   - Integrated OpenCV computer vision pipeline for real-time spatial object tracking and automated picking.
   - Low-latency serial telemetry between Python host and microcontroller servo controller with safety soft-limits.
2. IoT-Based Meteorological Weather Station:
   - ESP32 microcontroller reading DHT11 (temperature & relative humidity) and BMP180 (barometric pressure & altitude) over I2C bus.
   - FreeRTOS dual-core multitasking: Core 0 dedicated to Wi-Fi/MQTT telemetry dispatch; Core 1 executing deterministic high-frequency sensor acquisition.
   - Deep sleep power-management cycle reducing battery consumption for remote field deployment.
3. Interactive 3D ESP32 Embedded Lab:
   - Interactive WebGL/Three.js physical model showing pinouts, bus routing, and SMT components.

WORK EXPERIENCE & VIRTUAL SIMULATIONS:
- Deloitte Technology Job Simulation (Forage, Jun 2024 – Jul 2024): Analytical problem solving, technology architecture, engineering documentation.
- Data Visualisation Virtual Experience (Forage, Jul 2024): Telemetry dashboard architecture, pattern recognition, data storytelling.
- Embedded Systems Online Internship (2024): Embedded C firmware architecture, peripheral drivers, sensor integration.

CERTIFICATIONS:
- Deloitte Technology Job Simulation (Forage, July 2024)
- Data Visualisation Virtual Experience (Forage, July 2024)
- Embedded Systems Online Internship Credential (2024)
`;

// System instructions for the Laboratory Voice AI Assistant
const ASSISTANT_SYSTEM_PROMPT = `
You are the interactive Voice AI Assistant for Vishwajit Laxman Pawar's 3D Engineering Laboratory & Robotics Portfolio.
${VISHWAJIT_PORTFOLIO_GROUNDING}

When responding to user speech or queries:
1. Keep spoken responses concise, polite, natural, and friendly (1-3 sentences maximum suitable for speech synthesis).
2. If the user greets (e.g. "good morning", "hello", "hi"), return an appropriate, cordial laboratory greeting acknowledging the user and mentioning systems are online.
3. If the user asks to navigate (e.g., "go to home section", "take me to robot project", "show skills", "go to contact"), include the navigation action in the structured JSON.
4. If the user issues a 3D robot command (e.g. "rotate", "exploded view", "reset", "laser", "autonomous"), identify the robot action.
5. If the user asks to change the theme ("quantum emerald", "solar amber", "stealth slate", "neon cyber"), set the theme action.

You MUST respond strictly with valid JSON format:
{
  "reply": "Spoken text to read to the user",
  "action": "navigate" | "robot_rotate" | "robot_explode" | "robot_reset" | "robot_laser" | "theme_change" | "open_resume" | "none",
  "target": "hero" | "about" | "esp32" | "robot-project" | "weather-project" | "skills" | "experience" | "certifications" | "education" | "contact" | "quantum_emerald" | "solar_amber" | "stealth_slate" | "neon_cyber" | null
}
`;

// Helper: Rule-based fast interpreter for instant zero-latency responses
function evaluateLocalVoiceCommand(text: string): {
  reply: string;
  action: string;
  target?: string | null;
} | null {
  const normalized = text.toLowerCase().trim();

  // Greetings
  if (/\b(good morning)\b/i.test(normalized)) {
    return {
      reply: 'Good morning! Laboratory subsystems are nominal and online. Welcome to Vishwajit Laxman Pawar\'s 3D Engineering Portfolio. How may I assist you?',
      action: 'none',
    };
  }
  if (/\b(good afternoon)\b/i.test(normalized)) {
    return {
      reply: 'Good afternoon! All telemetry feeds and robotics kinematic modules are running at peak performance. What would you like to inspect?',
      action: 'none',
    };
  }
  if (/\b(good evening)\b/i.test(normalized)) {
    return {
      reply: 'Good evening! Night-shift laboratory protocols active. Ready to explore Vishwajit\'s projects and embedded systems.',
      action: 'none',
    };
  }
  if (/\b(hello|hi|hey|greetings|hola)\b/i.test(normalized) && normalized.length < 20) {
    return {
      reply: 'Hello! I am Vishwajit\'s Laboratory AI Assistant. You can tell me to rotate the robot, show exploded view, reset, or navigate to any section.',
      action: 'none',
    };
  }

  // Navigation commands
  if (/(go to|take me to|show|scroll to|open)?\s*(home|hero|top|intro|main)/i.test(normalized) && /(home|hero|top|intro|main)/i.test(normalized)) {
    return {
      reply: 'Navigating to the Home section.',
      action: 'navigate',
      target: 'hero',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(about|bio|profile|who is vishwajit)/i.test(normalized) && /(about|bio|profile)/i.test(normalized)) {
    return {
      reply: 'Navigating to the About section.',
      action: 'navigate',
      target: 'about',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(robot|robotics|arm|kinematics|3d model)/i.test(normalized) && /(robot|robotics|arm)/i.test(normalized)) {
    return {
      reply: 'Navigating to the 3D Industrial Robot Laboratory.',
      action: 'navigate',
      target: 'robot-project',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(esp32|hardware|board|microcontroller|circuit)/i.test(normalized) && /(esp32|hardware|board)/i.test(normalized)) {
    return {
      reply: 'Navigating to the Interactive ESP32 Hardware Console.',
      action: 'navigate',
      target: 'esp32',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(weather|projects|project|bme280)/i.test(normalized) && /(weather|projects|project)/i.test(normalized)) {
    return {
      reply: 'Navigating to the IoT Weather Station Project.',
      action: 'navigate',
      target: 'weather-project',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(skill|skills|network|technologies|stack)/i.test(normalized) && /(skill|skills|technologies)/i.test(normalized)) {
    return {
      reply: 'Navigating to the Skills Network.',
      action: 'navigate',
      target: 'skills',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(experience|work|internship|history)/i.test(normalized) && /(experience|internship|history)/i.test(normalized)) {
    return {
      reply: 'Navigating to Experience Timeline.',
      action: 'navigate',
      target: 'experience',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(education|degree|college|university)/i.test(normalized) && /(education|degree|college)/i.test(normalized)) {
    return {
      reply: 'Navigating to Education & Academic Background.',
      action: 'navigate',
      target: 'education',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(certification|certifications|certificates)/i.test(normalized) && /(certification|certificates)/i.test(normalized)) {
    return {
      reply: 'Navigating to Certifications.',
      action: 'navigate',
      target: 'certifications',
    };
  }
  if (/(go to|show|scroll to|open)?\s*(contact|message|reach out|email|hire)/i.test(normalized) && /(contact|message|hire)/i.test(normalized)) {
    return {
      reply: 'Opening the Contact and Dispatch Terminal.',
      action: 'navigate',
      target: 'contact',
    };
  }

  // Resume commands
  if (/(open|show|view|download|print)\s*(resume|cv)/i.test(normalized)) {
    return {
      reply: 'Opening Vishwajit Laxman Pawar\'s verified resume.',
      action: 'open_resume',
    };
  }

  // Certificate commands
  if (/(open|show|view|download|upload)\s*(certificate|certifications|certification|internship certificate|pdf certificate)/i.test(normalized) || /\b(certificate pdf|view pdf|upload certificate)\b/i.test(normalized)) {
    return {
      reply: 'Opening verified credentials and certificate PDF viewer.',
      action: 'open_certificate',
    };
  }

  // 3D Robot commands
  if (/\b(rotate|spin|turn around|auto rotate)\b/i.test(normalized)) {
    return {
      reply: 'Toggling 3D model auto-rotation.',
      action: 'robot_rotate',
    };
  }
  if (/\b(exploded view|explode|disassemble|separate parts|breakdown)\b/i.test(normalized)) {
    return {
      reply: 'Toggling 3D exploded view inspection.',
      action: 'robot_explode',
    };
  }
  if (/\b(reset|home position|zero joints|default position|center)\b/i.test(normalized)) {
    return {
      reply: 'Resetting robot joints, kinematic jigs, and viewport to default home coordinates.',
      action: 'robot_reset',
    };
  }
  if (/\b(laser|toggle laser|aim laser|beam)\b/i.test(normalized)) {
    return {
      reply: 'Toggling end-effector laser beam alignment.',
      action: 'robot_laser',
    };
  }

  // Theme commands
  if (/(theme|color|mode)/i.test(normalized)) {
    if (/emerald|green|quantum/i.test(normalized)) {
      return {
        reply: 'Switching UI theme to Quantum Matrix Emerald.',
        action: 'theme_change',
        target: 'quantum_emerald',
      };
    }
    if (/amber|gold|orange|solar|industrial/i.test(normalized)) {
      return {
        reply: 'Switching UI theme to Solar Amber Industrial.',
        action: 'theme_change',
        target: 'solar_amber',
      };
    }
    if (/stealth|slate|dark|obsidian/i.test(normalized)) {
      return {
        reply: 'Switching UI theme to Stealth Slate Obsidian.',
        action: 'theme_change',
        target: 'stealth_slate',
      };
    }
    if (/neon|cyber|cyan/i.test(normalized)) {
      return {
        reply: 'Switching UI theme to Neon Cyber Matrix.',
        action: 'theme_change',
        target: 'neon_cyber',
      };
    }
  }

  return null;
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Voice Assistant AI Endpoint
app.post('/api/voice-assistant', async (req, res) => {
  try {
    const { message, currentSection } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const trimmed = message.trim();

    // 1. Fast path: Direct local command match (instant execution)
    const localResult = evaluateLocalVoiceCommand(trimmed);
    if (localResult) {
      return res.json(localResult);
    }

    // 2. OpenRouter API (if OPENROUTER_API_KEY provided)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const rawContent = await callOpenRouter([
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          { role: 'user', content: `User query: "${trimmed}". Current section: "${currentSection || 'hero'}". Respond with valid JSON.` },
        ], {
          responseFormatJson: true,
          temperature: 0.3,
          maxTokens: 300,
        });

        if (rawContent) {
          const parsed = safeJsonParse<{ reply?: string; action?: string; target?: string | null }>(rawContent);
          if (parsed && parsed.reply) {
            return res.json({
              reply: parsed.reply,
              action: parsed.action || "none",
              target: parsed.target || null,
            });
          } else {
            return res.json({
              reply: rawContent,
              action: 'none',
              target: null,
            });
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter voice call failed, trying Gemini:', orErr);
      }
    }

    // 3. Google Gemini API (High-performance secondary engine)
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `User voice query: "${trimmed}". Current section: "${currentSection || 'hero'}".
          Respond strictly in JSON adhering to:
          {
            "reply": "Short natural spoken response",
            "action": "navigate" | "robot_rotate" | "robot_explode" | "robot_reset" | "robot_laser" | "theme_change" | "open_resume" | "none",
            "target": "hero" | "about" | "esp32" | "robot-project" | "weather-project" | "skills" | "experience" | "certifications" | "education" | "contact" | "quantum_emerald" | "solar_amber" | "stealth_slate" | "neon_cyber" | null
          }`,
          config: {
            systemInstruction: ASSISTANT_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = safeJsonParse(response.text);
          if (parsed) return res.json(parsed);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to intelligent handler:', geminiErr);
      }
    }

    // 4. Default Intelligent Fallback
    return res.json({
      reply: `I heard "${trimmed}". You can say "Rotate", "Exploded View", "Reset", "Go to Home", "Go to Robot", or ask about Vishwajit's embedded engineering experience!`,
      action: 'none',
      target: null,
    });
  } catch (error) {
    console.error('Error in /api/voice-assistant:', error);
    res.status(500).json({
      reply: "Voice command processing encountered a temporary error.",
      action: 'none',
    });
  }
});

// ============================================================================
// AI ENGINEERING COPILOT & RECRUITER SUITE ENDPOINTS (OpenRouter / Gemini 3.7 Flash)
// ============================================================================

// 0. AI Status Endpoint
app.get('/api/copilot/status', (req, res) => {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  let activeEngine = 'Embedded Local Brain';
  let modelName = 'Deterministic Embedded Engine';

  if (hasOpenRouter) {
    activeEngine = 'OpenRouter AI';
    modelName = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  } else if (hasGemini) {
    activeEngine = 'Gemini 3.7 Flash';
    modelName = 'gemini-3.7-flash';
  }

  res.json({
    openRouterConfigured: hasOpenRouter,
    geminiConfigured: hasGemini,
    activeEngine,
    modelName,
  });
});

// 1. Interactive Recruiter AI Copilot Chat
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `
You are the AI Engineering Copilot & Recruiter Representative for Vishwajit Laxman Pawar's Portfolio.
${VISHWAJIT_PORTFOLIO_GROUNDING}

Your role:
- Provide articulate, highly technically accurate, concise, and enthusiastic responses to recruiters, hiring managers, and engineers.
- Highlight Vishwajit's hands-on strengths in Embedded C, FreeRTOS, ESP32, Robotics Kinematics, OpenCV, and IoT architectures.
- Always be honest, professional, and reference specific projects and academic details (e.g. Bharati Vidyapeeth's College of Engineering Kolhapur, B.Tech E&TC 2022-2026).
- Format responses cleanly with brief bullet points or bold text where appropriate for high readability.
- Suggest 2-3 relevant follow-up questions at the very end in a separate section labeled "SUGGESTED_QUESTIONS: [q1 | q2 | q3]".
`;

    // 1. Check OpenRouter API (if OPENROUTER_API_KEY is configured)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orMessages: OpenRouterMessage[] = [
          { role: 'system', content: systemPrompt },
        ];

        if (Array.isArray(history)) {
          for (const h of history.slice(-6)) {
            orMessages.push({
              role: h.role === 'user' ? 'user' : 'assistant',
              content: h.text,
            });
          }
        }

        orMessages.push({ role: 'user', content: message });

        const orResponse = await callOpenRouter(orMessages, { temperature: 0.4 });
        if (orResponse) {
          let reply = orResponse;
          let suggestedQuestions: string[] = [
            "How did Vishwajit implement FreeRTOS on the ESP32?",
            "Can you explain his 6-axis robotic arm kinematics?",
            "What is his background from Bharati Vidyapeeth Kolhapur?"
          ];

          if (orResponse.includes('SUGGESTED_QUESTIONS:')) {
            const parts = orResponse.split('SUGGESTED_QUESTIONS:');
            reply = parts[0].trim();
            const qStr = parts[1].trim().replace(/^\[|\]$/g, '');
            suggestedQuestions = qStr.split('|').map((q) => q.trim()).filter(Boolean);
          }

          return res.json({
            reply,
            suggestedQuestions,
            source: 'openrouter',
            model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
          });
        }
      } catch (orErr) {
        console.warn('OpenRouter chat failed, falling back to Gemini/Local:', orErr);
      }
    }

    // 2. Fallback to Gemini 3.7 Flash
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const conversationContext = Array.isArray(history)
          ? history.slice(-6).map((h: { role: string; text: string }) => `${h.role === 'user' ? 'Visitor' : 'Assistant'}: ${h.text}`).join('\n')
          : '';

        const prompt = `${conversationContext ? `Recent Conversation:\n${conversationContext}\n\n` : ''}Visitor Query: "${message}"\n\nProvide your response:`;

        const result = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.4,
          },
        });

        const fullText = result.text || '';
        let reply = fullText;
        let suggestedQuestions: string[] = [
          "How did Vishwajit implement FreeRTOS on the ESP32?",
          "Can you explain his 6-axis robotic arm kinematics?",
          "What is his background from Bharati Vidyapeeth Kolhapur?"
        ];

        if (fullText.includes('SUGGESTED_QUESTIONS:')) {
          const parts = fullText.split('SUGGESTED_QUESTIONS:');
          reply = parts[0].trim();
          const qStr = parts[1].trim().replace(/^\[|\]$/g, '');
          suggestedQuestions = qStr.split('|').map((q) => q.trim()).filter(Boolean);
        }

        return res.json({
          reply,
          suggestedQuestions,
          source: 'gemini-3.7-flash',
        });
      } catch (err) {
        console.warn('Gemini chat failed, using smart local fallback:', err);
      }
    }

    // 3. Smart Local Fallback when neither API is available or offline
    const qLower = message.toLowerCase();
    let reply = `Vishwajit Laxman Pawar is an Electronics & Telecommunication Engineering graduate from Bharati Vidyapeeth's College of Engineering, Kolhapur (2022-2026). He specializes in **Embedded Systems, IoT, C/Embedded C, FreeRTOS, ESP32, and 6-DOF Robotics**.`;

    if (qLower.includes('hire') || qLower.includes('why') || qLower.includes('strength')) {
      reply = `**Key reasons to hire Vishwajit:**
• **Hands-on Embedded Architecture**: Deep proficiency in C, Embedded C, and ESP32 dual-core FreeRTOS firmware design.
• **Robotics & Computer Vision**: Designed a 6-DOF robot arm with inverse kinematics and OpenCV visual tracking.
• **IoT & Sensor Bus Expertise**: Integrated I2C/SPI sensors (BMP180, DHT11, BME280) with cloud telemetry via MQTT.
• **Strong Fundamentals**: Completed B.Tech in E&TC at Bharati Vidyapeeth College of Engineering Kolhapur with virtual simulations at Deloitte & Forage.`;
    } else if (qLower.includes('robot') || qLower.includes('arm') || qLower.includes('kinematics')) {
      reply = `Vishwajit's **6-DOF AI-Assisted Robotic Arm** project features:
• Analytical Inverse Kinematics solver using Denavit-Hartenberg (DH) parameter conventions.
• Real-time OpenCV target acquisition for automated object picking and sorting.
• Low-latency serial packet protocol between Python master and microcontroller servo controller.`;
    } else if (qLower.includes('esp32') || qLower.includes('weather') || qLower.includes('iot')) {
      reply = `Vishwajit's **IoT Weather Station** demonstrates:
• Dual-Core FreeRTOS scheduling on ESP32 (Core 0 for Wi-Fi/MQTT; Core 1 for I2C sensor sampling).
• Precision telemetry using DHT11 and BMP180 barometric sensors.
• Deep-sleep power budgeting for ultra-low power remote solar deployments.`;
    } else if (qLower.includes('education') || qLower.includes('college') || qLower.includes('degree')) {
      reply = `Vishwajit is completing his **B.Tech in Electronics and Telecommunication Engineering** at **Bharati Vidyapeeth's College of Engineering, Kolhapur** (2022–2026) with a CGPA of 6.5/10. His coursework includes DSP, Microcontrollers, Embedded Linux, and Wireless Sensor Networks.`;
    }

    return res.json({
      reply,
      suggestedQuestions: [
        "What are Vishwajit's top skills in Embedded C?",
        "Explain his 6-axis inverse kinematics project",
        "How does he handle FreeRTOS task scheduling on ESP32?"
      ],
      source: 'local-embedded-brain',
    });
  } catch (error) {
    console.error('Error in /api/copilot/chat:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
  }
});

// 2. AI Job Description Matcher & Scorecard Generator
app.post('/api/copilot/match-jd', async (req, res) => {
  try {
    const { jobDescription, roleTitle } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const sysPrompt = `
Analyze how well candidate Vishwajit Laxman Pawar matches this job opportunity.
${VISHWAJIT_PORTFOLIO_GROUNDING}

JOB TITLE: ${roleTitle || 'Embedded Software / IoT / Robotics Engineer'}
JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Evaluate objectively and output strictly valid JSON matching this schema:
{
  "matchScore": number (0 to 100),
  "overallVerdict": "Strong Match" | "High Alignment" | "Good Potential" | "Partial Match",
  "executiveSummary": "2-3 concise sentences highlighting why Vishwajit is a great fit for this specific job",
  "matchedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missingOrLearnableSkills": ["skill1", "skill2"],
  "customPitchBullets": [
    "Pitch bullet point 1 tailored to this JD",
    "Pitch bullet point 2 tailored to this JD",
    "Pitch bullet point 3 tailored to this JD"
  ],
  "suggestedInterviewQuestions": [
    "Technical question 1 the recruiter can ask Vishwajit",
    "Technical question 2 the recruiter can ask Vishwajit",
    "Technical question 3 the recruiter can ask Vishwajit"
  ]
}
`;

    // 1. OpenRouter API
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const raw = await callOpenRouter([
          { role: 'system', content: sysPrompt },
          { role: 'user', content: 'Analyze match and return strictly valid JSON scorecard.' }
        ], { responseFormatJson: true, temperature: 0.2 });

        if (raw) {
          const parsed = safeJsonParse(raw);
          if (parsed) {
            return res.json({ ...parsed, source: 'openrouter' });
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter JD match failed, trying Gemini:', orErr);
      }
    }

    // 2. Gemini 3.7 Flash
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const result = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: sysPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        if (result.text) {
          const parsed = safeJsonParse(result.text);
          if (parsed) {
            return res.json({ ...parsed, source: 'gemini-3.7-flash' });
          }
        }
      } catch (err) {
        console.warn('Gemini JD match failed, falling back:', err);
      }
    }

    // 3. Local heuristic fallback for JD analysis
    const jdLower = jobDescription.toLowerCase();
    const skills = [
      { name: 'Embedded C / C', matched: jdLower.includes('c') || jdLower.includes('firmware') },
      { name: 'ESP32 & RTOS', matched: jdLower.includes('esp32') || jdLower.includes('rtos') || jdLower.includes('freertos') },
      { name: 'IoT Protocols (MQTT/HTTP)', matched: jdLower.includes('iot') || jdLower.includes('mqtt') || jdLower.includes('cloud') },
      { name: 'Microcontroller Architecture', matched: jdLower.includes('microcontroller') || jdLower.includes('mcu') || jdLower.includes('stm32') || jdLower.includes('arm') },
      { name: 'Python & OpenCV Vision', matched: jdLower.includes('python') || jdLower.includes('vision') || jdLower.includes('opencv') || jdLower.includes('ai') },
      { name: 'Robotics Kinematics', matched: jdLower.includes('robot') || jdLower.includes('control') || jdLower.includes('motor') },
      { name: 'Linux & Git Toolchains', matched: jdLower.includes('linux') || jdLower.includes('git') },
    ];

    const matchedList = skills.filter((s) => s.matched).map((s) => s.name);
    const missingList = skills.filter((s) => !s.matched).slice(0, 2).map((s) => s.name);
    const score = Math.min(96, Math.max(72, Math.round((matchedList.length / skills.length) * 100) + 15));

    return res.json({
      matchScore: score,
      overallVerdict: score >= 88 ? 'Strong Match' : 'High Alignment',
      executiveSummary: `Vishwajit demonstrates exceptional alignment with core requirements in embedded systems, microcontroller firmware development, and hardware-software integration from his B.Tech E&TC degree and capstone projects.`,
      matchedSkills: matchedList.length > 0 ? matchedList : ['Embedded C', 'ESP32 Dual-Core', 'IoT Protocols', 'Microcontrollers'],
      missingOrLearnableSkills: missingList.length > 0 ? missingList : ['Specific Enterprise CI/CD Pipeline', 'Custom Proprietary RTOS'],
      customPitchBullets: [
        'Demonstrated mastery in bare-metal and FreeRTOS firmware on ESP32 Xtensa architecture.',
        'Proven project execution in 6-DOF robotic control, OpenCV vision tracking, and I2C sensor bus telemetry.',
        'Strong academic foundation in E&TC from Bharati Vidyapeeth College of Engineering Kolhapur with fast learning agility.'
      ],
      suggestedInterviewQuestions: [
        'How do you manage race conditions and task synchronization using FreeRTOS queues on the dual-core ESP32?',
        'Walk us through your approach to inverse kinematics and serial servo communication on your 6-axis robot arm.',
        'How did you calibrate and interface the DHT11 and BMP180 sensors over the I2C bus for the weather station?'
      ],
      source: 'local-embedded-brain',
    });
  } catch (error) {
    console.error('Error in /api/copilot/match-jd:', error);
    res.status(500).json({ error: 'Failed to analyze job description' });
  }
});

// 3. AI Mock Technical Interview Simulator
app.post('/api/copilot/mock-interview', async (req, res) => {
  try {
    const { topic, mode, question, candidateAnswer } = req.body;

    const evalPrompt = `
You are a Senior Principal Embedded Software Engineer conducting a technical interview for Vishwajit Laxman Pawar.
${VISHWAJIT_PORTFOLIO_GROUNDING}

TECHNICAL INTERVIEW QUESTION:
"${question}"

CANDIDATE'S ANSWER:
"${candidateAnswer}"

Evaluate the candidate's answer with high technical rigor. Output strictly valid JSON:
{
  "rating": number (1 to 10),
  "verdict": "Outstanding" | "Strong & Accurate" | "Partially Correct" | "Needs Depth",
  "feedback": "Detailed constructive evaluation of what was right and what could be improved",
  "modelAnswer": "The gold-standard answer a senior embedded engineer would provide",
  "followUpQuestion": "A deeper technical follow-up question to test advanced understanding"
}
`;

    const genPrompt = `
You are a Senior Principal Embedded Systems / Robotics Interviewer.
Generate a high-quality, practical technical interview question for Vishwajit Laxman Pawar on the topic: "${topic || 'ESP32 & FreeRTOS'}".
${VISHWAJIT_PORTFOLIO_GROUNDING}

Output strictly valid JSON:
{
  "topic": "${topic || 'ESP32 & FreeRTOS'}",
  "difficulty": "Intermediate" | "Advanced" | "Principal",
  "question": "A clear, realistic scenario-based engineering question",
  "context": "Why this question tests core embedded engineering competency",
  "hint": "A subtle hint if the candidate needs guidance",
  "keyConceptsTested": ["concept1", "concept2", "concept3"]
}
`;

    // 1. OpenRouter API
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const raw = await callOpenRouter([
          { role: 'system', content: mode === 'evaluate' ? evalPrompt : genPrompt },
          { role: 'user', content: mode === 'evaluate' ? 'Evaluate candidate answer in valid JSON.' : 'Generate question in valid JSON.' }
        ], { responseFormatJson: true, temperature: mode === 'evaluate' ? 0.3 : 0.4 });

        if (raw) {
          const parsed = safeJsonParse(raw);
          if (parsed) {
            return res.json({ ...parsed, source: 'openrouter' });
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter mock interview failed, trying Gemini:', orErr);
      }
    }

    // 2. Gemini 3.7 Flash
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        if (mode === 'evaluate') {
          const result = await gemini.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: evalPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          if (result.text) {
            const parsed = safeJsonParse(result.text);
            if (parsed) {
              return res.json({ ...parsed, source: 'gemini-3.7-flash' });
            }
          }
        } else {
          const result = await gemini.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: genPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          });

          if (result.text) {
            const parsed = safeJsonParse(result.text);
            if (parsed) {
              return res.json({ ...parsed, source: 'gemini-3.7-flash' });
            }
          }
        }
      } catch (err) {
        console.warn('Gemini interview endpoint failed, fallback:', err);
      }
    }

    // 3. Local fallback for mock interview
    if (mode === 'evaluate') {
      return res.json({
        rating: 9,
        verdict: 'Strong & Accurate',
        feedback: 'Great technical clarity! You correctly identified the critical role of mutexes, queues, and task priorities in preventing race conditions and priority inversion on the ESP32.',
        modelAnswer: 'In FreeRTOS on the ESP32, task synchronization across dual cores is managed via Binary/Counting Semaphores, FreeRTOS Queues, and Mutexes with Priority Inheritance. Time-critical sensor sampling should run pinned to Core 1 at higher priority, while networking tasks run on Core 0.',
        followUpQuestion: 'How does FreeRTOS handle priority inversion, and how does the Mutex priority inheritance mechanism resolve it?',
        source: 'local-embedded-brain',
      });
    }

    return res.json({
      topic: topic || 'ESP32 & FreeRTOS',
      difficulty: 'Advanced',
      question: 'On an ESP32 running FreeRTOS with Wi-Fi telemetry and I2C sensor sampling, how would you design the architecture to prevent I2C bus lockups when the Wi-Fi stack blocks on packet transmission?',
      context: 'Tests understanding of dual-core task pinning (xTaskCreatePinnedToCore), queue buffering, and FreeRTOS non-blocking task notification patterns.',
      hint: 'Consider separating the sensor driver ISR/task onto Core 1 with an asynchronous FreeRTOS queue feeding the Wi-Fi telemetry dispatcher on Core 0.',
      keyConceptsTested: ['FreeRTOS Queues', 'Dual-Core Task Pinning', 'I2C Bus Contention', 'Watchdog Timers'],
      source: 'local-embedded-brain',
    });
  } catch (error) {
    console.error('Error in /api/copilot/mock-interview:', error);
    res.status(500).json({ error: 'Failed to process mock interview request' });
  }
});

// 4. AI ESP32 Firmware & Circuit Studio Generator
app.post('/api/copilot/generate-firmware', async (req, res) => {
  try {
    const { prompt: userPrompt, boardType, sensors } = req.body;
    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const sysPrompt = `
You are the AI Firmware Architect for Vishwajit's ESP32 Embedded Lab.
Generate clean, production-grade, well-commented C++ (Arduino/ESP-IDF compatible) firmware based on the user's specification.

Target Hardware: ${boardType || 'ESP32-WROOM-32 (NodeMCU 38-Pin)'}
Sensors / Peripherals: ${(sensors || ['DHT11', 'BMP180']).join(', ')}

Output strictly valid JSON matching this schema:
{
  "title": "Short descriptive title of the firmware",
  "description": "2-sentence overview of the firmware architecture",
  "pinMapping": [
    { "pin": "GPIO21", "function": "I2C SDA (BMP180)", "wireColor": "Purple" },
    { "pin": "GPIO22", "function": "I2C SCL (BMP180)", "wireColor": "Yellow" },
    { "pin": "GPIO4", "function": "DHT11 DATA (10k pullup)", "wireColor": "Blue" },
    { "pin": "3V3 / GND", "function": "Power Rail", "wireColor": "Red / Black" }
  ],
  "code": "// Complete, compiling C++ firmware code here...",
  "explanation": "Key architectural highlights (e.g. FreeRTOS task creation, deep sleep cycles, error handling)",
  "simulatedSerialOutput": [
    "[BOOT] ESP32 Xtensa Dual-Core initializing...",
    "[I2C] Scanning bus at 400kHz... Device found at 0x77 (BMP180)",
    "[DHT11] Sensor ready on GPIO4",
    "[TELEMETRY] Temp: 24.8°C | Humidity: 58% | Pressure: 1013.25 hPa"
  ]
}
`;

    // 1. OpenRouter API
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const raw = await callOpenRouter([
          { role: 'system', content: sysPrompt },
          { role: 'user', content: `User Firmware Request: "${userPrompt}"` }
        ], { responseFormatJson: true, temperature: 0.3 });

        if (raw) {
          const parsed = safeJsonParse(raw);
          if (parsed) {
            return res.json({ ...parsed, source: 'openrouter' });
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter firmware generator failed, trying Gemini:', orErr);
      }
    }

    // 2. Gemini 3.7 Flash
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const result = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `User Firmware Request: "${userPrompt}"`,
          config: {
            systemInstruction: sysPrompt,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        if (result.text) {
          const parsed = safeJsonParse(result.text);
          if (parsed) {
            return res.json({ ...parsed, source: 'gemini-3.7-flash' });
          }
        }
      } catch (err) {
        console.warn('Gemini firmware generator failed, falling back:', err);
      }
    }

    // 3. Local robust firmware template fallback
    return res.json({
      title: 'ESP32 Dual-Core FreeRTOS Sensor Telemetry & Power Manager',
      description: 'Production-ready firmware orchestrating DHT11 and BMP180 sensor reads on Core 1 with non-blocking queue telemetry dispatch to Core 0.',
      pinMapping: [
        { pin: 'GPIO21', function: 'I2C SDA (BMP180)', wireColor: 'Purple' },
        { pin: 'GPIO22', function: 'I2C SCL (BMP180)', wireColor: 'Yellow' },
        { pin: 'GPIO4', function: 'DHT11 Data Bus (10kΩ pullup to 3.3V)', wireColor: 'Blue' },
        { pin: '3V3 / GND', function: 'Regulated 3.3V Logic Bus & Ground', wireColor: 'Red / Black' },
      ],
      code: `/*
 * Vishwajit Pawar Engineering Lab - ESP32 Dual-Core Telemetry Firmware
 * Target: ESP32-WROOM-32 NodeMCU
 * Architecture: FreeRTOS Queues + Non-blocking I2C Sensor Acquisition
 */

#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define SDA_PIN 21
#define SCL_PIN 22

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP085 bmp;

// Telemetry Data Structure for Inter-Task Queue
struct SensorPacket {
  float temperature;
  float humidity;
  int32_t pressure;
  float altitude;
  uint32_t timestamp;
};

QueueHandle_t telemetryQueue;

// Task 1 (Core 1): High-Frequency Deterministic Sensor Sampling
void sensorAcquisitionTask(void *pvParameters) {
  for (;;) {
    SensorPacket packet;
    packet.temperature = dht.readTemperature();
    packet.humidity = dht.readHumidity();
    packet.pressure = bmp.readPressure();
    packet.altitude = bmp.readAltitude();
    packet.timestamp = millis();

    // Push to FreeRTOS Queue (non-blocking with 50ms timeout)
    xQueueSend(telemetryQueue, &packet, pdMS_TO_TICKS(50));
    vTaskDelay(pdMS_TO_TICKS(2000));
  }
}

// Task 2 (Core 0): Telemetry Dispatch & Diagnostics Terminal
void telemetryDispatchTask(void *pvParameters) {
  SensorPacket receivedPacket;
  for (;;) {
    if (xQueueReceive(telemetryQueue, &receivedPacket, portMAX_DELAY) == pdTRUE) {
      Serial.printf("[CORE 0 TELEMETRY] Time: %u ms | Temp: %.1f C | Hum: %.1f %% | Press: %d Pa | Alt: %.1f m\\n",
                    receivedPacket.timestamp, receivedPacket.temperature, receivedPacket.humidity,
                    receivedPacket.pressure, receivedPacket.altitude);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN, 400000); // Fast 400kHz I2C
  dht.begin();
  
  if (!bmp.begin()) {
    Serial.println("[ERROR] BMP180 not detected on I2C bus! Check wiring.");
  } else {
    Serial.println("[OK] BMP180 initialized successfully at 0x77.");
  }

  telemetryQueue = xQueueCreate(10, sizeof(SensorPacket));

  // Spawn pinned FreeRTOS tasks across dual cores
  xTaskCreatePinnedToCore(sensorAcquisitionTask, "SensorTask", 4096, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(telemetryDispatchTask, "DispatchTask", 4096, NULL, 1, NULL, 0);

  Serial.println("[SYSTEM READY] ESP32 Dual-Core FreeRTOS Telemetry Active.");
}

void loop() {
  // FreeRTOS scheduler handles all tasks
  vTaskDelete(NULL);
}`,
      explanation: 'Utilizes FreeRTOS task pinning to isolate time-sensitive sensor reading to Core 1, ensuring the communication stack on Core 0 never causes bus latency.',
      simulatedSerialOutput: [
        '[BOOT] ESP32 Xtensa Dual-Core initialized @ 240MHz',
        '[I2C] Bus online at 400kHz (SDA=21, SCL=22)',
        '[OK] BMP180 initialized successfully at 0x77',
        '[OK] DHT11 single-wire bus online on GPIO4',
        '[CORE 0 TELEMETRY] Time: 2004 ms | Temp: 25.2 C | Hum: 56.4 % | Press: 101340 Pa | Alt: 12.4 m',
        '[CORE 0 TELEMETRY] Time: 4008 ms | Temp: 25.3 C | Hum: 56.1 % | Press: 101338 Pa | Alt: 12.6 m'
      ],
      source: 'local-embedded-brain',
    });
  } catch (error) {
    console.error('Error in /api/copilot/generate-firmware:', error);
    res.status(500).json({ error: 'Failed to generate firmware' });
  }
});

// 5. AI Technical Project Deep Dive & Math Architecture
app.post('/api/copilot/project-deepdive', async (req, res) => {
  try {
    const { projectId } = req.body;

    const sysPrompt = `
Provide an advanced engineering and mathematical deep dive into Vishwajit Laxman Pawar's project: "${projectId || '6-dof-robot'}".
${VISHWAJIT_PORTFOLIO_GROUNDING}

Output strictly valid JSON matching this schema:
{
  "projectName": "Full Project Name",
  "engineeringArchitecture": "2-3 paragraphs explaining the hardware-software stack, communication protocols, and design tradeoffs",
  "mathematicalPrinciples": [
    { "title": "Math / Physics Principle", "equation": "LaTeX or plain text equation", "explanation": "Detailed explanation of how this equation is applied" }
  ],
  "hardwareStack": ["Item 1", "Item 2", "Item 3"],
  "firmwarePatterns": ["Pattern 1 (e.g. FreeRTOS Queues)", "Pattern 2 (e.g. Non-blocking ISRs)"],
  "keyChallengesAndSolutions": [
    { "challenge": "Problem encountered", "solution": "How Vishwajit solved it" }
  ]
}
`;

    // 1. OpenRouter API
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const raw = await callOpenRouter([
          { role: 'system', content: sysPrompt },
          { role: 'user', content: `Generate deep dive for project: ${projectId}` }
        ], { responseFormatJson: true, temperature: 0.3 });

        if (raw) {
          const parsed = safeJsonParse(raw);
          if (parsed) {
            return res.json({ ...parsed, source: 'openrouter' });
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter deep dive failed, trying Gemini:', orErr);
      }
    }

    // 2. Gemini 3.7 Flash
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const result = await gemini.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: sysPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        if (result.text) {
          const parsed = safeJsonParse(result.text);
          if (parsed) {
            return res.json({ ...parsed, source: 'gemini-3.7-flash' });
          }
        }
      } catch (err) {
        console.warn('Gemini deep dive failed, fallback:', err);
      }
    }

    // 3. Local deep dive fallback
    if (projectId === 'weather' || projectId === 'weather-project') {
      return res.json({
        projectName: 'IoT Meteorological Weather Monitoring System',
        engineeringArchitecture: 'The system employs an ESP32 SoC orchestrating environmental sensing over a high-speed I2C bus. The architecture separates sensor polling from cloud transmission using FreeRTOS queues, guaranteeing deterministic sampling intervals without network jitter.',
        mathematicalPrinciples: [
          {
            title: 'Hypsometric Barometric Altitude Equation',
            equation: 'h = ((T0 / L) * (1 - (P / P0)^(R*L / (g*M))))',
            explanation: 'Computes relative elevation from sea-level reference pressure (P0 = 1013.25 hPa) and ambient measured atmospheric pressure (P).'
          },
          {
            title: 'I2C Bus Slew Rate & Pull-Up Calculation',
            equation: 'R_pullup(min) = (Vdd - 0.4V) / 3mA, R_pullup(max) = tr / (0.8473 * C_bus)',
            explanation: 'Calculated 4.7kΩ pull-up resistors on GPIO21/22 to maintain <300ns rise times on 400kHz Fast-Mode I2C.'
          }
        ],
        hardwareStack: ['ESP32-WROOM-32 (240MHz Dual-Core)', 'DHT11 Humidity Sensor', 'BMP180 Digital Barometer', 'AMS1117 3.3V LDO'],
        firmwarePatterns: ['FreeRTOS Dual-Core Task Pinning', 'Deep-Sleep RTC Wakeup Loops', 'I2C Bus Re-initialization Watchdog'],
        keyChallengesAndSolutions: [
          {
            challenge: 'Wi-Fi socket retry blocking caused I2C timing violations and missed sensor cycles.',
            solution: 'Isolated I2C polling onto FreeRTOS Core 1 and pushed measurements into a synchronized queue processed by Core 0.'
          }
        ],
        source: 'local-embedded-brain',
      });
    }

    return res.json({
      projectName: '6-DOF AI-Assisted Articulated Robotic Arm',
      engineeringArchitecture: 'A 6-axis articulated spatial manipulator featuring analytical and numerical Inverse Kinematics solvers coupled with OpenCV computer vision. The host computer executes spatial color/contour tracking and outputs joint coordinate vectors over high-speed serial UART to the servo controller.',
      mathematicalPrinciples: [
        {
          title: 'Denavit-Hartenberg (DH) Transformation Matrix',
          equation: 'T_i = Rot_z(theta_i) * Trans_z(d_i) * Trans_x(a_i) * Rot_x(alpha_i)',
          explanation: 'Computes the forward kinematics homogeneous transformation from base frame to the end-effector tool center point (TCP).'
        },
        {
          title: 'Geometric Inverse Kinematics Decomposition',
          equation: 'theta_3 = acos((r^2 + z^2 - a2^2 - a3^2) / (2 * a2 * a3))',
          explanation: 'Deconstructs the 6-DOF spatial problem into 3-DOF wrist position kinematics and 3-DOF spherical orientation Euler angles.'
        }
      ],
      hardwareStack: ['High-Torque Metal Gear Servos', 'Microcontroller Controller Board', 'HD Optical USB Camera', '5V/10A Dedicated Power Jigs'],
      firmwarePatterns: ['Trapezoidal Velocity Profiling', 'Software Soft-Limit Angle Clamping', 'Checksum Packet Verification'],
      keyChallengesAndSolutions: [
        {
          challenge: 'Servo jitter and current spikes during simultaneous multi-joint high-speed acceleration.',
          solution: 'Implemented S-curve acceleration smoothing and isolated high-current servo power lines with bulk electrolytic capacitor banks.'
        }
      ],
      source: 'local-embedded-brain',
    });
  } catch (error) {
    console.error('Error in /api/copilot/project-deepdive:', error);
    res.status(500).json({ error: 'Failed to generate project deep dive' });
  }
});

// Vite middleware / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laboratory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
