import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Compass, Flame, Globe2, PackageCheck, Pause, Play } from 'lucide-react';
import { AdaptiveLogo } from '../components/AdaptiveLogo';
import { MediaImage } from '../components/MediaImage';
import { VietnamOriginMap } from '../components/VietnamOriginMap';
import { useI18n } from '../i18n/I18nContext';
import { type Product, useStore } from '../context/StoreContext';
import { localizeCoffeeType, localizeJournalCategory } from '../lib/i18nHelpers';

interface HeroSlide {
  id: string;
  imageKey: string;
  badgeVi: string;
  badgeEn: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  captionVi: string;
  captionEn: string;
  primaryCtaVi: string;
  primaryCtaEn: string;
  primaryTo: string;
  secondaryCtaVi: string;
  secondaryCtaEn: string;
  secondaryTo: string;
  tabLabelVi: string;
  tabLabelEn: string;
  surfaceClass: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'flagship',
    imageKey: 'hero_roar_coffee',
    badgeVi: 'Thương hiệu Cà phê Việt Nam Cao Cấp',
    badgeEn: 'Distinctive Vietnamese Coffee Brand',
    titleVi: 'KHƠI BẢN LĨNH. ĐẬM CHẤT RIÊNG.',
    titleEn: 'IGNITING COURAGE. DEFINING CHARACTER.',
    descVi:
      'Kết tinh vùng nguyên liệu Việt Nam đích thực, nghệ thuật rang xay tinh tuyển, 7 cá tính thương hiệu riêng biệt và nền tảng thương mại cà phê nhân xanh S14/S16/S18 chuẩn quốc tế.',
    descEn:
      'Uniting authentic Vietnamese coffee origins, disciplined roast craftsmanship, seven distinctive brand personalities, and a commercial S14/S16/S18 green coffee portal.',
    captionVi: 'Hình ảnh minh họa nghệ thuật pha Phin Việt Nam — KHƠI BẢN LĨNH. ĐẬM CHẤT RIÊNG.',
    captionEn: 'Editorial concept of Vietnamese Phin extraction — IGNITING COURAGE. DEFINING CHARACTER.',
    primaryCtaVi: 'Khám phá cà phê',
    primaryCtaEn: 'Explore Coffee',
    primaryTo: '/shop',
    secondaryCtaVi: 'Trở thành đối tác',
    secondaryCtaEn: 'Become a Partner',
    secondaryTo: '/partners',
    tabLabelVi: '01 · Bản sắc ROAR',
    tabLabelEn: '01 · ROAR Identity',
    surfaceClass: 'bg-[#003D25]',
  },
  {
    id: 'signature-reserve',
    imageKey: 'hero_signature_reserve_banner',
    badgeVi: 'Báo Đen · 60% Robusta · 20% Culi · 20% Arabica',
    badgeEn: 'Black Panther · 60% Robusta · 20% Culi · 20% Arabica',
    titleVi: 'ROAR SIGNATURE RESERVE — ĐẲNG CẤP TINH HOA',
    titleEn: 'ROAR SIGNATURE RESERVE — LUXURY EDITION',
    descVi:
      'Tuyệt phẩm phối trộn chỉ định từ nhân xanh chế biến ướt CBU, lớp crema dày mịn hổ phách và hộp quà đen huyền – vàng champagne cho những dấu ấn trang trọng.',
    descEn:
      'Precision-crafted flagship blend with specified Washed CBU green beans, rich tiger-striped crema, and obsidian-gold executive gifting.',
    captionVi: 'Chiết xuất Espresso Signature Reserve với lớp crema vàng hổ phách đặc trưng.',
    captionEn: 'Signature Reserve Espresso extraction with rich amber tiger-striped crema.',
    primaryCtaVi: 'Khám phá Signature Reserve',
    primaryCtaEn: 'Discover Signature Reserve',
    primaryTo: '/signature-reserve',
    secondaryCtaVi: 'Đặt mua phiên bản Reserve',
    secondaryCtaEn: 'Shop Reserve Edition',
    secondaryTo: '/product/signature-reserve',
    tabLabelVi: '02 · Signature Reserve',
    tabLabelEn: '02 · Signature Reserve',
    surfaceClass: 'bg-[#0D1913]',
  },
  {
    id: 'green-matrix',
    imageKey: 'hero_highland_harvest_banner',
    badgeVi: 'Nguồn hạt Cao nguyên · Chuẩn B2B & Xuất khẩu',
    badgeEn: 'Highland Harvest · B2B & Export Matrix',
    titleVi: '27 CẤU HÌNH NHÂN XANH S14 / S16 / S18',
    titleEn: '27 CONFIGURABLE GREEN COFFEE SKUS',
    descVi:
      'Minh bạch từng vùng trồng Tây Nguyên với 3 dòng hạt (Robusta, Arabica, Culi/Peaberry), 3 cỡ sàng và 3 phương pháp Natural, Honey, Washed (CBU) sẵn sàng gửi mẫu thử.',
    descEn:
      'Traceable Central Highlands sourcing across 3 bean types, 3 screen grades (S14, S16, S18), and Natural, Honey & Washed (CBU) processing with sample fulfillment.',
    captionVi: 'Mùa thu hoạch chín mọng trên cao nguyên Tây Nguyên — nền tảng của mọi mẻ rang chuẩn.',
    captionEn: 'Ripe highland coffee harvest across Vietnam Central Highlands — foundation of every roast.',
    primaryCtaVi: 'Mở ma trận nhân xanh 27 mã',
    primaryCtaEn: 'Open 27-SKU Matrix',
    primaryTo: '/coffee/green-beans',
    secondaryCtaVi: 'OEM & Xuất khẩu',
    secondaryCtaEn: 'OEM & Export',
    secondaryTo: '/oem-export',
    tabLabelVi: '03 · Nhân xanh B2B',
    tabLabelEn: '03 · Green Coffee B2B',
    surfaceClass: 'bg-[#003D25]',
  },
  {
    id: 'brewing-craft',
    imageKey: 'product_brewing_ritual',
    badgeVi: 'Từ Nông Trại Đến Tách Cà Phê',
    badgeEn: 'From Farm to Cup Craft',
    titleVi: 'NGHỆ THUẬT PHA PHIN & RANG XAY CHUẨN MỰC',
    titleEn: 'VIETNAMESE PHIN & ROASTERY DISCIPLINE',
    descVi:
      'Khám phá quy trình 8 bước khép kín từ canh tác, chế biến đến công thức pha Phin truyền thống, Espresso, Pour-over và Cold Brew tối ưu cho từng gu thưởng thức.',
    descEn:
      'Explore our 8-stage farm-to-cup workflow alongside calibrated recipes for Vietnamese Phin, Espresso, Pour-over, French Press, and Cold Brew.',
    captionVi: 'Nghi thức pha Phin Việt Nam chậm rãi, tôn vinh hương vị nguyên bản.',
    captionEn: 'Slow Vietnamese Phin ritual celebrating authentic highland terroir.',
    primaryCtaVi: 'Xem hướng dẫn pha chế',
    primaryCtaEn: 'Brewing Guide',
    primaryTo: '/brewing',
    secondaryCtaVi: 'Hành trình 8 bước',
    secondaryCtaEn: '8-Stage Journey',
    secondaryTo: '/farm-to-cup',
    tabLabelVi: '04 · Pha chế & Quy trình',
    tabLabelEn: '04 · Brew & Craft',
    surfaceClass: 'bg-[#062C1B]',
  },
];

export const HomePage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const { personalities, formatPrice, addToCart, showToast, theme } = useStore();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Quick interactive Green Coffee selector
  const [gcType, setGcType] = useState('RO');
  const [gcScreen, setGcScreen] = useState('S18');
  const [gcProc, setGcProc] = useState('HON');

  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setFeaturedProducts((d.products || []).filter((p: Product) => p.category !== 'green_bean').slice(0, 4)))
      .catch(() => {});
    fetch('/api/journal')
      .then((r) => (r.ok ? r.json() : { articles: [] }))
      .then((d) => setArticles((d.articles || []).slice(0, 3)))
      .catch(() => {});
    fetch('/api/promotions')
      .then((r) => (r.ok ? r.json() : { promotions: [] }))
      .then((d) => setPromotions((d.promotions || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  const isCarouselPaused = heroPaused || userPaused;

  useEffect(() => {
    if (isCarouselPaused) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const timer = window.setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isCarouselPaused]);

  const activeSlide = HERO_SLIDES[heroIdx];
  const selectedGreenSku = `${gcType}-${gcScreen}-${gcProc}`;
  const selectedGreenSlug = `green-${gcType.toLowerCase()}-${gcScreen.toLowerCase()}-${gcProc.toLowerCase()}`;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 45) {
      setHeroIdx((prev) => (delta < 0 ? (prev + 1) % HERO_SLIDES.length : (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length));
    }
    touchStartX.current = null;
  };

  return (
    <div className="bg-[#F8F5EF] dark:bg-[#0E1512] text-[#202020] dark:text-[#F1EFEA] transition-colors">
      {/* 1. DYNAMIC MULTI-SLIDE HERO BANNER CAROUSEL */}
      <section
        className={`relative ${activeSlide.surfaceClass} text-white overflow-hidden transition-colors duration-700`}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-8 lg:pt-16 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div key={activeSlide.id} className="lg:col-span-6 flex flex-col justify-center space-y-6 transition-all duration-500">
            <div className="flex items-center justify-between gap-4">
              <AdaptiveLogo variant="horizontal" surface="dark" size="md" />
              <span className="font-mono text-xs text-[#C6A667]/90 border border-[#C6A667]/30 px-2.5 py-1 rounded tabular-nums">
                0{heroIdx + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#C6A667]">
                {lang === 'vi' ? activeSlide.badgeVi : activeSlide.badgeEn}
              </p>
              <h1 className="text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.1] font-bold tracking-tight text-balance">
                {lang === 'vi' ? activeSlide.titleVi : activeSlide.titleEn}
              </h1>
              <p className="text-sm sm:text-base text-[#F8F5EF]/80 leading-relaxed max-w-xl">
                {lang === 'vi' ? activeSlide.descVi : activeSlide.descEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to={localePath(activeSlide.primaryTo)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A667] text-[#111111] font-semibold text-sm rounded hover:bg-[#d4b67a] transition-colors whitespace-nowrap"
              >
                <span>{lang === 'vi' ? activeSlide.primaryCtaVi : activeSlide.primaryCtaEn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={localePath(activeSlide.secondaryTo)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white font-medium text-sm rounded hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <span>{lang === 'vi' ? activeSlide.secondaryCtaVi : activeSlide.secondaryCtaEn}</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/15 text-xs">
              <div>
                <span className="font-mono text-lg font-semibold text-[#C6A667] block tabular-nums">7</span>
                <span className="text-[#F8F5EF]/75">{t('Cá tính thương hiệu', 'Brand Personalities')}</span>
              </div>
              <div>
                <span className="font-mono text-lg font-semibold text-[#C6A667] block tabular-nums">27 SKUs</span>
                <span className="text-[#F8F5EF]/75">{t('Cấu hình nhân xanh B2B', 'Green Bean Matrix')}</span>
              </div>
              <div>
                <span className="font-mono text-lg font-semibold text-[#C6A667] block tabular-nums">CBU</span>
                <span className="text-[#F8F5EF]/75">{t('Chuẩn chế biến ướt', 'Washed Designation')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[460px] rounded-xl overflow-hidden border border-[#C6A667]/25 bg-black/25">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                aria-hidden={idx !== heroIdx}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  idx === heroIdx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.04] z-0 pointer-events-none'
                }`}
              >
                <MediaImage
                  imageKey={slide.imageKey}
                  alt={lang === 'vi' ? slide.titleVi : slide.titleEn}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex items-end justify-between gap-4 p-5 sm:p-6">
              <p className="text-xs text-[#F8F5EF]/90 max-w-md">
                {lang === 'vi' ? activeSlide.captionVi : activeSlide.captionEn}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? t('Tiếp tục chạy banner', 'Resume carousel') : t('Tạm dừng banner', 'Pause carousel')}
                  className="w-9 h-9 rounded-full bg-black/55 border border-white/25 text-white flex items-center justify-center hover:bg-[#C6A667] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  {userPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setHeroIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                  aria-label={t('Banner trước', 'Previous banner')}
                  className="w-9 h-9 rounded-full bg-black/55 border border-white/25 text-white flex items-center justify-center hover:bg-[#C6A667] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setHeroIdx((prev) => (prev + 1) % HERO_SLIDES.length)}
                  aria-label={t('Banner tiếp theo', 'Next banner')}
                  className="w-9 h-9 rounded-full bg-black/55 border border-white/25 text-white flex items-center justify-center hover:bg-[#C6A667] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Banner Selector Tabs with Dynamic Progress Track */}
        <div className="border-t border-white/10 bg-black/15">
          <div className="max-w-[1280px] mx-auto px-6 py-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
            {HERO_SLIDES.map((slide, idx) => {
              const active = idx === heroIdx;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setHeroIdx(idx)}
                  className={`relative overflow-hidden text-left px-3.5 py-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-[#C6A667] text-[#111111] border-[#C6A667] font-semibold'
                      : 'bg-white/5 text-white/75 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="block truncate">{lang === 'vi' ? slide.tabLabelVi : slide.tabLabelEn}</span>
                  {active && !isCarouselPaused && (
                    <span
                      key={`prog-${heroIdx}`}
                      className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#003D25]/60 animate-hero-progress"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. BRAND INTRODUCTION (with Official Vertical Logo) */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-[#202020]/10 dark:border-white/10">
        <div className="lg:col-span-4 flex justify-center lg:justify-start">
          <div className="bg-white dark:bg-[#16221C] p-8 rounded-xl border border-[#202020]/8 dark:border-white/10 inline-flex flex-col items-center text-center">
            <AdaptiveLogo variant="vertical" surface={theme === 'dark' ? 'dark' : 'light'} size="md" />
          </div>
        </div>
        <div className="lg:col-span-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00552B] dark:text-[#C6A667]">
            {t('Triết lý thương hiệu', 'Brand Positioning')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA] text-balance">
            {t(
              'Bản sắc cà phê Việt Nam đương đại cho thị trường nội địa và quốc tế',
              'Authentic Vietnamese coffee heritage shaped for contemporary life and global trade'
            )}
          </h2>
          <p className="text-base text-[#202020]/80 dark:text-[#F1EFEA]/80 leading-relaxed max-w-3xl">
            {t(
              'ROAR COFFEE kết hợp nguồn gốc cà phê Việt Nam chân thực, tay nghề chế tác chuẩn mực, phong cách sống hiện đại và bảy cá tính độc bản. Từ tách cà phê hằng ngày đến chuỗi cung ứng nhân xanh thương mại S14/S16/S18, mọi điểm chạm đều nhất quán về chất lượng và sự minh bạch.',
              'ROAR COFFEE bridges authentic Vietnamese highland coffee origins, disciplined craft, modern lifestyles, and seven distinct character archetypes — spanning daily roasted rituals, luxury Reserve gifting, and institutional S14/S16/S18 green bean supply.'
            )}
          </p>
          <div className="pt-2">
            <Link to={localePath('/about')} className="text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline inline-flex items-center gap-1.5">
              <span>{t('Tìm hiểu câu chuyện ROAR COFFEE', 'Read the ROAR COFFEE Story')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COFFEE COLLECTIONS */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00552B] dark:text-[#C6A667]">
              {t('Bộ sưu tập tiêu biểu', 'Featured Collections')}
            </p>
            <h2 className="text-3xl font-bold text-[#202020] dark:text-[#F1EFEA] mt-1">
              {t('Cà Phê Rang Xay & Hòa Tan ROAR', 'Roasted & Instant Collections')}
            </h2>
          </div>
          <Link to={localePath('/shop')} className="text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline whitespace-nowrap">
            {t('Xem tất cả sản phẩm →', 'View All Products →')}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/8 dark:border-white/10 overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5 transition-transform"
            >
              <div>
                <Link to={localePath(`/product/${p.slug}`)} className="block aspect-[4/5] overflow-hidden bg-[#F8F5EF] dark:bg-[#0E1512]">
                  <MediaImage
                    imageKey={p.image_key}
                    alt={lang === 'vi' ? p.name_vi : p.name_en}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </Link>
                <div className="p-5 space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#00552B] dark:text-[#C6A667]">
                    {p.sku} · {localizeCoffeeType(p.coffee_type, lang)}
                  </p>
                  <Link
                    to={localePath(`/product/${p.slug}`)}
                    className="block text-base font-bold text-[#202020] dark:text-[#F1EFEA] hover:text-[#00552B] dark:hover:text-[#C6A667] leading-snug"
                  >
                    {lang === 'vi' ? p.name_vi : p.name_en}
                  </Link>
                  <p className="text-xs text-[#202020]/70 dark:text-[#F1EFEA]/70 line-clamp-2">
                    {lang === 'vi' ? p.subtitle_vi : p.subtitle_en}
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-[#202020]/8 dark:border-white/10 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#202020] dark:text-[#F1EFEA] tabular-nums">
                  {formatPrice(p.price_vnd, p.price_usd)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const firstVar = p.variants[0];
                    addToCart({
                      productId: p.id,
                      slug: p.slug,
                      sku: p.sku,
                      nameVi: p.name_vi,
                      nameEn: p.name_en,
                      variantLabel: firstVar ? firstVar.label : 'Standard',
                      unitPriceVnd: firstVar ? firstVar.priceVnd : p.price_vnd,
                      unitPriceUsd: firstVar ? firstVar.priceUsd : p.price_usd,
                      quantity: 1,
                      imageKey: p.image_key,
                    });
                    showToast(t('Đã thêm vào giỏ hàng', 'Added to cart'));
                  }}
                  className="px-3 py-1.5 bg-[#00552B] text-white text-xs font-medium rounded hover:bg-[#003D25] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t('Thêm vào giỏ', 'Add to Cart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SEVEN BRAND PERSONALITIES */}
      <section className="bg-white dark:bg-[#131D18] border-y border-[#202020]/10 dark:border-white/10 py-16">
        <div className="max-w-[1280px] mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00552B] dark:text-[#C6A667]">
                {t('7 Cá Tính – 7 Dấu Ấn Riêng', 'Seven Personalities. Seven Distinct Characters.')}
              </p>
              <h2 className="text-3xl font-bold text-[#202020] dark:text-[#F1EFEA] mt-1">
                {t('Khám phá Linh Vật Bản Sắc ROAR COFFEE', 'Meet the Seven ROAR Characters')}
              </h2>
            </div>
            <Link to={localePath('/personalities')} className="text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline whitespace-nowrap">
              {t('Trải nghiệm đầy đủ →', 'Explore All Seven →')}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {personalities.map((m) => (
              <Link
                key={m.slug}
                to={localePath(`/personalities/${m.slug}`)}
                className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all hover:-translate-y-1 ${
                  m.slug === 'black-panther'
                    ? 'bg-[#111111] text-[#F8F5EF] border-[#C6A667]/40'
                    : 'bg-[#F8F5EF] dark:bg-[#1A2820] text-[#202020] dark:text-[#F1EFEA] border-[#202020]/10 dark:border-white/10 hover:border-[#00552B]/40 dark:hover:border-[#C6A667]/50'
                }`}
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <MediaImage
                    imageKey={m.custom_image_url || m.image_key}
                    alt={`${m.animal_en} — ${m.animal_vi}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold leading-tight">
                    {lang === 'vi' ? m.animal_vi : `${m.animal_en} · ${m.animal_vi}`}
                  </h3>
                  <p className={`text-[11px] line-clamp-2 ${m.slug === 'black-panther' ? 'text-[#C6A667]' : 'text-[#202020]/65 dark:text-[#F1EFEA]/65'}`}>
                    {lang === 'vi' ? m.traits_vi : m.traits_en}
                  </p>
                  <p className={`text-[10px] pt-1 font-medium ${m.slug === 'black-panther' ? 'text-white/75' : 'text-[#00552B] dark:text-[#C6A667]'}`}>
                    {lang === 'vi' ? m.product_association_vi : m.product_association_en}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GREEN COFFEE BEANS (B2B CONFIGURABLE MATRIX GATEWAY) */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="bg-[#003D25] text-white rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C6A667]">
              {t('Thương mại B2B & Xuất khẩu', 'B2B Green Coffee Supply')}
            </p>
            <h2 className="text-3xl font-bold text-balance">
              {t('Cà Phê Nhân Xanh Việt Nam — 27 Cấu Hình Chuẩn Hóa', 'Vietnamese Green Coffee Beans — 27 Configurable Specifications')}
            </h2>
            <p className="text-sm text-[#F8F5EF]/80 leading-relaxed">
              {t(
                'Hệ thống cấu hình 3 dòng hạt (Robusta, Arabica, Culi/Peaberry) × 3 cỡ sàng (S14, S16, S18) × 3 phương pháp chế biến (Natural, Honey, Washed CBU). Dễ dàng tra cứu thông số, yêu cầu mẫu thử và nhận báo giá 30kg, 60kg, 69kg hoặc Big Bag 1.000kg.',
                'Configure across 3 classifications (Robusta, Arabica, Culi / Peaberry) × 3 screen sizes (S14, S16, S18) × 3 processing methods (Natural, Honey, Washed CBU). Request verified samples and quotations from 30kg bags to 1,000kg Big Bags.'
              )}
            </p>

            {/* Quick Interactive Matrix Builder */}
            <div className="bg-white/10 rounded-xl p-4 space-y-3 border border-white/15">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#C6A667] block mb-1 font-medium">{t('Dòng hạt', 'Type')}</span>
                  <select
                    value={gcType}
                    onChange={(e) => setGcType(e.target.value)}
                    className="w-full bg-[#002D1B] border border-white/20 rounded px-2 py-2 text-white"
                  >
                    <option value="RO">Robusta (RO)</option>
                    <option value="AR">Arabica (AR)</option>
                    <option value="CU">{t('Culi / Hạt tròn (CU)', 'Culi / Peaberry (CU)')}</option>
                  </select>
                </div>
                <div>
                  <span className="text-[#C6A667] block mb-1 font-medium">{t('Cỡ sàng', 'Screen')}</span>
                  <select
                    value={gcScreen}
                    onChange={(e) => setGcScreen(e.target.value)}
                    className="w-full bg-[#002D1B] border border-white/20 rounded px-2 py-2 text-white"
                  >
                    <option value="S14">S14</option>
                    <option value="S16">S16</option>
                    <option value="S18">S18</option>
                  </select>
                </div>
                <div>
                  <span className="text-[#C6A667] block mb-1 font-medium">{t('Chế biến', 'Process')}</span>
                  <select
                    value={gcProc}
                    onChange={(e) => setGcProc(e.target.value)}
                    className="w-full bg-[#002D1B] border border-white/20 rounded px-2 py-2 text-white"
                  >
                    <option value="NAT">{t('Sơ chế Khô (Natural)', 'Natural')}</option>
                    <option value="HON">{t('Sơ chế Mật ong (Honey)', 'Honey')}</option>
                    <option value="CBU">{t('Chế biến ướt (CBU)', 'Washed (CBU)')}</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="font-mono text-sm text-[#C6A667] font-semibold">SKU: {selectedGreenSku}</span>
                <div className="flex gap-2">
                  <Link
                    to={localePath(`/product/${selectedGreenSlug}`)}
                    className="px-4 py-2 bg-[#C6A667] text-[#111111] text-xs font-semibold rounded hover:bg-[#d4b67a] transition-colors"
                  >
                    {t('Xem thông số & Yêu cầu mẫu', 'Inspect Spec & Sample')}
                  </Link>
                  <Link
                    to={localePath('/coffee/green-beans')}
                    className="px-4 py-2 border border-white/25 text-white text-xs font-medium rounded hover:bg-white/10 transition-colors"
                  >
                    {t('Mở ma trận 27 mã', 'Full 27-SKU Matrix')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
            <MediaImage
              imageKey="product_green_coffee_beans"
              alt="Natural, Honey, and Washed CBU green coffee sorting trays"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. VIETNAMESE COFFEE ORIGIN MAP */}
      <section className="max-w-[1280px] mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00552B] dark:text-[#C6A667]">
              {t('Khám phá vùng nguyên liệu cà phê Việt Nam', 'Discover the Origins of Vietnamese Coffee')}
            </p>
            <h2 className="text-3xl font-bold text-[#202020] dark:text-[#F1EFEA] mt-1">
              {t('10 Vùng Trồng Cà Phê Việt Nam — Bản Đồ Vệ Tinh & Địa Hình Thật', '10 Vietnamese Coffee Regions — Real Satellite & Terrain Map')}
            </h2>
          </div>
        </div>
        <VietnamOriginMap compact />
      </section>

      {/* 7 & 8. FROM FARM TO CUP + BREWING EXPERIENCE */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <Compass className="w-6 h-6 text-[#00552B] dark:text-[#C6A667]" />
            <h3 className="text-2xl font-bold text-[#202020] dark:text-[#F1EFEA]">
              {t('Hành trình Từ Nông Trại Đến Tách Cà Phê', 'From Farm to Cup Journey')}
            </h3>
            <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
              {t(
                '8 giai đoạn khép kín: Canh tác · Thu hái chín · Chế biến Natural / Honey / CBU · Tuyển chọn nhân xanh · Rang chuẩn · Xay · Pha chế · Thưởng thức.',
                'Eight disciplined stages: Cultivation · Selective Harvesting · Natural / Honey / CBU Processing · Green Selection · Roasting · Grinding · Brewing · Enjoying.'
              )}
            </p>
          </div>
          <Link
            to={localePath('/farm-to-cup')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline"
          >
            <span>{t('Khám phá quy trình 8 bước', 'Explore the 8-Stage Process')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <Flame className="w-6 h-6 text-[#00552B] dark:text-[#C6A667]" />
            <h3 className="text-2xl font-bold text-[#202020] dark:text-[#F1EFEA]">
              {t('Nghệ thuật Pha Chế Chuẩn Mực', 'Coffee Brewing Guide')}
            </h3>
            <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
              {t(
                'Công thức tham chiếu song ngữ cho Phin Việt Nam (20g · ủ 30s · 4–5 phút), Espresso (18g → 36g · 90–94°C), Pour-over, French Press và Cold Brew.',
                'Interactive bilingual recipes for Vietnamese Phin (20g · 30s bloom · 4–5m), Espresso (18g → 36g · 90–94°C), Pour-over, French Press, and Cold Brew.'
              )}
            </p>
          </div>
          <Link
            to={localePath('/brewing')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline"
          >
            <span>{t('Mở hướng dẫn pha chế', 'Open Brewing Calculator & Guide')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 9. SIGNATURE RESERVE LUXURY SPOTLIGHT */}
      <section className="bg-[#0B0B0B] text-[#F8F5EF] py-16">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C6A667]">
              {t('Báo Đen · 60% Robusta · 20% Culi · 20% Arabica', 'Black Panther · 60% Robusta · 20% Culi · 20% Arabica')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
              ROAR COFFEE SIGNATURE RESERVE
            </h2>
            <p className="text-sm sm:text-base text-[#F8F5EF]/80 leading-relaxed">
              {t(
                'Tuyệt phẩm sang trọng mang dấu ấn Báo Đen — kết hợp 60% Robusta, 20% Culi và 20% Arabica cùng nguồn nhân xanh CBU chỉ định. Thiết kế hộp quà đen huyền và vàng champagne dành cho thưởng thức tinh tế và quà tặng cấp cao.',
                'Our flagship Black Panther edition combining 60% Robusta, 20% Culi, and 20% Arabica with specified CBU green beans. Finished in deep obsidian and champagne gold for refined rituals and executive gifting.'
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={localePath('/signature-reserve')}
                className="px-6 py-3 bg-[#C6A667] text-[#111111] text-sm font-semibold rounded hover:bg-[#d4b67a] transition-colors"
              >
                {t('Khám phá Signature Reserve', 'Discover Signature Reserve')}
              </Link>
              <Link
                to={localePath('/product/signature-reserve')}
                className="px-6 py-3 border border-[#C6A667]/40 text-[#C6A667] text-sm font-medium rounded hover:bg-[#C6A667]/10 transition-colors"
              >
                {t('Đặt mua ngay', 'Shop Reserve Edition')}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-5 gap-4 items-center">
            <div className="col-span-3 aspect-[4/3] rounded-xl overflow-hidden border border-[#C6A667]/30">
              <MediaImage
                imageKey="product_signature_reserve"
                alt="ROAR COFFEE Signature Reserve Obsidian & Gold Edition"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="col-span-2 aspect-square rounded-xl overflow-hidden border border-[#C6A667]/30">
              <MediaImage
                imageKey="mascot_panther"
                alt="Black Panther Crest — Signature Reserve"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10 & 11. WHOLESALE / DISTRIBUTION + OEM & EXPORT */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-8 space-y-4">
          <PackageCheck className="w-6 h-6 text-[#00552B] dark:text-[#C6A667]" />
          <h3 className="text-2xl font-bold text-[#202020] dark:text-[#F1EFEA]">
            {t('Phân phối, Bán sỉ & Giải pháp HORECA', 'Wholesale, Distribution & HORECA')}
          </h3>
          <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
            {t(
              'Cung ứng ổn định cho chuỗi cà phê, nhà hàng, khách sạn, siêu thị và nhà phân phối với chính sách giá đối tác, mẫu thử và hỗ trợ kỹ thuật pha chế.',
              'Dedicated partner supply for cafes, hotels, restaurants, retailers, and distributors — featuring tiered partner pricing, sample kits, and barista consultation.'
            )}
          </p>
          <Link to={localePath('/partners')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline">
            <span>{t('Cổng đối tác B2B', 'Enter B2B Partner Portal')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-8 space-y-4">
          <Globe2 className="w-6 h-6 text-[#00552B] dark:text-[#C6A667]" />
          <h3 className="text-2xl font-bold text-[#202020] dark:text-[#F1EFEA]">
            {t('Gia công OEM, Nhãn riêng & Xuất khẩu Quốc tế', 'OEM, Private Label & Global Export')}
          </h3>
          <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
            {t(
              'Hỗ trợ tìm nguồn nhân xanh, gia công rang xay, đóng gói nhãn hiệu riêng (Private Label) và tư vấn hồ sơ xuất khẩu theo năng lực xác thực từng dự án.',
              'End-to-end green coffee sourcing, contract roasting, private-label packaging, MOQ planning, and verified export documentation support for international buyers.'
            )}
          </p>
          <Link to={localePath('/oem-export')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline">
            <span>{t('Gửi yêu cầu OEM / Xuất khẩu', 'Submit OEM & Export Inquiry')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 12 & 13. MEMBER BENEFITS & ACTIVE PROMOTIONS */}
      <section className="bg-white dark:bg-[#131D18] border-y border-[#202020]/10 dark:border-white/10 py-16">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <Award className="w-6 h-6 text-[#00552B] dark:text-[#C6A667]" />
            <h2 className="text-3xl font-bold text-[#202020] dark:text-[#F1EFEA]">
              {t('Thành viên ROAR COFFEE & Điểm Thưởng', 'ROAR COFFEE Members & Rewards')}
            </h2>
            <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
              {t(
                'Tích điểm trên mỗi đơn hàng hợp lệ (cấu hình tham chiếu 1 điểm / 10.000đ · 1 điểm = 100đ) và thăng hạng qua 4 cấp bậc: Thành viên, Bạc, Vàng và Reserve.',
                'Earn points across eligible purchases under configurable rules and unlock four membership tiers: ROAR Member, ROAR Silver, ROAR Gold, and ROAR Reserve.'
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to={localePath('/account')} className="px-5 py-2.5 bg-[#00552B] text-white text-sm font-medium rounded hover:bg-[#003D25]">
                {t('Đăng ký / Đăng nhập', 'Join ROAR Members')}
              </Link>
              <Link to={localePath('/promotions')} className="px-5 py-2.5 border border-[#00552B]/30 dark:border-[#C6A667]/40 text-[#00552B] dark:text-[#C6A667] text-sm font-medium rounded hover:bg-[#00552B]/5">
                {t('Xem tất cả ưu đãi', 'All Active Offers')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-[#F8F5EF] dark:bg-[#1A2820] rounded-xl border border-[#202020]/10 dark:border-white/10 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#00552B] dark:text-[#C6A667] font-mono">
                    <span className="font-bold">{promo.code}</span>
                    <span className="tabular-nums">{t('Hạn:', 'Valid until')} {promo.end_date}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202020] dark:text-[#F1EFEA]">
                    {lang === 'vi' ? promo.title_vi : promo.title_en}
                  </h3>
                  <p className="text-xs text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
                    {lang === 'vi' ? promo.description_vi : promo.description_en}
                  </p>
                </div>
                <Link
                  to={localePath('/shop')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline"
                >
                  <span>{t('Mua sắm ngay', 'Shop Now')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. COFFEE JOURNAL */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00552B] dark:text-[#C6A667]">
              {t('Tạp chí & Tri thức Cà phê', 'Coffee Journal')}
            </p>
            <h2 className="text-3xl font-bold text-[#202020] dark:text-[#F1EFEA] mt-1">
              {t('Góc nhìn chuyên sâu từ ROAR COFFEE', 'Editorial & Origin Science')}
            </h2>
          </div>
          <Link to={localePath('/journal')} className="text-sm font-semibold text-[#00552B] dark:text-[#C6A667] hover:underline">
            {t('Đọc tất cả bài viết →', 'View Journal →')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={localePath(`/journal/${a.slug}`)}
              className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform"
            >
              <div className="aspect-[4/5] bg-[#F8F5EF] dark:bg-[#0E1512] overflow-hidden">
                <MediaImage
                  imageKey={a.image_key}
                  alt={lang === 'vi' ? a.title_vi : a.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#202020]/55 dark:text-[#F1EFEA]/55">
                    <span>{localizeJournalCategory(a.category, lang)}</span>
                    <span>·</span>
                    <span>{a.read_minutes} {t('phút đọc', 'min read')}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#202020] dark:text-[#F1EFEA] leading-snug">
                    {lang === 'vi' ? a.title_vi : a.title_en}
                  </h3>
                  <p className="text-xs text-[#202020]/70 dark:text-[#F1EFEA]/70 line-clamp-2">
                    {lang === 'vi' ? a.excerpt_vi : a.excerpt_en}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#00552B] dark:text-[#C6A667] pt-2 inline-block">
                  {t('Đọc bài viết →', 'Read Article →')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
