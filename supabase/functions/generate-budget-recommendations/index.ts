import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    console.log('Generating recommendations for user:', user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error('Failed to fetch profile');
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found. Please complete your profile first.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Transactions error:', transactionsError);
      throw new Error('Failed to fetch transactions');
    }

    // Calculate financial summary
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = totalIncome - totalExpenses;

    // Create expense breakdown by category
    const expensesByCategory = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>) || {};

    // Prepare prompt for OpenAI
    const prompt = `As a financial advisor, analyze this user's financial situation and provide personalized budget recommendations:

USER PROFILE:
- Age: ${profile.age}
- Annual Salary: $${profile.salary}
- Marital Status: ${profile.marital_status}
- Financial Goals: ${profile.financial_goals?.join(', ') || 'Not specified'}

CURRENT FINANCIAL SUMMARY:
- Total Income (from transactions): $${totalIncome}
- Total Expenses (from transactions): $${totalExpenses}
- Current Balance: $${balance}

EXPENSE BREAKDOWN BY CATEGORY:
${Object.entries(expensesByCategory).map(([category, amount]) => `- ${category}: $${amount}`).join('\n')}

TRANSACTION COUNT: ${transactions?.length || 0} transactions recorded

Please provide:
1. Analysis of their current spending patterns
2. Specific budget recommendations based on their age, salary, and goals
3. Areas where they can optimize spending
4. Savings strategies appropriate for their situation
5. Emergency fund recommendations
6. Investment suggestions if applicable

Format your response in clear sections with actionable advice. Be specific with dollar amounts and percentages where relevant.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional financial advisor providing personalized budget recommendations. Be specific, practical, and encouraging in your advice.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    console.log('Generated recommendations, saving to database...');

    // Save recommendations to database
    const { error: saveError } = await supabase
      .from('ai_recommendations')
      .insert({
        user_id: user.id,
        recommendations: recommendations
      });

    if (saveError) {
      console.error('Save error:', saveError);
      throw new Error('Failed to save recommendations');
    }

    console.log('Recommendations saved successfully');

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-budget-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});