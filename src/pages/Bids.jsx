import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, FileText, CheckCircle, XCircle, Clock, DollarSign, ExternalLink, Calendar, Building2, Mail, Phone, Globe, Hash, Trash, LayoutGrid, Table2, Timer, ChevronRight, Upload, Printer, Download, FileStack } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp,
  writeBatch,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import BidQuotation from '../components/BidQuotation';
import OpenBidsReport from '../components/OpenBidsReport';

const Bids = ({ initialFilter }) => {
  const [bids, setBids] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterResult, setFilterResult] = useState(initialFilter || 'All');
  const [showModal, setShowModal] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [viewingBid, setViewingBid] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showQuotation, setShowQuotation] = useState(false);
  const [quotationBid, setQuotationBid] = useState(null);
  const [showOpenBidsReport, setShowOpenBidsReport] = useState(false);
  
  // Staff list for assignment - includes default company staff
  const [staffList, setStaffList] = useState([
    { id: 'staff-001', name: 'Abdul Rasheed Ali', email: 'abdul@businesswatch.mv', role: 'staff' },
    { id: 'staff-002', name: 'Ziyad Rashad', email: 'ziyad@businesswatch.mv', role: 'staff' },
    { id: 'staff-003', name: 'Aboobakuru Gasim', email: 'aboobakuru@businesswatch.mv', role: 'staff' }
  ]);
  
  // User-defined cost types persisted in localStorage
  const [userDefinedCostTypes, setUserDefinedCostTypes] = useState(() => {
    const saved = localStorage.getItem('userDefinedCostTypes');
    return saved ? JSON.parse(saved) : [];
  });
  const [fetchingGazette, setFetchingGazette] = useState(false);
  const [fetchGazetteError, setFetchGazetteError] = useState('');
  
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const categories = ['IT', 'Medical Equipment', 'Office Supplies', 'Furniture', 'Electrical', 'Electronics', 'Safety Equipment', 'Machinery', 'Construction', 'Sports Equipment', 'Printing', 'Security/IT', 'Apparel', 'Apparel/Uniform', 'Supply', 'Awards', 'IT/Equipment', 'Construction/Furniture', 'Civil Works'];
  const statuses = ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Open', 'Closed', 'Cancelled', 'Registered'];
  const results = ['Pending', 'Won', 'Lost', 'Cancelled', 'Registered', 'Missed Registered'];

  const [formData, setFormData] = useState({
    // Tender Info
    tenderId: '',
    gazetteId: '',
    title: '',
    titleDhivehi: '',
    authority: '',
    category: '',
    
    // Requirements
    requirements: {},
    
    // Dates & Deadlines
    submissionDeadline: '',
    submissionTime: '',
    bidOpeningDate: '',
    bidOpeningTime: '',
    registrationDeadline: '',
    registrationTime: '',
    bidSubmissionDate: '',
    bidTime: '',
    clarificationDeadline: '',
    clarificationTime: '',
    preBidMeeting: '',
    
    // Contact Info
    contactEmail: '',
    contactPhones: [],
    contactName: '',
    
    // Links
    gazetteUrl: '',
    infoSheetUrl: '',
    
    // Additional Fields
    tenderNo: '',
    eligibility: '',
    portal: '',
    bidSecurity: '',
    performanceGuarantee: '',
    funding: '',
    project: '',
    lots: null,
    
    // Bid Status
    status: 'Draft',
    result: 'Pending',
    
    // Financial
    bidAmount: '',
    costEstimate: '',
    profitMargin: '',
    taxRate: 0,
    
    // Requirement Items
    items: [],
    
    // Additional Costs (Commission, Installation, Transport, etc.)
    additionalCosts: [],
    
    // Quotation Details
    deliveryDays: 35,
    quotationValidity: 60,
    vendorNumber: '514110',
    
    // Documents & Notes
    documents: [],
    notes: ''
  });

  useEffect(() => {
    fetchBids();
    fetchTenders();
    fetchStaff();
  }, []);

  const fetchBids = async () => {
    try {
      const bidsSnapshot = await getDocs(collection(db, 'bids'));
      const bidsData = bidsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBids(bidsData);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenders = async () => {
    try {
      const tendersSnapshot = await getDocs(collection(db, 'tenders'));
      const tendersData = tendersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched tenders:', tendersData);
    } catch (error) {
      console.error('Error fetching tenders:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const staffSnapshot = await getDocs(collection(db, 'staff'));
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Merge default staff with fetched staff (avoiding duplicates)
      const defaultIds = new Set(staffList.map(s => s.id));
      const newStaff = staffData.filter(s => !defaultIds.has(s.id));
      if (newStaff.length > 0) {
        setStaffList(prev => [...prev, ...newStaff]);
      }
      console.log('Fetched staff:', staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const assignStaffToBid = async (bidId, staffId) => {
    try {
      const bidRef = doc(db, 'bids', bidId);
      await updateDoc(bidRef, {
        assignedStaff: staffId,
        updatedAt: serverTimestamp()
      });
      // Update local state
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, assignedStaff: staffId } : bid
      ));
      // Show success notification
      const assignedStaffName = staffList.find(s => s.id === staffId)?.name || 'Staff';
      alert(`Successfully assigned ${assignedStaffName} to bid!`);
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff. Please try again.');
    }
  };

  // Convert tender requirements to items
  const requirementsToItems = (requirements) => {
    if (!requirements || typeof requirements !== 'object') return [];
    
    return Object.entries(requirements).map(([key, value], index) => ({
      id: Date.now() + index,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert snake_case to Title Case
      quantity: typeof value === 'number' ? value : 1,
      costPrice: 0,
      bidPrice: 0,
      profit: 0,
      taxApplicable: false,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      specification: '',
      supplier: ''
    }));
  };

  const calculateProfit = () => {
    const bid = parseFloat(formData.bidAmount) || 0;
    const cost = parseFloat(formData.costEstimate) || 0;
    const profit = bid - cost;
    setFormData(prev => ({ ...prev, profitMargin: profit.toFixed(2) }));
  };

  // Add or update supplier in database
  const addSupplierToDB = async (supplierName, itemName) => {
    if (!supplierName || supplierName.trim() === '') return;
    
    try {
      const q = query(collection(db, 'suppliers'), where('name', '==', supplierName.trim()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'suppliers'), {
          name: supplierName.trim(),
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          itemsSupplied: itemName || '',
          notes: `Auto-added from bid item`,
          createdAt: serverTimestamp()
        });
      } else {
        const supplierDoc = snapshot.docs[0];
        const existingItems = supplierDoc.data().itemsSupplied || '';
        if (!existingItems.includes(itemName)) {
          await updateDoc(doc(db, 'suppliers', supplierDoc.id), {
            itemsSupplied: existingItems ? `${existingItems}, ${itemName}` : itemName,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error adding/updating supplier:', error);
    }
  };

  // Requirement Items Management
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      costPrice: 0,
      bidPrice: 0,
      profit: 0,
      taxApplicable: false,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      specification: '',
      supplier: ''
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id, field, value) => {
    setFormData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Calculate profit and totals
          const qty = parseFloat(updatedItem.quantity) || 0;
          const cost = parseFloat(updatedItem.costPrice) || 0;
          const bid = parseFloat(updatedItem.bidPrice) || 0;
          const taxRate = parseFloat(updatedItem.taxRate) || 0;
          
          updatedItem.profit = (bid - cost) * qty;
          
          if (updatedItem.taxApplicable && taxRate > 0) {
            updatedItem.taxAmount = (bid * qty) * (taxRate / 100);
          } else {
            updatedItem.taxAmount = 0;
          }
          
          updatedItem.total = (bid * qty) + updatedItem.taxAmount;
          
          // Add/update supplier in DB if supplier field changed
          if (field === 'supplier' && value) {
            addSupplierToDB(value, updatedItem.name);
          }
          
          return updatedItem;
        }
        return item;
      });
      
      // Calculate totals
      const totals = calculateTotals(updatedItems, prev.additionalCosts);
      
      return {
        ...prev,
        items: updatedItems,
        bidAmount: totals.totalBid,
        costEstimate: totals.totalCost,
        profitMargin: totals.totalProfit
      };
    });
  };

  const removeItem = (id) => {
    setFormData(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id);
      const totals = calculateTotals(updatedItems, prev.additionalCosts);
      
      return {
        ...prev,
        items: updatedItems,
        bidAmount: totals.totalBid,
        costEstimate: totals.totalCost,
        profitMargin: totals.totalProfit
      };
    });
  };

  // Additional Costs Management
  const addAdditionalCost = (costType = '', amount = 0) => {
    const newCost = {
      id: Date.now(),
      type: costType,
      amount: amount,
      isCustom: !predefinedCostTypes.includes(costType)
    };
    setFormData(prev => {
      const updatedCosts = [...(prev.additionalCosts || []), newCost];
      const totals = calculateTotals(prev.items, updatedCosts);
      return {
        ...prev,
        additionalCosts: updatedCosts,
        bidAmount: totals.totalBid,
        costEstimate: totals.totalCost,
        profitMargin: totals.totalProfit
      };
    });
  };

  const updateAdditionalCost = (id, field, value) => {
    setFormData(prev => {
      const updatedCosts = (prev.additionalCosts || []).map(cost => {
        if (cost.id === id) {
          // If updating type and it's a new custom type, save it
          if (field === 'type' && value && !predefinedCostTypes.includes(value)) {
            saveUserDefinedCostType(value);
          }
          return { ...cost, [field]: value };
        }
        return cost;
      });
      const totals = calculateTotals(prev.items, updatedCosts);
      return {
        ...prev,
        additionalCosts: updatedCosts,
        bidAmount: totals.totalBid,
        costEstimate: totals.totalCost,
        profitMargin: totals.totalProfit
      };
    });
  };

  const removeAdditionalCost = (id) => {
    setFormData(prev => {
      const updatedCosts = (prev.additionalCosts || []).filter(cost => cost.id !== id);
      const totals = calculateTotals(prev.items, updatedCosts);
      return {
        ...prev,
        additionalCosts: updatedCosts,
        bidAmount: totals.totalBid,
        costEstimate: totals.totalCost,
        profitMargin: totals.totalProfit
      };
    });
  };

  // Calculate total additional costs
  const calculateAdditionalCostsTotal = (additionalCosts) => {
    return (additionalCosts || []).reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
  };

  // Predefined additional cost types + user-defined
  const predefinedCostTypes = [
    'Commission',
    'Installation', 
    'Boat Naal',
    'Helpers Charge',
    'Unloading Charge',
    'Loading Charge',
    'Tea / Dinner Charge',
    ...userDefinedCostTypes
  ];

  // Function to save new custom cost type
  const saveUserDefinedCostType = (costType) => {
    if (!costType || predefinedCostTypes.includes(costType)) return;
    const updated = [...userDefinedCostTypes, costType];
    setUserDefinedCostTypes(updated);
    localStorage.setItem('userDefinedCostTypes', JSON.stringify(updated));
  };

  const calculateTotals = (items, additionalCosts = []) => {
    const itemsTotal = items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const cost = parseFloat(item.costPrice) || 0;
      const bid = parseFloat(item.bidPrice) || 0;
      
      acc.totalCost += cost * qty;
      acc.totalBid += item.total || (bid * qty);
      acc.totalProfit += item.profit || ((bid - cost) * qty);
      
      return acc;
    }, { totalCost: 0, totalBid: 0, totalProfit: 0 });

    // Add additional costs to totals
    const additionalCostsTotal = calculateAdditionalCostsTotal(additionalCosts);
    
    return {
      totalCost: itemsTotal.totalCost + additionalCostsTotal,
      totalBid: itemsTotal.totalBid + additionalCostsTotal,
      totalProfit: itemsTotal.totalProfit
    };
  };

  // Fetch tender data from Gazette URL
  const fetchGazetteData = async () => {
    if (!formData.gazetteUrl) {
      setFetchGazetteError('Please enter a Gazette URL first');
      return;
    }

    setFetchingGazette(true);
    setFetchGazetteError('');

    try {
      const response = await fetch('/api/fetch-gazette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.gazetteUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gazette data');
      }

      const data = await response.json();

      // Populate form with fetched data
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        titleDhivehi: data.titleDhivehi || prev.titleDhivehi,
        authority: data.authority || prev.authority,
        category: data.category || prev.category,
        tenderNo: data.tenderNo || prev.tenderNo,
        gazetteId: data.gazetteId || prev.gazetteId,
        submissionDeadline: data.submissionDeadline || prev.submissionDeadline,
        submissionTime: data.submissionTime || prev.submissionTime,
        bidOpeningDate: data.bidOpeningDate || prev.bidOpeningDate,
        bidOpeningTime: data.bidOpeningTime || prev.bidOpeningTime,
        registrationDeadline: data.registrationDeadline || prev.registrationDeadline,
        registrationTime: data.registrationTime || prev.registrationTime,
        clarificationDeadline: data.clarificationDeadline || prev.clarificationDeadline,
        clarificationTime: data.clarificationTime || prev.clarificationTime,
        preBidMeeting: data.preBidMeeting || prev.preBidMeeting,
        preBidMeetingTime: data.preBidMeetingTime || prev.preBidMeetingTime,
        contactEmail: data.contactEmail || prev.contactEmail,
        contactPhones: data.contactPhones || prev.contactPhones,
        contactName: data.contactName || prev.contactName,
        bidSecurity: data.bidSecurity || prev.bidSecurity,
        performanceGuarantee: data.performanceGuarantee || prev.performanceGuarantee,
        funding: data.funding || prev.funding,
        project: data.project || prev.project,
        eligibility: data.eligibility || prev.eligibility,
        requirements: data.requirements || prev.requirements,
        items: data.items ? requirementsToItems(data.requirements) : prev.items
      }));

      alert('Tender data fetched successfully!');
    } catch (error) {
      console.error('Error fetching gazette data:', error);
      setFetchGazetteError('Failed to fetch data. Please check the URL and try again.');
    } finally {
      setFetchingGazette(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bidData = {
        ...formData,
        bidAmount: parseFloat(formData.bidAmount) || 0,
        costEstimate: parseFloat(formData.costEstimate) || 0,
        profitMargin: parseFloat(formData.profitMargin) || 0,
        updatedAt: serverTimestamp()
      };

      if (editingBid) {
        await updateDoc(doc(db, 'bids', editingBid.id), bidData);
      } else {
        bidData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'bids'), bidData);
        
        // Send new bid notification
        try {
          await fetch('/api/notifications/new-bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bidData)
          });
        } catch (notifyError) {
          console.error('Failed to send bid notification:', notifyError);
        }
      }

      setShowModal(false);
      setEditingBid(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving bid:', error);
      alert('Error saving bid. Please try again.');
    }
  };

  const handleDelete = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid?')) return;
    
    try {
      await deleteDoc(doc(db, 'bids', bidId));
      fetchData();
    } catch (error) {
      console.error('Error deleting bid:', error);
      alert('Error deleting bid. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store file metadata only (no storage upload)
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { 
        name: file.name, 
        type: file.type,
        size: file.size
      }]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      // Tender Info
      tenderId: '',
      gazetteId: '',
      title: '',
      titleDhivehi: '',
      authority: '',
      category: '',
      
      // Requirements
      requirements: {},
      
      // Dates & Deadlines
      submissionDeadline: '',
      submissionTime: '',
      bidOpeningDate: '',
      bidOpeningTime: '',
      registrationDeadline: '',
      registrationTime: '',
      bidSubmissionDate: '',
      bidTime: '',
      clarificationDeadline: '',
      clarificationTime: '',
      preBidMeeting: '',
      preBidMeetingTime: '',
      
      // Contact Info
      contactEmail: '',
      contactPhones: [],
      contactName: '',
      
      // Links
      gazetteUrl: '',
      infoSheetUrl: '',
      
      // Additional Fields
      tenderNo: '',
      eligibility: '',
      portal: '',
      bidSecurity: '',
      performanceGuarantee: '',
      funding: '',
      project: '',
      lots: null,
      
      // Lot Configuration
      lotMode: 'single',
      
      // Bid Status
      status: 'Draft',
      result: 'Pending',
      
      // Financial
      bidAmount: '',
      costEstimate: '',
      profitMargin: '',
      
      // Requirement Items
      items: [],
      
      // Additional Costs
      additionalCosts: [],
      
      // Quotation Details
      deliveryDays: 35,
      quotationValidity: 60,
      vendorNumber: '514110',

      // Evaluation Criteria
      evaluationPrice: '',
      evaluationDelivery: '',
      evaluationExperience: '',
      
      // Documents & Notes
      documents: [],
      notes: ''
    });
  };

  const openEditModal = (bid) => {
    setEditingBid(bid);
    setFormData({
      tenderId: bid.tenderId || '',
      tenderTitle: bid.tenderTitle || '',
      clientName: bid.clientName || '',
      bidAmount: bid.bidAmount || '',
      costEstimate: bid.costEstimate || '',
      profitMargin: bid.profitMargin || '',
      status: bid.status || 'Draft',
      result: bid.result || 'Pending',
      submissionDate: bid.submissionDate || '',
      documents: bid.documents || [],
      notes: bid.notes || '',
      items: bid.items || []
    });
    setShowModal(true);
  };

  const handleEdit = (bid) => {
    setEditingBid(bid);
    setFormData({
      tenderId: bid.tenderId || '',
      gazetteId: bid.gazetteId || '',
      title: bid.title || '',
      titleDhivehi: bid.titleDhivehi || '',
      authority: bid.authority || '',
      category: bid.category || '',
      tenderNo: bid.tenderNo || '',
      requirements: bid.requirements || {},
      submissionDeadline: bid.submissionDeadline || '',
      submissionTime: bid.submissionTime || '',
      bidOpeningDate: bid.bidOpeningDate || '',
      bidOpeningTime: bid.bidOpeningTime || '',
      registrationDeadline: bid.registrationDeadline || '',
      registrationTime: bid.registrationTime || '',
      bidSubmissionDate: bid.bidSubmissionDate || '',
      bidTime: bid.bidTime || '',
      clarificationDeadline: bid.clarificationDeadline || '',
      clarificationTime: bid.clarificationTime || '',
      preBidMeeting: bid.preBidMeeting || '',
      preBidMeetingTime: bid.preBidMeetingTime || '',
      contactEmail: bid.contactEmail || '',
      contactPhones: bid.contactPhones || [],
      contactName: bid.contactName || '',
      gazetteUrl: bid.gazetteUrl || '',
      infoSheetUrl: bid.infoSheetUrl || '',
      portal: bid.portal || '',
      eligibility: bid.eligibility || '',
      bidSecurity: bid.bidSecurity || '',
      performanceGuarantee: bid.performanceGuarantee || '',
      funding: bid.funding || '',
      project: bid.project || '',
      lots: bid.lots || '',
      lotMode: bid.lotMode || 'single',
      status: bid.status || 'Draft',
      result: bid.result || 'Pending',
      bidAmount: bid.bidAmount || '',
      costEstimate: bid.costEstimate || '',
      profitMargin: bid.profitMargin || '',
      vendorNumber: bid.vendorNumber || '514110',
      items: bid.items || [],
      additionalCosts: bid.additionalCosts || [],
      documents: bid.documents || [],
      notes: bid.notes || '',
      deliveryDays: bid.deliveryDays || 35,
      quotationValidity: bid.quotationValidity || 60,

      // Evaluation Criteria
      evaluationPrice: bid.evaluationPrice || '',
      evaluationDelivery: bid.evaluationDelivery || '',
      evaluationExperience: bid.evaluationExperience || '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingBid(null);
    resetForm();
    setShowModal(true);
  };

  const getTenderTitle = (tenderId) => {
    const tender = tenders.find(t => t.id === tenderId);
    return tender ? tender.title : 'Unknown Tender';
  };

  const filteredBids = bids.filter(bid => {
    const tenderTitle = getTenderTitle(bid.tenderId).toLowerCase();
    const matchesSearch = tenderTitle.includes(searchTerm.toLowerCase()) || 
                         bid.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || bid.status === filterStatus;
    const matchesResult = filterResult === 'All' || bid.result === filterResult;
    return matchesSearch && matchesStatus && matchesResult;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getResultColor = (result) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-800',
      'Won': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800'
    };
    return colors[result] || 'bg-gray-100 text-gray-800';
  };

  const getAdditionalCostsTotal = (bid) => {
    const list = bid?.additionalCosts || [];
    if (!Array.isArray(list)) return 0;
    return list.reduce((sum, c) => sum + (parseFloat(c?.amount) || 0), 0);
  };

  const totalBidValue = bids.reduce((sum, bid) => sum + (bid.bidAmount || 0) + getAdditionalCostsTotal(bid), 0);
  const totalProfit = bids.reduce((sum, bid) => sum + (bid.profitMargin || 0), 0);
  const wonBids = bids.filter(b => b.result === 'Won').length;

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = parseISO(deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      const days = differenceInDays(deadlineDate, today);
      return days;
    } catch {
      return null;
    }
  };

  // Get urgency color based on days remaining
  const getUrgencyColor = (days) => {
    if (days === null) return 'bg-gray-100 text-gray-600';
    if (days < 0) return 'bg-red-100 text-red-700';
    if (days === 0) return 'bg-red-500 text-white';
    if (days <= 2) return 'bg-orange-100 text-orange-700';
    if (days <= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  // Get urgency label
  const getUrgencyLabel = (days) => {
    if (days === null) return 'No deadline';
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Today!';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Non-sticky for better mobile experience */}
      <div className="bg-gray-50 space-y-6 pb-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/illustrations/Business%20Plan-amico.svg" 
            alt="Bids" 
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                {initialFilter ? `${initialFilter} Bids` : 'Bid Management'}
              </h1>
              {initialFilter && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  initialFilter === 'Won' ? 'bg-green-100 text-green-800' : 
                  initialFilter === 'Pending' ? 'bg-purple-100 text-purple-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  Filtered
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1 text-sm hidden sm:block">
              {initialFilter 
                ? `Showing bids with result: ${initialFilter}` 
                : 'Create and manage tender bids with full details'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-none">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md transition-all text-sm ${
                viewMode === 'cards' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md transition-all text-sm ${
                viewMode === 'table' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
          
          <button onClick={openAddModal} className="btn-primary flex items-center gap-1 sm:gap-2 text-sm">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create</span>
            <span className="sm:hidden">Add</span>
          </button>
          
          <button 
            onClick={() => setShowOpenBidsReport(true)} 
            className="btn-secondary flex items-center gap-1 sm:gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Open Bids Report</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>
      </div>

      {/* Stats - Compact on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
        <div 
          className="card bg-blue-50 border-blue-200 p-2 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('All'); setFilterResult('All'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <FileText className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-700">{bids.length}</p>
            </div>
          </div>
        </div>
        <div 
          className="card bg-green-50 border-green-200 p-2 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('Open'); setFilterResult('All'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Open</p>
              <p className="text-lg sm:text-2xl font-bold text-green-700">
                {bids.filter(b => b.status === 'Open').length}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="card bg-yellow-50 border-yellow-200 p-2 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('All'); setFilterResult('Won'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <DollarSign className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Won</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-700">
                {bids.filter(b => b.result === 'Won').length}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="card bg-red-50 border-red-200 p-2 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('All'); setFilterResult('Lost'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <XCircle className="w-5 h-5 sm:w-8 sm:h-8 text-red-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Lost</p>
              <p className="text-lg sm:text-2xl font-bold text-red-700">
                {bids.filter(b => b.result === 'Lost').length}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="card bg-purple-50 border-purple-200 p-2 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('All'); setFilterResult('Pending'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-700">
                {bids.filter(b => b.result === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        <div 
          className="card bg-orange-50 border-orange-200 p-2 sm:p-4 col-span-2 sm:col-span-1 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => { setFilterStatus('Missed Registered'); setFilterResult('All'); }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Missed Reg</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-700">
                {bids.filter(b => b.result === 'Missed Registered' || b.status === 'Missed Registered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 sm:pl-10 text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-full sm:w-48 text-sm"
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-full sm:w-48 text-sm"
        >
          <option value="All">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="input w-full sm:w-48 text-sm"
          disabled={initialFilter}
          title={initialFilter ? `Filter locked to ${initialFilter}` : 'Filter by result'}
        >
          <option value="All">All Results</option>
          {results.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      </div>

      {/* Bids Display - Cards or Table */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No bids found</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBids.map((bid) => {
            const daysRemaining = getDaysRemaining(bid.submissionDeadline);
            const urgencyColor = getUrgencyColor(daysRemaining);
            const urgencyLabel = getUrgencyLabel(daysRemaining);
            
            return (
              <div
                key={bid.id}
                onClick={() => handleEdit(bid)}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {bid.category || 'Uncategorized'}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                      <Timer className="w-3 h-3" />
                      {urgencyLabel}
                    </div>
                  </div>
                  
                  {/* Staff Assignment Dropdown */}
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={bid.assignedStaff || ''}
                      onChange={(e) => assignStaffToBid(bid.id, e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Assign Staff...</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name || staff.email || staff.id}
                        </option>
                      ))}
                    </select>
                    {bid.assignedStaff && (
                      <p className="text-xs text-green-600 mt-1">
                        Assigned: {staffList.find(s => s.id === bid.assignedStaff)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {bid.title || 'Untitled Tender'}
                  </h3>
                  
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {bid.authority || 'Unknown Authority'}
                  </p>
                  
                  {bid.gazetteId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Gazette ID: {bid.gazetteId}
                      {bid.gazetteUrl && (
                        <a 
                          href={bid.gazetteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 text-blue-500 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      )}
                    </p>
                  )}
                </div>

                {/* Deadline Info */}
                <div className="px-5 py-4 bg-gray-50 space-y-3">
                  {/* Registration Deadline */}
                  {bid.registrationDeadline && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600">Registration End:</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {bid.registrationDeadline}
                        </p>
                        {bid.registrationTime && (
                          <p className="text-xs text-gray-500">{bid.registrationTime}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clarification Deadline */}
                  {bid.clarificationDeadline && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Clarification:</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {bid.clarificationDeadline}
                        </p>
                        {bid.clarificationTime && (
                          <p className="text-xs text-gray-500">{bid.clarificationTime}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Submission:</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {bid.submissionDeadline || 'N/A'}
                      </p>
                      {bid.submissionTime && (
                        <p className="text-xs text-gray-500">{bid.submissionTime}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(bid.result)}`}>
                        {bid.result}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {bid.bidAmount ? (
                        <span className="text-sm font-semibold text-gray-900">
                          MVR {bid.bidAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No bid</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/bid-compiler', { state: { selectedBid: bid } });
                    }}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-green-50 text-gray-600 hover:text-green-600"
                    title="Bid Compile"
                  >
                    <FileStack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(bid);
                    }}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bid.id);
                    }}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tender</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Cat</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Deadline</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Result</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Staff</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBids.map((bid) => {
                const daysRemaining = getDaysRemaining(bid.submissionDeadline);
                
                return (
                  <tr key={bid.id} className="hover:bg-gray-50 cursor-pointer text-sm" onClick={() => handleEdit(bid)}>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{bid.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-500">{bid.authority || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-2 py-2 hidden sm:table-cell">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                        {bid.category || '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-600 hidden md:table-cell">
                      {bid.submissionDeadline || 'N/A'}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getUrgencyColor(daysRemaining)}`}>
                        {daysRemaining !== null ? daysRemaining : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 hidden sm:table-cell">
                      <select
                        value={bid.result}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateDoc(doc(db, 'bids', bid.id), { result: e.target.value });
                          fetchData();
                        }}
                        className={`text-xs rounded-full px-2 py-0.5 border-0 cursor-pointer ${getResultColor(bid.result)}`}
                      >
                        {results.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={bid.assignedStaff || ''}
                        onChange={(e) => assignStaffToBid(bid.id, e.target.value)}
                        className="text-xs rounded-full px-2 py-0.5 border border-gray-300 cursor-pointer bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none max-w-[120px]"
                      >
                        <option value="">Assign...</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name || staff.email || staff.id}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-right font-medium text-xs">
                      {bid.bidAmount ? `${(bid.bidAmount/1000).toFixed(0)}k` : '-'}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate('/bid-compiler', { state: { selectedBid: bid } }); }}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Bid Compile"
                        >
                          <FileStack className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(bid); }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(bid.id); }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBid ? 'Edit Bid' : 'Create New Bid'}
              </h2>
              <div className="flex items-center gap-2">
                {editingBid && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuotationBid(editingBid);
                      setShowQuotation(true);
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Quotation
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* SECTION 1: Tender Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tender Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tender ID</label>
                    <input
                      type="text"
                      value={formData.tenderId}
                      onChange={(e) => setFormData({...formData, tenderId: e.target.value})}
                      className="input"
                      placeholder="e.g., TND-2026-001"
                    />
                  </div>
                  <div>
                    <label className="label">Gazette ID</label>
                    <input
                      type="text"
                      value={formData.gazetteId}
                      onChange={(e) => setFormData({...formData, gazetteId: e.target.value})}
                      className="input"
                      placeholder="e.g., 384475"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Title (English)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="input"
                      placeholder="Tender title in English"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Title (Dhivehi)</label>
                    <input
                      type="text"
                      value={formData.titleDhivehi}
                      onChange={(e) => setFormData({...formData, titleDhivehi: e.target.value})}
                      className="input font-dhivehi"
                      placeholder="ދިވެހިރާއްޖޭގެ ތާރީހު"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="label">Authority</label>
                    <input
                      type="text"
                      value={formData.authority}
                      onChange={(e) => setFormData({...formData, authority: e.target.value})}
                      className="input"
                      placeholder="e.g., Islamic University of Maldives"
                    />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tender Number</label>
                    <input
                      type="text"
                      value={formData.tenderNo}
                      onChange={(e) => setFormData({...formData, tenderNo: e.target.value})}
                      className="input"
                      placeholder="e.g., HDC (161)-PLM/IU/2026/72"
                    />
                  </div>
                  <div>
                    <label className="label">Lots</label>
                    <input
                      type="number"
                      value={formData.lots || ''}
                      onChange={(e) => setFormData({...formData, lots: e.target.value})}
                      className="input"
                      placeholder="Number of lots"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Requirement Items */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <Hash className="w-5 h-5" />
                    Requirement Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {/* Lot Mode Toggle */}
                {(formData.items || []).length > 0 && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                    <label className="label text-sm font-medium text-gray-700 mb-2">Lot Configuration</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, lotMode: 'single' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          formData.lotMode === 'single' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Many Items with One Lot
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, lotMode: 'multiple' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          formData.lotMode === 'multiple' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Each Item with 1 Lot
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.lotMode === 'single' 
                        ? 'All items will be grouped under LOT 1' 
                        : 'Each item will have its own LOT number'}
                    </p>
                  </div>
                )}

                {(formData.items || []).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No items added.</p>
                    {formData.requirements && Object.keys(formData.requirements).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const items = requirementsToItems(formData.requirements);
                          setFormData(prev => ({
                            ...prev,
                            items: items
                          }));
                        }}
                        className="btn-secondary text-sm mb-2"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Auto-Generate Items from Requirements
                      </button>
                    )}
                    <p className="text-xs text-gray-400">Or click "Add Item" to start manually</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg border border-green-200">
                        {/* Lot Number Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-green-100">
                          <div className="flex items-center gap-2">
                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                              LOT {formData.lotMode === 'single' ? 1 : index + 1}
                            </span>
                            <span className="text-xs text-gray-500">Item {index + 1} of {formData.items.length}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          {/* Item Name */}
                          <div className="md:col-span-3">
                            <label className="label text-xs">Item Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="input text-sm"
                              placeholder="e.g., Dell Monitor 24 inch"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-1">
                            <label className="label text-xs">Qty</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="input text-sm"
                              min="1"
                            />
                          </div>

                          {/* Cost Price */}
                          <div className="md:col-span-2">
                            <label className="label text-xs">Cost (MVR)</label>
                            <input
                              type="number"
                              value={item.costPrice}
                              onChange={(e) => updateItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)}
                              className="input text-sm"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Bid Price */}
                          <div className="md:col-span-2">
                            <label className="label text-xs">Bid (MVR)</label>
                            <input
                              type="number"
                              value={item.bidPrice}
                              onChange={(e) => updateItem(item.id, 'bidPrice', parseFloat(e.target.value) || 0)}
                              className="input text-sm"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Profit (Auto) */}
                          <div className="md:col-span-2">
                            <label className="label text-xs">Profit (MVR)</label>
                            <input
                              type="number"
                              value={item.profit.toFixed(2)}
                              readOnly
                              className="input text-sm bg-gray-100"
                            />
                          </div>

                          {/* Tax Toggle */}
                          <div className="md:col-span-1 flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.taxApplicable}
                                onChange={(e) => updateItem(item.id, 'taxApplicable', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-xs">Tax</span>
                            </label>
                          </div>
                        </div>

                        {/* Tax Rate (if applicable) */}
                        {item.taxApplicable && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <label className="label text-xs">Tax Rate (%)</label>
                              <input
                                type="number"
                                value={item.taxRate}
                                onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                className="input text-sm"
                                placeholder="e.g., 6"
                              />
                            </div>
                            <div>
                              <label className="label text-xs">Tax Amount (MVR)</label>
                              <input
                                type="number"
                                value={item.taxAmount.toFixed(2)}
                                readOnly
                                className="input text-sm bg-gray-100"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="label text-xs">Total with Tax (MVR)</label>
                              <input
                                type="number"
                                value={item.total.toFixed(2)}
                                readOnly
                                className="input text-sm bg-blue-50 font-semibold"
                              />
                            </div>
                          </div>
                        )}

                        {/* Specification & Supplier */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="label text-xs">Specification</label>
                            <textarea
                              value={item.specification}
                              onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                              className="input text-sm h-16"
                              placeholder="Technical specifications, model, brand, etc."
                            />
                          </div>
                          <div>
                            <label className="label text-xs">Supplier</label>
                            <input
                              type="text"
                              value={item.supplier}
                              onChange={(e) => updateItem(item.id, 'supplier', e.target.value)}
                              className="input text-sm"
                              placeholder="e.g., Tech Solutions Pvt Ltd"
                            />
                            <p className="text-xs text-gray-500 mt-1">Will auto-add to Suppliers page</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Totals Summary */}
                    <div className="bg-blue-100 p-4 rounded-lg mt-4">
                      <h4 className="font-semibold text-blue-800 mb-3">Bid Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Total Cost</p>
                          <p className="text-lg font-bold text-gray-900">
                            MVR {parseFloat(formData.costEstimate || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total Bid Amount</p>
                          <p className="text-lg font-bold text-blue-700">
                            MVR {parseFloat(formData.bidAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total Profit</p>
                          <p className="text-lg font-bold text-green-700">
                            MVR {parseFloat(formData.profitMargin || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Profit Margin</p>
                          <p className="text-lg font-bold text-purple-700">
                            {formData.bidAmount > 0 
                              ? ((formData.profitMargin / formData.bidAmount) * 100).toFixed(1) 
                              : 0}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Costs Summary */}
                      {(formData.additionalCosts || []).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-2">Additional Costs Breakdown:</p>
                          <div className="flex flex-wrap gap-2">
                            {(formData.additionalCosts || []).map((cost, idx) => (
                              <span key={idx} className="text-xs bg-white px-2 py-1 rounded">
                                {cost.type}: MVR {parseFloat(cost.amount || 0).toLocaleString()}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-blue-800 mt-2">
                            Total Additional Costs: MVR {calculateAdditionalCostsTotal(formData.additionalCosts).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2.5: Additional Costs */}
              <div className="bg-rose-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-rose-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Additional Costs
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add any additional costs like commission, installation, transportation, etc.
                </p>
                
                {/* Predefined Cost Types Buttons */}
                <div className="mb-4">
                  <label className="label text-sm">Quick Add Common Costs</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predefinedCostTypes.map((costType) => (
                      <button
                        key={costType}
                        type="button"
                        onClick={() => addAdditionalCost(costType)}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        + {costType}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => addAdditionalCost('')}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      + Custom
                    </button>
                  </div>
                </div>

                {/* Additional Costs List */}
                {(formData.additionalCosts || []).length > 0 && (
                  <div className="space-y-3">
                    {(formData.additionalCosts || []).map((cost) => (
                      <div key={cost.id} className="bg-white p-3 rounded border border-rose-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <label className="label text-xs">Cost Type</label>
                            {cost.isCustom === false ? (
                              <input
                                type="text"
                                value={cost.type}
                                readOnly
                                className="input text-sm bg-gray-50"
                              />
                            ) : (
                              <input
                                type="text"
                                value={cost.type}
                                onChange={(e) => updateAdditionalCost(cost.id, 'type', e.target.value)}
                                onBlur={(e) => {
                                  if (e.target.value && !predefinedCostTypes.includes(e.target.value)) {
                                    saveUserDefinedCostType(e.target.value);
                                  }
                                }}
                                placeholder="Enter cost type"
                                className="input text-sm"
                              />
                            )}
                          </div>
                          <div className="md:col-span-1">
                            <label className="label text-xs">Amount (MVR)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">MVR</span>
                              <input
                                type="number"
                                value={cost.amount}
                                onChange={(e) => updateAdditionalCost(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="input text-sm pl-10"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeAdditionalCost(cost.id)}
                              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 px-2 py-1.5"
                            >
                              <Trash className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total Additional Costs */}
                    <div className="bg-rose-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-rose-800">Total Additional Costs:</span>
                        <span className="text-lg font-bold text-rose-900">
                          MVR {calculateAdditionalCostsTotal(formData.additionalCosts).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(formData.additionalCosts || []).length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No additional costs added yet</p>
                    <p className="text-xs mt-1">Click a button above to add costs</p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Important Dates */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Important Dates & Deadlines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Submission Deadline</label>
                    <input
                      type="date"
                      value={formData.submissionDeadline}
                      onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Submission Time</label>
                    <input
                      type="time"
                      value={formData.submissionTime}
                      onChange={(e) => setFormData({...formData, submissionTime: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Bid Opening Date</label>
                    <input
                      type="date"
                      value={formData.bidOpeningDate}
                      onChange={(e) => setFormData({...formData, bidOpeningDate: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Bid Opening Time</label>
                    <input
                      type="time"
                      value={formData.bidOpeningTime}
                      onChange={(e) => setFormData({...formData, bidOpeningTime: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Registration Deadline</label>
                    <input
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Registration Time</label>
                    <input
                      type="time"
                      value={formData.registrationTime}
                      onChange={(e) => setFormData({...formData, registrationTime: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Clarification Deadline</label>
                    <input
                      type="date"
                      value={formData.clarificationDeadline}
                      onChange={(e) => setFormData({...formData, clarificationDeadline: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Clarification Time</label>
                    <input
                      type="time"
                      value={formData.clarificationTime}
                      onChange={(e) => setFormData({...formData, clarificationTime: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Clarification Location/Email</label>
                    <input
                      type="text"
                      value={formData.clarificationLocation}
                      onChange={(e) => setFormData({...formData, clarificationLocation: e.target.value})}
                      className="input"
                      placeholder="Room 101 or email@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Pre-Bid Meeting</label>
                    <input
                      type="date"
                      value={formData.preBidMeeting}
                      onChange={(e) => setFormData({...formData, preBidMeeting: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Pre-Bid Meeting Time</label>
                    <input
                      type="time"
                      value={formData.preBidMeetingTime}
                      onChange={(e) => setFormData({...formData, preBidMeetingTime: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Bid Submission Location</label>
                    <input
                      type="text"
                      value={formData.submissionLocation}
                      onChange={(e) => setFormData({...formData, submissionLocation: e.target.value})}
                      className="input"
                      placeholder="e.g., 2nd Floor, Ghazee Building, Male' or https://portal.example.com"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Contact Information */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Email (Optional)</label>
                    <input
                      type="text"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      className="input"
                      placeholder="procurement@example.gov.mv"
                    />
                  </div>
                  <div>
                    <label className="label">Contact Name</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      className="input"
                      placeholder="Contact person name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Contact Phones (comma separated)</label>
                    <input
                      type="text"
                      value={(formData.contactPhones || []).join(', ')}
                      onChange={(e) => setFormData({...formData, contactPhones: e.target.value.split(',').map(p => p.trim())})}
                      className="input"
                      placeholder="3339999, 7778888"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Links & URLs */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Links & URLs
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Gazette URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.gazetteUrl}
                        onChange={(e) => setFormData({...formData, gazetteUrl: e.target.value})}
                        className="input flex-1"
                        placeholder="https://gazette.gov.mv/iulaan/..."
                      />
                      {formData.gazetteUrl && (
                        <>
                          <button
                            type="button"
                            onClick={fetchGazetteData}
                            disabled={fetchingGazette}
                            className="btn-secondary flex items-center px-3 py-2"
                            title="Fetch tender data from Gazette"
                          >
                            {fetchingGazette ? (
                              <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={formData.gazetteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex items-center px-3 py-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </>
                      )}
                    </div>
                    {fetchGazetteError && (
                      <p className="text-sm text-red-600 mt-1">{fetchGazetteError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Paste Gazette URL and click fetch to auto-fill tender details
                    </p>
                  </div>
                  <div>
                    <label className="label">Info Sheet URL</label>
                    <input
                      type="url"
                      value={formData.infoSheetUrl}
                      onChange={(e) => setFormData({...formData, infoSheetUrl: e.target.value})}
                      className="input"
                      placeholder="https://storage.googleapis.com/..."
                    />
                  </div>
                  <div>
                    <label className="label">Portal URL</label>
                    <input
                      type="url"
                      value={formData.portal}
                      onChange={(e) => setFormData({...formData, portal: e.target.value})}
                      className="input"
                      placeholder="https://bids.example.gov.mv"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Additional Information */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Project Name</label>
                    <input
                      type="text"
                      value={formData.project}
                      onChange={(e) => setFormData({...formData, project: e.target.value})}
                      className="input"
                      placeholder="e.g., SAILS Project (World Bank)"
                    />
                  </div>
                  <div>
                    <label className="label">Funding Source</label>
                    <input
                      type="text"
                      value={formData.funding}
                      onChange={(e) => setFormData({...formData, funding: e.target.value})}
                      className="input"
                      placeholder="e.g., World Bank"
                    />
                  </div>
                  <div>
                    <label className="label">Bid Security</label>
                    <input
                      type="text"
                      value={formData.bidSecurity}
                      onChange={(e) => setFormData({...formData, bidSecurity: e.target.value})}
                      className="input"
                      placeholder="e.g., 5,000 MVR"
                    />
                  </div>
                  <div>
                    <label className="label">Performance Guarantee</label>
                    <input
                      type="text"
                      value={formData.performanceGuarantee}
                      onChange={(e) => setFormData({...formData, performanceGuarantee: e.target.value})}
                      className="input"
                      placeholder="e.g., 2% of contract value"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Eligibility Criteria</label>
                    <textarea
                      value={formData.eligibility}
                      onChange={(e) => setFormData({...formData, eligibility: e.target.value})}
                      className="input h-20"
                      placeholder="List eligibility requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Financial Information */}
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Bid Amount (MVR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">MVR</span>
                      <input
                        type="number"
                        value={formData.bidAmount}
                        onChange={(e) => {
                          setFormData({...formData, bidAmount: e.target.value});
                          setTimeout(calculateProfit, 0);
                        }}
                        onBlur={calculateProfit}
                        className="input pl-12"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Cost Estimate (MVR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">MVR</span>
                      <input
                        type="number"
                        value={formData.costEstimate}
                        onChange={(e) => {
                          setFormData({...formData, costEstimate: e.target.value});
                          setTimeout(calculateProfit, 0);
                        }}
                        onBlur={calculateProfit}
                        className="input pl-12"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Profit Margin (Auto)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">MVR</span>
                      <input
                        type="number"
                        value={formData.profitMargin}
                        readOnly
                        className="input pl-12 bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 8: Quotation Details */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  Quotation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Delivery Period (Days)</label>
                    <input
                      type="number"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({...formData, deliveryDays: parseInt(e.target.value) || 0})}
                      className="input"
                      placeholder="e.g., 35"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="label">Quotation Validity (Days)</label>
                    <input
                      type="number"
                      value={formData.quotationValidity}
                      onChange={(e) => setFormData({...formData, quotationValidity: parseInt(e.target.value) || 0})}
                      className="input"
                      placeholder="e.g., 60"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="label">Vendor Number</label>
                    <input
                      type="text"
                      value={formData.vendorNumber}
                      onChange={(e) => setFormData({...formData, vendorNumber: e.target.value})}
                      className="input"
                      placeholder="e.g., 514110"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 9: Evaluation Criteria */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Evaluation Criteria (Point System)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Price (%)</label>
                    <input
                      type="number"
                      value={formData.evaluationPrice || ''}
                      onChange={(e) => setFormData({...formData, evaluationPrice: parseInt(e.target.value) || 0})}
                      className="input"
                      placeholder="e.g., 40"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="label">Delivery Time (%)</label>
                    <input
                      type="number"
                      value={formData.evaluationDelivery || ''}
                      onChange={(e) => setFormData({...formData, evaluationDelivery: parseInt(e.target.value) || 0})}
                      className="input"
                      placeholder="e.g., 30"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="label">Feasibility (%)</label>
                    <input
                      type="number"
                      value={formData.evaluationExperience || ''}
                      onChange={(e) => setFormData({...formData, evaluationExperience: parseInt(e.target.value) || 0})}
                      className="input"
                      placeholder="e.g., 30"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                {(formData.evaluationPrice || 0) + (formData.evaluationDelivery || 0) + (formData.evaluationExperience || 0) !== 100 && (
                  <p className="text-sm text-red-600 mt-2">
                    Total should equal 100% (Current: {(formData.evaluationPrice || 0) + (formData.evaluationDelivery || 0) + (formData.evaluationExperience || 0)}%)
                  </p>
                )}
              </div>

              {/* SECTION 10: Status & Result */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Status & Result
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Bid Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Result</label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData({...formData, result: e.target.value})}
                      className="input"
                    >
                      {results.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 9: Notes & Documents */}
              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes & Documents
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="input h-24"
                      placeholder="Additional notes about this bid..."
                    />
                  </div>
                  <div>
                    <label className="label">Documents</label>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm text-gray-700">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          className="hidden"
                          id="bid-file-upload"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <label
                          htmlFor="bid-file-upload"
                          className="btn-secondary cursor-pointer inline-flex"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingFile ? 'Uploading...' : 'Upload Document'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBid ? 'Update' : 'Create'} Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showQuotation && quotationBid && (
        <BidQuotation 
          bid={quotationBid} 
          onClose={() => {
            setShowQuotation(false);
            setQuotationBid(null);
          }} 
        />
      )}
      {showOpenBidsReport && (
        <OpenBidsReport 
          bids={bids} 
          onClose={() => setShowOpenBidsReport(false)} 
        />
      )}
    </div>
  );
};

export default Bids;
