import React from 'react';
import { Plan, PlanType } from '../types';
import { Check, Zap, Wifi, Smartphone } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  onSelect: (planName: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
  const isMobile = plan.type === PlanType.MOBILE;

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border ${plan.hot ? 'border-viettel-red ring-1 ring-viettel-red/20' : 'border-gray-100'} p-6 flex flex-col h-full transition-all hover:shadow-md`}>
      {plan.hot && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-viettel-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Phổ biến nhất
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMobile ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-viettel-red'}`}>
          {isMobile ? <Smartphone size={24} /> : <Wifi size={24} />}
        </div>
        <div className="text-right">
          <span className="block text-2xl font-extrabold text-gray-900">{plan.price}</span>
          <span className="text-sm text-gray-500">{plan.period}</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Gói {plan.name}</h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {plan.data && (
          <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
            <Zap size={12} className="text-yellow-500" /> {plan.data}
          </div>
        )}
        {plan.speed && (
          <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
            <Zap size={12} className="text-yellow-500" /> {plan.speed}
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={() => onSelect(plan.name)}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          plan.hot 
            ? 'bg-viettel-red text-white hover:bg-viettel-dark shadow-lg shadow-red-100' 
            : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        Đăng Ký Ngay
      </button>
    </div>
  );
};

export default PlanCard;
