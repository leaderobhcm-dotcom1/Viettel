import { Plan, PlanType } from './types';

export const PLANS: Plan[] = [
  // Mobile Plans
  {
    id: 'm1',
    name: 'V90B',
    price: '90.000đ',
    period: '/tháng',
    data: '1GB/ngày',
    calls: 'Miễn phí gọi nội mạng < 10p',
    features: ['30GB Data tốc độ cao', 'Miễn phí gọi nội mạng dưới 10 phút', '30 phút gọi ngoại mạng'],
    type: PlanType.MOBILE,
    hot: false
  },
  {
    id: 'm2',
    name: 'V120B',
    price: '120.000đ',
    period: '/tháng',
    data: '1.5GB/ngày',
    calls: 'Miễn phí gọi nội mạng < 10p',
    features: ['45GB Data tốc độ cao', 'Miễn phí gọi nội mạng dưới 10 phút', '50 phút gọi ngoại mạng', 'TV360 Basic'],
    type: PlanType.MOBILE,
    hot: true
  },
  {
    id: 'm3',
    name: 'V200B',
    price: '200.000đ',
    period: '/tháng',
    data: '8GB/ngày',
    calls: 'Miễn phí gọi nội mạng < 20p',
    features: ['240GB Data tốc độ cao', 'Miễn phí gọi nội mạng dưới 20 phút', '100 phút gọi ngoại mạng'],
    type: PlanType.MOBILE,
    hot: true
  },
  // Internet Plans
  {
    id: 'i1',
    name: 'SUN1',
    price: '180.000đ',
    period: '/tháng',
    speed: '150 Mbps',
    features: ['Tốc độ 150Mbps', 'Modem Wifi 2 băng tần', 'Phù hợp hộ gia đình nhỏ', 'Lắp đặt miễn phí'],
    type: PlanType.INTERNET,
    hot: false
  },
  {
    id: 'i2',
    name: 'STAR1',
    price: '210.000đ',
    period: '/tháng',
    speed: '150 Mbps',
    features: ['Tốc độ 150Mbps', 'Trang bị thêm 1 Mesh Wifi', 'Phủ sóng rộng khắp nhà', 'Công nghệ Wifi 6'],
    type: PlanType.INTERNET,
    hot: true
  },
  {
    id: 'i3',
    name: 'STAR3',
    price: '299.000đ',
    period: '/tháng',
    speed: 'Unlimited',
    features: ['Tốc độ không giới hạn (>300Mbps)', 'Trang bị 3 Mesh Wifi', 'Cho nhà nhiều tầng/biệt thự', 'Ưu tiên băng thông quốc tế'],
    type: PlanType.INTERNET,
    hot: true
  }
];

export const APP_NAME = "Viettel Store";
