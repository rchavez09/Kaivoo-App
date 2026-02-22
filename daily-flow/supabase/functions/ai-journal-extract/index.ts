import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TopicContext {
  id: string;
  name: string;
  pages?: { id: string; name: string }[];
}

interface TagContext {
  id: string;
  name: string;
}

interface TaskContext {
  id: string;
  title: string;
  subtaskCount: number;
}

interface RequestBody {
  input: string;
  topics: TopicContext[];
  tags: TagContext[];
  tasks: TaskContext[];
  currentDate: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, topics, tags, tasks, currentDate }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const topicList = topics.map(t => {
      const pages = t.pages?.map(p => `  - ${t.name}/${p.name}`).join('\n') || '';
      return `- ${t.name}${pages ? '\n' + pages : ''}`;
    }).join('\n');

    const tagList = tags.map(t => `#${t.name}`).join(', ');

    const taskList = tasks.map(t => `- "${t.title}" (id: ${t.id}, ${t.subtaskCount} subtasks)`).join('\n');

    const systemPrompt = `You are an AI assistant for Kaivoo, analyzing long-form journal entries to extract actionable items and organize content.

CURRENT DATE: ${currentDate}
Use this to interpret relative dates like "next week", "tomorrow", "on Friday", etc.

AVAILABLE TOPICS (use exact names with [[Topic]] or [[Topic/Page]] syntax):
${topicList || 'No topics yet'}

AVAILABLE TAGS (use exact names with # prefix):
${tagList || 'No tags yet'}

EXISTING TASKS (you can suggest adding subtasks to these):
${taskList || 'No tasks yet'}

YOUR JOB:
1. Read through the journal entry carefully
2. Extract any actionable tasks, to-dos, or commitments mentioned
3. Identify if any content should be added as subtasks to existing tasks
4. Suggest appropriate topics and tags for organization
5. Only extract clear, actionable items - don't over-extract from casual musings

RULES:
1. Be conservative - only extract items that are clearly actionable
2. Look for phrases like "I need to", "I should", "I have to", "reminder to", "don't forget", "TODO", etc.
3. If user mentions something related to an existing task, suggest it as a subtask
4. Match task names fuzzily - "work on the presentation" should match "Quarterly Presentation" task
5. Suggest NEW topics/tags only if they add clear organizational value
6. For dates, calculate actual date based on CURRENT DATE

OUTPUT FORMAT (JSON):
{
  "suggestions": [
    {
      "type": "task",
      "title": "Clear, actionable task title",
      "dueDate": "YYYY-MM-DD format or null",
      "priority": "low | medium | high",
      "topicPath": "[[Topic/Page]]" or null,
      "tags": ["#tag1", "#tag2"],
      "isNewTopic": boolean,
      "isNewTag": boolean
    },
    {
      "type": "subtask",
      "title": "Subtask title",
      "parentTaskId": "existing-task-id",
      "parentTaskTitle": "Parent task title for display"
    }
  ]
}

IMPORTANT:
- If no actionable items are found, return {"suggestions": []}
- Focus on quality over quantity - don't extract vague or unclear items
- Each task should be specific and actionable
- Preserve the user's intent and wording where possible`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract actionable items from this journal entry:\n\n${input}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue using AI features." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process with AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI journal extract error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
