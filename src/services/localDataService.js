// Local JSON Data Service
// This service loads data from local JSON files instead of Firebase
// For future Firebase migration, replace imports in components

import projectsData from '../data/Projects 2026.json';

// Simulate async delay like Firebase
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Tenders from Projects 2026.json
export const getTenders = async () => {
  await delay(300);
  return projectsData.tenders.map(tender => ({
    id: tender.id,
    tenderId: tender.id,
    title: tender.title,
    authority: tender.authority,
    category: tender.category,
    publishedDate: tender.published_date,
    submissionDeadline: tender.submission_deadline,
    estimatedBudget: tender.estimated_budget,
    status: tender.status,
    bidAmount: tender.bid_amount,
    result: tender.result,
    wonDate: tender.won_date,
    documents: [],
    createdAt: tender.published_date,
    updatedAt: tender.published_date
  }));
};

// Get single tender
export const getTenderById = async (id) => {
  const tenders = await getTenders();
  return tenders.find(t => t.id === id) || null;
};

// Add tender (stored in memory for now)
let localTenders = [];
export const addTender = async (tenderData) => {
  await delay(200);
  const newTender = {
    id: `TND-LOCAL-${Date.now()}`,
    ...tenderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localTenders.push(newTender);
  return newTender;
};

// Update tender
export const updateTender = async (id, tenderData) => {
  await delay(200);
  const index = localTenders.findIndex(t => t.id === id);
  if (index !== -1) {
    localTenders[index] = { ...localTenders[index], ...tenderData, updatedAt: new Date().toISOString() };
    return localTenders[index];
  }
  return null;
};

// Delete tender
export const deleteTender = async (id) => {
  await delay(200);
  localTenders = localTenders.filter(t => t.id !== id);
  return true;
};

// Get all local tenders (JSON + added)
export const getAllTenders = async () => {
  const jsonTenders = await getTenders();
  return [...jsonTenders, ...localTenders];
};

// Bids - derived from tender data + local storage
let localBids = [];

export const getBids = async () => {
  await delay(300);
  const tenders = await getTenders();
  
  // Generate bids from tenders that have bid amounts
  const generatedBids = tenders
    .filter(t => t.bidAmount)
    .map(tender => ({
      id: `BID-${tender.id}`,
      tenderId: tender.id,
      bidAmount: tender.bidAmount,
      costEstimate: tender.bidAmount * 0.75, // Estimated 75% cost
      profitMargin: tender.bidAmount * 0.25,  // 25% profit margin
      status: tender.status === 'Submitted' ? 'Submitted' : 
              tender.status === 'Won' ? 'Submitted' : 'Draft',
      result: tender.result === 'Pending' ? 'Pending' : 
              tender.status === 'Won' ? 'Won' : 'Lost',
      documents: [],
      notes: '',
      createdAt: tender.publishedDate,
      updatedAt: tender.publishedDate
    }));
  
  return [...generatedBids, ...localBids];
};

export const addBid = async (bidData) => {
  await delay(200);
  const newBid = {
    id: `BID-LOCAL-${Date.now()}`,
    ...bidData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localBids.push(newBid);
  return newBid;
};

export const updateBid = async (id, bidData) => {
  await delay(200);
  const index = localBids.findIndex(b => b.id === id);
  if (index !== -1) {
    localBids[index] = { ...localBids[index], ...bidData, updatedAt: new Date().toISOString() };
    return localBids[index];
  }
  return null;
};

export const deleteBid = async (id) => {
  await delay(200);
  localBids = localBids.filter(b => b.id !== id);
  return true;
};

// Purchases (Procurement)
let localPurchases = [
  {
    id: 'PUR-001',
    tenderId: 'TND-2026-002',
    itemName: 'Office Desks - Executive',
    quantity: 10,
    supplierId: 'SUP-001',
    costPerUnit: 1500,
    totalCost: 15000,
    purchaseDate: '2026-03-12',
    status: 'Received',
    notes: 'High quality mahogany desks',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-12'
  },
  {
    id: 'PUR-002',
    tenderId: 'TND-2026-002',
    itemName: 'Ergonomic Office Chairs',
    quantity: 20,
    supplierId: 'SUP-001',
    costPerUnit: 850,
    totalCost: 17000,
    purchaseDate: '2026-03-14',
    status: 'Ordered',
    notes: 'Awaiting delivery',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-14'
  },
  {
    id: 'PUR-003',
    tenderId: 'TND-2026-002',
    itemName: 'Filing Cabinets',
    quantity: 15,
    supplierId: 'SUP-002',
    costPerUnit: 600,
    totalCost: 9000,
    purchaseDate: '2026-03-15',
    status: 'Pending',
    notes: 'To be ordered after chair delivery',
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15'
  }
];

export const getPurchases = async () => {
  await delay(300);
  return localPurchases;
};

export const addPurchase = async (purchaseData) => {
  await delay(200);
  const newPurchase = {
    id: `PUR-LOCAL-${Date.now()}`,
    ...purchaseData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localPurchases.push(newPurchase);
  return newPurchase;
};

export const updatePurchase = async (id, purchaseData) => {
  await delay(200);
  const index = localPurchases.findIndex(p => p.id === id);
  if (index !== -1) {
    localPurchases[index] = { ...localPurchases[index], ...purchaseData, updatedAt: new Date().toISOString() };
    return localPurchases[index];
  }
  return null;
};

export const deletePurchase = async (id) => {
  await delay(200);
  localPurchases = localPurchases.filter(p => p.id !== id);
  return true;
};

// Suppliers
let localSuppliers = [
  {
    id: 'SUP-001',
    name: 'Maldives Office Furniture Co.',
    contactPerson: 'Ahmed Naseem',
    email: 'info@mofurniture.mv',
    phone: '+960 777-1234',
    address: 'Majeedhee Magu, Male',
    itemsSupplied: 'Office Furniture, Desks, Chairs',
    notes: 'Reliable supplier, 5 year warranty',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  },
  {
    id: 'SUP-002',
    name: 'Tech Solutions Maldives',
    contactPerson: 'Fatima Ali',
    email: 'sales@techsol.mv',
    phone: '+960 999-5678',
    address: 'Hulhumale, Phase 2',
    itemsSupplied: 'IT Equipment, Computers, Printers',
    notes: 'Authorized dealer for Dell and HP',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  },
  {
    id: 'SUP-003',
    name: 'Construction Supplies Ltd',
    contactPerson: 'Ibrahim Hassan',
    email: 'orders@csl.mv',
    phone: '+960 666-9012',
    address: 'Industrial Zone, Thilafushi',
    itemsSupplied: 'Construction Materials, Cement, Steel',
    notes: 'Bulk orders only',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01'
  }
];

export const getSuppliers = async () => {
  await delay(300);
  return localSuppliers;
};

export const addSupplier = async (supplierData) => {
  await delay(200);
  const newSupplier = {
    id: `SUP-LOCAL-${Date.now()}`,
    ...supplierData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localSuppliers.push(newSupplier);
  return newSupplier;
};

export const updateSupplier = async (id, supplierData) => {
  await delay(200);
  const index = localSuppliers.findIndex(s => s.id === id);
  if (index !== -1) {
    localSuppliers[index] = { ...localSuppliers[index], ...supplierData, updatedAt: new Date().toISOString() };
    return localSuppliers[index];
  }
  return null;
};

export const deleteSupplier = async (id) => {
  await delay(200);
  localSuppliers = localSuppliers.filter(s => s.id !== id);
  return true;
};

// Deliveries
let localDeliveries = [
  {
    id: 'DEL-001',
    tenderId: 'TND-2026-002',
    itemName: 'Office Desks - Executive',
    quantity: 10,
    status: 'Delivered',
    expectedDate: '2026-03-20',
    deliveryDate: '2026-03-19',
    completed: true,
    notes: 'Delivered ahead of schedule',
    createdAt: '2026-03-12',
    updatedAt: '2026-03-19'
  },
  {
    id: 'DEL-002',
    tenderId: 'TND-2026-002',
    itemName: 'Ergonomic Office Chairs',
    quantity: 20,
    status: 'In Progress',
    expectedDate: '2026-03-25',
    deliveryDate: null,
    completed: false,
    notes: 'In transit from Singapore',
    createdAt: '2026-03-14',
    updatedAt: '2026-03-14'
  },
  {
    id: 'DEL-003',
    tenderId: 'TND-2026-002',
    itemName: 'Filing Cabinets',
    quantity: 15,
    status: 'Pending',
    expectedDate: '2026-04-01',
    deliveryDate: null,
    completed: false,
    notes: 'Awaiting confirmation',
    createdAt: '2026-03-15',
    updatedAt: '2026-03-15'
  }
];

export const getDeliveries = async () => {
  await delay(300);
  return localDeliveries;
};

export const addDelivery = async (deliveryData) => {
  await delay(200);
  const newDelivery = {
    id: `DEL-LOCAL-${Date.now()}`,
    ...deliveryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  localDeliveries.push(newDelivery);
  return newDelivery;
};

export const updateDelivery = async (id, deliveryData) => {
  await delay(200);
  const index = localDeliveries.findIndex(d => d.id === id);
  if (index !== -1) {
    localDeliveries[index] = { ...localDeliveries[index], ...deliveryData, updatedAt: new Date().toISOString() };
    return localDeliveries[index];
  }
  return null;
};

export const deleteDelivery = async (id) => {
  await delay(200);
  localDeliveries = localDeliveries.filter(d => d.id !== id);
  return true;
};

// Documents
let localDocuments = [];

export const getDocuments = async () => {
  await delay(300);
  return localDocuments;
};

export const addDocument = async (documentData) => {
  await delay(200);
  const newDocument = {
    id: `DOC-LOCAL-${Date.now()}`,
    ...documentData,
    createdAt: new Date().toISOString()
  };
  localDocuments.push(newDocument);
  return newDocument;
};

export const deleteDocument = async (id) => {
  await delay(200);
  localDocuments = localDocuments.filter(d => d.id !== id);
  return true;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  await delay(400);
  
  const tenders = await getAllTenders();
  const bids = await getBids();
  const purchases = await getPurchases();
  const deliveries = await getDeliveries();
  
  return {
    activeTenders: tenders.filter(t => t.status === 'Open' || t.status === 'Bidding').length,
    submittedBids: bids.filter(b => b.status === 'Submitted').length,
    wonTenders: tenders.filter(t => t.status === 'Won').length,
    pendingDeliveries: deliveries.filter(d => d.status === 'Pending' || d.status === 'In Progress').length,
    completedProjects: deliveries.filter(d => d.completed).length,
    totalBidValue: bids.reduce((sum, b) => sum + (b.bidAmount || 0), 0),
    totalProfit: bids.reduce((sum, b) => sum + (b.profitMargin || 0), 0),
    totalPurchaseCost: purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0),
    tenders,
    bids,
    purchases,
    deliveries
  };
};

// Projects summary from Projects 2026.json
export const getProjectsSummary = async () => {
  await delay(300);
  return {
    summary: projectsData.projects_summary,
    quarterlyTargets: projectsData.quarterly_targets
  };
};
