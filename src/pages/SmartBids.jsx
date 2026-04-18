import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Target,
  DollarSign,
  BarChart3,
  Loader2,
  RefreshCw,
  FileText,
  Award,
  Percent
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { analyzeBidsWithAI, getBidRecommendation } from '../services/geminiAI';

const SmartBids = () => {
  const [bids, setBids] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [priceRecommendations, setPriceRecommendations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // Fetch bids and tenders data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bids
      const bidsSnapshot = await getDocs(collection(db, 'bids'));
      const bidsData = bidsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBids(bidsData);

      // Fetch tenders (for bid comparison analysis)
      const tendersSnapshot = await getDocs(collection(db, 'tenders'));
      const tendersData = tendersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTenders(tendersData);

      // Run AI analysis
      await analyzeBids(bidsData, tendersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBids = async (bidsData, tendersData) => {
    setAnalyzing(true);
    
    try {
      // 1. Get comprehensive AI analysis from Gemini
      const aiInsights = await analyzeBidsWithAI(bidsData, tendersData, insights);
      setAiAnalysis(aiInsights);

      // 2. Get AI recommendations for open bids
      const openBids = bidsData.filter(b => b.status === 'Open' || b.status === 'Draft');
      const categoryStats = calculateCategoryStats(bidsData);
      
      const aiRecs = [];
      for (const bid of openBids.slice(0, 5)) { // Limit to 5 to avoid rate limits
        const rec = await getBidRecommendation(bid, bidsData, categoryStats);
        aiRecs.push(rec);
      }
      setAiRecommendations(aiRecs);
    } catch (error) {
      console.error('AI Analysis error:', error);
    }
    
    // Continue with local analysis as backup
    setTimeout(() => {
      // 1. Analyze Won vs Lost bids
      const wonBids = bidsData.filter(b => b.result === 'Won');
      const lostBids = bidsData.filter(b => b.result === 'Lost');
      const pendingBids = bidsData.filter(b => b.result === 'Pending');
      const openBids = bidsData.filter(b => b.status === 'Open' || b.status === 'Draft');

      // Calculate success rate
      const completedBids = wonBids.length + lostBids.length;
      const successRate = completedBids > 0 ? (wonBids.length / completedBids) * 100 : 0;

      // Calculate average bid amounts
      const avgWonAmount = wonBids.length > 0 
        ? wonBids.reduce((sum, b) => sum + (b.bidAmount || 0), 0) / wonBids.length 
        : 0;
      const avgLostAmount = lostBids.length > 0 
        ? lostBids.reduce((sum, b) => sum + (b.bidAmount || 0), 0) / lostBids.length 
        : 0;

      // Analyze by category
      const categoryStats = {};
      bidsData.forEach(bid => {
        const cat = bid.category || 'Unknown';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { won: 0, lost: 0, total: 0, totalAmount: 0 };
        }
        categoryStats[cat].total++;
        categoryStats[cat].totalAmount += (bid.bidAmount || 0);
        if (bid.result === 'Won') categoryStats[cat].won++;
        if (bid.result === 'Lost') categoryStats[cat].lost++;
      });

      // Find best and worst performing categories
      let bestCategory = null;
      let worstCategory = null;
      let bestRate = -1;
      let worstRate = 101;

      Object.entries(categoryStats).forEach(([cat, stats]) => {
        const rate = stats.total > 0 ? (stats.won / stats.total) * 100 : 0;
        if (stats.total >= 3) { // Only consider categories with at least 3 bids
          if (rate > bestRate) {
            bestRate = rate;
            bestCategory = cat;
          }
          if (rate < worstRate) {
            worstRate = rate;
            worstCategory = cat;
          }
        }
      });

      // Generate insights
      const generatedInsights = {
        successRate: successRate.toFixed(1),
        totalWon: wonBids.length,
        totalLost: lostBids.length,
        totalPending: pendingBids.length,
        avgWonAmount: avgWonAmount.toFixed(2),
        avgLostAmount: avgLostAmount.toFixed(2),
        bestCategory: bestCategory || 'N/A',
        bestCategoryRate: bestRate.toFixed(1),
        worstCategory: worstCategory || 'N/A',
        worstCategoryRate: worstRate.toFixed(1),
        categoryStats,
        openBidsCount: openBids.length
      };

      setInsights(generatedInsights);

      // 2. Generate Suggestions for Open Bids
      const generatedSuggestions = openBids.map(bid => {
        const category = bid.category || 'Unknown';
        const catStats = categoryStats[category] || { won: 0, lost: 0, total: 0 };
        const catSuccessRate = catStats.total > 0 ? (catStats.won / catStats.total) * 100 : 50;
        
        // AI Decision Logic
        let recommendation = 'CONSIDER';
        let confidence = 50;
        let reasoning = [];

        // Factor 1: Category performance
        if (catSuccessRate >= 70) {
          recommendation = 'RECOMMENDED';
          confidence += 20;
          reasoning.push(`Strong category performance (${catSuccessRate.toFixed(0)}% win rate)`);
        } else if (catSuccessRate <= 30 && catStats.total >= 3) {
          recommendation = 'NOT RECOMMENDED';
          confidence -= 20;
          reasoning.push(`Poor category performance (${catSuccessRate.toFixed(0)}% win rate)`);
        }

        // Factor 2: Bid amount comparison
        const bidAmount = bid.bidAmount || 0;
        const historicalAvg = catStats.total > 0 ? catStats.totalAmount / catStats.total : 0;
        
        if (historicalAvg > 0) {
          if (bidAmount < historicalAvg * 0.8) {
            recommendation = recommendation === 'NOT RECOMMENDED' ? 'CONSIDER' : 'RECOMMENDED';
            confidence += 15;
            reasoning.push('Bid amount below category average (competitive pricing)');
          } else if (bidAmount > historicalAvg * 1.5) {
            recommendation = recommendation === 'RECOMMENDED' ? 'CONSIDER' : 'NOT RECOMMENDED';
            confidence -= 15;
            reasoning.push('Bid amount significantly above category average');
          }
        }

        // Factor 3: Staff availability
        if (bid.assignedStaff) {
          confidence += 10;
          reasoning.push('Staff already assigned');
        } else {
          confidence -= 5;
          reasoning.push('No staff assigned yet');
        }

        // Cap confidence
        confidence = Math.max(10, Math.min(95, confidence));

        return {
          bidId: bid.id,
          bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
          category,
          recommendation,
          confidence,
          reasoning,
          bidAmount,
          deadline: bid.submissionDeadline,
          daysRemaining: bid.submissionDeadline 
            ? Math.ceil((new Date(bid.submissionDeadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null
        };
      });

      setSuggestions(generatedSuggestions);

      // 3. Price Recommendations
      const priceRecs = openBids.map(bid => {
        const category = bid.category || 'Unknown';
        const catStats = categoryStats[category];
        
        if (!catStats || catStats.won === 0) {
          return {
            bidId: bid.id,
            bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
            category,
            currentPrice: bid.bidAmount || 0,
            suggestedPrice: bid.bidAmount || 0,
            adjustment: 0,
            reasoning: ['Insufficient historical data for this category']
          };
        }

        // Calculate average won price for this category
        const wonInCategory = bidsData.filter(b => 
          b.result === 'Won' && (b.category || 'Unknown') === category
        );
        const avgWonPrice = wonInCategory.length > 0
          ? wonInCategory.reduce((sum, b) => sum + (b.bidAmount || 0), 0) / wonInCategory.length
          : bid.bidAmount || 0;

        const currentPrice = bid.bidAmount || 0;
        let suggestedPrice = currentPrice;
        let adjustment = 0;
        let reasoning = [];

        if (currentPrice > 0) {
          // If current price is higher than average won price, suggest lowering
          if (currentPrice > avgWonPrice * 1.2) {
            suggestedPrice = avgWonPrice * 1.05; // Slightly above average for competitiveness
            adjustment = ((suggestedPrice - currentPrice) / currentPrice) * 100;
            reasoning.push(`Current price is ${((currentPrice / avgWonPrice - 1) * 100).toFixed(0)}% above average winning price`);
            reasoning.push(`Consider reducing to increase win probability`);
          } 
          // If current price is already competitive
          else if (currentPrice >= avgWonPrice * 0.9 && currentPrice <= avgWonPrice * 1.1) {
            reasoning.push('Current price is competitive with historical wins');
            reasoning.push('Good positioning for this category');
          }
          // If current price is very low
          else if (currentPrice < avgWonPrice * 0.8) {
            suggestedPrice = avgWonPrice * 0.95;
            adjustment = ((suggestedPrice - currentPrice) / currentPrice) * 100;
            reasoning.push('Current price is significantly below average');
            reasoning.push('Room to increase while remaining competitive');
          }
        }

        return {
          bidId: bid.id,
          bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
          category,
          currentPrice,
          suggestedPrice: Math.round(suggestedPrice * 100) / 100,
          adjustment: Math.round(adjustment * 100) / 100,
          avgWonPrice: Math.round(avgWonPrice * 100) / 100,
          reasoning
        };
      });

      setPriceRecommendations(priceRecs);
      setAnalyzing(false);
    }, 500); // Short delay for UI smoothness
  };

  const calculateCategoryStats = (bidsData) => {
    const categoryStats = {};
    bidsData.forEach(bid => {
      const cat = bid.category || 'Unknown';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { won: 0, lost: 0, total: 0, totalAmount: 0 };
      }
      categoryStats[cat].total++;
      categoryStats[cat].totalAmount += (bid.bidAmount || 0);
      if (bid.result === 'Won') categoryStats[cat].won++;
      if (bid.result === 'Lost') categoryStats[cat].lost++;
    });
    return categoryStats;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading bid data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Smart Bids AI</h1>
        </div>
        <p className="text-gray-600">
          AI-powered bid analysis and recommendations based on your bidding history
        </p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={() => fetchData()}
        disabled={analyzing}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
        {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
      </button>

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-7 h-7 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Gemini AI Analysis</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Powered by Google Gemini</span>
          </div>
          
          <p className="text-gray-700 mb-4 italic">{aiAnalysis.executiveSummary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Key Strengths
              </h3>
              <ul className="space-y-1">
                {aiAnalysis.keyStrengths?.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-1">
                {aiAnalysis.areasForImprovement?.map((area, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {aiAnalysis.pricingInsights && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pricing Insights
              </h3>
              <p className="text-sm text-gray-600">{aiAnalysis.pricingInsights}</p>
            </div>
          )}
          
          {aiAnalysis.competitiveAnalysis && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
              <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Competitive Analysis
              </h3>
              <p className="text-sm text-gray-600">{aiAnalysis.competitiveAnalysis}</p>
            </div>
          )}
        </div>
      )}

      {/* Key Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold text-green-700">{insights.successRate}%</span>
            </div>
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-xs text-gray-500 mt-1">{insights.totalWon} won / {insights.totalLost} lost</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">
                MVR {Number(insights.avgWonAmount).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Avg. Winning Bid</p>
            <p className="text-xs text-gray-500 mt-1">Lost avg: MVR {Number(insights.avgLostAmount).toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-purple-600" />
              <span className="text-lg font-bold text-purple-700 truncate max-w-[120px]">{insights.bestCategory}</span>
            </div>
            <p className="text-sm text-gray-600">Best Category</p>
            <p className="text-xs text-gray-500 mt-1">{insights.bestCategoryRate}% win rate</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">{insights.openBidsCount}</span>
            </div>
            <p className="text-sm text-gray-600">Open Bids</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting decision</p>
          </div>
        </div>
      )}

      {/* Gemini AI Detailed Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Gemini AI Bid Recommendations
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">AI-Powered</span>
          </h2>
          <div className="space-y-4">
            {aiRecommendations.map((rec) => (
              <div 
                key={rec.bidId}
                className={`border-2 rounded-xl p-5 ${
                  rec.recommendation === 'BID' 
                    ? 'bg-green-50 border-green-300' 
                    : rec.recommendation === 'SKIP'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{rec.bidTitle}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full font-bold ${
                        rec.recommendation === 'BID'
                          ? 'bg-green-600 text-white'
                          : rec.recommendation === 'SKIP'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {rec.recommendation}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{rec.detailedReasoning}</p>
                  </div>
                  <div className="ml-4 text-center">
                    <div className={`text-3xl font-bold ${
                      rec.confidence >= 70 ? 'text-green-600' :
                      rec.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {rec.confidence}%
                    </div>
                    <p className="text-xs text-gray-500">AI Confidence</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Key Factors</h4>
                    <ul className="space-y-1">
                      {rec.keyFactors?.map((factor, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Pricing Assessment</h4>
                    <p className="text-xs text-gray-600">{rec.pricingAssessment}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm">Action Items</h4>
                    <ul className="space-y-1">
                      {rec.actionItems?.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <Target className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {(rec.risks?.length > 0 || rec.opportunities?.length > 0) && (
                  <div className="mt-3 flex gap-4 text-sm">
                    {rec.risks?.length > 0 && (
                      <span className="text-red-600">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        {rec.risks.length} risk(s) identified
                      </span>
                    )}
                    {rec.opportunities?.length > 0 && (
                      <span className="text-green-600">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {rec.opportunities.length} opportunity(s)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy AI Recommendations for Open Bids */}
      {suggestions.length > 0 && (
        <div className="mb-8 opacity-75">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Local Analysis (Backup)
          </h2>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.bidId}
                className={`border rounded-xl p-4 ${
                  suggestion.recommendation === 'RECOMMENDED' 
                    ? 'bg-green-50 border-green-200' 
                    : suggestion.recommendation === 'NOT RECOMMENDED'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{suggestion.bidTitle}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        suggestion.recommendation === 'RECOMMENDED'
                          ? 'bg-green-100 text-green-700'
                          : suggestion.recommendation === 'NOT RECOMMENDED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {suggestion.recommendation}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Category: {suggestion.category} | 
                      Amount: MVR {suggestion.bidAmount?.toLocaleString() || 'N/A'}
                      {suggestion.daysRemaining !== null && (
                        <span className={suggestion.daysRemaining < 3 ? 'text-red-600 font-medium' : ''}>
                          {' | '}Deadline: {suggestion.daysRemaining} days
                        </span>
                      )}
                    </p>
                    <div className="space-y-1">
                      {suggestion.reasoning.map((reason, idx) => (
                        <p key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          {suggestion.recommendation === 'RECOMMENDED' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : suggestion.recommendation === 'NOT RECOMMENDED' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        suggestion.confidence >= 70 ? 'text-green-600' :
                        suggestion.confidence >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {suggestion.confidence}%
                      </div>
                      <p className="text-xs text-gray-500">Confidence</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Recommendations */}
      {priceRecommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            AI Price Optimization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priceRecommendations.map((rec) => (
              <div key={rec.bidId} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">{rec.bidTitle}</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Price</p>
                    <p className="text-lg font-semibold text-gray-700">
                      MVR {rec.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Suggested Price</p>
                    <p className={`text-lg font-semibold ${
                      rec.adjustment < 0 ? 'text-green-600' : rec.adjustment > 0 ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      MVR {rec.suggestedPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                {rec.adjustment !== 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm font-medium ${
                      rec.adjustment < 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {rec.adjustment > 0 ? '+' : ''}{rec.adjustment}% adjustment
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {rec.reasoning.map((reason, idx) => (
                    <p key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      {reason}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Performance */}
      {insights && Object.keys(insights.categoryStats).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Performance by Category
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded-xl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total Bids</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Won</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Lost</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Win Rate</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(insights.categoryStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([category, stats]) => {
                    const winRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : 0;
                    return (
                      <tr key={category} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{category}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{stats.total}</td>
                        <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">{stats.won}</td>
                        <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">{stats.lost}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            winRate >= 70 ? 'bg-green-100 text-green-700' :
                            winRate >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {winRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          MVR {stats.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-800">About Smart Bids AI</h3>
            <p className="text-sm text-gray-600 mt-1">
              This AI assistant analyzes your historical bidding data to provide recommendations. 
              It considers win/loss ratios, category performance, pricing patterns, and staff availability. 
              Use these insights to make more informed bidding decisions and improve your win rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBids;
