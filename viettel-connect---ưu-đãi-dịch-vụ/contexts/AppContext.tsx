import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, User, Lead, ContactConfig, Role } from '../types';
import { PLANS as INITIAL_PLANS } from '../constants';

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbx_nIXcqNfCHRMvfcXRNe0YLewg1vfG5gU4jRhnVloFZQH1R69L5zNLCAldThO57bNNRg/exec";

interface AppContextType {
  // Auth
  user: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  
  // Data
  plans: Plan[];
  updatePlan: (updatedPlan: Plan) => void;
  
  // Leads (Liên hệ khách hàng gửi)
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;

  // Contact Config (Thông tin liên hệ chung)
  contactConfig: ContactConfig;
  updateContactConfig: (config: ContactConfig) => void;

  // System
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Auth State ---
  // Initialize from LocalStorage if available
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('viettel_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (username: string, pass: string): boolean => {
    let userObj: User | null = null;
    
    // Mock authentication
    if (username === 'admin' && pass === 'admin123') {
      userObj = { username: 'admin', role: 'ADMIN', name: 'Quản Trị Viên' };
    } else if (username === 'ctv' && pass === 'ctv123') {
      userObj = { username: 'ctv', role: 'CTV', name: 'Cộng Tác Viên' };
    }

    if (userObj) {
      setUser(userObj);
      localStorage.setItem('viettel_user', JSON.stringify(userObj));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('viettel_user');
  };

  // --- Data State ---
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    hotline: '1800 8098',
    website: 'viettel.vn',
    address: 'Số 1 Giang Văn Minh, P Kim Mã, Q Ba Đình, TP Hà Nội.'
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- API Helper ---
  // Fix for "Failed to fetch":
  // 1. method: POST
  // 2. credentials: omit (prevents auth conflicts)
  // 3. referrerPolicy: no-referrer (prevents some browser blocking on redirects)
  // 4. Content-Type: text/plain (avoids CORS preflight)
  const sendToSheet = async (action: string, payload: any) => {
    try {
      await fetch(SHEET_API_URL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        headers: { "Content-Type": "text/plain" }, 
        body: JSON.stringify({ action, ...payload })
      });
      console.log(`Synced ${action} to sheet`);
    } catch (error) {
      console.error(`Failed to sync ${action}`, error);
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add timestamp to prevent caching
        const response = await fetch(`${SHEET_API_URL}?action=getAll&t=${Date.now()}`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.status === 'error') {
           console.error("Sheet API Error:", data.message);
           return;
        }

        if (data.plans && data.plans.length > 0) {
          // Normalize features if they came back as strings instead of arrays from a raw fetch
          const normalizedPlans = data.plans.map((p: any) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : (Array.isArray(p.features) ? p.features : [])
          }));
          setPlans(normalizedPlans);
        }
        
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads.sort((a: Lead, b: Lead) => b.timestamp - a.timestamp));
        }

        if (data.config && data.config.hotline) {
          setContactConfig(data.config);
        }
      } catch (error) {
        console.error("Error fetching data from Sheet:", error);
        console.warn("Please ensure the Google Script is deployed as 'Web App' -> 'Who has access: Anyone'");
        // Keep initial state (constants) if fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Actions ---

  const updatePlan = (updatedPlan: Plan) => {
    // 1. Optimistic Update (Immediate UI change)
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    
    // 2. Sync to Backend
    sendToSheet('updatePlan', { payload: updatedPlan });
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'new'
    };
    
    // 1. Optimistic Update
    setLeads(prev => [newLead, ...prev]);
    
    // 2. Sync to Backend
    sendToSheet('addLead', { payload: newLead });
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    sendToSheet('updateLeadStatus', { id, status });
  };

  const updateContactConfig = (config: ContactConfig) => {
    setContactConfig(config);
    sendToSheet('updateConfig', { payload: config });
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      plans, updatePlan,
      leads, addLead, updateLeadStatus,
      contactConfig, updateContactConfig,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};