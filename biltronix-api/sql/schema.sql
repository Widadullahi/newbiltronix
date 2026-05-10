CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(40) NOT NULL UNIQUE,
  customer VARCHAR(150) NOT NULL,
  service VARCHAR(150) NOT NULL,
  date VARCHAR(40) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  whatsapp_number VARCHAR(50) NOT NULL DEFAULT '',
  vehicle VARCHAR(200) NOT NULL DEFAULT '',
  email VARCHAR(180) NOT NULL DEFAULT '',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(40) NOT NULL UNIQUE,
  item VARCHAR(200) NOT NULL,
  customer VARCHAR(150) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  channel VARCHAR(80) NOT NULL DEFAULT 'Website',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(220) NOT NULL,
  description TEXT,
  primary_image_url LONGTEXT,
  feature_image_url LONGTEXT,
  other_image_urls LONGTEXT,
  sold_out TINYINT(1) NOT NULL DEFAULT 0,
  category VARCHAR(60) NOT NULL DEFAULT 'car-parts',
  stock INT NOT NULL DEFAULT 0,
  sold INT NOT NULL DEFAULT 0,
  unit_price INT NOT NULL DEFAULT 0,
  make VARCHAR(100) NOT NULL DEFAULT '',
  model VARCHAR(100) NOT NULL DEFAULT '',
  year INT NOT NULL DEFAULT 0,
  `condition` VARCHAR(80) NOT NULL DEFAULT '',
  transmission VARCHAR(80) NOT NULL DEFAULT '',
  fuel_type VARCHAR(80) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS car_tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  body TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  image_url LONGTEXT,
  display_order INT NOT NULL DEFAULT 999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS store_highlights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  summary TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  cta_label VARCHAR(100) NOT NULL DEFAULT 'Browse Store',
  cta_href VARCHAR(200) NOT NULL DEFAULT '/sales',
  display_order INT NOT NULL DEFAULT 999,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspector_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(80) NOT NULL DEFAULT '',
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  company_address TEXT,
  signature_data_url LONGTEXT,
  company_logo_data_url LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL DEFAULT '',
  inspector_name VARCHAR(160) NOT NULL DEFAULT '',
  vehicle_label VARCHAR(220) NOT NULL DEFAULT '',
  vehicle_reg_no VARCHAR(80) NOT NULL DEFAULT '',
  vin VARCHAR(40) NOT NULL DEFAULT '',
  mileage VARCHAR(80) NOT NULL DEFAULT '',
  transmission VARCHAR(80) NOT NULL DEFAULT '',
  fuel_type VARCHAR(80) NOT NULL DEFAULT '',
  inspected_at VARCHAR(80) NOT NULL,
  checklist LONGTEXT,
  images LONGTEXT,
  overall_verdict VARCHAR(80) NOT NULL DEFAULT 'Pending',
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inspection_account FOREIGN KEY (account_id) REFERENCES inspector_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(40) NOT NULL,
  subject_id VARCHAR(120) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  replaced_by_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_subject ON refresh_tokens(role, subject_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_email ON password_reset_otps(email);
CREATE INDEX idx_password_reset_expires ON password_reset_otps(expires_at);

INSERT INTO store_highlights (title, summary, category, cta_label, cta_href, display_order)
SELECT 'Vehicles', 'Inspected sedans, SUVs, and premium options ready for immediate delivery.', 'Vehicles', 'Browse Vehicles', '/sales#products', 1
WHERE NOT EXISTS (SELECT 1 FROM store_highlights);

INSERT INTO store_highlights (title, summary, category, cta_label, cta_href, display_order)
SELECT 'Car Parts', 'OEM-grade parts including brake kits, filters, batteries, and service components.', 'Car Parts', 'Browse Parts', '/sales#products', 2
WHERE (SELECT COUNT(*) FROM store_highlights) < 2;

INSERT INTO store_highlights (title, summary, category, cta_label, cta_href, display_order)
SELECT 'Accessories', 'Dash cams, seat covers, phone mounts, and practical interior upgrades.', 'Accessories', 'Browse Accessories', '/sales#products', 3
WHERE (SELECT COUNT(*) FROM store_highlights) < 3;
