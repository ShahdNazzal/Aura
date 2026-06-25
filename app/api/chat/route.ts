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

    // history = مصفوفة الرسائل السابقة من الفرونت
    // كل عنصر: { role: "user" | "bot", text: string }
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

    // ─── Detect language & intent ────────────────────────────────────────────
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

    // ─── System prompt ────────────────────────────────────────────────────────
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
- When creating a card, your ENTIRE reply must be ONLY this JSON (nothing else, no extra text):
{
  "action": "create_card",
  "title": "short meaningful title",
  "category": "mind | body | soul | habits | lifestyle | custom",
  "description": "2-3 sentence description of what this card is about and what success looks like",
  "tasks": [
    "Detailed actionable task 1",
    "Detailed actionable task 2",
    "Detailed actionable task 3",
    "...more tasks as needed"
  ]
}

TASK RULES (CRITICAL):
- tasks array must NEVER be empty
- Minimum 5 tasks, maximum 12 tasks depending on topic complexity
- Each task must be specific, actionable, and directly related to the card topic
- Tasks must be ordered logically (beginner → advanced, or day 1 → day 7, etc.)
- If topic is a schedule (gym, study, diet...) → create one task per day or session
- If topic is a skill (meditation, reading...) → create progressive milestone tasks
- If topic is a habit → create daily/weekly habit tasks with clear targets
- Tasks must be written in the SAME language as the user
- In Arabic cards: tasks in Arabic. In English cards: tasks in English.

EXAMPLE - Gym schedule card tasks:
["يوم الأحد: تمارين الصدر والترايسبس (45 دقيقة)", "يوم الثلاثاء: تمارين الظهر والبايسبس (45 دقيقة)", "يوم الأربعاء: تمارين الكارديو والأكتاف (30 دقيقة)", "يوم الخميس: تمارين الأرجل والكور (45 دقيقة)", "يوم السبت: تمارين كاملة للجسم أو يوم راحة نشطة", "شرب 3 لترات ماء يومياً", "النوم 7-8 ساعات لتعافي العضلات", "تسجيل التقدم الأسبوعي في دفتر أو تطبيق"]

- In all other cases → reply in normal human-readable text only
- If a plan/schedule is suitable → suggest creating a card but do NOT create it
`;

    // ─── بناء تاريخ المحادثة للـ API ─────────────────────────────────────────
    // نأخذ آخر 20 رسالة فقط عشان ما نتجاوز حد الـ tokens
    const recentHistory = history.slice(-20);

    const conversationMessages = recentHistory.map((msg) => ({
      role: msg.role === "user" ? "user" as const : "assistant" as const,
      content: msg.text,
    }));

    // ─── استدعاء الـ AI ───────────────────────────────────────────────────────
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationMessages,
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
    });

    let aiMessage = response.choices?.[0]?.message?.content?.trim() || "";

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
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = null;
    }

    // ─── إنشاء الكارد ────────────────────────────────────────────────────────
    if (parsed?.action === "create_card" && wantsCard) {
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

      if (parsed.tasks?.length) {
        await supabaseAdmin.from("tasks").insert(
          parsed.tasks.map((t: string) => ({
            card_id: newCard.id,
            text: t,
            is_done: false,
          }))
        );
      }

      // جلب الكارد كاملة مع التاسكات عشان تظهر فوراً بالفرونت
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

    // ─── لو الـ AI رجع JSON بدون طلب كارد → حوّله لرسالة طبيعية ────────────
    if (parsed?.action || (parsed && !aiMessage.replace(/\{[\s\S]*\}/, "").trim())) {
      aiMessage = isArabic
        ? "عذراً، حدث خطأ في الرد. هل يمكنك إعادة السؤال؟"
        : "Sorry, something went wrong with my response. Could you rephrase?";
    }

    // ─── اقتراح كارد بدون إنشاء ──────────────────────────────────────────────
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