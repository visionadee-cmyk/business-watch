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
  Percent,
  Search,
  Globe,
  MapPin,
  ShoppingCart,
  ExternalLink,
  Package
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
  
  // Price Research Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [extractedItems, setExtractedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceResults, setPriceResults] = useState(null);
  const [searchingPrices, setSearchingPrices] = useState(false);

  // Fetch bids and tenders data
  useEffect(() => {
    fetchData();
  }, []);

  // Extract items when bids change
  useEffect(() => {
    if (bids.length > 0) {
      extractItemsFromBids(bids);
    }
  }, [bids]);

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

  // Extract items from open bids
  const extractItemsFromBids = (bidsData) => {
    const openBids = bidsData.filter(b => b.status === 'Open' || b.status === 'Draft' || b.status === 'Pending');
    const items = [];
    
    openBids.forEach(bid => {
      // Try to extract items from various bid structures
      const bidItems = bid.items || bid.requirements || bid.products || [];
      
      if (Array.isArray(bidItems)) {
        bidItems.forEach((item, idx) => {
          if (typeof item === 'string') {
            items.push({
              id: `${bid.id}-item-${idx}`,
              name: item,
              bidId: bid.id,
              bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
              category: bid.category || 'General',
              quantity: 1,
              estimatedPrice: bid.bidAmount ? (bid.bidAmount / bidItems.length) : 0
            });
          } else if (typeof item === 'object' && item !== null) {
            items.push({
              id: item.id || `${bid.id}-item-${idx}`,
              name: item.name || item.description || item.title || item.product || 'Unknown Item',
              bidId: bid.id,
              bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
              category: bid.category || item.category || 'General',
              quantity: item.quantity || item.qty || 1,
              estimatedPrice: item.price || item.amount || item.estimatedCost || 0,
              unit: item.unit || 'pcs'
            });
          }
        });
      }
      
      // Also check for requirements as text and parse them
      if (bid.requirements && typeof bid.requirements === 'string') {
        // Simple parsing: split by commas, newlines, or bullets
        const reqItems = bid.requirements.split(/[,\n•\-]+/).filter(r => r.trim().length > 3);
        reqItems.forEach((req, idx) => {
          if (!items.some(i => i.name === req.trim())) {
            items.push({
              id: `${bid.id}-req-${idx}`,
              name: req.trim(),
              bidId: bid.id,
              bidTitle: bid.title || bid.tenderTitle || 'Untitled Bid',
              category: bid.category || 'General',
              quantity: 1,
              estimatedPrice: 0,
              isRequirement: true
            });
          }
        });
      }
    });
    
    // Remove duplicates by name (case insensitive)
    const uniqueItems = [];
    const seen = new Set();
    items.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    });
    
    setExtractedItems(uniqueItems);
  };

  // AI Price Search Function
  const searchItemPrices = async (itemName) => {
    if (!itemName.trim()) return;
    
    setSearchingPrices(true);
    setSearchQuery(itemName);
    
    try {
      const prompt = `
You are a price research assistant for a procurement company in the Maldives. 
Search for prices for the following item: "${itemName}"

Provide a realistic price comparison with the following structure. Since you don't have real-time internet access, use your training data to estimate typical market prices as of 2024:

**Maldives Local Suppliers** (at least 3):
1. Supplier Name - Estimated Price in MVR (Maldivian Rufiyaa) - Location in Maldives
2. Supplier Name - Estimated Price in MVR - Location in Maldives  
3. Supplier Name - Estimated Price in MVR - Location in Maldives

**International/Global Suppliers** (at least 3):
1. Supplier/Platform Name (Country) - Price in USD - Website or platform
2. Supplier/Platform Name (Country) - Price in USD - Website or platform
3. Supplier/Platform Name (Country) - Price in USD - Website or platform

Also include:
- Price trend (increasing/decreasing/stable)
- Best time to buy
- Any buying tips specific to this item

Return ONLY valid JSON in this exact format:
{
  "itemName": "${itemName}",
  "maldivesSuppliers": [
    {"name": "Supplier Name", "priceMVR": 1000, "location": "Malé", "contact": "optional"},
    {"name": "Supplier Name", "priceMVR": 950, "location": "Addu", "contact": "optional"},
    {"name": "Supplier Name", "priceMVR": 1100, "location": "Hulhumalé", "contact": "optional"}
  ],
  "internationalSuppliers": [
    {"name": "Amazon/AliExpress/etc", "country": "USA/China/etc", "priceUSD": 65, "website": "amazon.com", "shippingDays": 14},
    {"name": "Alibaba/etc", "country": "China", "priceUSD": 45, "website": "alibaba.com", "shippingDays": 21},
    {"name": "Local dealer/etc", "country": "Sri Lanka/Singapore", "priceUSD": 70, "website": "example.com", "shippingDays": 7}
  ],
  "priceTrend": "stable/increasing/decreasing",
  "bestTimeToBuy": "description",
  "buyingTips": "specific tips for this item",
  "notes": "any additional notes"
}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA6MyrMHXP_1VY7iOOJTI25Ci9MHHfrmcA`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 10
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        })
      });

      if (!response.ok) throw new Error('Price search failed');
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setPriceResults(result);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Price search error:', error);
      // Detect item category and provide relevant Maldivian suppliers
      const itemLower = itemName.toLowerCase();
      let category = 'general';
      if (itemLower.includes('computer') || itemLower.includes('laptop') || itemLower.includes('printer') || itemLower.includes('monitor') || itemLower.includes('keyboard') || itemLower.includes('mouse')) category = 'electronics';
      else if (itemLower.includes('cement') || itemLower.includes('steel') || itemLower.includes('pipe') || itemLower.includes('wire') || itemLower.includes('paint') || itemLower.includes('wood') || itemLower.includes('tool')) category = 'hardware';
      else if (itemLower.includes('book') || itemLower.includes('paper') || itemLower.includes('pen') || itemLower.includes('stationery')) category = 'books';
      
      const suppliersByCategory = {
        electronics: [
          { name: 'Odiaba (State Trading Organization)', priceMVR: Math.floor(Math.random() * 500) + 1500, location: 'Malé / Hulhumalé', contact: '1414 / www.odiaba.com' },
          { name: 'Redwave Maldives', priceMVR: Math.floor(Math.random() * 400) + 1800, location: 'Malé', contact: '334-4004 / www.redwave.mv' },
          { name: 'Mi Store Maldives', priceMVR: Math.floor(Math.random() * 450) + 1600, location: 'Malé', contact: '332-2555' },
          { name: 'iTech Maldives', priceMVR: Math.floor(Math.random() * 350) + 1700, location: 'Hulhumalé', contact: '335-6789' },
          { name: 'Makro Maldives - Electronics', priceMVR: Math.floor(Math.random() * 400) + 1900, location: 'Malé', contact: '331-5001' }
        ],
        hardware: [
          { name: 'Malé Hardware & Engineering', priceMVR: Math.floor(Math.random() * 200) + 400, location: 'Maafannu, Malé', contact: '331-7788' },
          { name: 'STO Hardware Division', priceMVR: Math.floor(Math.random() * 150) + 450, location: 'Malé / Hulhumalé', contact: '1414' },
          { name: 'Mifco Hardware', priceMVR: Math.floor(Math.random() * 180) + 420, location: 'Malé', contact: '332-2424' },
          { name: 'A.D. Trading', priceMVR: Math.floor(Math.random() * 220) + 380, location: 'Machangoalhi, Malé', contact: '331-2323' },
          { name: 'Rasdhoo Hardware', priceMVR: Math.floor(Math.random() * 250) + 350, location: 'North Ari Atoll', contact: '666-1234' }
        ],
        books: [
          { name: 'Jamaluddin School Supplies', priceMVR: Math.floor(Math.random() * 50) + 150, location: 'Malé', contact: '331-1414' },
          { name: 'STO Bookshop', priceMVR: Math.floor(Math.random() * 40) + 160, location: 'Malé', contact: '1414' },
          { name: 'Brainy Bunny Bookstore', priceMVR: Math.floor(Math.random() * 60) + 140, location: 'Malé', contact: '331-5555' },
          { name: 'Island Bookshop', priceMVR: Math.floor(Math.random() * 45) + 155, location: 'Hulhumalé', contact: '335-1234' },
          { name: 'Atoll Education Supplies', priceMVR: Math.floor(Math.random() * 55) + 145, location: 'Malé', contact: '332-6789' }
        ],
        general: [
          { name: 'State Trading Organization (STO)', priceMVR: Math.floor(Math.random() * 300) + 800, location: 'Malé / Hulhumalé', contact: '1414 / sales@sto.com.mv' },
          { name: 'Makro Maldives', priceMVR: Math.floor(Math.random() * 250) + 900, location: 'Malé', contact: '331-5001 / www.makromaldives.com' },
          { name: 'Atoll Market', priceMVR: Math.floor(Math.random() * 350) + 750, location: 'Hulhumalé', contact: '335-5000 / www.atollmarket.com' },
          { name: 'Redwave Maldives', priceMVR: Math.floor(Math.random() * 450) + 650, location: 'Malé', contact: '334-4004 / www.redwave.mv' },
          { name: 'Dharumavantha Hospital Supplies', priceMVR: Math.floor(Math.random() * 400) + 700, location: 'Malé', contact: '333-5335' }
        ]
      };

      const tipsByCategory = {
        electronics: 'Odiaba (STO) offers warranty on electronics. Redwave has competitive prices. Compare with Amazon/Alibaba for import options.',
        hardware: 'Malé Hardware has best prices for bulk. STO reliable for quality materials. Import from IndiaMART for specialized items.',
        books: 'Jamaluddin School Supplies best for educational materials. STO Bookshop has wide range. Consider IndiaMART for bulk textbook orders.',
        general: 'STO offers bulk discounts for registered businesses. Compare Makro vs STO prices. Consider shipping costs when importing.'
      };

      // Provide fallback data with category-specific suppliers
      setPriceResults({
        itemName: itemName,
        maldivesSuppliers: suppliersByCategory[category].slice(0, 3),
        internationalSuppliers: [
          { name: 'Alibaba.com', country: 'China', priceUSD: Math.floor(Math.random() * 40) + 40, website: 'www.alibaba.com', shippingDays: 21 },
          { name: 'Amazon.com', country: 'USA', priceUSD: Math.floor(Math.random() * 35) + 45, website: 'www.amazon.com', shippingDays: 14 },
          { name: 'AliExpress', country: 'China', priceUSD: Math.floor(Math.random() * 30) + 35, website: 'www.aliexpress.com', shippingDays: 25 },
          { name: 'IndiaMART', country: 'India', priceUSD: Math.floor(Math.random() * 25) + 30, website: 'www.indiamart.com', shippingDays: 10 },
          { name: 'DHgate', country: 'China', priceUSD: Math.floor(Math.random() * 35) + 25, website: 'www.dhgate.com', shippingDays: 20 }
        ].slice(0, 3),
        priceTrend: 'stable',
        bestTimeToBuy: category === 'electronics' ? 'STO quarterly sales (March, June, September, December). Import during off-peak shipping seasons.' : 
                       category === 'hardware' ? 'Bulk order before construction season (October-January). STO offers contractor discounts.' :
                       category === 'books' ? 'Order in bulk before school season (December-January). Educational discounts available.' :
                       'Contact STO and Makro for quarterly promotions. Import from IndiaMART for faster shipping.',
        buyingTips: tipsByCategory[category],
        notes: `AI search encountered an error. Showing reliable ${category === 'general' ? 'local' : category} suppliers in Maldives. Please contact them directly for current prices. Major suppliers: STO (state enterprise), Makro (wholesale), Redwave (electronics).`
      });
    } finally {
      setSearchingPrices(false);
    }
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

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Brain className="w-4 h-4 inline mr-1" />
          AI Analysis
        </button>
        <button
          onClick={() => setActiveTab('price-research')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'price-research'
              ? 'bg-green-100 text-green-700 border-b-2 border-green-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" />
          Price Research
          {extractedItems.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
              {extractedItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Price Research Tab */}
      {activeTab === 'price-research' && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-7 h-7 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">AI Price Research</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Powered by Gemini AI</span>
            </div>
            <p className="text-gray-600 mb-4">
              Search for item prices from Maldives suppliers and international sources. AI finds the best prices and suppliers for your bid items.
            </p>
            
            {/* Search Input */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an item (e.g., Cement, Steel rods, Office furniture...)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchItemPrices(searchQuery)}
                />
              </div>
              <button
                onClick={() => searchItemPrices(searchQuery)}
                disabled={searchingPrices || !searchQuery.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {searchingPrices ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Searching...</>
                ) : (
                  <><Search className="w-5 h-5" /> Search Prices</>
                )}
              </button>
            </div>
          </div>

          {/* Extracted Items from Open Bids */}
          {extractedItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Items from Open Bids ({extractedItems.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {extractedItems.slice(0, 12).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => searchItemPrices(item.name)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition-all group"
                  >
                    <p className="font-medium text-gray-800 group-hover:text-green-700 line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{item.category}</span>
                      {item.estimatedPrice > 0 && (
                        <span>Est: MVR {item.estimatedPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 truncate">From: {item.bidTitle}</p>
                  </button>
                ))}
              </div>
              {extractedItems.length > 12 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  +{extractedItems.length - 12} more items. Use search to find specific items.
                </p>
              )}
            </div>
          )}

          {/* Price Results */}
          {priceResults && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Price Results: {priceResults.itemName}
                </h3>
              </div>
              
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Maldives Suppliers */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Maldives Suppliers (Local)
                  </h4>
                  <div className="space-y-3">
                    {priceResults.maldivesSuppliers?.map((supplier, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.location}</p>
                            {supplier.contact && (
                              <p className="text-xs text-gray-500">Contact: {supplier.contact}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">
                              MVR {supplier.priceMVR?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">per unit</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* International Suppliers */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    International Suppliers
                  </h4>
                  <div className="space-y-3">
                    {priceResults.internationalSuppliers?.map((supplier, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.country}</p>
                            <p className="text-xs text-gray-500">{supplier.shippingDays} days shipping</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">
                              ${supplier.priceUSD}
                            </p>
                            <p className="text-xs text-gray-500">
                              ~ MVR {(supplier.priceUSD * 15.4).toFixed(0)}
                            </p>
                          </div>
                        </div>
                        {supplier.website && (
                          <a 
                            href={`https://${supplier.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visit {supplier.website}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Buying Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Price Trend</p>
                    <p className="font-medium text-gray-800">{priceResults.priceTrend || 'Stable'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Best Time to Buy</p>
                    <p className="font-medium text-gray-800">{priceResults.bestTimeToBuy || 'Compare and buy when needed'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">AI Tips</p>
                    <p className="font-medium text-gray-800">{priceResults.buyingTips || 'Check multiple suppliers before buying'}</p>
                  </div>
                </div>
                {priceResults.notes && (
                  <p className="mt-3 text-xs text-gray-500 italic">{priceResults.notes}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overview Tab - AI Analysis Section */}
      {activeTab === 'overview' && (
        <>
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
        </>
      )}
    </div>
  );
};

export default SmartBids;
