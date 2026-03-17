-- SQL Schema for Supabase

-- 1. Table for Service Plans
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  data TEXT,
  speed TEXT,
  calls TEXT,
  features JSONB NOT NULL,
  type TEXT NOT NULL, -- 'MOBILE', 'INTERNET', 'COMBO'
  hot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Customer Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'done'
  note TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table for Configuration
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table for News
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table for User Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'USER', -- 'ADMIN', 'USER'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    CASE 
      WHEN new.email = 'admin@viettel.vn' THEN 'ADMIN' 
      ELSE 'USER' 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Initial Data for Plans
INSERT INTO plans (id, name, price, period, data, calls, features, type, hot) VALUES
('m1', 'V90B', '90.000đ', '/tháng', '1GB/ngày', 'Miễn phí gọi nội mạng < 10p', '["30GB Data tốc độ cao", "Miễn phí gọi nội mạng dưới 10 phút", "30 phút gọi ngoại mạng"]', 'MOBILE', false),
('m2', 'V120B', '120.000đ', '/tháng', '1.5GB/ngày', 'Miễn phí gọi nội mạng < 10p', '["45GB Data tốc độ cao", "Miễn phí gọi nội mạng dưới 10 phút", "50 phút gọi ngoại mạng", "TV360 Basic"]', 'MOBILE', true),
('m3', 'V200B', '200.000đ', '/tháng', '8GB/ngày', 'Miễn phí gọi nội mạng < 20p', '["240GB Data tốc độ cao", "Miễn phí gọi nội mạng dưới 20 phút", "100 phút gọi ngoại mạng"]', 'MOBILE', true),
('i1', 'SUN1', '180.000đ', '/tháng', NULL, NULL, '["Tốc độ 150Mbps", "Modem Wifi 2 băng tần", "Phù hợp hộ gia đình nhỏ", "Lắp đặt miễn phí"]', 'INTERNET', false),
('i2', 'STAR1', '210.000đ', '/tháng', NULL, NULL, '["Tốc độ 150Mbps", "Trang bị thêm 1 Mesh Wifi", "Phủ sóng rộng khắp nhà", "Công nghệ Wifi 6"]', 'INTERNET', true),
('i3', 'STAR3', '299.000đ', '/tháng', NULL, NULL, '["Tốc độ không giới hạn (>300Mbps)", "Trang bị 3 Mesh Wifi", "Cho nhà nhiều tầng/biệt thự", "Ưu tiên băng thông quốc tế"]', 'INTERNET', true)
ON CONFLICT (id) DO NOTHING;

-- Initial Data for Config
INSERT INTO config (key, value) VALUES
('hotline', '1800 8098'),
('website', 'viettel.vn'),
('address', 'Số 1 Giang Văn Minh, Kim Mã, Ba Đình, Hà Nội')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policies
-- Plans: Everyone can read, only authenticated can write
DROP POLICY IF EXISTS "Allow public read on plans" ON plans;
CREATE POLICY "Allow public read on plans" ON plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated write on plans" ON plans;
CREATE POLICY "Allow authenticated write on plans" ON plans FOR ALL TO authenticated USING (true);

-- Leads: Everyone can insert, only authenticated can read/update
DROP POLICY IF EXISTS "Allow public insert on leads" ON leads;
CREATE POLICY "Allow public insert on leads" ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated access on leads" ON leads;
CREATE POLICY "Allow authenticated access on leads" ON leads FOR ALL TO authenticated USING (true);

-- Config: Everyone can read, only authenticated can write
DROP POLICY IF EXISTS "Allow public read on config" ON config;
CREATE POLICY "Allow public read on config" ON config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated write on config" ON config;
CREATE POLICY "Allow authenticated write on config" ON config FOR ALL TO authenticated USING (true);

-- News: Everyone can read, only authenticated can write
DROP POLICY IF EXISTS "Allow public read on news" ON news;
CREATE POLICY "Allow public read on news" ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated write on news" ON news;
CREATE POLICY "Allow authenticated write on news" ON news FOR ALL TO authenticated USING (true);
