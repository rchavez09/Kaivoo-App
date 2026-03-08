import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  followUp?: {
    question: string;
    answer: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, topics, tags, tasks, currentDate, followUp }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const topicList = topics
      .map((t) => {
        const pages = t.pages?.map((p) => `  - ${t.name}/${p.name}`).join('\n') || '';
        return `- ${t.name}${pages ? '\n' + pages : ''}`;
      })
      .join('\n');

    const tagList = tags.map((t) => `#${t.name}`).join(', ');

    const taskList = tasks.map((t) => `- "${t.title}" (id: ${t.id}, ${t.subtaskCount} subtasks)`).join('\n');

    const systemPrompt = `You are an AI assistant for Kaivoo, a personal productivity app. Your job is to analyze user thoughts/notes and suggest structured actions WITH smart categorization.

CURRENT DATE: ${currentDate}
Use this to interpret relative dates like "28th of this month", "next week", "tomorrow", etc.

AVAILABLE TOPICS (use exact names with [[Topic]] or [[Topic/Page]] syntax):
${topicList || 'No topics yet'}

AVAILABLE TAGS (use exact names with # prefix):
${tagList || 'No tags yet'}

EXISTING TASKS (you can add subtasks to these):
${taskList || 'No tasks yet'}

RULES:
1. Analyze the input and suggest actionable items
2. PROACTIVE SORTING: Always try to categorize content, even generic notes! If there's no clear match:
   - Suggest a NEW topic that would make sense (set isNewTopic: true, include in suggestedNewTopics)
   - Suggest relevant NEW tags based on content themes (set isNewTag: true if any tag is new, include in suggestedNewTags)
3. For generic/ambiguous content like "testing features" or casual notes, STILL suggest:
   - A topic like "[[General]]", "[[Ideas]]", "[[Notes]]" if no existing topic fits
   - Tags based on detected themes: #testing, #ideas, #personal, #quick-thought, etc.
4. Be concise - this is quick capture, not a conversation
5. If the user mentions adding something TO an existing task, create a "subtask" suggestion
6. Match task names fuzzily - "Butcher Block Task" should match "Butcher Block"
7. CRITICAL: When user mentions dates, calculate the actual date based on CURRENT DATE

OUTPUT FORMAT (JSON):
{
  "suggestions": [
    {
      "type": "task",
      "title": "Task title",
      "dueDate": "YYYY-MM-DD format or null",
      "priority": "low | medium | high",
      "topicPath": "[[Topic/Page]]" or null (ALWAYS suggest one if possible),
      "tags": ["#tag1", "#tag2"] (ALWAYS include at least one relevant tag),
      "isNewTopic": boolean (true if topic doesn't exist),
      "isNewTag": boolean (true if ANY tag is new),
      "suggestedNewTopics": ["TopicName"] (optional: list new topic suggestions user can pick from),
      "suggestedNewTags": ["#tagname"] (optional: list new tag suggestions user can pick from)
    },
    {
      "type": "subtask",
      "title": "Subtask title",
      "parentTaskId": "existing-task-id",
      "parentTaskTitle": "Parent task title"
    },
    {
      "type": "capture",
      "content": "Note text to save",
      "topicPath": "[[Topic/Page]]" or null (ALWAYS suggest one - even [[Notes]] or [[General]] for generic content),
      "tags": ["#tag1"] (ALWAYS include at least one relevant tag),
      "isNewTopic": boolean,
      "isNewTag": boolean,
      "suggestedNewTopics": ["TopicName"] (optional: alternatives for user to pick),
      "suggestedNewTags": ["#tagname"] (optional: additional tag suggestions)
    }
  ],
  "clarification": null or {
    "question": "Where does this belong?",
    "choices": ["Work project", "Personal", "Skip routing"]
  }
}

IMPORTANT: For ANY input, even vague ones, ALWAYS:
- Assign a topicPath (create new if needed like [[General]], [[Notes]], [[Ideas]])
- Assign at least one tag based on content (#note, #idea, #quick-thought, #reminder, etc.)
- Include suggestedNewTopics/suggestedNewTags arrays with alternatives when creating new ones

If everything is clear, provide suggestions with proper categorization and set clarification to null.`;

    const messages = [{ role: 'system', content: systemPrompt }];

    // Add follow-up context if provided
    if (followUp) {
      messages.push(
        { role: 'user', content: input },
        { role: 'assistant', content: `I need clarification: ${followUp.question}` },
        {
          role: 'user',
          content: `User selected: ${followUp.answer}. Now process the original input with this context.`,
        },
      );
    } else {
      messages.push({ role: 'user', content: input });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue using AI features.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to process with AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('AI inbox error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
