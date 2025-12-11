import { GoogleGenAI, Chat } from "@google/genai";
import { PLANS } from '../constants';

const API_KEY = process.env.API_KEY || '';

// Construct a context string from the plans to feed into the system instruction
const plansContext = PLANS.map(p => 
  `- Gói ${p.name} (${p.type}): Giá ${p.price}${p.period}. ${p.data ? `Data: ${p.data}.` : ''} ${p.speed ? `Tốc độ: ${p.speed}.` : ''} Đặc điểm: ${p.features.join(', ')}.`
).join('\n');

const SYSTEM_INSTRUCTION = `
Bạn là trợ lý ảo AI chuyên nghiệp của Viettel. Nhiệm vụ của bạn là tư vấn các gói cước dịch vụ cho khách hàng một cách thân thiện, ngắn gọn và chính xác.

Dưới đây là danh sách các gói cước hiện có:
${plansContext}

Quy tắc trả lời:
1. Luôn xưng hô là "Trợ lý Viettel" hoặc "mình".
2. Chỉ tư vấn các gói cước có trong danh sách trên.
3. Nếu khách hàng hỏi về nhu cầu (ví dụ: chơi game, xem phim, nhà rộng), hãy gợi ý gói phù hợp nhất.
   - Nhà rộng/nhiều tầng -> Gợi ý dòng STAR (có Mesh Wifi).
   - Dùng nhiều Data di động -> Gợi ý V200B.
   - Tiết kiệm -> Gợi ý SUN1 hoặc V90B.
4. Trả lời ngắn gọn, tập trung vào lợi ích chính.
5. Sử dụng giọng văn nhiệt tình, khuyến khích khách đăng ký.
`;

let aiInstance: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

export const createChatSession = (): Chat => {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });
};
