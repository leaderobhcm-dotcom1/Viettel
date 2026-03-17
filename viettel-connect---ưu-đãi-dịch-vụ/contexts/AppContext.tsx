import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plan, Lead, User, ContactConfig, PlanType, News } from '../types';
import { PLANS } from '../constants';
import { supabase, isSupabaseConfigured } from '../supabase';

interface AppContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  plans: Plan[];
  leads: Lead[];
  news: News[];
  contactConfig: ContactConfig;
  addLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead['status']) => Promise<void>;
  updateLeadNote: (id: string, note: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addPlan: (plan: Omit<Plan, 'id'>) => Promise<void>;
  updatePlan: (plan: Plan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  addNews: (news: Omit<News, 'id' | 'created_at'>) => Promise<void>;
  updateNews: (news: News) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  updateConfig: (config: ContactConfig) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    hotline: '1800 8098',
    website: 'viettel.vn',
    address: 'Số 1 Giang Văn Minh, Kim Mã, Ba Đình, Hà Nội'
  });

  // Handle Auth State Changes
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        setUser({
          username: data.username,
          role: data.role as 'ADMIN' | 'USER',
          name: data.full_name
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch initial data from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (plansData && !plansError) {
          setPlans(plansData as Plan[]);
        }

        // Fetch Config
        const { data: configData, error: configError } = await supabase
          .from('config')
          .select('*');
        
        if (configData && !configError) {
          const configObj: any = {};
          configData.forEach(item => {
            configObj[item.key] = item.value;
          });
          if (Object.keys(configObj).length > 0) {
            setContactConfig(configObj as ContactConfig);
          }
        }

        // Fetch Leads
        console.log('Fetching leads, user authenticated:', !!user);
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (leadsData && !leadsError) {
          console.log('Leads fetched successfully:', leadsData.length);
          // Ensure timestamp is a number (Supabase BIGINT can come as string)
          const formattedLeads = leadsData.map(lead => ({
            ...lead,
            timestamp: typeof lead.timestamp === 'string' ? parseInt(lead.timestamp, 10) : Number(lead.timestamp)
          }));
          setLeads(formattedLeads as Lead[]);
        } else if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        }

        // Fetch News
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (newsData && !newsError) {
          setNews(newsData as News[]);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for leads
    const leadsSubscription = supabase
      .channel('leads-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [payload.new as Lead, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSubscription);
    };
  }, [user, isSupabaseConfigured]);

  // Login with Supabase Auth
  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Fallback for demo if not configured
      if (email === 'admin@viettel.vn' && password === 'admin123') {
        setUser({ username: 'admin', role: 'ADMIN', name: 'Quản trị viên' });
        return true;
      }
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    return !!data.user;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const addLead = async (newLeadData: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const newLead = {
      ...newLeadData,
      timestamp: Date.now(),
      status: 'new'
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('leads')
        .insert([newLead]);

      if (error) {
        console.error('Error adding lead to Supabase:', error);
        setLeads(prev => [{ ...newLead, id: Math.random().toString() } as Lead, ...prev]);
      }
    } else {
      setLeads(prev => [{ ...newLead, id: Math.random().toString() } as Lead, ...prev]);
    }
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating lead status in Supabase:', error);
        // Revert on error if needed, but for now just log
      }
    }
  };

  const updateLeadNote = async (id: string, note: string) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, note } : l));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('leads')
        .update({ note })
        .eq('id', id);

      if (error) {
        console.error('Error updating lead note in Supabase:', error);
      }
    }
  };

  const deleteLead = async (id: string) => {
    // Optimistic update
    setLeads(prev => prev.filter(l => l.id !== id));

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead from Supabase:', error);
      }
    }
  };

  const addPlan = async (newPlanData: Omit<Plan, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newPlan = { ...newPlanData, id };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('plans')
        .insert([newPlan]);

      if (error) {
        console.error('Error adding plan to Supabase:', error);
        setPlans(prev => [...prev, newPlan as Plan]);
      } else {
        setPlans(prev => [...prev, newPlan as Plan]);
      }
    } else {
      setPlans(prev => [...prev, newPlan as Plan]);
    }
  };

  const updatePlan = async (updatedPlan: Plan) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('plans')
        .update(updatedPlan)
        .eq('id', updatedPlan.id);

      if (error) {
        console.error('Error updating plan in Supabase:', error);
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      } else {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      }
    } else {
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    }
  };

  const deletePlan = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan from Supabase:', error);
        setPlans(prev => prev.filter(p => p.id !== id));
      } else {
        setPlans(prev => prev.filter(p => p.id !== id));
      }
    } else {
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateConfig = async (newConfig: ContactConfig) => {
    if (isSupabaseConfigured) {
      const updates = Object.entries(newConfig).map(([key, value]) => 
        supabase.from('config').upsert({ key, value })
      );
      await Promise.all(updates);
    }
    setContactConfig(newConfig);
  };

  const addNews = async (newsData: Omit<News, 'id' | 'created_at'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('news')
        .insert([newsData])
        .select();

      if (!error && data) {
        setNews(prev => [data[0] as News, ...prev]);
      }
    } else {
      const newNews = { ...newsData, id: Math.random().toString(), created_at: new Date().toISOString() };
      setNews(prev => [newNews as News, ...prev]);
    }
  };

  const updateNews = async (updatedNews: News) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('news')
        .update(updatedNews)
        .eq('id', updatedNews.id);

      if (!error) {
        setNews(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
      }
    } else {
      setNews(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
    }
  };

  const deleteNews = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (!error) {
        setNews(prev => prev.filter(n => n.id !== id));
      }
    } else {
      setNews(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, plans, leads, news, contactConfig,
      addLead, updateLeadStatus, updateLeadNote, deleteLead, addPlan, updatePlan, deletePlan, 
      addNews, updateNews, deleteNews,
      updateConfig,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
