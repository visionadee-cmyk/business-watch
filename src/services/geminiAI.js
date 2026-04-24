// Google Gemini AI Service for Smart Bids
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

/**
 * Generate AI-powered bid analysis using Gemini
 */
export const analyzeBidsWithAI = async (bidsData, tendersData, insights) => {
  try {
    const prompt = buildAnalysisPrompt(bidsData, tendersData, insights);
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return parseAIResponse(data);
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return getFallbackAnalysis(bidsData, insights);
  }
};

/**
 * Get detailed recommendations for a specific open bid
 */
export const getBidRecommendation = async (bid, allBids, categoryStats) => {
  try {
    const prompt = buildBidRecommendationPrompt(bid, allBids, categoryStats);
    
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return parseBidRecommendation(data, bid);
  } catch (error) {
    console.error('Gemini Recommendation Error:', error);
    return getFallbackRecommendation(bid, categoryStats);
  }
};

/**
 * Build comprehensive analysis prompt
 */
const buildAnalysisPrompt = (bids, tenders, insights) => {
  const wonBids = bids.filter(b => b.result === 'Won');
  const lostBids = bids.filter(b => b.result === 'Lost');
  const openBids = bids.filter(b => b.status === 'Open' || b.status === 'Draft');

  return `
You are an expert tender/bid analyst for a Maldivian company called "Business Watch". 
Analyze the following bidding data and provide strategic recommendations:

## HISTORICAL PERFORMANCE
- Total Won Bids: ${wonBids.length}
- Total Lost Bids: ${lostBids.length}
- Win Rate: ${insights?.successRate || 'N/A'}%
- Average Winning Bid: MVR ${insights?.avgWonAmount || 'N/A'}
- Average Lost Bid: MVR ${insights?.avgLostAmount || 'N/A'}
- Best Performing Category: ${insights?.bestCategory || 'N/A'} (${insights?.bestCategoryRate || 'N/A'}% win rate)

## WON BIDS DETAILS:
${wonBids.slice(0, 10).map(b => `- ${b.title || b.tenderTitle}: MVR ${(b.bidAmount || 0).toLocaleString()} (${b.category || 'Unknown'})`).join('\n')}

## LOST BIDS DETAILS:
${lostBids.slice(0, 5).map(b => `- ${b.title || b.tenderTitle}: MVR ${(b.bidAmount || 0).toLocaleString()} (${b.category || 'Unknown'})`).join('\n')}

## OPEN BIDS (Need Decision):
${openBids.map(b => `- ${b.title || b.tenderTitle}: MVR ${(b.bidAmount || 0).toLocaleString()}, Category: ${b.category || 'Unknown'}, Deadline: ${b.submissionDeadline || 'N/A'}`).join('\n')}

## CATEGORY PERFORMANCE:
${Object.entries(insights?.categoryStats || {}).map(([cat, stats]) => 
  `- ${cat}: ${stats.won} won / ${stats.lost} lost (${stats.total > 0 ? ((stats.won/stats.total)*100).toFixed(1) : 0}% win rate)`
).join('\n')}

Please provide a detailed analysis in this exact JSON format:
{
  "executiveSummary": "Brief 2-3 sentence summary of overall performance",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2"],
  "strategicRecommendations": [
    {
      "category": "Category Name",
      "recommendation": "Detailed recommendation text",
      "priority": "High/Medium/Low"
    }
  ],
  "pricingInsights": "Analysis of pricing patterns and suggestions",
  "competitiveAnalysis": "Brief competitive positioning analysis",
  "openBidsStrategy": "Strategy for current open bids"
}

Only return the JSON, no other text.`;
};

/**
 * Build recommendation prompt for a single bid
 */
const buildBidRecommendationPrompt = (bid, allBids, categoryStats) => {
  const category = bid.category || 'Unknown';
  const catStats = categoryStats[category] || { won: 0, lost: 0, total: 0 };
  
  const similarWonBids = allBids.filter(b => 
    b.result === 'Won' && 
    (b.category || 'Unknown') === category
  ).slice(0, 5);

  return `
You are a tender/bid expert analyzing whether to bid on a specific opportunity.

## BID TO ANALYZE:
- Title: ${bid.title || bid.tenderTitle || 'Untitled'}
- Category: ${category}
- Amount: MVR ${(bid.bidAmount || 0).toLocaleString()}
- Company/Client: ${bid.company || bid.client || 'Not specified'}
- Deadline: ${bid.submissionDeadline || 'Not specified'}
- Status: ${bid.status || 'Open'}
- Assigned Staff: ${bid.assignedStaff ? 'Yes' : 'No'}

## CATEGORY HISTORICAL DATA (${category}):
- Total bids in this category: ${catStats.total}
- Won: ${catStats.won}
- Lost: ${catStats.lost}
- Win Rate: ${catStats.total > 0 ? ((catStats.won/catStats.total)*100).toFixed(1) : 0}%

## SIMILAR SUCCESSFUL BIDS IN THIS CATEGORY:
${similarWonBids.map(b => `- ${b.title || b.tenderTitle}: MVR ${(b.bidAmount || 0).toLocaleString()}`).join('\n')}

Based on this data, should we bid on this opportunity? Provide analysis in this exact JSON format:
{
  "recommendation": "BID or SKIP or CONSIDER",
  "confidence": 85,
  "detailedReasoning": "2-3 sentences explaining the recommendation with specific data points",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "pricingAssessment": "Is the bid amount competitive? Suggest adjustments if needed.",
  "risks": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1"],
  "actionItems": ["action 1", "action 2"]
}

Only return the JSON, no other text.`;
};

/**
 * Parse AI response
 */
const parseAIResponse = (data) => {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getFallbackAnalysis();
  } catch (e) {
    console.error('Parse error:', e);
    return getFallbackAnalysis();
  }
};

/**
 * Parse bid recommendation
 */
const parseBidRecommendation = (data, bid) => {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        bidId: bid.id,
        bidTitle: bid.title || bid.tenderTitle,
        recommendation: parsed.recommendation,
        confidence: parsed.confidence,
        detailedReasoning: parsed.detailedReasoning,
        keyFactors: parsed.keyFactors || [],
        pricingAssessment: parsed.pricingAssessment,
        risks: parsed.risks || [],
        opportunities: parsed.opportunities || [],
        actionItems: parsed.actionItems || []
      };
    }
    return getFallbackRecommendation(bid);
  } catch (e) {
    return getFallbackRecommendation(bid);
  }
};

/**
 * Fallback analysis when AI fails
 */
const getFallbackAnalysis = (bids, insights) => ({
  executiveSummary: `Based on historical data, your win rate is ${insights?.successRate || 'N/A'}%. Focus on ${insights?.bestCategory || 'profitable'} categories for better results.`,
  keyStrengths: ['Consistent bidding activity', 'Diverse category experience'],
  areasForImprovement: ['Pricing strategy', 'Category focus'],
  strategicRecommendations: [],
  pricingInsights: 'Review pricing against historical wins',
  competitiveAnalysis: 'Data insufficient for detailed analysis',
  openBidsStrategy: 'Prioritize bids in strong categories'
});

/**
 * Fallback recommendation
 */
const getFallbackRecommendation = (bid, categoryStats) => {
  const category = bid.category || 'Unknown';
  const stats = categoryStats?.[category] || { total: 0, won: 0 };
  const winRate = stats.total > 0 ? (stats.won / stats.total) * 100 : 50;
  
  return {
    bidId: bid.id,
    bidTitle: bid.title || bid.tenderTitle,
    recommendation: winRate >= 50 ? 'BID' : 'CONSIDER',
    confidence: Math.round(winRate),
    detailedReasoning: `Category win rate is ${winRate.toFixed(0)}%. ${winRate >= 50 ? 'Strong historical performance.' : 'Mixed results in this category.'}`,
    keyFactors: ['Category performance', 'Bid amount'],
    pricingAssessment: 'Compare to historical winning bids',
    risks: ['Competition', 'Timeline constraints'],
    opportunities: ['Category experience'],
    actionItems: ['Review pricing', 'Assign dedicated staff']
  };
};

export default { analyzeBidsWithAI, getBidRecommendation };
