// C:\Users\lenovo\Downloads\build-aura-gamified-platform\app\api\chat\route.ts

import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId: string = body.userId;
    const userMessage: string = body.text;
    const history: { role: string; text: string }[] = body.history ?? [];

    if (!userMessage) {
      return Response.json({ reply: "No message" });
    }

    // ─── جلب الذاكرة من Supabase ────────────────────────────────────────────
    let userMemory = "";
    let existingFacts: Record<string, string> = {};

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("ai_memory")
        .eq("id", userId)
        .single();

      if (profile?.ai_memory) {
        existingFacts = profile.ai_memory as Record<string, string>;
        userMemory = Object.entries(existingFacts)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n");
      }
    }

    const isArabic = /[\u0600-\u06FF]/.test(userMessage);

    const wantsCard =
      userMessage.toLowerCase().includes("card") ||
      userMessage.includes("كارد") ||
      userMessage.includes("كرت");

    const suggestCard =
      !wantsCard &&
      (userMessage.toLowerCase().includes("plan") ||
        userMessage.toLowerCase().includes("schedule") ||
        userMessage.includes("خطة") ||
        userMessage.includes("جدول"));

    const systemPrompt = `
You are AURA, a warm and smart AI self-growth coach.

${userMemory ? `WHAT YOU KNOW ABOUT THIS USER:\n${userMemory}\n` : ""}

LANGUAGE RULE (HIGHEST PRIORITY):
- ALWAYS reply in the EXACT same language as the user's latest message
- If user writes in Arabic → reply ONLY in Arabic
- If user writes in English → reply ONLY in English
- NEVER mix languages

CONVERSATION RULE:
- You have full memory of the conversation above
- Always keep context and refer back to previous messages when relevant
- Be warm, concise, and genuinely helpful

MEMORY RULE:
- If user shares personal info (name, age, goals, habits, health, lifestyle),
  extract it and append at the very END of your reply as:
  <memory>{"key": "value"}</memory>
  Only include NEW facts not already known. Omit the tag if nothing new.

CARD RULES:
- ONLY create a card when user EXPLICITLY asks (says "create a card", "أنشئ كارد", etc.)
- When creating a card, your ENTIRE reply must be ONLY this JSON (nothing else, no extra text, no markdown fences):
{
  "action": "create_card",
  "title": "short meaningful title",
  "category": "mind | body | soul | habits | lifestyle | custom",
  "description": "2-3 sentence description of what this card is about and what success looks like",
  "tasks": [
    "Detailed actionable task 1",
    "Detailed actionable task 2",
    "Detailed actionable task 3"
  ]
}

TASK RULES (CRITICAL — DO NOT SKIP):
- "tasks" is REQUIRED and must NEVER be an empty array. This is the most important field in the whole JSON.
- Write the tasks array FIRST in your head, then write the rest of the JSON around it.
- Minimum 5 tasks, maximum 8 tasks. Keep each task short (under 15 words) so you don't run out of space.
- Tasks must be specific, actionable, ordered logically.
- Tasks must be written in the SAME language as the user.

EXAMPLE - Gym schedule card tasks:
["يوم الأحد: تمارين الصدر والترايسبس (45 دقيقة)", "يوم الثلاثاء: تمارين الظهر والبايسبس (45 دقيقة)", "يوم الأربعاء: كارديو وأكتاف (30 دقيقة)", "يوم الخميس: أرجل وكور (45 دقيقة)", "شرب 3 لترات ماء يومياً", "النوم 7-8 ساعات", "تسجيل التقدم أسبوعياً"]

- In all other cases → reply in normal human-readable text only
- If a plan/schedule is suitable → suggest creating a card but do NOT create it
`;

    const recentHistory = history.slice(-20);

    const conversationMessages = recentHistory.map((msg) => ({
      role: msg.role === "user" ? "user" as const : "assistant" as const,
      content: msg.text,
    }));

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 2048, // مهم: كان مفقود، وممكن يكون السبب الرئيسي لقص الـ tasks
    });

    let aiMessage = response.choices?.[0]?.message?.content?.trim() || "";

    // ─── تشخيص: اطبع الرد الخام دايماً بالـ terminal ─────────────────────────
    console.log("=== RAW AI RESPONSE ===\n", aiMessage, "\n=======================");

    // ─── استخراج وحفظ الذاكرة ────────────────────────────────────────────────
    const memoryMatch = aiMessage.match(/<memory>([\s\S]*?)<\/memory>/);
    if (memoryMatch && userId) {
      try {
        const newFacts = JSON.parse(memoryMatch[1]);
        const merged = { ...existingFacts, ...newFacts };
        await supabaseAdmin
          .from("profiles")
          .update({ ai_memory: merged })
          .eq("id", userId);
      } catch {
        // skip bad JSON
      }
      aiMessage = aiMessage.replace(/<memory>[\s\S]*?<\/memory>/, "").trim();
    }

    // ─── محاولة Parse JSON (للكارد) ──────────────────────────────────────────
    let parsed: any = null;
    let parseError: string | null = null;
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e: any) {
      parsed = null;
      parseError = e?.message ?? "unknown parse error";
      console.log("=== JSON PARSE FAILED ===\n", parseError);
    }

    // ─── إنشاء الكارد ────────────────────────────────────────────────────────
    if (parsed?.action === "create_card" && wantsCard) {
      // fallback: لو الموديل رجع tasks فاضية أو ناقصة، اطلبها بطلب منفصل ومركّز
      let tasks: string[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];

      if (tasks.length === 0) {
        console.log("=== tasks EMPTY, requesting a dedicated tasks-only call ===");
        try {
          const tasksRetry = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: isArabic
                  ? `أعطني فقط مصفوفة JSON من 5 إلى 8 تاسكات (نصوص قصيرة وعملية) لكارد بعنوان "${parsed.title}" ووصفه: "${parsed.description}". رجاوبني بس بمصفوفة JSON متل هيك: ["task1", "task2", ...] بدون أي كلام إضافي.`
                  : `Give me only a JSON array of 5 to 8 short actionable tasks for a card titled "${parsed.title}" with description: "${parsed.description}". Reply ONLY with a JSON array like: ["task1", "task2", ...] with no extra text.`,
              },
            ],
            temperature: 0.5,
            max_tokens: 800,
          });

          const retryText = tasksRetry.choices?.[0]?.message?.content?.trim() || "";
          const arrMatch = retryText.match(/\[[\s\S]*\]/);
          if (arrMatch) {
            const retryTasks = JSON.parse(arrMatch[0]);
            if (Array.isArray(retryTasks) && retryTasks.length > 0) {
              tasks = retryTasks;
            }
          }
        } catch (e) {
          console.log("=== tasks retry failed ===", e);
        }
      }

      const { data: newCard, error } = await supabaseAdmin
        .from("cards")
        .insert({
          user_id: userId,
          title: parsed.title,
          category: parsed.category,
          description: parsed.description,
        })
        .select()
        .single();

      if (error) throw error;

      if (tasks.length) {
        const { error: tasksError } = await supabaseAdmin.from("tasks").insert(
          tasks.map((t: string) => ({
            card_id: newCard.id,
            text: t,
            is_done: false,
          }))
        );
        if (tasksError) console.log("=== tasks insert error ===", tasksError);
      } else {
        console.log("=== NO TASKS EVEN AFTER RETRY ===");
      }

      const { data: fullCard } = await supabaseAdmin
        .from("cards")
        .select("*, tasks(*)")
        .eq("id", newCard.id)
        .single();

      return Response.json({
        reply: isArabic
          ? `تم إنشاء كارد "${parsed.title}" بنجاح ✅`
          : `Card "${parsed.title}" created successfully ✅`,
        newCard: fullCard ?? newCard,
      });
    }

    if (parsed?.action || (parsed && !aiMessage.replace(/\{[\s\S]*\}/, "").trim())) {
      aiMessage = isArabic
        ? "عذراً، حدث خطأ في الرد. هل يمكنك إعادة السؤال؟"
        : "Sorry, something went wrong with my response. Could you rephrase?";
    }

    if (suggestCard) {
      aiMessage += isArabic
        ? "\n\n💡 هل تريد أحول هذا إلى كارد؟ قل لي \"أنشئ كارد\" وسأضيفها فوراً."
        : "\n\n💡 Want me to turn this into a card? Just say \"create a card\" and I'll add it instantly.";
    }

    return Response.json({ reply: aiMessage });
  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Server error 😢" });
  }
}