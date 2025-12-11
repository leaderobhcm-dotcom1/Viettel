import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plan, PlanType } from '../types';
import { Save, LogOut, LayoutDashboard, Smartphone, Wifi, Phone, Edit2, X, CheckCircle, Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout, plans, updatePlan, leads, updateLeadStatus, contactConfig, updateContactConfig } = useApp();
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'INTERNET' | 'CONTACT' | 'LEADS'>('MOBILE');
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for editing form
  const [tempPlan, setTempPlan] = useState<Plan | null>(null);
  const [featuresText, setFeaturesText] = useState(''); // Textarea content for features
  const [tempConfig, setTempConfig] = useState(contactConfig);

  const startEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setTempPlan({ ...plan });
    setFeaturesText(plan.features.join('\n'));
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setTempPlan(null);
    setFeaturesText('');
  };

  const savePlan = async () => {
    if (tempPlan) {
      setIsSaving(true);
      // Convert text area back to array, removing empty lines
      const updatedFeatures = featuresText.split('\n').map(line => line.trim()).filter(line => line !== '');
      const finalPlan = { ...tempPlan, features: updatedFeatures };
      
      updatePlan(finalPlan);
      
      // Simulate small delay for UX
      setTimeout(() => {
        setIsSaving(false);
        setEditingPlan(null);
        setTempPlan(null);
      }, 500);
    }
  };

  const handleConfigSave = () => {
    setIsSaving(true);
    updateContactConfig(tempConfig);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleInputChange = (field: keyof Plan, value: string) => {
    if (tempPlan) {
      setTempPlan({ ...tempPlan, [field]: value });
    }
  };

  if (!user) return null;

  const filteredPlans = plans.filter(p => {
    if (activeTab === 'MOBILE') return p.type === PlanType.MOBILE;
    if (activeTab === 'INTERNET') return p.type === PlanType.INTERNET;
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Sidebar / Header */}
      <div className="bg-gray-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-viettel-red rounded flex items-center justify-center font-bold">V</div>
            <span className="font-bold text-lg hidden sm:block">Hệ Thống Quản Trị</span>
            <span className="px-2 py-0.5 rounded bg-gray-700 text-xs text-gray-300 border border-gray-600">
              {user.role} - {user.name}
            </span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Menu */}
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('MOBILE')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'MOBILE' ? 'bg-white text-viettel-red shadow-sm font-bold border-l-4 border-viettel-red' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Smartphone size={20} /> Gói Di Động
            </button>
            <button 
              onClick={() => setActiveTab('INTERNET')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'INTERNET' ? 'bg-white text-viettel-red shadow-sm font-bold border-l-4 border-viettel-red' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Wifi size={20} /> Internet - Wifi
            </button>
            <button 
              onClick={() => setActiveTab('CONTACT')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'CONTACT' ? 'bg-white text-viettel-red shadow-sm font-bold border-l-4 border-viettel-red' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Phone size={20} /> Thông Tin Liên Hệ
            </button>
            <button 
              onClick={() => setActiveTab('LEADS')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'LEADS' ? 'bg-white text-viettel-red shadow-sm font-bold border-l-4 border-viettel-red' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <LayoutDashboard size={20} /> Yêu Cầu Tư Vấn
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {activeTab === 'LEADS' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-bold text-lg text-gray-800">Danh Sách Khách Hàng Cần Tư Vấn</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Tên</th>
                        <th className="px-6 py-4">SĐT</th>
                        <th className="px-6 py-4">Dịch vụ</th>
                        <th className="px-6 py-4">Thời gian</th>
                        <th className="px-6 py-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leads.length === 0 ? (
                         <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Chưa có yêu cầu nào</td></tr>
                      ) : (
                        leads.map(lead => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                            <td className="px-6 py-4">{lead.phone}</td>
                            <td className="px-6 py-4">{lead.service}</td>
                            <td className="px-6 py-4">{new Date(lead.timestamp).toLocaleString('vi-VN')}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={lead.status}
                                onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                                className={`px-2 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer ${
                                  lead.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}
                              >
                                <option value="new">Mới</option>
                                <option value="contacted">Đang tư vấn</option>
                                <option value="done">Hoàn thành</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'CONTACT' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h2 className="text-xl font-bold mb-6 text-gray-800">Cập nhật thông tin liên hệ hiển thị trên web</h2>
                 <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hotline Tổng Đài</label>
                      <input 
                        type="text" 
                        value={tempConfig.hotline} 
                        onChange={(e) => setTempConfig({...tempConfig, hotline: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viettel-red outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website hiển thị</label>
                      <input 
                        type="text" 
                        value={tempConfig.website} 
                        onChange={(e) => setTempConfig({...tempConfig, website: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viettel-red outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                      <textarea 
                        value={tempConfig.address} 
                        onChange={(e) => setTempConfig({...tempConfig, address: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viettel-red outline-none h-24" 
                      />
                    </div>
                    <button 
                      onClick={handleConfigSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-viettel-red text-white px-6 py-2.5 rounded-lg font-bold hover:bg-viettel-dark transition disabled:bg-gray-400"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredPlans.map(plan => (
                  <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {editingPlan === plan.id && tempPlan ? (
                      // Edit Mode
                      <div className="p-6 bg-red-50/50">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-viettel-red">Chỉnh sửa: {plan.name}</h3>
                          <div className="flex gap-2">
                             <button 
                               onClick={savePlan} 
                               disabled={isSaving}
                               className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1 disabled:bg-gray-400"
                              >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                                {isSaving ? ' Lưu...' : ' Lưu'}
                              </button>
                             <button onClick={cancelEdit} className="bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500"><X size={16} /> Hủy</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500">Tên gói</label>
                            <input value={tempPlan.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500">Giá cước</label>
                            <input value={tempPlan.price} onChange={e => handleInputChange('price', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500">Data / Tốc độ</label>
                             {plan.type === PlanType.MOBILE ? (
                                <input value={tempPlan.data || ''} onChange={e => handleInputChange('data', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" placeholder="VD: 4GB/ngày" />
                             ) : (
                                <input value={tempPlan.speed || ''} onChange={e => handleInputChange('speed', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" placeholder="VD: 150Mbps" />
                             )}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500">Chu kỳ</label>
                            <input value={tempPlan.period} onChange={e => handleInputChange('period', e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" />
                          </div>
                        </div>
                        <div className="mt-4">
                           <label className="text-xs font-bold text-gray-500 mb-2 block">Đặc điểm nổi bật (Mỗi dòng một ý)</label>
                           <textarea
                            value={featuresText}
                            onChange={(e) => setFeaturesText(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white text-sm h-32 focus:ring-2 focus:ring-viettel-red outline-none"
                            placeholder="Nhập tính năng, mỗi tính năng một dòng..."
                           />
                           <div className="text-xs text-gray-400 mt-1">Xuống dòng để thêm tính năng mới</div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                               <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                               {plan.hot && <span className="bg-red-100 text-viettel-red text-xs px-2 py-0.5 rounded font-bold">HOT</span>}
                            </div>
                            <div className="text-viettel-red font-bold text-lg">{plan.price} <span className="text-sm text-gray-500 font-normal">{plan.period}</span></div>
                            <div className="text-sm text-gray-600 mt-2">
                               {plan.data && <span>Data: {plan.data} • </span>}
                               {plan.speed && <span>Speed: {plan.speed} • </span>}
                               <span className="opacity-75">{plan.features.length} tính năng</span>
                            </div>
                         </div>
                         <button 
                           onClick={() => startEdit(plan)}
                           className="flex items-center gap-2 text-gray-600 hover:text-viettel-red px-4 py-2 rounded-lg border border-gray-200 hover:border-viettel-red transition bg-white"
                         >
                            <Edit2 size={16} /> Chỉnh sửa
                         </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;