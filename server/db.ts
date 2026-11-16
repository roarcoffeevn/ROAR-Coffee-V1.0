import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'roar_coffee.db');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'b2b_partner', 'admin')),
      member_code TEXT NOT NULL UNIQUE,
      tier TEXT NOT NULL DEFAULT 'ROAR Member',
      email_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      reset_token TEXT,
      reset_expires INTEGER,
      addresses_json TEXT NOT NULL DEFAULT '[]',
      notification_prefs_json TEXT NOT NULL DEFAULT '{"email_orders":true,"email_offers":true,"zalo_updates":false}',
      privacy_prefs_json TEXT NOT NULL DEFAULT '{"marketing_consent":false,"analytics_consent":true}',
      deletion_requested INTEGER NOT NULL DEFAULT 0,
      company_name TEXT DEFAULT '',
      b2b_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('roasted', 'green_bean', 'instant')),
      sub_category TEXT DEFAULT '',
      name_vi TEXT NOT NULL,
      name_en TEXT NOT NULL,
      subtitle_vi TEXT DEFAULT '',
      subtitle_en TEXT DEFAULT '',
      description_vi TEXT NOT NULL,
      description_en TEXT NOT NULL,
      coffee_type TEXT NOT NULL,
      blend_summary_vi TEXT DEFAULT '',
      blend_summary_en TEXT DEFAULT '',
      blend_public INTEGER NOT NULL DEFAULT 1,
      roast_profile_vi TEXT DEFAULT '',
      roast_profile_en TEXT DEFAULT '',
      tasting_notes_vi TEXT DEFAULT '',
      tasting_notes_en TEXT DEFAULT '',
      brewing_methods_json TEXT NOT NULL DEFAULT '[]',
      variants_json TEXT NOT NULL DEFAULT '[]',
      packaging_options_json TEXT NOT NULL DEFAULT '[]',
      price_vnd INTEGER NOT NULL DEFAULT 0,
      price_usd REAL NOT NULL DEFAULT 0,
      inventory INTEGER NOT NULL DEFAULT 0,
      moq TEXT DEFAULT '1',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'configurable_on_request', 'out_of_stock', 'draft')),
      is_demo_data INTEGER NOT NULL DEFAULT 1,
      mascot_slug TEXT DEFAULT '',
      screen_size TEXT DEFAULT '',
      processing_method TEXT DEFAULT '',
      origin_region TEXT DEFAULT '',
      harvest_year TEXT DEFAULT 'Pending verified lot',
      moisture_content TEXT DEFAULT 'Pending verified COA',
      density TEXT DEFAULT 'Pending verified COA',
      defect_info TEXT DEFAULT 'Pending verified COA',
      grading_spec TEXT DEFAULT 'TCVN / Export grade configurable',
      image_key TEXT NOT NULL DEFAULT 'product_robusta_house',
      gallery_images_json TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      verified_purchase INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'VND',
      subtotal INTEGER NOT NULL,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      points_redeemed INTEGER NOT NULL DEFAULT 0,
      points_discount INTEGER NOT NULL DEFAULT 0,
      shipping_fee INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      voucher_code TEXT DEFAULT '',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
      order_status TEXT NOT NULL DEFAULT 'Pending' CHECK(order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipping', 'Completed', 'Cancelled', 'Returned')),
      tracking_code TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      points_awarded INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      sku TEXT NOT NULL,
      product_name_vi TEXT NOT NULL,
      product_name_en TEXT NOT NULL,
      variant_label TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price_vnd INTEGER NOT NULL,
      line_total_vnd INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS points_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      entry_type TEXT NOT NULL CHECK(entry_type IN ('earn_pending', 'earn_available', 'redeem', 'reverse', 'expire', 'admin_adjustment')),
      points INTEGER NOT NULL,
      description_vi TEXT NOT NULL,
      description_en TEXT NOT NULL,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS loyalty_settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      points_per_10k_vnd INTEGER NOT NULL DEFAULT 1,
      vnd_per_point INTEGER NOT NULL DEFAULT 100,
      expiration_days INTEGER NOT NULL DEFAULT 365,
      max_redeem_percent INTEGER NOT NULL DEFAULT 30,
      policy_status TEXT NOT NULL DEFAULT 'Proposed / Configurable Policy',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS membership_tiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      min_spend_vnd INTEGER NOT NULL DEFAULT 0,
      point_multiplier REAL NOT NULL DEFAULT 1.0,
      qualification_months INTEGER NOT NULL DEFAULT 12,
      benefits_vi TEXT NOT NULL,
      benefits_en TEXT NOT NULL,
      early_access INTEGER NOT NULL DEFAULT 0,
      birthday_reward_code TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_vi TEXT NOT NULL,
      description_en TEXT NOT NULL,
      promo_type TEXT NOT NULL,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percent', 'fixed', 'free_shipping')),
      discount_value INTEGER NOT NULL DEFAULT 0,
      max_discount INTEGER NOT NULL DEFAULT 0,
      min_order_value INTEGER NOT NULL DEFAULT 0,
      eligible_category TEXT NOT NULL DEFAULT 'all',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      usage_limit INTEGER NOT NULL DEFAULT 1000,
      used_count INTEGER NOT NULL DEFAULT 0,
      per_customer_limit INTEGER NOT NULL DEFAULT 1,
      combinable INTEGER NOT NULL DEFAULT 0,
      member_only INTEGER NOT NULL DEFAULT 0,
      min_tier TEXT DEFAULT '',
      terms_vi TEXT NOT NULL,
      terms_en TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS b2b_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inquiry_type TEXT NOT NULL CHECK(inquiry_type IN ('sample_request', 'green_quotation', 'wholesale_partner', 'horeca', 'oem_private_label', 'export_inquiry', 'corporate_gifting', 'contact')),
      company_name TEXT DEFAULT '',
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      country TEXT DEFAULT 'Vietnam',
      business_type TEXT DEFAULT '',
      product_sku TEXT DEFAULT '',
      packaging_option TEXT DEFAULT '',
      estimated_volume TEXT DEFAULT '',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'reviewing', 'quoted', 'closed')),
      admin_notes TEXT DEFAULT '',
      quoted_price TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coffee_origins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      region_name_vi TEXT NOT NULL,
      region_name_en TEXT NOT NULL,
      localities_vi TEXT NOT NULL,
      localities_en TEXT NOT NULL,
      elevation TEXT NOT NULL,
      varieties TEXT NOT NULL,
      processing_methods TEXT NOT NULL,
      sourcing_status TEXT NOT NULL CHECK(sourcing_status IN ('confirmed_sourcing', 'general_geography')),
      characteristics_vi TEXT NOT NULL,
      characteristics_en TEXT NOT NULL,
      sourcing_note_vi TEXT NOT NULL,
      sourcing_note_en TEXT NOT NULL,
      map_x REAL NOT NULL,
      map_y REAL NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      image_key TEXT NOT NULL,
      photo_attribution TEXT NOT NULL,
      related_skus_json TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS personalities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      animal_en TEXT NOT NULL,
      animal_vi TEXT NOT NULL,
      traits_vi TEXT NOT NULL,
      traits_en TEXT NOT NULL,
      story_vi TEXT NOT NULL,
      story_en TEXT NOT NULL,
      product_association_vi TEXT NOT NULL,
      product_association_en TEXT NOT NULL,
      associated_product_slug TEXT DEFAULT '',
      is_future_collection INTEGER NOT NULL DEFAULT 0,
      image_key TEXT NOT NULL,
      custom_image_url TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS journal_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL DEFAULT '[]',
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      excerpt_vi TEXT NOT NULL,
      excerpt_en TEXT NOT NULL,
      content_vi TEXT NOT NULL,
      content_en TEXT NOT NULL,
      author TEXT NOT NULL,
      read_minutes INTEGER NOT NULL DEFAULT 4,
      image_key TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      published_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      lang TEXT NOT NULL DEFAULT 'vi',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL DEFAULT '',
      alt_text TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
      size_bytes INTEGER NOT NULL DEFAULT 0,
      source_type TEXT NOT NULL DEFAULT 'uploaded' CHECK(source_type IN ('uploaded', 'builtin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title_vi TEXT NOT NULL,
      title_en TEXT NOT NULL,
      message_vi TEXT NOT NULL,
      message_en TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'system' CHECK(category IN ('order', 'promo', 'loyalty', 'system')),
      link_url TEXT DEFAULT '/account',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT DEFAULT '',
      details_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
  runIncrementalMigrations();
}

function seedInitialData(): void {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, member_code, tier, email_verified, addresses_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(
      'admin@roarcoffee.vn',
      hashPassword('RoarAdmin!2026'),
      'ROAR COFFEE Administrator',
      '+84 28 0000 0000',
      'admin',
      'RC-ADM-0001',
      'ROAR Reserve',
      1,
      JSON.stringify([])
    );
    insertUser.run(
      'member@roarcoffee.vn',
      hashPassword('RoarMember!2026'),
      'Nguyễn Minh Khôi',
      '0909 123 456',
      'customer',
      'RC-MEM-1001',
      'ROAR Silver',
      1,
      JSON.stringify([
        {
          id: 'addr-1',
          label: 'Văn phòng Quận 1',
          recipient: 'Nguyễn Minh Khôi',
          phone: '0909 123 456',
          addressLine: '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ])
    );
  }

  const loyaltyCount = (db.prepare('SELECT COUNT(*) as c FROM loyalty_settings').get() as { c: number }).c;
  if (loyaltyCount === 0) {
    db.prepare(`
      INSERT INTO loyalty_settings (id, points_per_10k_vnd, vnd_per_point, expiration_days, max_redeem_percent, policy_status)
      VALUES (1, 1, 100, 365, 30, 'Proposed / Configurable Policy')
    `).run();
  }

  const tierCount = (db.prepare('SELECT COUNT(*) as c FROM membership_tiers').get() as { c: number }).c;
  if (tierCount === 0) {
    const insertTier = db.prepare(`
      INSERT INTO membership_tiers (name, min_spend_vnd, point_multiplier, qualification_months, benefits_vi, benefits_en, early_access, birthday_reward_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTier.run(
      'ROAR Member',
      0,
      1.0,
      12,
      'Tích điểm cơ bản theo chính sách đề xuất · Ưu đãi chào mừng thành viên mới',
      'Standard points earning under proposed rules · Welcome member voucher access',
      0,
      'ROARBDAY'
    );
    insertTier.run(
      'ROAR Silver',
      3000000,
      1.25,
      12,
      'Hệ số điểm 1.25x (cấu hình) · Voucher sinh nhật · Miễn phí giao hàng đơn từ ngưỡng quy định',
      '1.25x configurable point multiplier · Birthday reward · Priority seasonal offers',
      0,
      'ROARBDAY'
    );
    insertTier.run(
      'ROAR Gold',
      10000000,
      1.5,
      12,
      'Hệ số điểm 1.5x (cấu hình) · Tiếp cận sớm các lô rang mới · Sự kiện thử nếm thành viên',
      '1.5x configurable point multiplier · Early product access · Member cupping invitations',
      1,
      'ROARBDAY'
    );
    insertTier.run(
      'ROAR Reserve',
      25000000,
      2.0,
      12,
      'Hệ số điểm 2.0x (cấu hình) · Đặc quyền Signature Reserve · Tư vấn quà tặng doanh nghiệp riêng',
      '2.0x configurable point multiplier · Signature Reserve privileges · Dedicated gifting concierge',
      1,
      'ROARBDAY'
    );
  }

  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
  if (productCount === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        slug, sku, category, sub_category, name_vi, name_en, subtitle_vi, subtitle_en,
        description_vi, description_en, coffee_type, blend_summary_vi, blend_summary_en, blend_public,
        roast_profile_vi, roast_profile_en, tasting_notes_vi, tasting_notes_en,
        brewing_methods_json, variants_json, packaging_options_json,
        price_vnd, price_usd, inventory, moq, status, is_demo_data,
        mascot_slug, screen_size, processing_method, origin_region,
        harvest_year, moisture_content, density, defect_info, grading_spec, image_key, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Roasted Coffee Lines (6 flagship products)
    insertProduct.run(
      'robusta-house-blend',
      'RC-RST-RHB',
      'roasted',
      'House Collection',
      'ROAR COFFEE ROBUSTA HOUSE BLEND',
      'ROAR COFFEE ROBUSTA HOUSE BLEND',
      '100% Robusta Việt Nam · Nguyên liệu nhân xanh CBU chọn lọc',
      '100% Vietnamese Robusta · Selected CBU green coffee ingredient',
      'Dòng cà phê rang xay 100% Robusta Việt Nam được thiết kế cho nhịp sống thưởng thức cà phê hằng ngày, sử dụng nguồn nhân xanh chế biến ướt CBU khi được chỉ định, phù hợp pha phin truyền thống và các phương pháp pha chế được khuyến nghị.',
      '100% Vietnamese Robusta roasted coffee crafted for daily coffee rituals, incorporating specified CBU washed green coffee ingredients and tailored for traditional Vietnamese phin and approved brewing methods.',
      '100% Robusta',
      '100% Robusta (Thành phần nhân xanh CBU theo quy chuẩn ROAR COFFEE)',
      '100% Robusta (CBU washed green coffee component where specified)',
      1,
      'Rang vừa – đậm (Cấu hình theo lô rang xác thực)',
      'Medium-Dark Roast (Per verified roast profile)',
      'Hồ sơ hương vị đang chờ cập nhật từ kết quả thử nếm chính thức',
      'Verified cupping notes pending official sensory sign-off',
      JSON.stringify(['Vietnamese Phin', 'Espresso', 'Moka Pot']),
      JSON.stringify([
        { label: '250g · Whole Bean', priceVnd: 185000, priceUsd: 7.5 },
        { label: '250g · Phin Ground', priceVnd: 185000, priceUsd: 7.5 },
        { label: '500g · Whole Bean', priceVnd: 350000, priceUsd: 14.0 },
        { label: '1kg · HORECA Pack', priceVnd: 660000, priceUsd: 26.5 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      185000,
      7.5,
      120,
      '1 bag (Demo)',
      'active',
      1,
      'tiger',
      'S16/S18',
      'CBU / Washed',
      'Tây Nguyên (Đắk Lắk)',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Roasted spec configurable',
      'ROAR Roasted Standard',
      'product_robusta_house',
      1
    );

    insertProduct.run(
      'arabica-selection',
      'RC-RST-ARS',
      'roasted',
      'Specialty Selection',
      'ROAR COFFEE ARABICA SELECTION',
      'ROAR COFFEE ARABICA SELECTION',
      '100% Arabica tuyển chọn · Nguyên liệu nhân xanh CBU',
      '100% Selected Arabica · CBU green coffee ingredient',
      'Dòng cà phê 100% Arabica tuyển chọn với nguyên liệu nhân xanh CBU khi được chỉ định, mang đến trải nghiệm tinh tế cho pha giấy lọc Pour-over và Espresso theo cấu hình rang chuẩn.',
      '100% selected Arabica coffee utilizing CBU green coffee ingredients where specified, delivering a refined coffee experience suited for filter pour-over and espresso according to the final roast profile.',
      '100% Arabica',
      '100% Arabica (Nhân xanh chế biến ướt CBU theo lô xác thực)',
      '100% Arabica (CBU washed green coffee component where specified)',
      1,
      'Rang vừa (Medium Roast)',
      'Medium Roast (Configurable per final profile)',
      'Hồ sơ hương vị đang chờ xác nhận từ đội ngũ thử nếm',
      'Tasting notes awaiting verified cupping panel approval',
      JSON.stringify(['Pour-over', 'Espresso', 'French Press', 'Cold Brew']),
      JSON.stringify([
        { label: '250g · Whole Bean', priceVnd: 265000, priceUsd: 10.8 },
        { label: '250g · Filter Ground', priceVnd: 265000, priceUsd: 10.8 },
        { label: '500g · Whole Bean', priceVnd: 510000, priceUsd: 20.5 },
        { label: '1kg · Barista Pack', priceVnd: 980000, priceUsd: 39.0 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      265000,
      10.8,
      85,
      '1 bag (Demo)',
      'active',
      1,
      'fox',
      'S16/S18',
      'CBU / Washed',
      'Lâm Đồng (Cầu Đất)',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Roasted spec configurable',
      'ROAR Roasted Standard',
      'product_arabica_selection',
      1
    );

    insertProduct.run(
      'signature-reserve',
      'RC-RST-SGR',
      'roasted',
      'Reserve Luxury',
      'ROAR COFFEE SIGNATURE RESERVE',
      'ROAR COFFEE SIGNATURE RESERVE',
      '60% Robusta · 20% Culi · 20% Arabica · Linh vật Báo Đen',
      '60% Robusta · 20% Culi · 20% Arabica · Black Panther Edition',
      'Phiên bản cao cấp mang biểu tượng Báo Đen — Quý hiếm, bí ẩn, tinh tế và khác biệt. Công thức phối trộn đã được phê duyệt gồm 60% Robusta, 20% Culi và 20% Arabica sử dụng nguyên liệu nhân xanh CBU theo tiêu chuẩn riêng, hoàn hảo làm quà tặng sang trọng.',
      'Our flagship luxury edition embodied by the Black Panther — Exclusive, mysterious, sophisticated, and distinct. Approved composition of 60% Robusta, 20% Culi, and 20% Arabica with specified CBU green coffee ingredients, presented in obsidian black and champagne gold.',
      '60% Robusta · 20% Culi · 20% Arabica',
      '60% Robusta · 20% Culi · 20% Arabica (Nhân xanh CBU theo chỉ định)',
      '60% Robusta · 20% Culi · 20% Arabica (CBU green coffee ingredients as specified)',
      1,
      'Rang tinh chỉnh Signature Reserve',
      'Signature Reserve Precision Roast',
      'Hương vị phức hợp cân bằng · Chi tiết thử nếm chính thức cập nhật theo lô phát hành',
      'Structured luxury profile · Verified sensory notes published per lot release',
      JSON.stringify(['Espresso', 'Vietnamese Phin', 'Pour-over']),
      JSON.stringify([
        { label: '250g · Signature Tin (Whole Bean)', priceVnd: 490000, priceUsd: 20.0 },
        { label: '500g · Obsidian Gift Box', priceVnd: 920000, priceUsd: 37.5 },
        { label: 'Corporate Gift Set (2 x 250g)', priceVnd: 1150000, priceUsd: 46.5 },
      ]),
      JSON.stringify(['250g Tin', '500g Box', 'Corporate Gift Set']),
      490000,
      20.0,
      48,
      '1 tin (Demo)',
      'active',
      1,
      'black-panther',
      'S18 Selected',
      'CBU / Washed Reserve',
      'Tây Nguyên (Đắk Lắk & Lâm Đồng)',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Reserve Lot Spec',
      'Signature Reserve Standard',
      'product_signature_reserve',
      1
    );

    insertProduct.run(
      'roar-dam-bold',
      'RC-RST-DAM',
      'roasted',
      'Personality Line',
      'ROAR COFFEE ĐẬM',
      'ROAR COFFEE ĐẬM (BOLD EDITION)',
      'Cá tính Hổ · Mạnh mẽ, quyết đoán, bản lĩnh',
      'Tiger Character · Boldness, Strength, Determination',
      'Sản phẩm gắn liền với linh vật Hổ trong bộ sưu tập 7 Cá Tính, dành cho người yêu phong cách cà phê mạnh mẽ, quyết đoán và đậm bản lĩnh. Tỷ lệ phối trộn nội bộ được bảo mật theo quy định thương hiệu.',
      'Associated with the Tiger character in the Seven Personalities collection, crafted for coffee drinkers who value boldness, strength, and determination. Confidential blend proportions are protected unless approved for disclosure.',
      'Proprietary Blend',
      'Công thức phối trộn bảo mật (Tỷ lệ chi tiết chỉ công bố khi được phê duyệt)',
      'Confidential blend formulation (Exact percentages withheld per brand policy)',
      0,
      'Rang đậm (Dark Roast)',
      'Dark Roast',
      'Hồ sơ hương vị đang chờ xác nhận công bố chính thức',
      'Verified tasting notes pending publication approval',
      JSON.stringify(['Vietnamese Phin', 'Iced Milk Coffee']),
      JSON.stringify([
        { label: '250g · Whole Bean', priceVnd: 195000, priceUsd: 7.9 },
        { label: '250g · Phin Ground', priceVnd: 195000, priceUsd: 7.9 },
        { label: '500g · Phin Ground', priceVnd: 370000, priceUsd: 15.0 },
      ]),
      JSON.stringify(['250g', '500g']),
      195000,
      7.9,
      90,
      '1 bag (Demo)',
      'active',
      1,
      'tiger',
      'S16/S18',
      'Configurable',
      'Tây Nguyên',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Confidential',
      'ROAR Roasted Standard',
      'product_robusta_house',
      0
    );

    insertProduct.run(
      'roar-phin-heritage',
      'RC-RST-PHN',
      'roasted',
      'Personality Line',
      'ROAR COFFEE PHIN',
      'ROAR COFFEE PHIN',
      'Cá tính Sư Tử · Lãnh đạo, tự tin, uy nghi',
      'Lion Character · Leadership, Confidence, Authority',
      'Dòng cà phê tôn vinh văn hóa pha phin Việt Nam gắn với hình tượng Sư Tử — biểu trưng cho sự tự tin, uy nghi và tinh thần dẫn dắt.',
      'Honoring authentic Vietnamese phin coffee culture through the Lion character — symbolizing leadership, confidence, and quiet authority.',
      'Proprietary Phin Blend',
      'Công thức phối trộn dành riêng cho pha Phin (Bảo mật tỷ lệ)',
      'Proprietary Phin formulation (Confidential blend ratio)',
      0,
      'Rang chuẩn pha Phin',
      'Phin Traditional Roast',
      'Cấu trúc dày dặn cho pha phin · Chờ cập nhật ghi chú thử nếm xác thực',
      'Structured for slow phin extraction · Verified sensory notes pending',
      JSON.stringify(['Vietnamese Phin']),
      JSON.stringify([
        { label: '250g · Phin Ground', priceVnd: 210000, priceUsd: 8.5 },
        { label: '500g · Phin Ground', priceVnd: 395000, priceUsd: 16.0 },
      ]),
      JSON.stringify(['250g', '500g']),
      210000,
      8.5,
      75,
      '1 bag (Demo)',
      'active',
      1,
      'lion',
      'S16/S18',
      'Configurable',
      'Tây Nguyên',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Confidential',
      'ROAR Roasted Standard',
      'product_robusta_house',
      0
    );

    insertProduct.run(
      'roar-espresso',
      'RC-RST-ESP',
      'roasted',
      'Personality Line',
      'ROAR COFFEE ESPRESSO',
      'ROAR COFFEE ESPRESSO',
      'Cá tính Cáo (Fox) · Thông minh, linh hoạt, sáng tạo',
      'Fox Character · Intelligence, Agility, Creativity',
      'Dòng cà phê rang xay chuyên biệt cho máy pha Espresso hiện đại và pha phin tinh chỉnh, gắn với hình tượng Cáo — biểu trưng cho tư duy linh hoạt, sự chính xác và sáng tạo mỗi ngày.',
      'Dedicated roasted blend engineered for modern espresso bars and agile daily extraction, embodied by the Fox — representing sharp intellect, agility, and creative craft.',
      'Proprietary Espresso Blend',
      'Công thức phối trộn Espresso chuẩn cân bằng (Tỷ lệ chi tiết bảo mật)',
      'Balanced Espresso formulation (Confidential blend percentages)',
      0,
      'Rang Espresso vừa-đậm (Medium-Dark Espresso)',
      'Medium-Dark Espresso Roast',
      'Crema ổn định, cân bằng cho Espresso 18g → 36g · Ghi chú hương vị cập nhật theo lô xác thực',
      'Stable crema balanced for 18g → 36g extraction · Verified cupping notes per batch',
      JSON.stringify(['Espresso', 'Moka Pot', 'Cold Brew']),
      JSON.stringify([
        { label: '250g · Whole Bean', priceVnd: 195000, priceUsd: 7.9 },
        { label: '250g · Espresso Fine Ground', priceVnd: 195000, priceUsd: 7.9 },
        { label: '500g · Whole Bean', priceVnd: 380000, priceUsd: 15.5 },
        { label: '1kg · Barista Pack', priceVnd: 720000, priceUsd: 29.0 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      195000,
      7.9,
      88,
      '1 bag (Demo)',
      'active',
      1,
      'fox',
      'S16/S18',
      'Configurable',
      'Tây Nguyên (Đắk Lắk & Lâm Đồng)',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Confidential',
      'ROAR Espresso Standard',
      'product_arabica_selection',
      1
    );

    insertProduct.run(
      'roar-espresso-gold',
      'RC-RST-ESG',
      'roasted',
      'Personality Line',
      'ROAR COFFEE ESPRESSO GOLD',
      'ROAR COFFEE ESPRESSO GOLD',
      'Cá tính Đại Bàng (Eagle) · Tầm nhìn, tham vọng, bứt phá',
      'Eagle Character · Vision, Ambition, Excellence',
      'Phiên bản Espresso Gold cao cấp gắn với hình tượng Đại Bàng — đại diện cho khát vọng bứt phá và tiêu chuẩn chiết xuất khắt khe tại các quầy pha chế chuyên nghiệp và chuỗi HORECA.',
      'Elevated Espresso Gold edition anchored by the Eagle character — celebrating international vision, elevated hospitality standards, and high-clarity espresso extraction.',
      'Premium Espresso Gold Blend',
      'Công thức Espresso Gold tuyển chọn (Tỷ lệ chi tiết bảo mật)',
      'Selected Espresso Gold formulation (Confidential proportions)',
      0,
      'Rang Espresso Gold tinh chỉnh',
      'Precision Espresso Gold Roast',
      'Chiết xuất dày mượt 18g → 36g ở 90–94°C · Cập nhật thử nếm theo từng lô phát hành',
      'Dense, velvety 18g → 36g extraction at 90–94°C · Cupping notes updated per verified lot',
      JSON.stringify(['Espresso', 'Moka Pot']),
      JSON.stringify([
        { label: '250g · Whole Bean (Gold)', priceVnd: 235000, priceUsd: 9.5 },
        { label: '500g · Whole Bean (Gold)', priceVnd: 440000, priceUsd: 17.8 },
        { label: '1kg · HORECA Gold Pack', priceVnd: 840000, priceUsd: 34.0 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      235000,
      9.5,
      64,
      '1 bag (Demo)',
      'active',
      1,
      'eagle',
      'S18 Selected',
      'CBU / Washed & Honey',
      'Lâm Đồng & Đắk Lắk',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Confidential',
      'ROAR Espresso Gold Standard',
      'hero_signature_reserve_banner',
      1
    );

    // 2. Instant Coffee Collections (Silver & Gold)
    insertProduct.run(
      'instant-silver-collection',
      'RC-INS-SLV',
      'instant',
      'Instant Collection',
      'ROAR COFFEE HÒA TAN — BỘ SƯU TẬP SILVER',
      'ROAR COFFEE INSTANT — SILVER COLLECTION',
      'Sắc xanh rừng đặc trưng kết hợp điểm nhấn ánh bạc tinh gọn',
      'Signature forest green identity with brushed silver accents',
      'Bộ sưu tập cà phê hòa tan Silver trong bao bì hộp ngang thanh lịch, giữ trọn bản sắc xanh rừng của ROAR COFFEE cùng tiện ích pha chế nhanh mọi lúc mọi nơi. Thông số công thức và định lượng chi tiết hiển thị theo hồ sơ xác nhận.',
      'The Instant Silver Collection in an architectural horizontal box pairing ROAR COFFEE forest green with silver accents. Exact formulation, stick count, and net weight fields are configurable pending final commercial specification.',
      'Instant Coffee Blend',
      'Công thức hòa tan Silver (Cập nhật theo hồ sơ công bố sản phẩm)',
      'Silver instant formulation (Pending final verified product sheet)',
      0,
      'Phun sấy / Hòa tan',
      'Instant Soluble Process',
      'Tiện lợi hằng ngày · Định lượng theo quy cách hộp',
      'Everyday convenience · Specifications per confirmed packaging run',
      JSON.stringify(['Hot Water (70–80°C)', 'Iced Coffee']),
      JSON.stringify([
        { label: 'Box 10 Sticks (Configurable Spec)', priceVnd: 95000, priceUsd: 3.9 },
        { label: 'Box 20 Sticks (Configurable Spec)', priceVnd: 175000, priceUsd: 7.2 },
      ]),
      JSON.stringify(['10 Sticks Box', '20 Sticks Box']),
      95000,
      3.9,
      140,
      '1 box (Demo)',
      'active',
      1,
      'fox',
      'N/A',
      'Soluble Instant',
      'Việt Nam',
      'Pending verified batch',
      '≤ 4.0% (Configurable)',
      'N/A',
      'Pending confirmed sheet',
      'Net weight & ingredients pending final label confirmation',
      'product_instant_silver_gold',
      1
    );

    insertProduct.run(
      'instant-gold-collection',
      'RC-INS-GLD',
      'instant',
      'Instant Collection',
      'ROAR COFFEE HÒA TAN — BỘ SƯU TẬP GOLD',
      'ROAR COFFEE INSTANT — GOLD COLLECTION',
      'Sắc xanh rừng sang trọng kết hợp ánh vàng Champagne Gold',
      'Forest green packaging accented with champagne gold metallic detailing',
      'Bộ sưu tập cà phê hòa tan Gold cao cấp với thiết kế hộp ngang sang trọng, hướng đến trải nghiệm đậm đà tinh tế cho doanh nhân, văn phòng và quà tặng.',
      'The premium Instant Gold Collection combining ROAR COFFEE forest green with champagne gold foil aesthetics for discerning daily rituals, hospitality rooms, and gifting.',
      'Premium Instant Coffee',
      'Công thức hòa tan Gold (Cập nhật theo hồ sơ công bố chính thức)',
      'Gold instant formulation (Pending final verified product sheet)',
      0,
      'Hòa tan cao cấp',
      'Premium Soluble Process',
      'Hồ sơ hương vị đang chờ cập nhật từ bản công bố chính thức',
      'Sensory details awaiting confirmed production specification',
      JSON.stringify(['Hot Water (70–80°C)', 'Iced Coffee']),
      JSON.stringify([
        { label: 'Gold Box 10 Sticks (Configurable Spec)', priceVnd: 135000, priceUsd: 5.5 },
        { label: 'Gold Box 20 Sticks (Configurable Spec)', priceVnd: 245000, priceUsd: 9.9 },
      ]),
      JSON.stringify(['10 Sticks Gold Box', '20 Sticks Gold Box']),
      135000,
      5.5,
      110,
      '1 box (Demo)',
      'active',
      1,
      'eagle',
      'N/A',
      'Soluble Instant',
      'Việt Nam',
      'Pending verified batch',
      '≤ 4.0% (Configurable)',
      'N/A',
      'Pending confirmed sheet',
      'Net weight & ingredients pending final label confirmation',
      'product_instant_silver_gold',
      1
    );

    // 3. Full 27-Combination Green Coffee Matrix (3 species/morphology x 3 screens x 3 processes)
    const types = [
      { code: 'RO', nameEn: 'Robusta', nameVi: 'Robusta', origin: 'Đắk Lắk / Gia Lai / Đắk Nông', baseVnd: 115000, baseUsd: 4.6 },
      { code: 'AR', nameEn: 'Arabica', nameVi: 'Arabica', origin: 'Lâm Đồng (Cầu Đất / Đà Lạt) / Sơn La', baseVnd: 185000, baseUsd: 7.4 },
      { code: 'CU', nameEn: 'Culi / Peaberry', nameVi: 'Culi / Peaberry', origin: 'Tây Nguyên (Chọn lọc hạt tròn)', baseVnd: 145000, baseUsd: 5.8 },
    ];
    const screens = ['S14', 'S16', 'S18'];
    const processes = [
      { code: 'NAT', nameEn: 'Natural Process', nameVi: 'Chế biến khô (Natural)' },
      { code: 'HON', nameEn: 'Honey Process', nameVi: 'Chế biến Honey' },
      { code: 'CBU', nameEn: 'Washed Process (CBU)', nameVi: 'Chế biến ướt (CBU)' },
    ];

    for (const t of types) {
      for (const s of screens) {
        for (const p of processes) {
          const sku = `${t.code}-${s}-${p.code}`;
          const slug = `green-${t.code.toLowerCase()}-${s.toLowerCase()}-${p.code.toLowerCase()}`;
          // Only select primary S18/S16 lots are active reference listings; S14 and specialized lots are configurable on request
          const isPrimary = (s === 'S18' || (t.code === 'AR' && s === 'S16'));
          const status = isPrimary ? 'active' : 'configurable_on_request';
          const screenBonus = s === 'S18' ? 15000 : s === 'S16' ? 8000 : 0;
          const procBonus = p.code === 'CBU' ? 12000 : p.code === 'HON' ? 8000 : 0;
          const unitPriceVnd = t.baseVnd + screenBonus + procBonus;
          const unitPriceUsd = Number((unitPriceVnd / 25000).toFixed(2));

          insertProduct.run(
            slug,
            sku,
            'green_bean',
            t.nameEn,
            `Cà Phê Nhân Xanh ${t.nameVi} ${s} — ${p.nameVi}`,
            `Green Coffee ${t.nameEn} ${s} — ${p.nameEn}`,
            `Mã ${sku} · ${t.code === 'CU' ? 'Phân loại hình thái hạt đơn (Peaberry)' : 'Cà phê nhân xanh thương mại B2B'}`,
            `SKU ${sku} · ${t.code === 'CU' ? 'Bean morphology classification (Peaberry)' : 'B2B Commercial Green Coffee'}`,
            `Sản phẩm cà phê nhân xanh ${t.nameVi} kích thước sàng ${s}, phương pháp ${p.nameVi}. Mọi thông số độ ẩm, tỷ trọng, tỷ lệ lỗi và niên vụ chỉ được công bố chính thức khi có chứng thư kiểm định lô hàng xác thực.`,
            `${t.nameEn} green coffee beans graded to ${s} screen size using ${p.nameEn}. Moisture content, density, defect tolerance, and harvest year are published strictly upon verified lot lab certification.`,
            t.nameEn,
            `${t.nameEn} · ${s} · ${p.nameEn}`,
            `${t.nameEn} · ${s} · ${p.nameEn}`,
            1,
            'Nhân xanh chưa rang (Unroasted Green)',
            'Unroasted Green Beans',
            'Áp dụng thử nếm mẫu (Sample Cupping) theo từng lô cung ứng',
            'Sample cupping profile provided per verified export lot',
            JSON.stringify(['Commercial Roasting', 'Sample Roasting', 'Export Blending']),
            JSON.stringify([
              { label: 'Sample 1kg (Đánh giá mẫu)', priceVnd: unitPriceVnd * 2, priceUsd: Number((unitPriceUsd * 2).toFixed(2)) },
              { label: '30kg Bag (Báo giá theo kg)', priceVnd: unitPriceVnd, priceUsd: unitPriceUsd },
              { label: '60kg Jute / PP Bag', priceVnd: unitPriceVnd, priceUsd: unitPriceUsd },
              { label: '69kg Export Bag', priceVnd: unitPriceVnd, priceUsd: unitPriceUsd },
              { label: '1,000kg Big Bag (Container / Contract)', priceVnd: unitPriceVnd, priceUsd: unitPriceUsd },
            ]),
            JSON.stringify(['30kg', '60kg', '69kg', '1,000kg Big Bag']),
            unitPriceVnd,
            unitPriceUsd,
            isPrimary ? 2500 : 0,
            '30kg / Sample 1kg',
            status,
            1,
            '',
            s,
            p.code,
            t.origin,
            'Pending verified harvest lot / Chờ xác nhận niên vụ',
            'Pending verified COA / Chờ chứng thư độ ẩm',
            'Pending verified COA / Chờ đo tỷ trọng',
            'Pending verified COA / Chờ bảng kiểm lỗi',
            `Screen ${s} · ${p.code === 'CBU' ? 'CBU Washed Commercial Designation' : p.nameEn}`,
            'product_green_coffee_beans',
            sku === 'RO-S18-HON' || sku === 'AR-S16-CBU' ? 1 : 0
          );
        }
      }
    }
  }

  const originCount = (db.prepare('SELECT COUNT(*) as c FROM coffee_origins').get() as { c: number }).c;
  if (originCount === 0) {
    const insertOrigin = db.prepare(`
      INSERT INTO coffee_origins (
        slug, region_name_vi, region_name_en, localities_vi, localities_en,
        elevation, varieties, processing_methods, sourcing_status,
        characteristics_vi, characteristics_en, sourcing_note_vi, sourcing_note_en,
        map_x, map_y, latitude, longitude, image_key, photo_attribution, related_skus_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const o of VIETNAM_COFFEE_ORIGINS) {
      insertOrigin.run(
        o.slug,
        o.region_name_vi,
        o.region_name_en,
        o.localities_vi,
        o.localities_en,
        o.elevation,
        o.varieties,
        o.processing_methods,
        o.sourcing_status,
        o.characteristics_vi,
        o.characteristics_en,
        o.sourcing_note_vi,
        o.sourcing_note_en,
        o.map_x,
        o.map_y,
        o.latitude,
        o.longitude,
        o.image_key,
        o.photo_attribution,
        JSON.stringify(o.related_skus)
      );
    }
  }

  const persCount = (db.prepare('SELECT COUNT(*) as c FROM personalities').get() as { c: number }).c;
  if (persCount === 0) {
    const insertPers = db.prepare(`
      INSERT INTO personalities (
        slug, animal_en, animal_vi, traits_vi, traits_en, story_vi, story_en,
        product_association_vi, product_association_en, associated_product_slug,
        is_future_collection, image_key, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPers.run(
      'tiger',
      'Tiger',
      'Hổ',
      'Mạnh mẽ · Quyết đoán · Bản lĩnh',
      'Boldness · Strength · Determination',
      'Hổ đại diện cho nguồn năng lượng tiên phong và ý chí không lùi bước. Mỗi ngụm cà phê gắn với biểu tượng Hổ là lời khẳng định sức mạnh nội tại trước mọi thử thách.',
      'The Tiger embodies decisive momentum and unyielding courage — crafted for those who step into every morning with clarity, resolve, and bold presence.',
      'ROAR COFFEE ĐẬM',
      'ROAR COFFEE ĐẬM',
      'roar-dam-bold',
      0,
      'mascot_tiger',
      1
    );

    insertPers.run(
      'lion',
      'Lion',
      'Sư Tử',
      'Lãnh đạo · Tự tin · Uy nghi',
      'Leadership · Confidence · Authority',
      'Sư Tử tôn vinh phong thái điềm tĩnh của người dẫn đầu. Gắn liền với nét truyền thống của Phin Việt Nam, từng giọt cà phê chậm rãi mà đầy uy lực.',
      'The Lion honors the composed authority of true leadership, anchored in the patient, deliberate ritual of the traditional Vietnamese Phin.',
      'ROAR COFFEE PHIN',
      'ROAR COFFEE PHIN',
      'roar-phin-heritage',
      0,
      'mascot_lion',
      2
    );

    insertPers.run(
      'fox',
      'Fox',
      'Cáo',
      'Thông minh · Linh hoạt · Sáng tạo',
      'Intelligence · Agility · Creativity',
      'Cáo đại diện cho tư duy nhạy bén, khả năng thích ứng nhanh và những ý tưởng đột phá — đồng hành cùng phong cách Espresso hiện đại và nhịp sống sáng tạo.',
      'The Fox captures sharp intellect, creative agility, and modern adaptability — the natural companion to precision Espresso rituals.',
      'ROAR COFFEE ESPRESSO',
      'ROAR COFFEE ESPRESSO',
      'roar-espresso',
      0,
      'mascot_fox',
      3
    );

    insertPers.run(
      'eagle',
      'Eagle',
      'Đại Bàng',
      'Tầm nhìn · Tham vọng · Bứt phá',
      'Vision · Ambition · Excellence',
      'Đại Bàng nhìn xa vượt qua những giới hạn quen thuộc. Biểu tượng cho khát vọng vươn tầm quốc tế và chuẩn mực chiết xuất tinh hoa trong Espresso Gold.',
      'The Eagle sees beyond immediate horizons — representing international ambition, elevated standards, and the pursuit of excellence in Espresso Gold.',
      'ROAR COFFEE ESPRESSO GOLD',
      'ROAR COFFEE ESPRESSO GOLD',
      'roar-espresso-gold',
      0,
      'mascot_eagle',
      4
    );

    insertPers.run(
      'wolf',
      'Wolf',
      'Sói',
      'Độc lập · Kiên định · Bền bỉ',
      'Independence · Resilience · Determination',
      'Sói là biểu tượng của sự bền bỉ âm thầm, trung thành với giá trị cốt lõi và kiên định trên hành trình dài hơi. Thuộc bộ sưu tập tương lai đang được nghiên cứu phát triển.',
      'The Wolf stands for quiet endurance, loyalty to craft, and unshakeable resilience across long journeys. Reserved for an upcoming ROAR COFFEE collection.',
      'Bộ sưu tập tương lai (Sắp ra mắt)',
      'Future Collection (Coming Soon)',
      '',
      1,
      'mascot_wolf',
      5
    );

    insertPers.run(
      'owl',
      'Owl',
      'Cú Mèo',
      'Trí tuệ · Sâu sắc · Tinh tế · Chiêm nghiệm',
      'Wisdom · Insight · Refinement · Contemplation',
      'Cú Mèo đại diện cho trí tuệ tĩnh tại, sự thấu suốt và khả năng thưởng thức những tầng hương vị tinh tế nhất của hạt cà phê trong khoảnh khắc chiêm nghiệm sâu sắc.',
      'The Owl communicates calm intellect, depth, discernment, and a contemplative appreciation of nuanced coffee craftsmanship. Reserved for a future collection.',
      'Bộ sưu tập tương lai (Sắp ra mắt)',
      'Future Collection (Coming Soon)',
      '',
      1,
      'mascot_owl',
      6
    );

    insertPers.run(
      'black-panther',
      'Black Panther',
      'Báo Đen',
      'Quý hiếm · Bí ẩn · Tinh tế · Khác biệt',
      'Exclusivity · Mystery · Sophistication · Distinction',
      'Báo Đen là biểu tượng tối thượng của Signature Reserve: chuẩn mực sang trọng trong sắc đen huyền bí và vàng champagne, nơi 60% Robusta, 20% Culi và 20% Arabica hội tụ.',
      'The Black Panther embodies Signature Reserve: rare poise in obsidian black and champagne gold, uniting 60% Robusta, 20% Culi, and 20% Arabica.',
      'ROAR COFFEE SIGNATURE RESERVE',
      'ROAR COFFEE SIGNATURE RESERVE',
      'signature-reserve',
      0,
      'mascot_panther',
      7
    );
  }

  const promoCount = (db.prepare('SELECT COUNT(*) as c FROM promotions').get() as { c: number }).c;
  if (promoCount === 0) {
    const insertPromo = db.prepare(`
      INSERT INTO promotions (
        code, title_vi, title_en, description_vi, description_en,
        promo_type, discount_type, discount_value, max_discount, min_order_value,
        eligible_category, start_date, end_date, usage_limit, used_count,
        per_customer_limit, combinable, member_only, min_tier, terms_vi, terms_en, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPromo.run(
      'ROARWELCOME10',
      'Ưu đãi Chào Thành Viên Mới — Giảm 10%',
      'New Member Welcome — 10% Off',
      'Giảm 10% (tối đa 100.000đ) cho đơn hàng cà phê rang xay hoặc hòa tan đầu tiên từ 300.000đ.',
      'Enjoy 10% off (up to 100,000 VND) on your first roasted or instant coffee order over 300,000 VND.',
      'welcome',
      'percent',
      10,
      100000,
      300000,
      'roasted',
      '2026-01-01',
      '2027-12-31',
      1000,
      12,
      1,
      0,
      0,
      '',
      'Áp dụng cho sản phẩm cà phê rang xay. Không áp dụng cộng dồn với mã giảm giá khác.',
      'Valid on roasted coffee collections. Cannot be combined with other promotional codes.',
      1
    );

    insertPromo.run(
      'ROARFREESHIP',
      'Miễn Phí Vận Chuyển Đơn Từ 500.000đ',
      'Complimentary Shipping Over 500,000 VND',
      'Hỗ trợ miễn phí giao hàng tiêu chuẩn toàn quốc (tối đa 35.000đ) cho mọi đơn hàng bán lẻ từ 500.000đ.',
      'Complimentary standard domestic shipping (up to 35,000 VND) on retail orders from 500,000 VND.',
      'free_shipping',
      'free_shipping',
      35000,
      35000,
      500000,
      'all',
      '2026-01-01',
      '2027-12-31',
      5000,
      24,
      5,
      1,
      0,
      '',
      'Áp dụng cho tất cả đơn hàng tiêu chuẩn tại Việt Nam.',
      'Valid for standard domestic deliveries across Vietnam.',
      1
    );

    insertPromo.run(
      'RESERVEGOLD15',
      'Đặc Quyền Hạng Thành Viên — Giảm 15% Signature Reserve',
      'Member Privilege — 15% Off Signature Reserve',
      'Ưu đãi dành riêng cho thành viên ROAR Silver trở lên khi đặt mua Signature Reserve hoặc hộp quà tặng.',
      'Exclusive to ROAR Silver tier and above on Signature Reserve tins and presentation boxes.',
      'member_only',
      'percent',
      15,
      200000,
      450000,
      'roasted',
      '2026-01-01',
      '2027-12-31',
      500,
      4,
      2,
      0,
      1,
      'ROAR Silver',
      'Yêu cầu đăng nhập tài khoản ROAR COFFEE Members từ hạng Silver trở lên.',
      'Requires signed-in ROAR COFFEE Member account at Silver tier or higher.',
      1
    );

    // Expired campaign — must never show in active storefront
    insertPromo.run(
      'ROARLAUNCH2025',
      'Chiến dịch ra mắt 2025 (Đã kết thúc)',
      '2025 Launch Campaign (Expired)',
      'Chương trình đã hết hạn.',
      'Expired campaign.',
      'seasonal',
      'percent',
      20,
      150000,
      300000,
      'all',
      '2025-01-01',
      '2025-12-31',
      100,
      100,
      1,
      0,
      0,
      '',
      'Đã hết hạn.',
      'Expired.',
      1
    );
  }

  const journalCount = (db.prepare('SELECT COUNT(*) as c FROM journal_articles').get() as { c: number }).c;
  if (journalCount === 0) {
    const insertArticle = db.prepare(`
      INSERT INTO journal_articles (slug, category, tags_json, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en, author, read_minutes, image_key, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertArticle.run(
      'understanding-cbu-washed-process-in-vietnam',
      'Coffee processing',
      JSON.stringify(['CBU', 'Washed Process', 'Green Coffee']),
      'Hiểu đúng về CBU — Chuẩn Chế Biến Ướt trong Danh Mục Cà Phê Nhân Xanh ROAR COFFEE',
      'Understanding CBU — Washed Processing in the ROAR COFFEE Green Coffee Architecture',
      'CBU là ký hiệu thương mại chính thức của phương pháp chế biến ướt (Washed Process) tại ROAR COFFEE, giúp kiểm soát độ sạch vị và tính đồng nhất của hạt nhân xanh.',
      'CBU is ROAR COFFEE’s official commercial designation for Washed Process coffee, supporting clean flavor clarity and uniform green bean quality across Robusta, Arabica, and Culi.',
      'Trong thương mại cà phê nhân xanh hiện đại, phương pháp chế biến quyết định trực tiếp đến cấu trúc hương vị, độ sạch (clean cup) và sự ổn định khi rang. Tại ROAR COFFEE, toàn bộ dòng nhân xanh chế biến ướt được chuẩn hóa ký hiệu thương mại là CBU (Chế biến ướt / Washed Process), song hành cùng Natural (Chế biến khô) và Honey.\n\nQuy trình chế biến ướt tách vỏ quả tươi ngay sau thu hoạch chín đỏ, lên men kiểm soát để loại bỏ hoàn toàn lớp nhớt, sau đó rửa sạch và làm khô đến độ ẩm tiêu chuẩn. Nhờ vậy, nhân xanh CBU thường có màu sắc đồng đều, tỷ lệ tạp chất thấp và giúp thợ rang dễ dàng thể hiện bản sắc nguyên bản của vùng trồng.\n\nTại hệ thống sản phẩm B2B của ROAR COFFEE, CBU được cấu hình trên cả 3 dòng Robusta (RO), Arabica (AR) và Culi (CU) với các cỡ sàng S14, S16 và S18.',
      'In modern green coffee trading, post-harvest processing directly shapes cup clarity, roast behavior, and commercial consistency. Across the ROAR COFFEE catalog, CBU serves as the official commercial designation for Washed Process coffee alongside Natural and Honey.\n\nBy depulping ripe cherries promptly, controlling mucilage fermentation, washing cleanly, and drying to stable storage moisture, CBU lots deliver clean visual uniformity and predictable roasting curves.\n\nWithin the ROAR COFFEE B2B matrix, CBU is configurable across Robusta (RO), Arabica (AR), and Culi / Peaberry (CU) in screen sizes S14, S16, and S18.',
      'ROAR Coffee Editorial',
      5,
      'product_green_coffee_beans',
      1
    );

    insertArticle.run(
      'culi-peaberry-morphology-explained',
      'Coffee varieties',
      JSON.stringify(['Culi', 'Peaberry', 'Robusta', 'Arabica']),
      'Culi (Peaberry) dưới góc nhìn khoa học: Phân loại hình thái hạt chứ không phải giống loài riêng',
      'Culi (Peaberry) Explained: Bean Morphology Classification, Not a Separate Botanical Species',
      'Làm rõ bản chất sinh học của hạt Culi — hiện tượng một nhân đơn phát triển trọn vẹn trong quả cà phê, tạo nên hình dáng tròn đặc trưng.',
      'Clarifying the botanical reality of Culi (Peaberry): a natural single-seed morphology inside the coffee cherry rather than a separate species.',
      'Nhiều người yêu cà phê thường nhầm lẫn Culi là một giống cà phê độc lập tương đương Robusta hay Arabica. Thực tế khoa học nông học cho thấy Culi (Peaberry) là một phân loại theo hình thái học của hạt.\n\nThông thường mỗi quả cà phê chín chứa hai hạt nhân ép mặt phẳng vào nhau. Trong khoảng 5–10% số quả tự nhiên, chỉ một noãn phát triển thành một hạt tròn đơn duy nhất chiếm trọn khoang quả — đó chính là hạt Culi.\n\nVì hình dáng tròn đặc trưng, hạt Culi cần sự lưu tâm riêng khi sàng lọc kích thước (S14, S16, S18) và khi truyền nhiệt trong trống rang để đảm bảo chín đều từ ngoài vào tâm.',
      'Culi — known internationally as Peaberry — is frequently misunderstood as a separate coffee species alongside Arabica or Robusta. Botanically, however, Culi is a bean morphology classification.\n\nWhereas a normal coffee cherry develops two flat-sided seeds facing one another, a small natural percentage of cherries develop a single round seed that fills the entire cavity. Because of its spherical density, Culi behaves differently during screen grading (S14, S16, S18) and heat transfer in the roasting drum.',
      'ROAR Coffee Editorial',
      4,
      'product_robusta_house',
      1
    );

    insertArticle.run(
      'vietnamese-phin-and-espresso-precision',
      'Brewing techniques',
      JSON.stringify(['Vietnamese Phin', 'Espresso', 'Brewing']),
      'Nghệ thuật cân bằng tỷ lệ khi pha Phin truyền thống và Espresso hiện đại',
      'Dialing In Precision: Traditional Vietnamese Phin Meets Modern Espresso',
      'Hướng dẫn tham chiếu các thông số nhiệt độ 90–94°C, thời gian ủ nở 30 giây cho Phin và tỷ lệ 1:2 cho Espresso.',
      'Reference parameters for 90–94°C water temperature, 30-second phin bloom, and 1:2 espresso extraction ratios.',
      'Dù bạn yêu thích sự chậm rãi của chiếc Phin đồng truyền thống hay nhịp điệu chuẩn xác của máy Espresso hiện đại, mọi tách cà phê cân bằng đều bắt đầu từ tỷ lệ bột cà phê, lượng nước, cỡ xay và nhiệt độ.\n\nVới Phin truyền thống: tham chiếu 20g cà phê xay vừa-thô, châm 25–30ml nước nóng đầu tiên để ủ nở (bloom) trong 30 giây trước khi rót thêm 50–70ml nước, hoàn tất chiết xuất trong khoảng 4–5 phút.\n\nVới Espresso: tham chiếu 18g cà phê đầu vào để thu về 36g chiết xuất trong 25–30 giây ở nhiệt độ 90–94°C.',
      'Whether brewing with a traditional brass Vietnamese Phin or an Italian espresso machine, balanced extraction depends on dose, water volume, grind distribution, and temperature stability.\n\nFor Vietnamese Phin: begin with a 20g reference dose, wet evenly with 25–30ml water for a 30-second bloom, then add 50–70ml hot water for a 4–5 minute drawdown.\n\nFor Espresso: start from an 18g dose yielding 36g liquid beverage in 25–30 seconds at 90–94°C, then refine grind size by taste.',
      'ROAR Barista Lab',
      6,
      'hero_roar_coffee',
      1
    );
  }

  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM site_settings').get() as { c: number }).c;
  if (settingsCount === 0) {
    const setSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    setSetting.run('brand_name', 'ROAR COFFEE');
    setSetting.run('tagline_en', 'IGNITING COURAGE. DEFINING CHARACTER.');
    setSetting.run('tagline_vi', 'KHƠI BẢN LĨNH. ĐẬM CHẤT RIÊNG.');
    setSetting.run('primary_color', '#00552B');
    setSetting.run('secondary_color', '#003D25');
    setSetting.run('gold_color', '#C6A667');
    setSetting.run('header_logo_mode', 'horizontal');
    setSetting.run('footer_logo_mode', 'vertical');
    setSetting.run('contact_email', 'hello@roarcoffee.vn');
    setSetting.run('b2b_email', 'b2b@roarcoffee.vn');
    setSetting.run('contact_phone', '+84 (0) 28 0000 0000 (Placeholder)');
    setSetting.run('office_address_vi', 'TP. Hồ Chí Minh, Việt Nam (Địa chỉ chính thức cập nhật trước khi vận hành thương mại)');
    setSetting.run('office_address_en', 'Ho Chi Minh City, Vietnam (Official registered address to be confirmed prior to launch)');
  }

  // Seed 1 sample order + points ledger entry for demo member so Dashboard immediately demonstrates real relational data
  const orderCount = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
  if (orderCount === 0) {
    const member = db.prepare('SELECT id FROM users WHERE email = ?').get('member@roarcoffee.vn') as { id: number } | undefined;
    const product = db.prepare('SELECT id, sku, name_vi, name_en FROM products WHERE slug = ?').get('signature-reserve') as
      | { id: number; sku: string; name_vi: string; name_en: string }
      | undefined;
    if (member && product) {
      const info = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, customer_name, customer_email, customer_phone, shipping_address,
          currency, subtotal, discount_amount, points_redeemed, points_discount, shipping_fee, total,
          voucher_code, payment_method, payment_status, order_status, tracking_code, points_awarded
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'RC-20261101-1001',
        member.id,
        'Nguyễn Minh Khôi',
        'member@roarcoffee.vn',
        '0909 123 456',
        '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        'VND',
        490000,
        0,
        0,
        0,
        0,
        490000,
        '',
        'bank_transfer',
        'confirmed_demo',
        'Completed',
        'VN-DEMO-1001',
        49
      );
      const orderId = Number(info.lastInsertRowid);
      db.prepare(`
        INSERT INTO order_items (order_id, product_id, sku, product_name_vi, product_name_en, variant_label, quantity, unit_price_vnd, line_total_vnd)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        product.id,
        product.sku,
        product.name_vi,
        product.name_en,
        '250g · Signature Tin (Whole Bean)',
        1,
        490000,
        490000
      );
      db.prepare(`
        INSERT INTO points_ledger (user_id, order_id, entry_type, points, description_vi, description_en, expires_at)
        VALUES (?, ?, 'earn_available', ?, ?, ?, datetime('now', '+365 days'))
      `).run(
        member.id,
        orderId,
        49,
        'Điểm thưởng mẫu từ đơn hàng RC-20261101-1001 (Dữ liệu phát triển)',
        'Demo reward points from order RC-20261101-1001 (Development sample)'
      );
    }
  }
}

export function logAudit(
  actorUserId: number | null,
  actorEmail: string,
  action: string,
  entityType: string,
  entityId: string | number,
  details: unknown = {}
): void {
  db.prepare(`
    INSERT INTO audit_logs (actor_user_id, actor_email, action, entity_type, entity_id, details_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(actorUserId, actorEmail, action, entityType, String(entityId), JSON.stringify(details));
}

const VIETNAM_COFFEE_ORIGINS = [
  {
    slug: 'dak-lak',
    region_name_vi: 'Đắk Lắk',
    region_name_en: 'Đắk Lắk',
    localities_vi: 'Buôn Ma Thuột, Cư M’gar, Krông Pắc, Krông Năng, Ea H’leo, Buôn Hồ',
    localities_en: 'Buôn Ma Thuột, Cư M’gar, Krông Pắc, Krông Năng, Ea H’leo, Buôn Hồ',
    elevation: '450m – 800m',
    varieties: 'Robusta (Vối, TR4, TR9), Culi (Peaberry)',
    processing_methods: 'Natural, Honey, Washed (CBU)',
    sourcing_status: 'confirmed_sourcing',
    characteristics_vi:
      'Thủ phủ cà phê lớn nhất Việt Nam trên nền đất đỏ bazan màu mỡ (diện tích >210.000 ha), mùa thu hoạch rộ từ tháng 11 – tháng 1, cho hạt Robusta chắc nặng, hàm lượng caffeine cao và hậu vị sô-cô-la đậm.',
    characteristics_en:
      'Vietnam’s largest coffee capital across deep red basaltic plateaus (>210,000 ha), harvested Nov–Jan for dense Robusta and Culi beans with rich cocoa body.',
    sourcing_note_vi: 'Khu vực thu mua trọng tâm & đánh giá chất lượng trực tiếp cho Robusta House Blend và Culi/Robusta nhân xanh.',
    sourcing_note_en: 'Primary ROAR COFFEE sourcing evaluation zone for Robusta House Blend and commercial Robusta/Culi lots.',
    map_x: 268,
    map_y: 462,
    latitude: 12.6667,
    longitude: 108.05,
    image_key: 'origin_central_highlands',
    photo_attribution: 'Buôn Ma Thuột & Cư M’gar, Đắk Lắk — Vùng đất đỏ bazan Tây Nguyên',
    related_skus: ['RO-S18-NAT', 'RO-S18-HON', 'RO-S18-CBU', 'RC-RST-RHB'],
  },
  {
    slug: 'lam-dong',
    region_name_vi: 'Lâm Đồng',
    region_name_en: 'Lâm Đồng',
    localities_vi: 'Cầu Đất (Xuân Trường, Trạm Hành), Đà Lạt, Lạc Dương, Di Linh, Bảo Lộc, Lâm Hà',
    localities_en: 'Cầu Đất (Xuân Trường, Trạm Hành), Đà Lạt, Lạc Dương, Di Linh, Bảo Lộc, Lâm Hà',
    elevation: '900m – 1,650m',
    varieties: 'Arabica (Catimor, Bourbon, Typica, Catuai), Robusta',
    processing_methods: 'Washed (CBU), Honey, Natural',
    sourcing_status: 'confirmed_sourcing',
    characteristics_vi:
      'Cao nguyên Langbiang & Di Linh có khí hậu ôn hòa, sương mù buổi sớm quanh năm. Cầu Đất (>1.500m) nổi tiếng với Arabica thanh lịch, trong khi Di Linh – Bảo Lộc cung ứng nguồn Robusta độ cao lớn.',
    characteristics_en:
      'High-altitude temperate belt uniting Cầu Đất & Đà Lạt (>1,500m) specialty Arabica terraces with highland Robusta valleys across Di Linh and Bảo Lộc.',
    sourcing_note_vi: 'Vùng nguyên liệu trọng tâm cho Arabica Selection, Espresso Gold và các lô nhân xanh chế biến ướt CBU.',
    sourcing_note_en: 'Primary sourcing zone for Arabica Selection, Espresso Gold, and Washed (CBU) green lots.',
    map_x: 262,
    map_y: 512,
    latitude: 11.9404,
    longitude: 108.4583,
    image_key: 'hero_highland_harvest_banner',
    photo_attribution: 'Cầu Đất – Đà Lạt & Di Linh, Lâm Đồng — Vùng Arabica cao nguyên',
    related_skus: ['AR-S16-CBU', 'AR-S18-CBU', 'AR-S16-HON', 'RC-RST-ARS', 'RC-RST-ESG'],
  },
  {
    slug: 'gia-lai',
    region_name_vi: 'Gia Lai',
    region_name_en: 'Gia Lai',
    localities_vi: 'Pleiku, Ia Grai, Chư Prông, Đak Đoa, Chư Sê, Mang Yang',
    localities_en: 'Pleiku, Ia Grai, Chư Prông, Đak Đoa, Chư Sê, Mang Yang',
    elevation: '650m – 850m',
    varieties: 'Robusta, Culi (Peaberry), Arabica (Mang Yang)',
    processing_methods: 'Natural, Honey, Washed (CBU)',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Cao nguyên Pleiku rộng lớn đứng thứ ba cả nước về sản lượng cà phê, mùa khô nắng gió ổn định từ tháng 11 – tháng 3 rất lý tưởng để phơi giàn Natural và Honey sạch vị.',
    characteristics_en:
      'Expansive Pleiku basalt plateau ranking among Vietnam’s top three producing provinces, blessed with dry winter sunshine ideal for clean raised-bed drying.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Nguồn tham khảo cho các lô Robusta & Culi phơi giàn (xác thực theo từng hợp đồng).',
    sourcing_note_en: 'Vietnamese coffee geography profile — Reference belt for raised-bed Natural & Honey Robusta/Culi lots.',
    map_x: 260,
    map_y: 415,
    latitude: 13.9833,
    longitude: 108.0,
    image_key: 'origin_central_highlands',
    photo_attribution: 'Pleiku & Ia Grai, Gia Lai — Cao nguyên Bắc Tây Nguyên',
    related_skus: ['RO-S16-NAT', 'RO-S18-HON', 'CU-S16-HON'],
  },
  {
    slug: 'dak-nong',
    region_name_vi: 'Đắk Nông',
    region_name_en: 'Đắk Nông',
    localities_vi: 'Gia Nghĩa, Đắk Mil, Đắk Song, Đắk R’lấp, Tuy Đức',
    localities_en: 'Gia Nghĩa, Đắk Mil, Đắk Song, Đắk R’lấp, Tuy Đức',
    elevation: '600m – 950m',
    varieties: 'Robusta, Culi (Peaberry)',
    processing_methods: 'Natural, Honey, Washed (CBU)',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Cao nguyên M’Nông chuyển tiếp nằm ở phía Tây Nam Tây Nguyên (đặc biệt cụm Đắk Mil – Đắk Song), chênh lệch nhiệt độ đêm mát giúp quả cà phê chín chậm và phát triển vị ngọt tự nhiên.',
    characteristics_en:
      'Southern Central Highlands M’Nông plateau (especially Đắk Mil and Đắk Song), where cooler highland nights slow cherry maturation and deepen sweetness.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Vùng Robusta cao độ nổi bật cho sản phẩm rang đậm và Signature Reserve.',
    sourcing_note_en: 'Vietnamese coffee geography profile — Notable high-elevation Robusta belt.',
    map_x: 244,
    map_y: 492,
    latitude: 12.0033,
    longitude: 107.6876,
    image_key: 'hero_highland_harvest_banner',
    photo_attribution: 'Đắk Mil & Gia Nghĩa, Đắk Nông — Cao nguyên M’Nông',
    related_skus: ['RO-S18-NAT', 'CU-S18-NAT', 'RO-S16-HON'],
  },
  {
    slug: 'kon-tum',
    region_name_vi: 'Kon Tum',
    region_name_en: 'Kon Tum',
    localities_vi: 'Đắk Hà, Măng Đen (Kon Plông), Đắk Tô, Tu Mơ Rông, Ngọc Hồi',
    localities_en: 'Đắk Hà, Măng Đen (Kon Plông), Đắk Tô, Tu Mơ Rông, Ngọc Hồi',
    elevation: '600m – 1,250m',
    varieties: 'Robusta (Đắk Hà), Arabica Catimor (Măng Đen)',
    processing_methods: 'Washed (CBU), Honey, Natural',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Vùng cực Bắc Tây Nguyên hội tụ hai tiểu vùng đặc sắc: thung lũng bazan Đắk Hà nổi tiếng với chỉ dẫn địa lý Cà phê Đắk Hà (Robusta) và vùng khí hậu lạnh Măng Đen (>1.100m) trồng Arabica xứ lạnh.',
    characteristics_en:
      'Northernmost Central Highlands uniting the Đắk Hà GI Robusta valley with Măng Đen’s cool misty (>1,100m) mountain terraces suited to Arabica cultivation.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Khu vực Bắc Tây Nguyên đa dạng cả Robusta Đắk Hà lẫn Arabica Măng Đen.',
    sourcing_note_en: 'Vietnamese coffee geography profile — Dual-species belt spanning Đắk Hà Robusta and Măng Đen Arabica.',
    map_x: 256,
    map_y: 386,
    latitude: 14.5425,
    longitude: 107.9219,
    image_key: 'origin_central_highlands',
    photo_attribution: 'Đắk Hà & Măng Đen, Kon Tum — Cực Bắc Tây Nguyên',
    related_skus: ['RO-S16-CBU', 'AR-S16-HON', 'RC-RST-ESP'],
  },
  {
    slug: 'son-la',
    region_name_vi: 'Sơn La',
    region_name_en: 'Sơn La',
    localities_vi: 'Mai Sơn, Chiềng Ban, Thuận Châu, Sốp Cộp, Yên Châu, Mường Chanh',
    localities_en: 'Mai Sơn, Chiềng Ban, Thuận Châu, Sốp Cộp, Yên Châu, Mường Chanh',
    elevation: '900m – 1,250m',
    varieties: 'Arabica Catimor, THA1',
    processing_methods: 'Washed (CBU), Honey',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Vùng trồng Arabica lớn nhất miền Bắc (~20.000 ha) trải dài trên các sườn núi đá vôi Mai Sơn – Thuận Châu, khí hậu mùa đông se lạnh tạo hương thơm hoa quả rõ nét khi chế biến ướt CBU.',
    characteristics_en:
      'Northern Vietnam’s largest Arabica hub (~20,000 ha) across Mai Sơn and Thuận Châu limestone ridges, where crisp winters sharpen floral acidity under CBU washing.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Vùng Arabica trọng điểm khu vực Tây Bắc.',
    sourcing_note_en: 'Vietnamese coffee geography profile — Primary Northwest Vietnam Arabica region.',
    map_x: 138,
    map_y: 126,
    latitude: 21.3256,
    longitude: 103.9188,
    image_key: 'hero_highland_harvest_banner',
    photo_attribution: 'Chiềng Ban – Mai Sơn, Sơn La — Thủ phủ Arabica Tây Bắc',
    related_skus: ['AR-S14-CBU', 'AR-S16-CBU', 'AR-S18-CBU'],
  },
  {
    slug: 'dien-bien',
    region_name_vi: 'Điện Biên',
    region_name_en: 'Điện Biên',
    localities_vi: 'Mường Ảng, Tuần Giáo, Điện Biên Đông, Mường Nhé',
    localities_en: 'Mường Ảng, Tuần Giáo, Điện Biên Đông, Mường Nhé',
    elevation: '800m – 1,200m',
    varieties: 'Arabica Catimor',
    processing_methods: 'Washed (CBU), Natural',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Tâm điểm tại thung lũng Mường Ảng và Tuần Giáo — nơi cây Arabica được trồng lâu đời trên dãy núi cao Tây Bắc với biên độ nhiệt ngày – đêm lớn, thu hoạch muộn từ tháng 11 đến tháng 2.',
    characteristics_en:
      'Centered in Mường Ảng and Tuần Giáo mountain valleys, a historic Northwest Arabica enclave shaped by wide diurnal swings and late-season harvests.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Tiểu vùng Arabica núi cao Tây Bắc (Mường Ảng).',
    sourcing_note_en: 'Vietnamese coffee geography profile — Northwest highland Arabica enclave (Mường Ảng).',
    map_x: 112,
    map_y: 102,
    latitude: 21.5244,
    longitude: 103.2189,
    image_key: 'origin_central_highlands',
    photo_attribution: 'Mường Ảng & Tuần Giáo, Điện Biên — Vùng núi cao Tây Bắc',
    related_skus: ['AR-S14-CBU', 'AR-S16-NAT'],
  },
  {
    slug: 'quang-tri',
    region_name_vi: 'Quảng Trị',
    region_name_en: 'Quảng Trị',
    localities_vi: 'Khe Sanh, Hướng Hóa, Hướng Phùng, Tân Hợp, Hướng Linh',
    localities_en: 'Khe Sanh, Hướng Hóa, Hướng Phùng, Tân Hợp, Hướng Linh',
    elevation: '500m – 800m',
    varieties: 'Arabica Catimor, Liberica (Cà phê Mít)',
    processing_methods: 'Washed (CBU), Honey, Natural',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Vùng cà phê Arabica nổi tiếng miền Trung tại cao nguyên Khe Sanh – Hướng Hóa (dãy Trường Sơn), kết hợp thổ nhưỡng đất đỏ trên sườn đồi và khí hậu chuyển tiếp giữa hai mùa gió Bắc – Nam.',
    characteristics_en:
      'Central Vietnam’s celebrated Khe Sanh – Hướng Hóa Arabica hills along the Trường Sơn range, bridging basalt foothill soils with distinct monsoon microclimates.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Vùng Arabica Khe Sanh tiêu biểu miền Trung.',
    sourcing_note_en: 'Vietnamese coffee geography profile — Landmark Central Vietnam Khe Sanh Arabica region.',
    map_x: 204,
    map_y: 288,
    latitude: 16.6231,
    longitude: 106.7267,
    image_key: 'product_green_coffee_beans',
    photo_attribution: 'Khe Sanh – Hướng Hóa, Quảng Trị — Arabica dãy Trường Sơn',
    related_skus: ['AR-S16-CBU', 'AR-S16-HON'],
  },
  {
    slug: 'nghe-an',
    region_name_vi: 'Nghệ An (Phủ Quỳ)',
    region_name_en: 'Nghệ An (Phủ Quỳ)',
    localities_vi: 'Phủ Quỳ, Nghĩa Đàn, Quỳ Hợp, Thái Hòa, Tân Kỳ',
    localities_en: 'Phủ Quỳ, Nghĩa Đàn, Quỳ Hợp, Thái Hòa, Tân Kỳ',
    elevation: '150m – 450m',
    varieties: 'Arabica, Robusta',
    processing_methods: 'Washed (CBU), Natural',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Vùng đất đỏ bazan Phủ Quỳ mang dấu ấn lịch sử lâu đời bậc nhất của ngành cà phê Việt Nam từ đầu thế kỷ 20, thích nghi đa dạng với cả dòng Arabica lẫn Robusta vùng Bắc Trung Bộ.',
    characteristics_en:
      'Historic early-20th-century Phủ Quỳ red-basalt plateau in North Central Vietnam cultivating both Arabica and Robusta on rolling mid-elevation terrain.',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Vùng nguyên liệu lịch sử Bắc Trung Bộ (Phủ Quỳ).',
    sourcing_note_en: 'Vietnamese coffee geography profile — Historic Phủ Quỳ basalt coffee plateau.',
    map_x: 166,
    map_y: 206,
    latitude: 19.3219,
    longitude: 105.4242,
    image_key: 'product_roasting_drum_clean',
    photo_attribution: 'Phủ Quỳ – Nghĩa Đàn, Nghệ An — Vùng cà phê Bắc Trung Bộ',
    related_skus: ['AR-S14-CBU', 'RO-S14-NAT'],
  },
  {
    slug: 'dong-nai',
    region_name_vi: 'Đồng Nai & Đông Nam Bộ',
    region_name_en: 'Đồng Nai & Southeast',
    localities_vi: 'Long Khánh, Xuân Lộc, Cẩm Mỹ, Châu Đức (Bà Rịa – Vũng Tàu)',
    localities_en: 'Long Khánh, Xuân Lộc, Cẩm Mỹ, Châu Đức (Bà Rịa – Vũng Tàu)',
    elevation: '100m – 350m',
    varieties: 'Robusta, Liberica / Excelsa (Cà phê Mít)',
    processing_methods: 'Natural, Honey',
    sourcing_status: 'general_geography',
    characteristics_vi:
      'Vùng trồng cà phê chuyển tiếp phía Nam gần các cảng xuất khẩu TP.HCM – Cái Mép, thu hoạch sớm (từ cuối tháng 10) với nguồn Robusta vùng thấp và đặc sản Cà phê Mít (Excelsa/Liberica).',
    characteristics_en:
      'Southern lowland basalt belt near HCMC & Cái Mép export ports, yielding early-harvest Robusta and heritage Liberica/Excelsa (Cà phê Mít).',
    sourcing_note_vi: 'Địa lý vùng cà phê Việt Nam — Vùng cửa ngõ Đông Nam Bộ thuận lợi logistics cảng biển.',
    sourcing_note_en: 'Vietnamese coffee geography profile — Southeast export corridor near deep-water ports.',
    map_x: 244,
    map_y: 552,
    latitude: 10.9284,
    longitude: 107.2429,
    image_key: 'product_green_coffee_beans',
    photo_attribution: 'Long Khánh – Xuân Lộc, Đồng Nai & Đông Nam Bộ',
    related_skus: ['RO-S16-NAT', 'RO-S14-NAT'],
  },
];

function runIncrementalMigrations(): void {
  // 1. Ensure ROAR COFFEE ESPRESSO (RC-RST-ESP) and ROAR COFFEE ESPRESSO GOLD (RC-RST-ESG) are separate SKUs
  const combinedEsg = db.prepare("SELECT * FROM products WHERE slug = 'roar-espresso-gold'").get() as any;
  const separateEsp = db.prepare("SELECT * FROM products WHERE slug = 'roar-espresso'").get() as any;

  if (combinedEsg && String(combinedEsg.name_en || '').includes('ESPRESSO & ESPRESSO GOLD')) {
    db.prepare(`
      UPDATE products SET
        name_vi = ?,
        name_en = ?,
        subtitle_vi = ?,
        subtitle_en = ?,
        description_vi = ?,
        description_en = ?,
        coffee_type = ?,
        blend_summary_vi = ?,
        blend_summary_en = ?,
        roast_profile_vi = ?,
        roast_profile_en = ?,
        tasting_notes_vi = ?,
        tasting_notes_en = ?,
        variants_json = ?,
        packaging_options_json = ?,
        price_vnd = ?,
        price_usd = ?,
        mascot_slug = 'eagle',
        screen_size = 'S18 Selected',
        processing_method = 'CBU / Washed & Honey',
        origin_region = 'Lâm Đồng & Đắk Lắk',
        grading_spec = 'ROAR Espresso Gold Standard',
        image_key = 'hero_signature_reserve_banner'
      WHERE slug = 'roar-espresso-gold'
    `).run(
      'ROAR COFFEE ESPRESSO GOLD',
      'ROAR COFFEE ESPRESSO GOLD',
      'Cá tính Đại Bàng (Eagle) · Tầm nhìn, tham vọng, bứt phá',
      'Eagle Character · Vision, Ambition, Excellence',
      'Phiên bản Espresso Gold cao cấp gắn với hình tượng Đại Bàng — đại diện cho khát vọng bứt phá và tiêu chuẩn chiết xuất khắt khe tại các quầy pha chế chuyên nghiệp và chuỗi HORECA.',
      'Elevated Espresso Gold edition anchored by the Eagle character — celebrating international vision, elevated hospitality standards, and high-clarity espresso extraction.',
      'Premium Espresso Gold Blend',
      'Công thức Espresso Gold tuyển chọn (Tỷ lệ chi tiết bảo mật)',
      'Selected Espresso Gold formulation (Confidential proportions)',
      'Rang Espresso Gold tinh chỉnh',
      'Precision Espresso Gold Roast',
      'Chiết xuất dày mượt 18g → 36g ở 90–94°C · Cập nhật thử nếm theo từng lô phát hành',
      'Dense, velvety 18g → 36g extraction at 90–94°C · Cupping notes updated per verified lot',
      JSON.stringify([
        { label: '250g · Whole Bean (Gold)', priceVnd: 235000, priceUsd: 9.5 },
        { label: '500g · Whole Bean (Gold)', priceVnd: 440000, priceUsd: 17.8 },
        { label: '1kg · HORECA Gold Pack', priceVnd: 840000, priceUsd: 34.0 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      235000,
      9.5
    );
  }

  if (!separateEsp) {
    db.prepare(`
      INSERT INTO products (
        slug, sku, category, sub_category, name_vi, name_en, subtitle_vi, subtitle_en,
        description_vi, description_en, coffee_type, blend_summary_vi, blend_summary_en, blend_public,
        roast_profile_vi, roast_profile_en, tasting_notes_vi, tasting_notes_en,
        brewing_methods_json, variants_json, packaging_options_json,
        price_vnd, price_usd, inventory, moq, status, is_demo_data,
        mascot_slug, screen_size, processing_method, origin_region,
        harvest_year, moisture_content, density, defect_info, grading_spec, image_key, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'roar-espresso',
      'RC-RST-ESP',
      'roasted',
      'Personality Line',
      'ROAR COFFEE ESPRESSO',
      'ROAR COFFEE ESPRESSO',
      'Cá tính Cáo (Fox) · Thông minh, linh hoạt, sáng tạo',
      'Fox Character · Intelligence, Agility, Creativity',
      'Dòng cà phê rang xay chuyên biệt cho máy pha Espresso hiện đại và pha phin tinh chỉnh, gắn với hình tượng Cáo — biểu trưng cho tư duy linh hoạt, sự chính xác và sáng tạo mỗi ngày.',
      'Dedicated roasted blend engineered for modern espresso bars and agile daily extraction, embodied by the Fox — representing sharp intellect, agility, and creative craft.',
      'Proprietary Espresso Blend',
      'Công thức phối trộn Espresso chuẩn cân bằng (Tỷ lệ chi tiết bảo mật)',
      'Balanced Espresso formulation (Confidential blend percentages)',
      0,
      'Rang Espresso vừa-đậm (Medium-Dark Espresso)',
      'Medium-Dark Espresso Roast',
      'Crema ổn định, cân bằng cho Espresso 18g → 36g · Ghi chú hương vị cập nhật theo lô xác thực',
      'Stable crema balanced for 18g → 36g extraction · Verified cupping notes per batch',
      JSON.stringify(['Espresso', 'Moka Pot', 'Cold Brew']),
      JSON.stringify([
        { label: '250g · Whole Bean', priceVnd: 195000, priceUsd: 7.9 },
        { label: '250g · Espresso Fine Ground', priceVnd: 195000, priceUsd: 7.9 },
        { label: '500g · Whole Bean', priceVnd: 380000, priceUsd: 15.5 },
        { label: '1kg · Barista Pack', priceVnd: 720000, priceUsd: 29.0 },
      ]),
      JSON.stringify(['250g', '500g', '1kg']),
      195000,
      7.9,
      88,
      '1 bag (Demo)',
      'active',
      1,
      'fox',
      'S16/S18',
      'Configurable',
      'Tây Nguyên (Đắk Lắk & Lâm Đồng)',
      'Pending verified lot',
      'N/A (Roasted)',
      'N/A (Roasted)',
      'Confidential',
      'ROAR Espresso Standard',
      'product_arabica_selection',
      1
    );
  }

  // Update Fox personality to link directly to separate roar-espresso SKU
  db.prepare(`
    UPDATE personalities
    SET product_association_vi = 'ROAR COFFEE ESPRESSO',
        product_association_en = 'ROAR COFFEE ESPRESSO',
        associated_product_slug = 'roar-espresso'
    WHERE slug = 'fox' AND associated_product_slug != 'roar-espresso'
  `).run();

  // 2. Upsert all 10 comprehensive Vietnamese coffee growing regions
  const upsertOrigin = db.prepare(`
    INSERT INTO coffee_origins (
      slug, region_name_vi, region_name_en, localities_vi, localities_en,
      elevation, varieties, processing_methods, sourcing_status,
      characteristics_vi, characteristics_en, sourcing_note_vi, sourcing_note_en,
      map_x, map_y, latitude, longitude, image_key, photo_attribution, related_skus_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      region_name_vi = excluded.region_name_vi,
      region_name_en = excluded.region_name_en,
      localities_vi = excluded.localities_vi,
      localities_en = excluded.localities_en,
      elevation = excluded.elevation,
      varieties = excluded.varieties,
      processing_methods = excluded.processing_methods,
      characteristics_vi = excluded.characteristics_vi,
      characteristics_en = excluded.characteristics_en,
      sourcing_note_vi = excluded.sourcing_note_vi,
      sourcing_note_en = excluded.sourcing_note_en,
      map_x = excluded.map_x,
      map_y = excluded.map_y,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      image_key = excluded.image_key,
      photo_attribution = excluded.photo_attribution,
      related_skus_json = excluded.related_skus_json
  `);

  for (const o of VIETNAM_COFFEE_ORIGINS) {
    upsertOrigin.run(
      o.slug,
      o.region_name_vi,
      o.region_name_en,
      o.localities_vi,
      o.localities_en,
      o.elevation,
      o.varieties,
      o.processing_methods,
      o.sourcing_status,
      o.characteristics_vi,
      o.characteristics_en,
      o.sourcing_note_vi,
      o.sourcing_note_en,
      o.map_x,
      o.map_y,
      o.latitude,
      o.longitude,
      o.image_key,
      o.photo_attribution,
      JSON.stringify(o.related_skus)
    );
  }

  // 3. Ensure products.gallery_images_json exists for multi-image WooCommerce galleries
  const cols = db.prepare('PRAGMA table_info(products)').all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === 'gallery_images_json')) {
    db.exec("ALTER TABLE products ADD COLUMN gallery_images_json TEXT NOT NULL DEFAULT '[]'");
  }

  // 4. Seed expanded promotions idempotently
  const extraPromos = [
    {
      code: 'ROARESPRESSO50',
      title_vi: 'Giảm 50.000đ Dòng Espresso & Espresso Gold',
      title_en: '50,000 VND Off Espresso & Espresso Gold',
      description_vi: 'Ưu đãi trực tiếp 50.000đ cho đơn hàng dòng ROAR Espresso hoặc Espresso Gold từ 350.000đ.',
      description_en: 'Instant 50,000 VND discount on ROAR Espresso or Espresso Gold orders from 350,000 VND.',
      promo_type: 'product_line',
      discount_type: 'fixed',
      discount_value: 50000,
      max_discount: 50000,
      min_order_value: 350000,
      eligible_category: 'roasted',
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      usage_limit: 800,
      member_only: 0,
      min_tier: '',
      terms_vi: 'Áp dụng cho đơn hàng cà phê rang xay từ 350.000đ.',
      terms_en: 'Valid on roasted coffee orders from 350,000 VND.',
    },
    {
      code: 'HOATAN20',
      title_vi: 'Ưu Đãi Cà Phê Hòa Tan Silver & Gold — Giảm 20%',
      title_en: 'Instant Coffee Silver & Gold — 20% Off',
      description_vi: 'Giảm 20% (tối đa 80.000đ) khi trải nghiệm bộ sưu tập Cà phê Hòa tan tiện lợi ROAR COFFEE.',
      description_en: 'Enjoy 20% off (up to 80,000 VND) across Instant Silver & Gold collections.',
      promo_type: 'flash_offer',
      discount_type: 'percent',
      discount_value: 20,
      max_discount: 80000,
      min_order_value: 180000,
      eligible_category: 'instant',
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      usage_limit: 600,
      member_only: 0,
      min_tier: '',
      terms_vi: 'Áp dụng cho dòng Cà phê Hòa tan Silver & Gold từ 180.000đ.',
      terms_en: 'Applicable to Instant Silver & Gold from 180,000 VND.',
    },
    {
      code: 'THANHVIEN15',
      title_vi: 'Đặc Quyền Thành Viên — Giảm 15% Mọi Dòng Rang Xay',
      title_en: 'Member Exclusive — 15% Off Roasted Coffee',
      description_vi: 'Ưu đãi dành cho toàn bộ tài khoản thành viên ROAR COFFEE đã đăng nhập với đơn từ 250.000đ.',
      description_en: 'Exclusive 15% savings for signed-in ROAR COFFEE Members on roasted orders over 250,000 VND.',
      promo_type: 'member_only',
      discount_type: 'percent',
      discount_value: 15,
      max_discount: 180000,
      min_order_value: 250000,
      eligible_category: 'roasted',
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      usage_limit: 1200,
      member_only: 1,
      min_tier: 'ROAR Member',
      terms_vi: 'Yêu cầu đăng nhập tài khoản thành viên ROAR COFFEE.',
      terms_en: 'Requires signed-in ROAR COFFEE member account.',
    },
    {
      code: 'DOANHGIA12',
      title_vi: 'Quà Tặng Doanh Nghiệp & Đơn Lớn — Giảm 12%',
      title_en: 'Corporate Gifting & Bulk Retail — 12% Off',
      description_vi: 'Giảm 12% (tối đa 350.000đ) cho đơn hàng hộp quà tặng hoặc đơn bán lẻ giá trị cao từ 1.000.000đ.',
      description_en: 'Save 12% (up to 350,000 VND) on presentation gift sets and orders from 1,000,000 VND.',
      promo_type: 'gifting',
      discount_type: 'percent',
      discount_value: 12,
      max_discount: 350000,
      min_order_value: 1000000,
      eligible_category: 'all',
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      usage_limit: 400,
      member_only: 0,
      min_tier: '',
      terms_vi: 'Áp dụng cho toàn bộ danh mục bán lẻ với giá trị đơn từ 1.000.000đ.',
      terms_en: 'Valid across all retail items on orders from 1,000,000 VND.',
    },
  ];

  const insertExtraPromo = db.prepare(`
    INSERT OR IGNORE INTO promotions (
      code, title_vi, title_en, description_vi, description_en,
      promo_type, discount_type, discount_value, max_discount, min_order_value,
      eligible_category, start_date, end_date, usage_limit, used_count,
      per_customer_limit, combinable, member_only, min_tier, terms_vi, terms_en, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 3, 0, ?, ?, ?, ?, 1)
  `);
  for (const pr of extraPromos) {
    insertExtraPromo.run(
      pr.code,
      pr.title_vi,
      pr.title_en,
      pr.description_vi,
      pr.description_en,
      pr.promo_type,
      pr.discount_type,
      pr.discount_value,
      pr.max_discount,
      pr.min_order_value,
      pr.eligible_category,
      pr.start_date,
      pr.end_date,
      pr.usage_limit,
      pr.member_only,
      pr.min_tier,
      pr.terms_vi,
      pr.terms_en
    );
  }

  // 5. Seed demo orders & customer notifications for member@roarcoffee.vn if needed
  const memberUser = db.prepare("SELECT id, full_name, email, phone FROM users WHERE email = 'member@roarcoffee.vn'").get() as any;
  if (memberUser) {
    const orderCnt = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
    if (orderCnt <= 1) {
      const esp = db.prepare("SELECT id, sku, name_vi, name_en, price_vnd FROM products WHERE slug = 'roar-espresso'").get() as any;
      const esg = db.prepare("SELECT id, sku, name_vi, name_en, price_vnd FROM products WHERE slug = 'roar-espresso-gold'").get() as any;

      if (esp) {
        const pendingExists = db.prepare("SELECT id FROM orders WHERE order_number = 'RC-20261115-2048'").get();
        if (!pendingExists) {
          const r1 = db.prepare(`
            INSERT INTO orders (
              order_number, user_id, customer_name, customer_email, customer_phone, shipping_address,
              currency, subtotal, discount_amount, points_redeemed, points_discount, shipping_fee, total,
              voucher_code, payment_method, payment_status, order_status, tracking_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, 'VND', ?, 50000, 0, 0, 35000, ?, 'ROARESPRESSO50', 'vietqr', 'pending_verification', 'Pending', '', ?)
          `).run(
            'RC-20261115-2048',
            memberUser.id,
            memberUser.full_name,
            memberUser.email,
            memberUser.phone || '0909 123 456',
            '45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
            390000,
            375000,
            'Giao giờ hành chính. [Customer QR/Wallet Ref: VQR-889124]'
          );
          db.prepare(`
            INSERT INTO order_items (order_id, product_id, sku, product_name_vi, product_name_en, variant_label, quantity, unit_price_vnd, line_total_vnd)
            VALUES (?, ?, ?, ?, ?, '250g · Whole Bean', 2, ?, ?)
          `).run(Number(r1.lastInsertRowid), esp.id, esp.sku, esp.name_vi, esp.name_en, esp.price_vnd, esp.price_vnd * 2);
        }
      }

      if (esg) {
        const shipExists = db.prepare("SELECT id FROM orders WHERE order_number = 'RC-20261114-1892'").get();
        if (!shipExists) {
          const r2 = db.prepare(`
            INSERT INTO orders (
              order_number, user_id, customer_name, customer_email, customer_phone, shipping_address,
              currency, subtotal, discount_amount, points_redeemed, points_discount, shipping_fee, total,
              voucher_code, payment_method, payment_status, order_status, tracking_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, 'VND', ?, 0, 0, 0, 0, ?, '', 'momo', 'paid', 'Shipping', 'GHN-ROAR-884210', 'Đã đóng gói chống sốc')
          `).run(
            'RC-20261114-1892',
            memberUser.id,
            memberUser.full_name,
            memberUser.email,
            memberUser.phone || '0909 123 456',
            '12 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            440000,
            440000
          );
          db.prepare(`
            INSERT INTO order_items (order_id, product_id, sku, product_name_vi, product_name_en, variant_label, quantity, unit_price_vnd, line_total_vnd)
            VALUES (?, ?, ?, ?, ?, '500g · Whole Bean (Gold)', 1, 440000, 440000)
          `).run(Number(r2.lastInsertRowid), esg.id, esg.sku, esg.name_vi, esg.name_en);
        }
      }
    }

    const notifCnt = (db.prepare('SELECT COUNT(*) as c FROM user_notifications WHERE user_id = ?').get(memberUser.id) as { c: number }).c;
    if (notifCnt === 0) {
      const insertNotif = db.prepare(`
        INSERT INTO user_notifications (user_id, title_vi, title_en, message_vi, message_en, category, link_url, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertNotif.run(
        memberUser.id,
        'Đơn hàng RC-20261114-1892 đang được giao',
        'Order RC-20261114-1892 is out for delivery',
        'Đơn vị vận chuyển đã tiếp nhận kiện hàng mã vận đơn GHN-ROAR-884210. Vui lòng chú ý điện thoại khi nhận hàng.',
        'Carrier has picked up shipment GHN-ROAR-884210. Please keep your phone reachable.',
        'order',
        '/account',
        0
      );
      insertNotif.run(
        memberUser.id,
        'Ưu đãi thành viên mới: Giảm 15% toàn bộ dòng Rang Xay',
        'Member Perk: 15% Off All Roasted Coffee',
        'Sử dụng mã THANHVIEN15 khi thanh toán cho đơn hàng rang xay từ 250.000đ để nhận ưu đãi ngay.',
        'Apply code THANHVIEN15 at checkout on roasted coffee orders from 250,000 VND.',
        'promo',
        '/promotions',
        0
      );
      insertNotif.run(
        memberUser.id,
        'Đã cộng +49 điểm thưởng ROAR từ đơn RC-20261101-1001',
        '+49 ROAR Points Credited from Order RC-20261101-1001',
        'Điểm thưởng đã sẵn sàng quy đổi trực tiếp trong bước thanh toán đơn hàng tiếp theo.',
        'Your reward points are now available for redemption on your next checkout.',
        'loyalty',
        '/account',
        1
      );
    }
  }
}
