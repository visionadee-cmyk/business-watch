import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, ShoppingCart, Package, Save, FileText, Trash2, Plus } from 'lucide-react';
import { useData } from '../hooks/useData';

export default function CostCalculator() {
  const { bids, tenders } = useData();
  const [selectedItems, setSelectedItems] = useState([]);
  const [markup, setMarkup] = useState(15);
  const [exchangeRate, setExchangeRate] = useState(15.42);
  const [savedCalculations, setSavedCalculations] = useState([]);

  // Create items from tender categories
  const items = useMemo(() => {
    const categories = [...new Set(tenders.map(t => t.category).filter(Boolean))];
    if (categories.length === 0) return [];
    return categories.map((category, index) => ({
      id: index + 1,
      name: category,
      specs: `Tender category: ${category}`,
      usPrice: Math.floor(Math.random() * 500) + 50,
      indiaPrice: Math.floor(Math.random() * 400) + 40,
      unit: 'each',
      category
    }));
  }, [tenders]);

  const categories = [...new Set(items.map(i => i.category))];

  const addItem = (item, quantity = 1, source = 'us') => {
    const price = source === 'us' ? item.usPrice : item.indiaPrice;
    const newItem = {
      ...item,
      quantity,
      source,
      unitPrice: price,
      totalPrice: price * quantity
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const removeItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    updated[index].totalPrice = updated[index].unitPrice * quantity;
    setSelectedItems(updated);
  };

  const calculations = useMemo(() => {
    const subtotalUSD = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const subtotalMVR = subtotalUSD * exchangeRate;
    const markupAmount = subtotalMVR * (markup / 100);
    const totalMVR = subtotalMVR + markupAmount;
    
    return { subtotalUSD, subtotalMVR, markupAmount, totalMVR };
  }, [selectedItems, exchangeRate, markup]);

  const saveCalculation = () => {
    const calculation = {
      id: Date.now(),
      name: `Calculation ${savedCalculations.length + 1}`,
      items: [...selectedItems],
      subtotalUSD: calculations.subtotalUSD,
      subtotalMVR: calculations.subtotalMVR,
      markup,
      totalMVR: calculations.totalMVR,
      date: new Date().toLocaleDateString()
    };
    setSavedCalculations([...savedCalculations, calculation]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Calculator</h1>
          <p className="text-gray-500 mt-1">Calculate tender costs from bid data</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setSelectedItems([])}
            className="btn btn-secondary"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button 
            onClick={saveCalculation}
            disabled={selectedItems.length === 0}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4" />
            Save Calculation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Select Items
            </h3>
            
            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.specs}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addItem(item, 1, 'us')}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                    >
                      US: ${item.usPrice.toFixed(2)}
                    </button>
                    <button
                      onClick={() => addItem(item, 1, 'india')}
                      className="flex-1 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm hover:bg-orange-100"
                    >
                      India: ${item.indiaPrice.toFixed(2)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items Table */}
          {selectedItems.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Selected Items ({selectedItems.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-center">Source</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.specs.substring(0, 30)}...</div>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border rounded text-center"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.source === 'us' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.source === 'us' ? 'US' : 'India'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button 
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Calculator Sidebar */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Exchange Rate (USD to MVR)</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Markup %</label>
                <input
                  type="number"
                  value={markup}
                  onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-lg font-semibold mb-4">Cost Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal (USD):</span>
                <span className="font-medium">${calculations.subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal (MVR):</span>
                <span className="font-medium">MVR {calculations.subtotalMVR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Markup ({markup}%):</span>
                <span className="font-medium text-amber-600">
                  +MVR {calculations.markupAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total (MVR):</span>
                <span className="text-xl font-bold text-blue-700">
                  MVR {calculations.totalMVR.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Calculations */}
          {savedCalculations.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Saved Calculations
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedCalculations.map((calc) => (
                  <div key={calc.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{calc.name}</p>
                        <p className="text-xs text-gray-500">{calc.date}</p>
                      </div>
                      <p className="font-semibold text-blue-700">
                        MVR {calc.totalMVR.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {calc.items.length} items • {calc.markup}% markup
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
