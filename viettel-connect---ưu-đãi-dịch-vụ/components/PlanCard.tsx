import React from 'react';
import { Plan, PlanType } from '../types';
import { Wifi, Smartphone, Check, Zap } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  onSelect: (planName: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => {
  return (
    <div className={`relative flex flex-col p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${plan.hot ? 'border-viettel-red scale-105 z-10' : 'border-gray-100'}`}>
      {plan.hot && (
        <div className="absolute top-0 right-0 bg-viettel-red text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
          <Zap size={12} /> HOT
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
           {plan.type === PlanType.INTERNET ? (
             <div className="p-2 bg-red-50 rounded-lg text-viettel-red">
               <Wifi size={24} />
             </div>
           ) : (
             <div className="p-2 bg-red-50 rounded-lg text-viettel-red">
               <Smartphone size={24} />
             </div>
           )}
           <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-viettel-red">{plan.price}</span>
          <span className="text-gray-500 font-medium">{plan.period}</span>
        </div>
      </div>

      <div className="flex-grow space-y-3 mb-6">
        {plan.data && (
           <div className="flex items-center gap-2 text-gray-700 font-medium">
             <span className="w-2 h-2 bg-viettel-red rounded-full"></span>
             Data: {plan.data}
           </div>
        )}
        {plan.speed && (
           <div className="flex items-center gap-2 text-gray-700 font-medium">
             <span className="w-2 h-2 bg-viettel-red rounded-full"></span>
             Tốc độ: {plan.speed}
           </div>
        )}
        {plan.calls && (
           <div className="text-sm text-gray-600 italic mb-2 pl-4">
             {plan.calls}
           </div>
        )}
        
        <div className="border-t border-gray-100 pt-3 space-y-2">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.name)}
        className={`w-full py-3 rounded-xl font-bold text-center transition-colors ${
          plan.hot 
            ? 'bg-viettel-red text-white hover:bg-viettel-dark shadow-md shadow-red-200' 
            : 'bg-white text-viettel-red border-2 border-viettel-red hover:bg-red-50'
        }`}
      >
        Đăng Ký Ngay
      </button>
    </div>
  );
};

export default PlanCard;
