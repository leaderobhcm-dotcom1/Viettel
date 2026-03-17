import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plan, PlanType, News } from '../types';
import { 
  Users, Package, Settings, LogOut, Search, 
  Filter, MoreVertical, CheckCircle, Clock, 
  Phone, Trash2, Edit2, Plus, ArrowUpRight,
  TrendingUp, Calendar, UserCheck, X, Save,
  Newspaper, Home, Image as ImageIcon
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

const NoteCell = ({ leadId, initialNote, onSave }: { leadId: string, initialNote: string, onSave: (id: string, note: string) => void }) => {
  const [note, setNote] = useState(initialNote);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with props if they change externally
  React.useEffect(() => {
    setNote(initialNote);
    setIsDirty(false);
  }, [initialNote]);

  const handleSave = () => {
    if (isDirty) {
      onSave(leadId, note);
      setIsDirty(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="text"
        placeholder="Thêm ghi chú..."
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setIsDirty(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="text-sm bg-transparent border-b border-transparent hover:border-gray-200 focus:border-viettel-red focus:outline-none flex-grow py-1"
      />
      {isDirty && (
        <button 
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Lưu ghi chú"
        >
          <Save size={14} />
        </button>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { 
    user, logout, leads, plans, news, 
    updateLeadStatus, updateLeadNote, deleteLead, 
    addPlan, updatePlan, deletePlan, 
    addNews, updateNews, deleteNews,
    contactConfig, updateConfig 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'leads' | 'plans' | 'news' | 'settings'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<Omit<Plan, 'id'>>({
    name: '',
    price: '',
    period: '/tháng',
    data: '',
    speed: '',
    calls: '',
    features: [],
    type: PlanType.MOBILE,
    hot: false
  });
  const [featureInput, setFeatureInput] = useState('');

  // News Modal State
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsForm, setNewsForm] = useState<Omit<News, 'id' | 'created_at'>>({
    title: '',
    content: '',
    image_url: ''
  });

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone.includes(searchTerm)
  );

  const stats = [
    { label: 'Khách hàng mới', value: leads.filter(l => l.status === 'new').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Đã liên hệ', value: leads.filter(l => l.status === 'contacted').length, icon: Phone, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Hoàn thành', value: leads.filter(l => l.status === 'done').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Tổng số', value: leads.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      price: '',
      period: '/tháng',
      data: '',
      speed: '',
      calls: '',
      features: [],
      type: PlanType.MOBILE,
      hot: false
    });
    setShowPlanModal(true);
  };

  const handleOpenEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      period: plan.period,
      data: plan.data || '',
      speed: plan.speed || '',
      calls: plan.calls || '',
      features: [...plan.features],
      type: plan.type,
      hot: plan.hot || false
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      await updatePlan({ ...planForm, id: editingPlan.id });
    } else {
      await addPlan(planForm);
    }
    setShowPlanModal(false);
  };

  const handleOpenAddNewsModal = () => {
    setEditingNews(null);
    setNewsForm({
      title: '',
      content: '',
      image_url: ''
    });
    setShowNewsModal(true);
  };

  const handleOpenEditNewsModal = (item: News) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      content: item.content,
      image_url: item.image_url || ''
    });
    setShowNewsModal(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNews) {
      await updateNews({ ...newsForm, id: editingNews.id, created_at: editingNews.created_at });
    } else {
      await addNews(newsForm);
    }
    setShowNewsModal(false);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setPlanForm(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-viettel-red rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <span className="font-bold text-xl text-viettel-red">Admin Panel</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:bg-gray-50 mb-4"
          >
            <Home size={20} /> Về trang chủ
          </button>
          <div className="h-px bg-gray-100 mx-4 mb-4"></div>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-red-50 text-viettel-red font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Khách hàng
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'plans' ? 'bg-red-50 text-viettel-red font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Package size={20} /> Gói cước
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-red-50 text-viettel-red font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Newspaper size={20} /> Tin tức
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-red-50 text-viettel-red font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={20} /> Cấu hình
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
            <div className="w-10 h-10 bg-viettel-red/10 text-viettel-red rounded-full flex items-center justify-center font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'leads' && 'Quản lý khách hàng'}
            {activeTab === 'plans' && 'Quản lý gói cước'}
            {activeTab === 'news' && 'Quản lý tin tức'}
            {activeTab === 'settings' && 'Cấu hình hệ thống'}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-viettel-red w-64"
              />
            </div>
            <button className="lg:hidden p-2 text-gray-500" onClick={logout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8">
          {activeTab === 'leads' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Danh sách đăng ký</h3>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><Filter size={18} /></button>
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"><TrendingUp size={18} /></button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold">Khách hàng</th>
                        <th className="px-6 py-4 font-bold">Dịch vụ</th>
                        <th className="px-6 py-4 font-bold">Thời gian</th>
                        <th className="px-6 py-4 font-bold">Trạng thái</th>
                        <th className="px-6 py-4 font-bold">Ghi chú</th>
                        <th className="px-6 py-4 font-bold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{lead.name}</p>
                            <p className="text-sm text-gray-500">{lead.phone}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {lead.service}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(lead.timestamp).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                              className={`text-xs font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer ${
                                lead.status === 'new' ? 'bg-blue-100 text-blue-600' :
                                lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }`}
                            >
                              <option value="new">Mới</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="done">Hoàn thành</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <NoteCell 
                              leadId={lead.id} 
                              initialNote={lead.note || ''} 
                              onSave={updateLeadNote} 
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (window.confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
                                    deleteLead(lead.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                            Chưa có dữ liệu khách hàng đăng ký
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
                    Tổng cộng: {plans.length} gói cước
                  </div>
                </div>
                <button 
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-2 px-6 py-2.5 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100"
                >
                  <Plus size={20} /> Thêm gói cước
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-2 bg-white shadow-md rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deletePlan(plan.id)}
                        className="p-2 bg-white shadow-md rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${plan.type === PlanType.MOBILE ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {plan.type === PlanType.MOBILE ? 'Di động' : 'Internet'}
                      </span>
                      <h3 className="font-bold text-xl text-gray-900 mt-2">Gói {plan.name}</h3>
                    </div>

                    <div className="flex items-baseline gap-1 mb-4">
                      <p className="text-2xl font-extrabold text-viettel-red">{plan.price}</p>
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    </div>

                    <div className="space-y-2 mb-6 flex-grow">
                      {plan.data && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <ArrowUpRight size={14} className="text-viettel-red" /> {plan.data}
                        </div>
                      )}
                      {plan.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle size={14} className="text-green-500" /> {f}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleOpenEditModal(plan)}
                      className="w-full py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Chỉnh sửa chi tiết
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
                    Tổng cộng: {news.length} tin tức
                  </div>
                </div>
                <button 
                  onClick={handleOpenAddNewsModal}
                  className="flex items-center gap-2 px-6 py-2.5 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100"
                >
                  <Plus size={20} /> Thêm tin tức
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={() => handleOpenEditNewsModal(item)}
                        className="p-2 bg-white shadow-md rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Xóa tin tức này?')) deleteNews(item.id);
                        }}
                        className="p-2 bg-white shadow-md rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                        <ImageIcon size={48} />
                      </div>
                    )}

                    <div className="p-6 flex flex-grow flex-col">
                      <p className="text-xs text-gray-400 mb-2">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                      <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">{item.content}</p>
                      <button 
                        onClick={() => handleOpenEditNewsModal(item)}
                        className="w-full py-2 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ))}
                {news.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                    Chưa có tin tức nào. Nhấn "Thêm tin tức" để bắt đầu.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <h3 className="font-bold text-xl mb-6">Thông tin liên hệ</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hotline tư vấn</label>
                  <input 
                    type="text" 
                    defaultValue={contactConfig.hotline}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Website chính thức</label>
                  <input 
                    type="text" 
                    defaultValue={contactConfig.website}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ văn phòng</label>
                  <textarea 
                    defaultValue={contactConfig.address}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
                <button className="px-8 py-3 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-viettel-red p-6 text-white flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold">{editingNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}</h2>
              <button onClick={() => setShowNewsModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="p-8 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề tin tức</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nhập tiêu đề..."
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Hình ảnh</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.jpg"
                  value={newsForm.image_url}
                  onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung tin tức</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Nhập nội dung chi tiết..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                />
              </div>

              <div className="flex gap-4 pt-4 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowNewsModal(false)}
                  className="flex-grow py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-grow py-3.5 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Lưu tin tức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-viettel-red p-6 text-white flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold">{editingPlan ? 'Chỉnh sửa gói cước' : 'Thêm gói cước mới'}</h2>
              <button onClick={() => setShowPlanModal(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại gói cước</label>
                  <select 
                    value={planForm.type}
                    onChange={(e) => setPlanForm({ ...planForm, type: e.target.value as PlanType })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  >
                    <option value={PlanType.MOBILE}>Di động</option>
                    <option value={PlanType.INTERNET}>Internet - Wifi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên gói cước</label>
                  <input 
                    type="text" 
                    required
                    placeholder="V90B, SUN1..."
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá cước</label>
                  <input 
                    type="text" 
                    required
                    placeholder="90.000đ"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chu kỳ</label>
                  <input 
                    type="text" 
                    placeholder="/tháng, /ngày..."
                    value={planForm.period}
                    onChange={(e) => setPlanForm({ ...planForm, period: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Data (nếu có)</label>
                  <input 
                    type="text" 
                    placeholder="1GB/ngày"
                    value={planForm.data}
                    onChange={(e) => setPlanForm({ ...planForm, data: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tốc độ (nếu có)</label>
                  <input 
                    type="text" 
                    placeholder="150Mbps"
                    value={planForm.speed}
                    onChange={(e) => setPlanForm({ ...planForm, speed: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tính năng nổi bật</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="Nhập tính năng và nhấn Enter..."
                    className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-viettel-red"
                  />
                  <button 
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 bg-viettel-red text-white rounded-xl hover:bg-viettel-dark"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {planForm.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-viettel-red rounded-lg text-sm font-medium border border-red-100">
                      {feature}
                      <button type="button" onClick={() => removeFeature(idx)} className="hover:text-viettel-dark">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hot-plan"
                  checked={planForm.hot}
                  onChange={(e) => setPlanForm({ ...planForm, hot: e.target.checked })}
                  className="w-4 h-4 text-viettel-red border-gray-300 rounded focus:ring-viettel-red"
                />
                <label htmlFor="hot-plan" className="text-sm font-medium text-gray-700">Gói cước HOT (hiển thị nổi bật)</label>
              </div>

              <div className="flex gap-4 pt-4 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-grow py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-grow py-3.5 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Lưu gói cước
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

