import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/media';
import { localizeBrewingMethod } from '../../lib/i18nHelpers';
import { useStore } from '../../context/StoreContext';
import { useI18n } from '../../i18n/I18nContext';
import { MediaPickerModal, type MediaAssetRecord } from './MediaPickerModal';

interface VariantItem {
  label: string;
  priceVnd: number;
  priceUsd: number;
}

interface ProductEditorModalProps {
  open: boolean;
  product: any | null;
  mediaAssets: MediaAssetRecord[];
  onMediaUploaded: () => Promise<void> | void;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const AVAILABLE_BREW_METHODS = [
  'Vietnamese Phin',
  'Espresso',
  'Moka Pot',
  'Pour-over',
  'French Press',
  'Cold Brew',
  'Iced Milk Coffee',
  'Hot Water (70–80°C)',
  'Commercial Roasting',
  'Sample Roasting',
];

function toSafeSlugClient(raw: string): string {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  open,
  product,
  mediaAssets,
  onMediaUploaded,
  onClose,
  onSaved,
}) => {
  const { lang, t } = useI18n();
  const { apiFetch, showToast } = useStore();

  const [tab, setTab] = useState<'general' | 'pricing' | 'media' | 'specs'>('general');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<'roasted' | 'instant' | 'green_bean'>('roasted');
  const [nameVi, setNameVi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [subtitleVi, setSubtitleVi] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [descriptionVi, setDescriptionVi] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [mascotSlug, setMascotSlug] = useState('');
  const [featured, setFeatured] = useState(false);

  const [priceVnd, setPriceVnd] = useState(220000);
  const [priceUsd, setPriceUsd] = useState(9);
  const [inventory, setInventory] = useState(50);
  const [moq, setMoq] = useState('1');
  const [status, setStatus] = useState('active');
  const [variants, setVariants] = useState<VariantItem[]>([]);

  const [imageKey, setImageKey] = useState('product_robusta_house');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const [coffeeType, setCoffeeType] = useState('100% Robusta');
  const [originRegion, setOriginRegion] = useState('Đắk Lắk');
  const [screenSize, setScreenSize] = useState('S18');
  const [processingMethod, setProcessingMethod] = useState('Natural');
  const [harvestYear, setHarvestYear] = useState('2025/2026');
  const [moistureContent, setMoistureContent] = useState('≤ 12.5%');
  const [density, setDensity] = useState('Đang chờ phiếu kiểm nghiệm COA');
  const [defectInfo, setDefectInfo] = useState('Đang chờ phiếu kiểm nghiệm COA');
  const [gradingSpec, setGradingSpec] = useState('');
  const [roastProfileVi, setRoastProfileVi] = useState('');
  const [roastProfileEn, setRoastProfileEn] = useState('');
  const [tastingNotesVi, setTastingNotesVi] = useState('');
  const [tastingNotesEn, setTastingNotesEn] = useState('');
  const [blendSummaryVi, setBlendSummaryVi] = useState('');
  const [blendSummaryEn, setBlendSummaryEn] = useState('');
  const [blendPublic, setBlendPublic] = useState(true);
  const [brewingMethods, setBrewingMethods] = useState<string[]>([]);

  // Media Picker
  const [pickerTarget, setPickerTarget] = useState<'main' | 'gallery' | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab('general');
    setErrorMsg('');
    if (product) {
      setSku(product.sku || '');
      setSlug(product.slug || '');
      setSlugEdited(true);
      setCategory(product.category || 'roasted');
      setNameVi(product.name_vi || '');
      setNameEn(product.name_en || '');
      setSubtitleVi(product.subtitle_vi || '');
      setSubtitleEn(product.subtitle_en || '');
      setDescriptionVi(product.description_vi || '');
      setDescriptionEn(product.description_en || '');
      setMascotSlug(product.mascot_slug || '');
      setFeatured(Boolean(product.featured));

      setPriceVnd(Number(product.price_vnd || 0));
      setPriceUsd(Number(product.price_usd || 0));
      setInventory(Number(product.inventory || 0));
      setMoq(product.moq || '1');
      setStatus(product.status || 'active');
      setVariants(Array.isArray(product.variants) ? product.variants : []);

      setImageKey(product.image_key || 'product_robusta_house');
      setGalleryImages(Array.isArray(product.gallery_images) ? product.gallery_images : []);

      setCoffeeType(product.coffee_type || '');
      setOriginRegion(product.origin_region || '');
      setScreenSize(product.screen_size || '');
      setProcessingMethod(product.processing_method || '');
      setHarvestYear(product.harvest_year || '');
      setMoistureContent(product.moisture_content || '');
      setDensity(product.density || '');
      setDefectInfo(product.defect_info || '');
      setGradingSpec(product.grading_spec || '');
      setRoastProfileVi(product.roast_profile_vi || '');
      setRoastProfileEn(product.roast_profile_en || '');
      setTastingNotesVi(product.tasting_notes_vi || '');
      setTastingNotesEn(product.tasting_notes_en || '');
      setBlendSummaryVi(product.blend_summary_vi || '');
      setBlendSummaryEn(product.blend_summary_en || '');
      setBlendPublic(Boolean(product.blend_public));
      setBrewingMethods(Array.isArray(product.brewing_methods) ? product.brewing_methods : []);
    } else {
      setSku('');
      setSlug('');
      setSlugEdited(false);
      setCategory('roasted');
      setNameVi('');
      setNameEn('');
      setSubtitleVi('');
      setSubtitleEn('');
      setDescriptionVi('');
      setDescriptionEn('');
      setMascotSlug('');
      setFeatured(false);

      setPriceVnd(220000);
      setPriceUsd(9);
      setInventory(50);
      setMoq('1');
      setStatus('active');
      setVariants([{ label: '250g · Hạt nguyên chất', priceVnd: 220000, priceUsd: 9 }]);

      setImageKey('product_robusta_house');
      setGalleryImages([]);

      setCoffeeType('100% Robusta');
      setOriginRegion('Đắk Lắk');
      setScreenSize('S18');
      setProcessingMethod('Natural');
      setHarvestYear('2025/2026');
      setMoistureContent('≤ 12.5%');
      setDensity('Đang chờ phiếu kiểm nghiệm COA');
      setDefectInfo('Đang chờ phiếu kiểm nghiệm COA');
      setGradingSpec('');
      setRoastProfileVi('Rang vừa đậm');
      setRoastProfileEn('Medium-Dark Roast');
      setTastingNotesVi('');
      setTastingNotesEn('');
      setBlendSummaryVi('');
      setBlendSummaryEn('');
      setBlendPublic(true);
      setBrewingMethods(['Vietnamese Phin']);
    }
  }, [open, product]);

  if (!open) return null;

  const toggleBrewMethod = (m: string) => {
    setBrewingMethods((prev) => (prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]));
  };

  const addVariantRow = (label = '', vnd = priceVnd, usd = priceUsd) => {
    setVariants((prev) => [...prev, { label, priceVnd: vnd, priceUsd: usd }]);
  };

  const updateVariantRow = (idx: number, patch: Partial<VariantItem>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const removeVariantRow = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveGalleryItem = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= galleryImages.length) return;
    setGalleryImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!sku.trim() || !nameVi.trim()) {
      setErrorMsg(t('Vui lòng nhập đầy đủ Mã SKU và Tên sản phẩm (Tiếng Việt).', 'SKU and Product Name (VI) are required.'));
      setTab('general');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: sku.trim(),
        slug: (slug.trim() || toSafeSlugClient(nameVi) || sku.trim()).toLowerCase(),
        category,
        name_vi: nameVi.trim(),
        name_en: nameEn.trim() || nameVi.trim(),
        subtitle_vi: subtitleVi.trim(),
        subtitle_en: subtitleEn.trim() || subtitleVi.trim(),
        description_vi: descriptionVi.trim(),
        description_en: descriptionEn.trim() || descriptionVi.trim(),
        mascot_slug: mascotSlug,
        featured,
        price_vnd: Number(priceVnd || 0),
        price_usd: Number(priceUsd || 0),
        inventory: Number(inventory || 0),
        moq: moq.trim() || '1',
        status,
        variants: variants.filter((v) => v.label.trim().length > 0),
        image_key: imageKey,
        gallery_images: galleryImages,
        coffee_type: coffeeType,
        origin_region: originRegion,
        screen_size: screenSize,
        processing_method: processingMethod,
        harvest_year: harvestYear,
        moisture_content: moistureContent,
        density,
        defect_info: defectInfo,
        grading_spec: gradingSpec,
        roast_profile_vi: roastProfileVi,
        roast_profile_en: roastProfileEn,
        tasting_notes_vi: tastingNotesVi,
        tasting_notes_en: tastingNotesEn,
        blend_summary_vi: blendSummaryVi,
        blend_summary_en: blendSummaryEn,
        blend_public: blendPublic,
        brewing_methods: brewingMethods,
      };

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PATCH' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || t('Không thể lưu sản phẩm.', 'Unable to save product.'));
        return;
      }
      showToast(product ? t('Đã cập nhật sản phẩm', 'Updated product') : t('Đã tạo sản phẩm mới', 'Created new product'));
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {product
                  ? `${t('Chỉnh sửa sản phẩm:', 'Edit Product:')} ${product.name_vi}`
                  : t('Thêm sản phẩm mới', 'Add New Product')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {product ? `${t('Mã SKU:', 'SKU:')} ${product.sku}` : t('Quản lý thông tin, biến thể giá, thư viện ảnh và thông số COA', 'Manage general info, variants, gallery images & COA specs')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 WooCommerce Tabs */}
          <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'general', label: t('1. Thông tin chung', '1. General') },
              { id: 'pricing', label: t('2. Giá, Kho & Biến thể', '2. Pricing & Variants') },
              { id: 'media', label: t('3. Hình ảnh & Thư viện', '3. Images & Gallery') },
              { id: 'specs', label: t('4. Thông số Cà phê & COA', '4. Coffee Specs & COA') },
            ].map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id as any)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer ${
                  tab === tb.id
                    ? 'border-[#00552B] text-[#00552B] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">{errorMsg}</div>
            )}

            {/* TAB 1: GENERAL */}
            {tab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('Tên sản phẩm (Tiếng Việt) *', 'Product Name (VI) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameVi}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNameVi(val);
                      if (!slugEdited) setSlug(toSafeSlugClient(val));
                    }}
                    placeholder="VD: Cà phê Espresso Cao cấp"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('Tên sản phẩm (Tiếng Anh)', 'Product Name (EN)')}
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="ROAR COFFEE Espresso"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('Mã SKU *', 'SKU Code *')}</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="RC-RST-ESP"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('Đường dẫn tĩnh (Slug)', 'URL Slug')}</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="roar-espresso"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('Danh mục sản phẩm', 'Category')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="roasted">{t('Cà phê Rang xay', 'Roasted Coffee')}</option>
                    <option value="instant">{t('Cà phê Hòa tan', 'Instant Coffee')}</option>
                    <option value="green_bean">{t('Cà phê Nhân xanh B2B', 'Green Coffee Beans')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('Linh vật Cá tính Thương hiệu', 'Brand Personality Mascot')}
                  </label>
                  <select
                    value={mascotSlug}
                    onChange={(e) => setMascotSlug(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="">{t('-- Không gắn linh vật --', '-- None --')}</option>
                    <option value="tiger">{t('Hổ · Đậm đà & Bản lĩnh', 'Tiger')}</option>
                    <option value="lion">{t('Sư Tử · Chuẩn gu Phin', 'Lion')}</option>
                    <option value="fox">{t('Cáo · Linh hoạt Espresso', 'Fox')}</option>
                    <option value="eagle">{t('Đại Bàng · Bứt phá Espresso Gold', 'Eagle')}</option>
                    <option value="black-panther">{t('Báo Đen · Phiên bản Signature Reserve', 'Black Panther')}</option>
                    <option value="wolf">{t('Sói · Bộ sưu tập tương lai', 'Wolf')}</option>
                    <option value="owl">{t('Cú Mèo · Bộ sưu tập tương lai', 'Owl')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('Phụ đề (Tiếng Việt)', 'Subtitle (VI)')}</label>
                  <input
                    type="text"
                    value={subtitleVi}
                    onChange={(e) => setSubtitleVi(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('Phụ đề (Tiếng Anh)', 'Subtitle (EN)')}</label>
                  <input
                    type="text"
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('Mô tả chi tiết (Tiếng Việt)', 'Product Description (VI)')}
                  </label>
                  <textarea
                    rows={4}
                    value={descriptionVi}
                    onChange={(e) => setDescriptionVi(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('Mô tả chi tiết (Tiếng Anh)', 'Product Description (EN)')}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#00552B]"
                    />
                    {t('Đánh dấu là Sản phẩm nổi bật trên trang chủ', 'Feature this product on storefront highlights')}
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: PRICING, STOCK & VARIANTS */}
            {tab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Giá mặc định (VND)', 'Base Price (VND)')}</label>
                    <input
                      type="number"
                      min={0}
                      value={priceVnd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPriceVnd(val);
                        setPriceUsd(Number((val / 25000).toFixed(2)));
                      }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Giá mặc định (USD)', 'Base Price (USD)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={priceUsd}
                      onChange={(e) => setPriceUsd(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Tồn kho', 'Inventory')}</label>
                    <input
                      type="number"
                      min={0}
                      value={inventory}
                      onChange={(e) => setInventory(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white font-mono tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Số lượng tối thiểu (MOQ)', 'MOQ')}</label>
                    <input
                      type="text"
                      value={moq}
                      onChange={(e) => setMoq(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Trạng thái bán', 'Status')}</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="active">{t('Đang bán', 'Active')}</option>
                      <option value="configurable_on_request">{t('Đặt theo cấu hình', 'Configurable on Request')}</option>
                      <option value="out_of_stock">{t('Tạm hết hàng', 'Out of Stock')}</option>
                      <option value="draft">{t('Bản nháp / Lưu trữ', 'Draft / Archived')}</option>
                    </select>
                  </div>
                </div>

                {/* Visual Variant Builder */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {t('Biến thể & Quy cách đóng gói (WooCommerce)', 'Product Variations & Packaging')}
                      </h4>
                      <p className="text-slate-500">
                        {t('Thêm các lựa chọn khối lượng hoặc kiểu xay để khách hàng chọn khi mua hàng.', 'Define packaging weights or grind sizes with dedicated prices.')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addVariantRow('250g · Hạt nguyên chất', priceVnd, priceUsd)}
                        className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        + 250g Hạt
                      </button>
                      <button
                        type="button"
                        onClick={() => addVariantRow('500g · Hạt nguyên chất', priceVnd * 2, Number((priceUsd * 2).toFixed(2)))}
                        className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        + 500g Hạt
                      </button>
                      <button
                        type="button"
                        onClick={() => addVariantRow('1kg · Gói chuyên dụng quán (HORECA)', Math.round(priceVnd * 3.7), Number((priceUsd * 3.7).toFixed(2)))}
                        className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 font-medium cursor-pointer"
                      >
                        + 1kg HORECA
                      </button>
                      <button
                        type="button"
                        onClick={() => addVariantRow('', priceVnd, priceUsd)}
                        className="px-3 py-1.5 rounded bg-[#00552B] text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('Thêm biến thể', 'Add Variation')}
                      </button>
                    </div>
                  </div>

                  {variants.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-500">
                      {t('Chưa có biến thể nào. Sản phẩm sẽ dùng Giá mặc định ở trên.', 'No variants defined. Storefront will use the base price above.')}
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="p-2.5 text-left">{t('Tên quy cách / Biến thể', 'Variation Label')}</th>
                            <th className="p-2.5 text-right">{t('Giá bán (VND)', 'Price (VND)')}</th>
                            <th className="p-2.5 text-right">{t('Giá bán (USD)', 'Price (USD)')}</th>
                            <th className="p-2.5 text-right">{t('Xóa', 'Remove')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {variants.map((v, idx) => (
                            <tr key={idx}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.label}
                                  onChange={(e) => updateVariantRow(idx, { label: e.target.value })}
                                  placeholder="VD: 500g · Xay pha Phin"
                                  className="w-full border border-slate-200 rounded px-2.5 py-1.5"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  value={v.priceVnd}
                                  onChange={(e) => {
                                    const vnd = Number(e.target.value);
                                    updateVariantRow(idx, {
                                      priceVnd: vnd,
                                      priceUsd: Number((vnd / 25000).toFixed(2)),
                                    });
                                  }}
                                  className="w-32 text-right border border-slate-200 rounded px-2.5 py-1.5 font-mono tabular-nums"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={v.priceUsd}
                                  onChange={(e) => updateVariantRow(idx, { priceUsd: Number(e.target.value) })}
                                  className="w-24 text-right border border-slate-200 rounded px-2.5 py-1.5 font-mono tabular-nums"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeVariantRow(idx)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                  aria-label={t('Xóa biến thể', 'Remove variation')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: IMAGES & GALLERY */}
            {tab === 'media' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">{t('Ảnh đại diện sản phẩm', 'Featured Product Image')}</h4>
                  <div className="max-w-[280px] aspect-[4/5] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                    <img
                      src={resolveMediaUrl(imageKey)}
                      alt={nameVi || 'Featured product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPickerTarget('main')}
                      className="flex-1 py-2 px-3 bg-[#00552B] hover:bg-[#003D25] text-white font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {t('Chọn / Tải ảnh đại diện', 'Choose / Upload Main Image')}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate">{imageKey}</p>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {t('Thư viện ảnh chi tiết sản phẩm', 'Product Gallery Images')} ({galleryImages.length})
                      </h4>
                      <p className="text-slate-500">
                        {t('Các hình ảnh này hiển thị thêm trong thanh trượt trang chi tiết sản phẩm.', 'Displayed in the product detail image carousel alongside the main image.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickerTarget('gallery')}
                      className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('Thêm ảnh thư viện', 'Add Gallery Image')}
                    </button>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
                      {t('Chưa có ảnh bổ sung riêng. Hệ thống sẽ hiển thị bộ ảnh mặc định theo dòng sản phẩm.', 'No custom gallery images added yet. Default category slides will be shown.')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {galleryImages.map((imgVal, idx) => (
                        <div key={`${imgVal}-${idx}`} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <div className="aspect-[4/5] bg-slate-100 relative">
                            <img src={resolveMediaUrl(imgVal)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2 flex items-center justify-between gap-1 bg-slate-50 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveGalleryItem(idx, -1)}
                                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === galleryImages.length - 1}
                                onClick={() => moveGalleryItem(idx, 1)}
                                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: COFFEE SPECS & COA */}
            {tab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Loại hạt / Dòng cà phê', 'Coffee Type')}</label>
                    <input type="text" value={coffeeType} onChange={(e) => setCoffeeType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Vùng nguyên liệu', 'Origin Region')}</label>
                    <input type="text" value={originRegion} onChange={(e) => setOriginRegion(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Cỡ sàng', 'Screen Size')}</label>
                    <input type="text" value={screenSize} onChange={(e) => setScreenSize(e.target.value)} placeholder="S14 / S16 / S18" className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Phương pháp sơ chế', 'Processing Method')}</label>
                    <input type="text" value={processingMethod} onChange={(e) => setProcessingMethod(e.target.value)} placeholder="Natural / Honey / CBU" className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Niên vụ thu hoạch', 'Harvest Year')}</label>
                    <input type="text" value={harvestYear} onChange={(e) => setHarvestYear(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Độ ẩm (COA)', 'Moisture Content')}</label>
                    <input type="text" value={moistureContent} onChange={(e) => setMoistureContent(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Tỷ trọng hạt', 'Density')}</label>
                    <input type="text" value={density} onChange={(e) => setDensity(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Thông số lỗi hạt', 'Defect Spec')}</label>
                    <input type="text" value={defectInfo} onChange={(e) => setDefectInfo(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Tiêu chuẩn phân loại', 'Grading Spec')}</label>
                    <input type="text" value={gradingSpec} onChange={(e) => setGradingSpec(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Hồ sơ rang (Tiếng Việt)', 'Roast Profile (VI)')}</label>
                    <input type="text" value={roastProfileVi} onChange={(e) => setRoastProfileVi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Hồ sơ rang (Tiếng Anh)', 'Roast Profile (EN)')}</label>
                    <input type="text" value={roastProfileEn} onChange={(e) => setRoastProfileEn(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Ghi chú thử nếm (Tiếng Việt)', 'Tasting Notes (VI)')}</label>
                    <input type="text" value={tastingNotesVi} onChange={(e) => setTastingNotesVi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Ghi chú thử nếm (Tiếng Anh)', 'Tasting Notes (EN)')}</label>
                    <input type="text" value={tastingNotesEn} onChange={(e) => setTastingNotesEn(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Tóm tắt phối trộn (VI)', 'Blend Summary (VI)')}</label>
                    <input type="text" value={blendSummaryVi} onChange={(e) => setBlendSummaryVi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('Tóm tắt phối trộn (EN)', 'Blend Summary (EN)')}</label>
                    <input type="text" value={blendSummaryEn} onChange={(e) => setBlendSummaryEn(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blendPublic}
                      onChange={(e) => setBlendPublic(e.target.checked)}
                      className="w-4 h-4 accent-[#00552B]"
                    />
                    {t('Công khai tỷ lệ phối trộn trên cửa hàng', 'Publicly display blend formula on storefront')}
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    {t('Phương pháp pha chế gợi ý', 'Recommended Brewing Methods')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_BREW_METHODS.map((m) => {
                      const checked = brewingMethods.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleBrewMethod(m)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                            checked
                              ? 'bg-[#00552B] text-white border-[#00552B]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {localizeBrewingMethod(m, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {t('Hủy bỏ', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold bg-[#00552B] hover:bg-[#003D25] text-white rounded-lg cursor-pointer disabled:opacity-50"
            >
              {saving
                ? t('Đang lưu...', 'Saving...')
                : product
                  ? t('Cập nhật sản phẩm', 'Save Changes')
                  : t('Đăng bán sản phẩm', 'Publish Product')}
            </button>
          </div>
        </form>
      </div>

      <MediaPickerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        mediaAssets={mediaAssets}
        onMediaUploaded={onMediaUploaded}
        title={
          pickerTarget === 'main'
            ? t('Chọn ảnh đại diện sản phẩm', 'Select Main Product Image')
            : t('Thêm ảnh vào thư viện sản phẩm', 'Add Image to Product Gallery')
        }
        onSelect={(val) => {
          if (pickerTarget === 'main') {
            setImageKey(val);
          } else if (pickerTarget === 'gallery') {
            setGalleryImages((prev) => (prev.includes(val) ? prev : [...prev, val]));
          }
        }}
      />
    </>
  );
};
