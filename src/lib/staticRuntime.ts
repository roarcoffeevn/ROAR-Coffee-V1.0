import { loadStaticSnapshot } from './staticFallback';
import { calculateShippingFee, resolveVolumeTier } from './pricing';
import { ALL_ADMIN_PERMISSIONS } from './rbac';

const STATIC_STATE_KEY = 'roar_static_runtime_v1';

interface StaticUserRecord {
  id: number;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'b2b_partner' | 'admin';
  adminRole?: string;
  adminPermissions?: string[];
  memberCode: string;
  tier: string;
  emailVerified: boolean;
  companyName?: string;
  b2bVerified?: boolean;
  createdAt: string;
}

interface StaticRuntimeState {
  users: StaticUserRecord[];
  orders: any[];
  b2bInquiries: any[];
  newsletterSubscribers: Array<{ id: number; email: string; lang: string; created_at: string }>;
  settingsOverlay: Record<string, string>;
  productsOverlay: Record<number, any>;
  createdProducts: any[];
}

function getDefaultUsers(): StaticUserRecord[] {
  return [
    {
      id: 1,
      email: 'admin@roarcoffee.vn',
      password: 'RoarAdmin2026!',
      fullName: 'ROAR Super Admin',
      phone: '0901234567',
      role: 'admin',
      adminRole: 'super_admin',
      adminPermissions: [...ALL_ADMIN_PERMISSIONS],
      memberCode: 'RC-ADM-000001',
      tier: 'ROAR Reserve',
      emailVerified: true,
      createdAt: '2026-01-01 08:00:00',
    },
    {
      id: 2,
      email: 'customer@roarcoffee.vn',
      password: 'RoarMember2026!',
      fullName: 'Nguyễn Minh Quân',
      phone: '0912345678',
      role: 'customer',
      memberCode: 'RC-MEM-100001',
      tier: 'ROAR Member',
      emailVerified: true,
      createdAt: '2026-02-01 09:00:00',
    },
  ];
}

function readState(): StaticRuntimeState {
  try {
    const raw = window.localStorage.getItem(STATIC_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : getDefaultUsers(),
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        b2bInquiries: Array.isArray(parsed.b2bInquiries) ? parsed.b2bInquiries : [],
        newsletterSubscribers: Array.isArray(parsed.newsletterSubscribers) ? parsed.newsletterSubscribers : [],
        settingsOverlay: parsed.settingsOverlay || {},
        productsOverlay: parsed.productsOverlay || {},
        createdProducts: Array.isArray(parsed.createdProducts) ? parsed.createdProducts : [],
      };
    }
  } catch {
    // ignore
  }
  return {
    users: getDefaultUsers(),
    orders: [],
    b2bInquiries: [],
    newsletterSubscribers: [],
    settingsOverlay: {},
    productsOverlay: {},
    createdProducts: [],
  };
}

function writeState(state: StaticRuntimeState): void {
  try {
    window.localStorage.setItem(STATIC_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toPublicUser(u: StaticUserRecord) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    adminRole: u.adminRole,
    adminPermissions: u.adminPermissions,
    memberCode: u.memberCode,
    tier: u.tier,
    emailVerified: u.emailVerified,
    companyName: u.companyName || '',
    b2bVerified: Boolean(u.b2bVerified),
    addresses: [],
    points: { available: 120, pending: 0, redeemed: 0, expired: 0, expiringSoon: 0 },
    unreadNotifications: 0,
  };
}

function resolveTokenUser(headers: Headers, state: StaticRuntimeState): StaticUserRecord | null {
  const auth = headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim() || window.localStorage.getItem('roar_auth_token') || '';
  if (!token.startsWith('static-token-')) return null;
  const uid = Number(token.replace('static-token-', ''));
  return state.users.find((u) => u.id === uid) || null;
}

export async function handleStaticApiFallback(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response | null> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.pathname + input.search : input.url;
  let pathname = urlStr;
  let searchParams = new URLSearchParams();
  try {
    const u = new URL(urlStr, window.location.origin);
    pathname = u.pathname;
    searchParams = u.searchParams;
  } catch {
    // fallback
  }

  if (!pathname.startsWith('/api/')) return null;

  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers || {});
  let body: any = {};
  if (typeof init.body === 'string' && init.body.trim()) {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  const state = readState();
  const snap = await loadStaticSnapshot();

  // 1. Auth: Register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    if (!email || !password || !fullName) {
      return jsonResponse({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' }, 400);
    }
    if (password.length < 6) {
      return jsonResponse({ error: 'Mật khẩu cần tối thiểu 6 ký tự.' }, 400);
    }
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      return jsonResponse({ error: 'Email này đã được đăng ký tài khoản.' }, 409);
    }
    const role = body.roleIntent === 'b2b_partner' ? 'b2b_partner' : 'customer';
    const nextId = Math.max(10, ...state.users.map((u) => u.id)) + 1;
    const newUser: StaticUserRecord = {
      id: nextId,
      email,
      password,
      fullName,
      phone,
      role,
      memberCode: `RC-${role === 'b2b_partner' ? 'B2B' : 'MEM'}-${Math.floor(100000 + Math.random() * 900000)}`,
      tier: 'ROAR Member',
      emailVerified: true,
      companyName: String(body.companyName || '').trim(),
      b2bVerified: false,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    state.users.push(newUser);
    writeState(state);
    return jsonResponse({ ok: true, user: toPublicUser(newUser), token: `static-token-${newUser.id}` }, 201);
  }

  // 2. Auth: Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const found = state.users.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!found) {
      return jsonResponse({ error: 'Sai email hoặc mật khẩu.' }, 401);
    }
    return jsonResponse({ ok: true, user: toPublicUser(found), token: `static-token-${found.id}` });
  }

  // 3. Auth: Me & Logout
  if (pathname === '/api/auth/me' && method === 'GET') {
    const u = resolveTokenUser(headers, state);
    return jsonResponse({ user: u ? toPublicUser(u) : null });
  }
  if (pathname === '/api/auth/logout' && method === 'POST') {
    return jsonResponse({ ok: true });
  }

  // 4. Account Dashboard
  if (pathname === '/api/account/dashboard' && method === 'GET') {
    const u = resolveTokenUser(headers, state);
    if (!u) return jsonResponse({ error: 'Unauthorized' }, 401);
    const userOrders = state.orders.filter(
      (o) => o.user_id === u.id || String(o.customer_email || '').toLowerCase() === u.email.toLowerCase()
    );
    return jsonResponse({
      user: {
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        phone: u.phone,
        role: u.role,
        member_code: u.memberCode,
        tier: u.tier,
        email_verified: 1,
        addresses: [],
      },
      points: { available: 120, pending: 0, redeemed: 0, expired: 0, expiringSoon: 0 },
      ledger: [],
      orders: userOrders,
      activeVouchers: (snap?.tables?.promotions || []).filter((p: any) => p.active),
      tiers: snap?.tables?.membership_tiers || [],
      loyaltySettings: (snap?.tables?.loyalty_settings || [])[0] || null,
      notifications: [],
    });
  }

  // 5. Promotions Validate
  if (pathname === '/api/promotions/validate' && method === 'POST') {
    const code = String(body.code || '').trim().toUpperCase();
    const sub = Number(body.subtotal || 0);
    const promos = snap?.tables?.promotions || [];
    const promo = promos.find((p: any) => String(p.code || '').toUpperCase() === code && p.active);
    if (!promo) return jsonResponse({ error: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.' }, 404);
    if (sub < Number(promo.min_order_value || 0)) {
      return jsonResponse({ error: `Đơn hàng tối thiểu ${Number(promo.min_order_value).toLocaleString('vi-VN')} ₫.` }, 400);
    }
    let discountAmount = 0;
    if (promo.discount_type === 'percent') {
      discountAmount = Math.round((sub * promo.discount_value) / 100);
      if (promo.max_discount > 0) discountAmount = Math.min(discountAmount, promo.max_discount);
    } else if (promo.discount_type === 'fixed') {
      discountAmount = Math.min(sub, promo.discount_value);
    } else if (promo.discount_type === 'free_shipping') {
      discountAmount = promo.discount_value || 35000;
    }
    return jsonResponse({ valid: true, promo, discountAmount });
  }

  // 6. Create Order & Track Order
  if (pathname === '/api/orders' && method === 'POST') {
    const allProds = [...(snap?.tables?.products || []), ...state.createdProducts];
    let subtotal = 0;
    const resolvedItems: any[] = [];
    for (const item of body.items || []) {
      const p = allProds.find((x: any) => x.id === Number(item.productId));
      if (!p) continue;
      const qty = Math.max(1, Number(item.quantity || 1));
      const tiers = Array.isArray(p.pricing_tiers) ? p.pricing_tiers : JSON.parse(p.pricing_tiers_json || '[]');
      let unitPriceVnd = Number(p.price_vnd || 0);
      let variantLabel = String(item.variantLabel || 'Standard');
      let unit: 'kg' | 'unit' = 'unit';
      if (tiers.length > 0) {
        const tier = resolveVolumeTier(tiers, qty);
        if (tier) {
          unitPriceVnd = tier.priceVnd;
          variantLabel = `${qty} kg (${tier.labelVi})`;
          unit = 'kg';
        }
      }
      const lineTotalVnd = unitPriceVnd * qty;
      subtotal += lineTotalVnd;
      resolvedItems.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        product_id: p.id,
        sku: p.sku,
        product_name_vi: p.name_vi,
        product_name_en: p.name_en,
        product_image_key: p.image_key,
        variant_label: variantLabel,
        quantity: qty,
        unit,
        unit_price_vnd: unitPriceVnd,
        line_total_vnd: lineTotalVnd,
      });
    }
    const mergedSettings: Record<string, string> = {};
    for (const row of snap?.tables?.site_settings || []) mergedSettings[row.key] = row.value;
    Object.assign(mergedSettings, state.settingsOverlay);
    const shippingCalc = calculateShippingFee(subtotal, mergedSettings);
    const shippingFee = shippingCalc.feeVnd;
    const total = subtotal + shippingFee;
    const orderNumber = `RC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const u = resolveTokenUser(headers, state);
    const newOrder = {
      id: Date.now(),
      order_number: orderNumber,
      user_id: u?.id || null,
      customer_name: body.customerName,
      customer_email: String(body.customerEmail || '').trim().toLowerCase(),
      customer_phone: body.customerPhone,
      shipping_address: body.shippingAddress,
      currency: body.currency || 'VND',
      subtotal,
      discount_amount: 0,
      points_discount: 0,
      shipping_fee: shippingFee,
      total,
      payment_method: body.paymentMethod || 'vietqr',
      payment_status: 'awaiting_payment',
      order_status: 'Pending',
      notes: body.notes || '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      items: resolvedItems,
    };
    state.orders.unshift(newOrder);
    writeState(state);
    return jsonResponse({
      ok: true,
      order: {
        orderId: newOrder.id,
        orderNumber,
        total,
        subtotal,
        shippingFee,
        paymentMethod: newOrder.payment_method,
        customerEmail: newOrder.customer_email,
      },
    }, 201);
  }

  if (pathname === '/api/orders/track' && method === 'GET') {
    const orderNumber = (searchParams.get('orderNumber') || '').trim().toUpperCase();
    const phone = (searchParams.get('phone') || '').replace(/\D/g, '').replace(/^84/, '0');
    const email = (searchParams.get('email') || '').trim().toLowerCase();
    const matches = state.orders.filter((o) => {
      if (orderNumber && String(o.order_number || '').toUpperCase() === orderNumber) return true;
      if (email && String(o.customer_email || '').toLowerCase() === email) return true;
      if (phone) {
        const op = String(o.customer_phone || '').replace(/\D/g, '').replace(/^84/, '0');
        if (op === phone) return true;
      }
      return false;
    });
    if (matches.length === 0) return jsonResponse({ error: 'Không tìm thấy đơn hàng phù hợp.' }, 404);
    return jsonResponse({ orders: matches, order: matches[0] });
  }

  // 7. B2B & Newsletter Public Submissions
  if (pathname === '/api/b2b/inquiries' && method === 'POST') {
    const rec = {
      id: Date.now(),
      inquiry_type: body.inquiryType || 'wholesale',
      company_name: body.companyName || '',
      contact_name: body.contactName || '',
      email: body.email || '',
      phone: body.phone || '',
      country: body.country || 'Vietnam',
      product_sku: body.productSku || '',
      estimated_volume: body.estimatedVolume || '',
      message: body.message || '',
      status: 'new',
      quoted_price: '',
      admin_notes: '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    state.b2bInquiries.unshift(rec);
    writeState(state);
    return jsonResponse({ ok: true, id: rec.id }, 201);
  }

  if (pathname === '/api/newsletter' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) return jsonResponse({ error: 'Email không hợp lệ.' }, 400);
    if (!state.newsletterSubscribers.some((n) => n.email === email)) {
      state.newsletterSubscribers.unshift({
        id: Date.now(),
        email,
        lang: body.lang === 'en' ? 'en' : 'vi',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      writeState(state);
    }
    return jsonResponse({ ok: true });
  }

  // 8. Admin CMS Static Fallback Endpoints
  if (pathname.startsWith('/api/admin/')) {
    const u = resolveTokenUser(headers, state);
    if (!u || u.role !== 'admin') return jsonResponse({ error: 'Admin access required' }, 403);

    if (pathname === '/api/admin/overview') {
      const products = snap?.tables?.products || [];
      return jsonResponse({
        metrics: {
          totalOrders: state.orders.length,
          grossRevenueVnd: state.orders.reduce((s, o) => s + Number(o.total || 0), 0),
          customers: state.users.filter((x) => x.role !== 'admin').length,
          b2bInquiries: state.b2bInquiries.length,
          newsletterCount: state.newsletterSubscribers.length,
          activeProducts: products.filter((p: any) => p.status !== 'draft').length,
        },
        recentOrders: state.orders.slice(0, 5),
      });
    }
    if (pathname === '/api/admin/products' && method === 'GET') {
      const list = [...(snap?.tables?.products || []), ...state.createdProducts].map((p: any) => ({
        ...p,
        ...(state.productsOverlay[p.id] || {}),
        variants: Array.isArray(p.variants) ? p.variants : JSON.parse(p.variants_json || '[]'),
        pricing_tiers: Array.isArray(p.pricing_tiers) ? p.pricing_tiers : JSON.parse(p.pricing_tiers_json || '[]'),
        gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : JSON.parse(p.gallery_images_json || '[]'),
      }));
      return jsonResponse({ products: list });
    }
    if (pathname === '/api/admin/orders' && method === 'GET') {
      return jsonResponse({ orders: state.orders });
    }
    if (pathname === '/api/admin/customers' && method === 'GET') {
      return jsonResponse({
        customers: state.users.map((x) => ({
          id: x.id,
          email: x.email,
          full_name: x.fullName,
          phone: x.phone,
          role: x.role,
          member_code: x.memberCode,
          tier: x.tier,
          created_at: x.createdAt,
        })),
        loyaltySettings: (snap?.tables?.loyalty_settings || [])[0] || null,
      });
    }
    if (pathname === '/api/admin/b2b' && method === 'GET') {
      return jsonResponse({ inquiries: state.b2bInquiries });
    }
    if (pathname.startsWith('/api/admin/b2b/') && method === 'PATCH') {
      const id = Number(pathname.split('/').pop());
      state.b2bInquiries = state.b2bInquiries.map((inq) =>
        inq.id === id
          ? {
              ...inq,
              status: body.status ?? inq.status,
              quoted_price: body.quotedPrice ?? inq.quoted_price,
              admin_notes: body.adminNotes ?? inq.admin_notes,
            }
          : inq
      );
      writeState(state);
      return jsonResponse({ ok: true });
    }
    if (pathname.startsWith('/api/admin/b2b/') && method === 'DELETE') {
      const id = Number(pathname.split('/').pop());
      state.b2bInquiries = state.b2bInquiries.filter((inq) => inq.id !== id);
      writeState(state);
      return jsonResponse({ ok: true });
    }
    if (pathname === '/api/admin/newsletter' && method === 'GET') {
      return jsonResponse({ subscribers: state.newsletterSubscribers });
    }
    if (pathname.startsWith('/api/admin/newsletter/') && method === 'DELETE') {
      const id = Number(pathname.split('/').pop());
      state.newsletterSubscribers = state.newsletterSubscribers.filter((n) => n.id !== id);
      writeState(state);
      return jsonResponse({ ok: true });
    }
    if (pathname === '/api/admin/promotions' && method === 'GET') {
      return jsonResponse({ promotions: snap?.tables?.promotions || [] });
    }
    if (pathname === '/api/admin/settings' && method === 'GET') {
      const settings: Record<string, string> = {};
      for (const row of snap?.tables?.site_settings || []) settings[row.key] = row.value;
      return jsonResponse({ settings: { ...settings, ...state.settingsOverlay } });
    }
    if (pathname === '/api/admin/settings' && method === 'PATCH') {
      Object.assign(state.settingsOverlay, body.settings || {});
      writeState(state);
      return jsonResponse({ ok: true });
    }
    if (pathname === '/api/admin/pages' && method === 'GET') {
      return jsonResponse({ pages: snap?.tables?.cms_pages || [] });
    }
    if (pathname === '/api/admin/journal' && method === 'GET') {
      return jsonResponse({ articles: snap?.tables?.journal_articles || [] });
    }
    if (pathname === '/api/admin/media' && method === 'GET') {
      return jsonResponse({ assets: snap?.tables?.media_assets || [] });
    }
    if (pathname === '/api/admin/team' && method === 'GET') {
      return jsonResponse({ admins: [], nonAdmins: [], auditLogs: [] });
    }
  }

  return null;
}
