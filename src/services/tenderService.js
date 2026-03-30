import { db } from './firebase.js';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';

// Get all tenders
export const getAllTenders = async () => {
  try {
    const tendersRef = collection(db, 'tenders');
    const q = query(tendersRef, orderBy('submission_deadline', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tenders:', error);
    throw error;
  }
};

// Get tender by ID
export const getTenderById = async (tenderId) => {
  try {
    const tenderRef = doc(db, 'tenders', tenderId);
    const snapshot = await getDoc(tenderRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching tender:', error);
    throw error;
  }
};

// Get tenders by category
export const getTendersByCategory = async (category) => {
  try {
    const tendersRef = collection(db, 'tenders');
    const q = query(tendersRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tenders by category:', error);
    throw error;
  }
};

// Get tenders by authority
export const getTendersByAuthority = async (authority) => {
  try {
    const tendersRef = collection(db, 'tenders');
    const q = query(tendersRef, where('authority', '==', authority));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tenders by authority:', error);
    throw error;
  }
};

// Get tender summary/stats
export const getTenderSummary = async () => {
  try {
    const summaryRef = doc(db, 'tenderData', 'summary');
    const snapshot = await getDoc(summaryRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

// Get metadata
export const getTenderMetadata = async () => {
  try {
    const metadataRef = doc(db, 'tenderData', 'metadata');
    const snapshot = await getDoc(metadataRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};

// Real-time listener for tenders
export const subscribeToTenders = (callback) => {
  const tendersRef = collection(db, 'tenders');
  const q = query(tendersRef, orderBy('submission_deadline', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const tenders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(tenders);
  }, (error) => {
    console.error('Error in tenders subscription:', error);
  });
};

// Get urgent deadlines (tenders closing soon)
export const getUrgentTenders = async (daysThreshold = 7) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);
    
    const tendersRef = collection(db, 'tenders');
    const snapshot = await getDocs(tendersRef);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(tender => {
        if (!tender.submission_deadline) return false;
        const deadline = new Date(tender.submission_deadline);
        return deadline >= today && deadline <= futureDate;
      })
      .sort((a, b) => new Date(a.submission_deadline) - new Date(b.submission_deadline));
  } catch (error) {
    console.error('Error fetching urgent tenders:', error);
    throw error;
  }
};

// Search tenders
export const searchTenders = async (searchTerm) => {
  try {
    const tendersRef = collection(db, 'tenders');
    const snapshot = await getDocs(tendersRef);
    
    const term = searchTerm.toLowerCase();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(tender => 
        tender.title?.toLowerCase().includes(term) ||
        tender.authority?.toLowerCase().includes(term) ||
        tender.category?.toLowerCase().includes(term) ||
        tender.id?.toLowerCase().includes(term)
      );
  } catch (error) {
    console.error('Error searching tenders:', error);
    throw error;
  }
};
