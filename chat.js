
// netlify/functions/chat.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBwiaSnXjie2eDlci2M30Lq7s0JV-dukMI" });

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const body = JSON.parse(event.body || "{}");
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing 'message' string" }) };
    }

    let prompt = message;
    if (Array.isArray(history) && history.length) {
      const recent = history
        .slice(-8)
        .map((h) => `${h.role === "user" ? "Usuario" : "Asistente"}: ${h.text}`)
        .join("\n");
      prompt = `${recent}\nUsuario: ${message}\nAsistente:`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = response?.text ?? "No obtuve respuesta del modelo.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Error en función Netlify:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AI error", details: String(err) }),
    };
  }
};
