import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { PlanType, News } from './types';
import PlanCard from './components/PlanCard';
import ChatBot from './components/ChatBot';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { Phone, Globe, Menu, X, ArrowRight, ShieldCheck, Clock, Award, Lock, UserCog, CheckCircle, ChevronRight, Search } from 'lucide-react';

// Wrapper component to use Context inside App
const AppContent = () => {
  const { user, plans, news, contactConfig, addLead, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  
  // Local state for form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('Internet Cáp Quang');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mobilePlans = plans.filter(p => p.type === PlanType.MOBILE);
  const internetPlans = plans.filter(p => p.type === PlanType.INTERNET);

  // Helper function for robust smooth scrolling
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handlePlanSelect = (planName: string) => {
    setFormService(planName);
    const contactSection = document.getElementById('contact-form');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formPhone && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await addLead({
          name: formName,
          phone: formPhone,
          service: formService
        });
        setFormSuccess(true);
        setFormName('');
        setFormPhone('');
        setTimeout(() => setFormSuccess(false), 3000);
      } catch (err) {
        alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // If user is logged in and showAdmin is true, show Admin Dashboard
  if (user && showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  // News Detail View
  if (selectedNews) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-white">
        <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedNews(null)}>
              <div className="w-10 h-10 bg-viettel-red rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Viettel_logo_2021.svg/100px-Viettel_logo_2021.svg.png" 
                  alt="V" 
                  className="w-full h-full object-cover scale-150"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="absolute">V</span>
              </div>
              <span className="text-viettel-red font-bold text-2xl tracking-tighter">viettel</span>
            </div>
            <button 
              onClick={() => setSelectedNews(null)}
              className="px-4 py-2 text-gray-600 font-bold hover:text-viettel-red transition-colors flex items-center gap-2"
            >
              <ArrowRight size={20} className="rotate-180" /> Quay lại
            </button>
          </div>
        </nav>

        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <button 
              onClick={() => setSelectedNews(null)}
              className="mb-8 text-gray-500 hover:text-viettel-red transition-colors flex items-center gap-2 font-medium"
            >
              <ArrowRight size={18} className="rotate-180" /> Trang chủ / Tin tức
            </button>

            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {selectedNews.title}
            </h1>
            
            <div className="flex items-center gap-4 text-gray-500 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{new Date(selectedNews.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-viettel-red font-bold">Tin tức Viettel</span>
            </div>

            {selectedNews.image_url && (
              <div className="rounded-3xl overflow-hidden mb-10 shadow-xl">
                <img 
                  src={selectedNews.image_url} 
                  alt={selectedNews.title} 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedNews.content}
            </div>

            <div className="mt-16 p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="font-bold text-xl mb-4">Bạn quan tâm đến dịch vụ của chúng tôi?</h3>
              <p className="text-gray-600 mb-6">Để lại thông tin để được tư vấn miễn phí các gói cước ưu đãi nhất.</p>
              <button 
                onClick={() => {
                  setSelectedNews(null);
                  setTimeout(() => {
                    const contactSection = document.getElementById('contact-form');
                    if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-8 py-3 bg-viettel-red text-white font-bold rounded-xl hover:bg-viettel-dark transition-all shadow-lg shadow-red-100"
              >
                Đăng ký tư vấn ngay
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>© 2026 Viettel Telecom. Bảo lưu mọi quyền.</p>
          </div>
        </footer>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-viettel-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 bg-viettel-red rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden relative">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Viettel_logo_2021.svg/100px-Viettel_logo_2021.svg.png" 
                alt="V" 
                className="w-full h-full object-cover scale-150"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="absolute">V</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-viettel-red font-black text-2xl tracking-tighter">viettel</span>
              <span className="text-[10px] text-viettel-red font-bold uppercase tracking-widest">telephone</span>
            </div>
          </div>

          {/* Right Menu & Actions */}
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-8 font-bold text-[16px] text-gray-800">
              <a href="#mobile" onClick={(e) => handleNavClick(e, 'mobile')} className="hover:text-viettel-red transition-colors">Di Động</a>
              <a href="#internet" onClick={(e) => handleNavClick(e, 'internet')} className="hover:text-viettel-red transition-colors">Internet - Wifi</a>
              <a href="#news" onClick={(e) => handleNavClick(e, 'news')} className="hover:text-viettel-red transition-colors">Tin Tức</a>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-viettel-red text-white rounded-full text-sm font-bold hover:bg-viettel-dark transition-all"
                >
                  <UserCog size={16} /> Quản trị
                </button>
              )}
              <button className="lg:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-xl flex flex-col gap-4 z-40">
            <a href="#mobile" className="py-2 text-gray-700 font-bold" onClick={(e) => handleNavClick(e, 'mobile')}>Di Động</a>
            <a href="#internet" className="py-2 text-gray-700 font-bold" onClick={(e) => handleNavClick(e, 'internet')}>Internet - Wifi</a>
            <a href="#news" className="py-2 text-gray-700 font-bold" onClick={(e) => handleNavClick(e, 'news')}>Tin Tức</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-50 to-white pt-16 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-red-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-red-100 text-viettel-red rounded-full font-semibold text-sm">
             ✨ Khuyến mãi đặc biệt tháng này
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Kết Nối Không Giới Hạn <br />
            <span className="text-viettel-red">Trải Nghiệm Đỉnh Cao</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Khám phá các gói cước Internet cáp quang siêu tốc và Data di động khủng. 
            Lắp đặt nhanh chóng, hỗ trợ 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#internet" onClick={(e) => handleNavClick(e, 'internet')} className="w-full sm:w-auto px-8 py-4 bg-viettel-red text-white rounded-full font-bold text-lg hover:bg-viettel-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-red-200 flex items-center justify-center gap-2">
              Xem Gói Internet <ArrowRight size={20} />
            </a>
            <a href="#mobile" onClick={(e) => handleNavClick(e, 'mobile')} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-lg hover:border-viettel-red hover:text-viettel-red transition-all flex items-center justify-center">
              Xem Gói Di Động
            </a>
          </div>
          
           {/* Trust Badges */}
           <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
             <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-viettel-red mb-3">
                   <ShieldCheck size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Mạng Lưới Số 1</h3>
                <p className="text-sm text-gray-500">Phủ sóng rộng khắp 63 tỉnh thành</p>
             </div>
             <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-viettel-red mb-3">
                   <Clock size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Hỗ Trợ 24/7</h3>
                <p className="text-sm text-gray-500">Đội ngũ kỹ thuật hỗ trợ mọi lúc</p>
             </div>
             <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-viettel-red mb-3">
                   <Award size={24} />
                </div>
                <h3 className="font-bold text-gray-900">Tốc Độ Ổn Định</h3>
                <p className="text-sm text-gray-500">Cam kết băng thông quốc tế</p>
             </div>
          </div>
        </div>
      </section>

      {/* Mobile Plans Section */}
      <section id="mobile" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Gói Cước Di Động</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Data thả ga, gọi điện không lo về giá. Chọn ngay gói cước phù hợp với nhu cầu của bạn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mobilePlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onSelect={handlePlanSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* Internet Plans Section */}
      <section id="internet" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Internet Cáp Quang & Wifi 6</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Trang bị Modem Wifi 2 băng tần và thiết bị Mesh giúp phủ sóng mọi ngóc ngách ngôi nhà bạn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {internetPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onSelect={handlePlanSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tin Tức Mới Nhất</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Cập nhật những thông tin mới nhất về khuyến mãi, công nghệ và dịch vụ từ Viettel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedNews(item)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              >
                {item.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs text-gray-400 mb-2">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-viettel-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {item.content}
                  </p>
                  <button className="text-viettel-red font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Xem chi tiết <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                Chưa có tin tức nào được cập nhật.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="bg-viettel-red rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Đăng Ký Tư Vấn Ngay</h2>
                  <p className="text-red-100 text-lg mb-8">
                    Để lại thông tin, nhân viên Viettel sẽ liên hệ tư vấn và làm thủ tục tại nhà miễn phí trong vòng 10 phút.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Phone size={20} />
                      </div>
                      <span className="font-medium text-lg">Tổng đài: {contactConfig.hotline}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Globe size={20} />
                      </div>
                      <span className="font-medium text-lg">Website: {contactConfig.website}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
                  {formSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Đăng Ký Thành Công!</h3>
                      <p className="text-gray-600">Chúng tôi sẽ liên hệ với bạn qua số điện thoại <b>{formPhone}</b> sớm nhất.</p>
                    </div>
                  ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                        <input 
                          type="text" 
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-viettel-red focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                          placeholder="Nguyễn Văn A" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                        <input 
                          type="tel" 
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-viettel-red focus:ring-2 focus:ring-red-100 outline-none transition-all" 
                          placeholder="09xxxxxxxx" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dịch Vụ Quan Tâm</label>
                        <select 
                          value={formService}
                          onChange={(e) => setFormService(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-viettel-red focus:ring-2 focus:ring-red-100 outline-none transition-all"
                        >
                          <option>Internet Cáp Quang</option>
                          <option>Gói Cước Di Động</option>
                          <option>Combo Internet + TV</option>
                          <option>Camera An Ninh</option>
                          {plans.map(p => <option key={p.id} value={p.name}>Gói {p.name}</option>)}
                        </select>
                      </div>
                      <button className="w-full py-3.5 bg-viettel-red text-white font-bold rounded-lg hover:bg-viettel-dark transition-colors shadow-lg shadow-red-200">
                        Gửi Yêu Cầu
                      </button>
                      <p className="text-xs text-center text-gray-500 mt-3">
                        Bằng cách gửi form, bạn đồng ý để Viettel liên hệ tư vấn.
                      </p>
                    </form>
                  )}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           {/* Left side: Links */}
           <div className="flex items-center gap-6 text-sm font-medium">
              <a href="#mobile" onClick={(e) => handleNavClick(e, 'mobile')} className="hover:text-white transition-colors">Di Động</a>
              <a href="#internet" onClick={(e) => handleNavClick(e, 'internet')} className="hover:text-white transition-colors">Internet & TV</a>
           </div>

           {/* Right side: Admin Button */}
           <button 
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-white transition-colors border border-gray-700 rounded-full px-3 py-1"
            >
              <UserCog size={14} /> Quản trị viên
            </button>
        </div>
      </footer>

      <ChatBot />
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
