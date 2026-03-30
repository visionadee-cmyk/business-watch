import { useState, useEffect, useCallback } from 'react';
import {
  getAllTenders,
  getTenderById,
  getTenderSummary,
  getUrgentTenders,
  searchTenders,
  subscribeToTenders
} from '../services/tenderService';

// Local tender data import (fallback)
import tenderData from '../../data/working_file.json';

export const useTenders = (useLocal = false) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const loadLocalData = useCallback(() => {
    try {
      setTenders(tenderData.tenders || []);
      setSummary(tenderData.summary || null);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, []);

  const loadFirebaseData = useCallback(async () => {
    try {
      setLoading(true);
      const [tendersData, summaryData] = await Promise.all([
        getAllTenders(),
        getTenderSummary()
      ]);
      setTenders(tendersData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      console.error('Firebase load failed, falling back to local:', err);
      loadLocalData();
    } finally {
      setLoading(false);
    }
  }, [loadLocalData]);

  useEffect(() => {
    if (useLocal) {
      loadLocalData();
    } else {
      loadFirebaseData();
    }
  }, [useLocal, loadLocalData, loadFirebaseData]);

  const getTender = useCallback(async (id) => {
    if (useLocal) {
      return tenderData.tenders.find(t => t.id === id) || null;
    }
    try {
      return await getTenderById(id);
    } catch {
      return tenderData.tenders.find(t => t.id === id) || null;
    }
  }, [useLocal]);

  const search = useCallback(async (term) => {
    if (useLocal) {
      const searchTerm = term.toLowerCase();
      return tenderData.tenders.filter(t => 
        t.title?.toLowerCase().includes(searchTerm) ||
        t.authority?.toLowerCase().includes(searchTerm) ||
        t.category?.toLowerCase().includes(searchTerm)
      );
    }
    try {
      return await searchTenders(term);
    } catch {
      const searchTerm = term.toLowerCase();
      return tenderData.tenders.filter(t => 
        t.title?.toLowerCase().includes(searchTerm) ||
        t.authority?.toLowerCase().includes(searchTerm) ||
        t.category?.toLowerCase().includes(searchTerm)
      );
    }
  }, [useLocal]);

  const getUrgent = useCallback(async (days = 7) => {
    if (useLocal) {
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + days);
      
      return tenderData.tenders
        .filter(t => {
          if (!t.submission_deadline) return false;
          const deadline = new Date(t.submission_deadline);
          return deadline >= today && deadline <= future;
        })
        .sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline));
    }
    try {
      return await getUrgentTenders(days);
    } catch {
      return getUrgent(days);
    }
  }, [useLocal]);

  const refresh = useCallback(() => {
    if (useLocal) {
      loadLocalData();
    } else {
      loadFirebaseData();
    }
  }, [useLocal, loadLocalData, loadFirebaseData]);

  return {
    tenders,
    summary,
    loading,
    error,
    getTender,
    search,
    getUrgent,
    refresh
  };
};

export default useTenders;
