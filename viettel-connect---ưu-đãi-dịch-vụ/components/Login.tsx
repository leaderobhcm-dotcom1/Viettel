import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { X, Lock, User } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      onClose();
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu (Thử: ctv / ctv123)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-viettel-red p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Lock size={20} /> Đăng Nhập Hệ Thống
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-viettel-red focus:border-transparent outline-none"
                placeholder="admin hoặc ctv"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-viettel-red focus:border-transparent outline-none"
                placeholder="******"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-viettel-red text-white font-bold py-2.5 rounded-lg hover:bg-viettel-dark transition">
            Đăng Nhập
          </button>
          
          <div className="text-xs text-center text-gray-400">
            Demo: admin/admin123 hoặc ctv/ctv123
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
