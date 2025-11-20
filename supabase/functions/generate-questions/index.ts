import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 5 } = await req.json();

    // Get Llama container URL from environment
    const llamaUrl = Deno.env.get('LLAMA_CONTAINER_URL');
    if (!llamaUrl) {
      throw new Error("LLAMA_CONTAINER_URL not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    const categories = ["Sécurité", "Phishing", "Mots de passe", "Réseaux", "RGPD", "Authentification"];
    const generatedQuestions = [];

    // Generate questions using Llama
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const prompt = `Génère une question de cybersécurité de type vrai/faux sur le thème "${category}". 
Format de réponse attendu (JSON uniquement):
{
  "question": "La question ici",
  "answer": true ou false,
  "category": "${category}"
}`;

      try {
        const response = await fetch(`${llamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "llama3",
            prompt: prompt,
            stream: false,
          }),
        });

        if (!response.ok) {
          console.error("Llama API error:", await response.text());
          continue;
        }

        const data = await response.json();
        const responseText = data.response;
        
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const questionData = JSON.parse(jsonMatch[0]);
          
          // Insert into database
          const { data: inserted, error: insertError } = await supabaseClient
            .from('questions')
            .insert({
              question: questionData.question,
              answer: questionData.answer,
              category: questionData.category || category,
              ai_generated: true,
              validated: false,
              created_by: user.id,
            })
            .select()
            .single();

          if (!insertError) {
            generatedQuestions.push(inserted);
          }
        }
      } catch (error) {
        console.error("Error generating question:", error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: generatedQuestions.length,
        questions: generatedQuestions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error in generate-questions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes("Unauthorized") ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
