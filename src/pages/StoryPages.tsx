import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Clock, Flame, Thermometer } from 'lucide-react';
import { AdaptiveLogo } from '../components/AdaptiveLogo';
import { B2BInquiryModal } from '../components/B2BInquiryModal';
import { MediaImage } from '../components/MediaImage';
import { VietnamOriginMap } from '../components/VietnamOriginMap';
import { useI18n } from '../i18n/I18nContext';
import { useStore } from '../context/StoreContext';

export const OriginsPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-14 space-y-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00552B] dark:text-[#C6A667]">
          {t('KHÁM PHÁ VÙNG NGUYÊN LIỆU CÀ PHÊ VIỆT NAM', 'DISCOVER THE ORIGINS OF VIETNAMESE COFFEE')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA]">
          {t('Bản Đồ Vùng Nguyên Liệu & Địa Lý Cà Phê Việt Nam', 'Vietnamese Coffee Origin Map')}
        </h1>
        <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
          {t(
            'Bao phủ 10 vùng trồng cà phê tiêu biểu từ Tây Bắc (Sơn La, Điện Biên), Bắc Trung Bộ (Nghệ An Phủ Quỳ, Quảng Trị Khe Sanh), Tây Nguyên (Kon Tum, Gia Lai, Đắk Lắk, Đắk Nông, Lâm Đồng) đến Đông Nam Bộ (Đồng Nai) trên lớp ảnh vệ tinh và địa hình thực tế.',
            'Covering 10 authentic coffee regions from Northwest Vietnam (Sơn La, Điện Biên), North Central Highlands & Khe Sanh (Nghệ An Phủ Quỳ, Quảng Trị), the Central Highlands (Kon Tum, Gia Lai, Đắk Lắk, Đắk Nông, Lâm Đồng) to Đồng Nai on real satellite and topographic imagery.'
          )}
        </p>
      </div>
      <VietnamOriginMap />
    </div>
  );
};

export const FarmToCupPage: React.FC = () => {
  const { t } = useI18n();
  const [activeTopic, setActiveTopic] = useState(0);

  const stages = [
    { vi: '01. Canh tác & Thổ nhưỡng', en: '01. Cultivation & Terroir', descVi: 'Chăm sóc cây cà phê tại các vùng cao nguyên phù hợp về độ cao và đất đỏ bazan.', descEn: 'Stewardship across highland volcanic and limestone soils matched to Robusta and Arabica.' },
    { vi: '02. Thu hái chọn lọc', en: '02. Selective Harvesting', descVi: 'Ưu tiên thu hái quả chín đỏ đồng đều để tối ưu lượng đường tự nhiên.', descEn: 'Targeting ripe red cherries to maximize natural sugar development and clean cup potential.' },
    { vi: '03. Sơ chế sau thu hoạch', en: '03. Post-Harvest Processing', descVi: 'Thực hiện theo 3 phương pháp chuẩn hóa: Natural, Honey và Washed (CBU).', descEn: 'Processed via three disciplined methods: Natural, Honey, and Washed (CBU).' },
    { vi: '04. Tuyển chọn nhân xanh', en: '04. Green Bean Selection', descVi: 'Phân sàng kích thước S14, S16, S18 và kiểm tra độ ẩm, tỷ trọng, khuyết tật.', descEn: 'Screen graded across S14, S16, S18 with controlled moisture, density, and defect verification.' },
    { vi: '05. Nghệ thuật Rang', en: '05. Precision Roasting', descVi: 'Xây dựng biểu đồ nhiệt phù hợp cho từng dòng Robusta, Arabica hay Signature Reserve.', descEn: 'Tailored roast curves calibrated separately for Robusta, Arabica, Culi, and Reserve blends.' },
    { vi: '06. Xay theo phương pháp pha', en: '06. Precision Grinding', descVi: 'Cỡ xay tương thích từ Phin thô-vừa đến Espresso mịn và Pour-over đồng nhất.', descEn: 'Particle distribution matched precisely to Phin, Espresso, Pour-over, French Press, or Cold Brew.' },
    { vi: '07. Chiết xuất & Pha chế', en: '07. Brewing & Extraction', descVi: 'Kiểm soát nhiệt độ nước 90–94°C, tỷ lệ bột/nước và thời gian ủ nở.', descEn: 'Controlled water chemistry, 90–94°C thermal stability, bloom timing, and extraction yield.' },
    { vi: '08. Thưởng thức bản lĩnh', en: '08. Sensory Enjoyment', descVi: 'Trải nghiệm trọn vẹn hương vị và dấu ấn cá tính riêng trong từng tách cà phê.', descEn: 'Experiencing authentic Vietnamese coffee character in daily rituals and curated tastings.' },
  ];

  const topics = [
    { id: 'natural', vi: 'Chế biến Khô (Natural)', en: 'Natural Process', bodyVi: 'Quả cà phê chín được phơi nguyên quả trên giàn hoặc sân phơi sạch, đảo đều để giữ vị ngọt đậm và thể chất dày.', bodyEn: 'Whole ripe cherries are dried intact on raised beds or clean patios, producing full body and concentrated fruit sweetness.' },
    { id: 'honey', vi: 'Chế biến Honey', en: 'Honey Process', bodyVi: 'Xát bỏ vỏ quả nhưng giữ lại một phần lớp nhớt tự nhiên khi phơi, cân bằng giữa độ sạch và vị ngọt hậu.', bodyEn: 'Outer skin is removed while retaining controlled mucilage during drying, balancing clarity and lingering sweetness.' },
    { id: 'cbu', vi: 'Chế biến Ướt (CBU)', en: 'Washed Process (CBU)', bodyVi: 'CBU là ký hiệu chính thức của ROAR COFFEE cho chế biến ướt: lên men kiểm soát, rửa sạch lớp nhớt, tạo độ sạch vị cao.', bodyEn: 'CBU is ROAR COFFEE’s official designation for Washed Process: controlled fermentation and clean washing for high-clarity green beans.' },
    { id: 'selection', vi: 'Tuyển chọn Nhân xanh', en: 'Green Coffee Selection', bodyVi: 'Phân loại theo cỡ sàng S14, S16, S18 và tách riêng hạt đơn Culi (Peaberry) trước khi đưa vào bảo quản hoặc xuất khẩu.', bodyEn: 'Graded across S14, S16, and S18 screens alongside morphological separation of Culi (Peaberry) beans.' },
    { id: 'roasting', vi: 'Khoa học Rang', en: 'Roasting Craft', bodyVi: 'Theo dõi phát triển hương thơm (Maillard & Caramelization) phù hợp từng mục đích pha Phin hay Espresso.', bodyEn: 'Balancing Maillard development and roast time for authentic Phin body or modern Espresso sweetness.' },
    { id: 'cupping', vi: 'Thử nếm (Cupping)', en: 'Coffee Cupping', bodyVi: 'Đánh giá cảm quan mù theo lô để kiểm tra độ sạch, hậu vị và tính nhất quán trước khi phát hành.', bodyEn: 'Structured lot cupping evaluates cleanliness, aroma, and consistency prior to product release.' },
    { id: 'storage', vi: 'Bảo quản Cà phê', en: 'Coffee Storage', bodyVi: 'Bảo quản nhân xanh trong bao chuyên dụng thoáng khí kiểm soát ẩm; cà phê rang dùng bao bì van một chiều tránh ánh sáng.', bodyEn: 'Green beans rest in moisture-controlled storage; roasted lots ship in one-way valve barriers away from heat and light.' },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-14 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00552B] dark:text-[#C6A667]">
            {t('Từ Nông Trại Đến Tách Cà Phê', 'From Farm to Cup')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA]">
            {t('8 Giai Đoạn Tạo Nên Chuẩn Mực ROAR COFFEE', 'Eight Stages of Coffee Craftsmanship')}
          </h1>
          <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">
            {t(
              'Hành trình minh bạch từ vùng trồng Tây Nguyên, qua 3 phương pháp sơ chế Natural, Honey, CBU đến tách cà phê hoàn chỉnh.',
              'An educational journey from highland cultivation through Natural, Honey, and Washed (CBU) processing to final extraction.'
            )}
          </p>
        </div>
        <div className="lg:col-span-6 aspect-[16/9] rounded-xl overflow-hidden border border-[#202020]/10 dark:border-white/10">
          <MediaImage imageKey="origin_central_highlands" alt="Vietnamese coffee highlands" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stages.map((s) => (
          <div key={s.en} className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-5 space-y-2">
            <h2 className="text-base font-bold text-[#00552B] dark:text-[#C6A667]">{t(s.vi, s.en)}</h2>
            <p className="text-xs text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">{t(s.descVi, s.descEn)}</p>
          </div>
        ))}
      </div>

      <section className="bg-white dark:bg-[#16221C] rounded-2xl border border-[#202020]/10 dark:border-white/10 p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-[#202020] dark:text-[#F1EFEA]">{t('Chuyên Đề Kỹ Thuật Sơ Chế & Bảo Quản', 'Processing & Technical Deep Dive')}</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((tp, idx) => (
            <button
              key={tp.id}
              type="button"
              onClick={() => setActiveTopic(idx)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                activeTopic === idx ? 'bg-[#00552B] text-white' : 'bg-[#F8F5EF] dark:bg-[#0E1512] text-[#202020]/80 dark:text-[#F1EFEA]/80 hover:text-[#202020] dark:hover:text-white'
              }`}
            >
              {t(tp.vi, tp.en)}
            </button>
          ))}
        </div>
        <div className="p-6 rounded-xl bg-[#F8F5EF] dark:bg-[#0E1512] border border-[#202020]/8 dark:border-white/10 space-y-2">
          <h3 className="text-xl font-bold text-[#003D25] dark:text-[#C6A667]">{t(topics[activeTopic].vi, topics[activeTopic].en)}</h3>
          <p className="text-sm text-[#202020]/85 dark:text-[#F1EFEA]/85 leading-relaxed">{t(topics[activeTopic].bodyVi, topics[activeTopic].bodyEn)}</p>
        </div>
      </section>
    </div>
  );
};

export const BrewingGuidePage: React.FC = () => {
  const { t } = useI18n();
  const [servings, setServings] = useState(1);
  const [methodIdx, setMethodIdx] = useState(0);

  const recipes = [
    {
      nameVi: 'Phin Việt Nam',
      nameEn: 'Vietnamese Phin',
      doseG: 20,
      waterMl: 85,
      temp: '92–95°C',
      time: t('4–5 phút', '4–5 min'),
      grindVi: 'Vừa-thô',
      grindEn: 'Medium-Coarse',
      equipVi: 'Phin nhôm hoặc đồng truyền thống, ly thủy tinh, ấm cổ ngỗng',
      equipEn: 'Traditional aluminum or brass Vietnamese Phin, glass, kettle',
      stepsVi: [
        'Tráng nóng phin và ly trước khi pha.',
        'Cho 20g cà phê vào phin, lắc nhẹ cho phẳng bề mặt và đặt nắp gài vừa tay.',
        'Rót 25–30ml nước nóng đầu tiên để ủ nở (bloom) trong 30 giây.',
        'Châm thêm 50–70ml nước nóng, đậy nắp và chờ chiết xuất hoàn tất trong 4–5 phút.',
      ],
      stepsEn: [
        'Pre-warm the brass or aluminum Phin and serving glass.',
        'Add 20g coffee, level gently, and rest the gravity press lightly on top.',
        'Pour 25–30ml hot water for a 30-second bloom.',
        'Add remaining 50–70ml hot water, cover, and allow 4–5 minutes total drawdown.',
      ],
      troubleVi: 'Chảy quá nhanh (<3 phút): chỉnh cỡ xay mịn hơn hoặc nén gài vừa phải hơn. Chảy nghẽn: xay thô hơn một chút.',
      troubleEn: 'Draws too fast (<3 min): grind slightly finer. Stalled drip: coarsen grind slightly and avoid over-pressing.',
    },
    {
      nameVi: 'Espresso',
      nameEn: 'Espresso',
      doseG: 18,
      waterMl: 36,
      temp: '90–94°C',
      time: '25–30s',
      grindVi: 'Mịn (Fine Espresso)',
      grindEn: 'Fine Espresso',
      equipVi: 'Máy pha Espresso 9 bar, cân điện tử 0.1g, tamper 58mm',
      equipEn: '9-bar Espresso machine, 0.1g scale, calibrated tamper',
      stepsVi: [
        'Xay 18g cà phê vào tay pha sạch và khô.',
        'Phân bổ đều bột cà phê và nén phẳng lực ổn định.',
        'Chiết xuất ở nhiệt độ 90–94°C trong 25–30 giây để thu về 36g nước cốt.',
      ],
      stepsEn: [
        'Dose 18g freshly ground coffee into a clean, dry portafilter.',
        'Distribute evenly and tamp level.',
        'Extract at 90–94°C for 25–30 seconds targeting 36g beverage output.',
      ],
      troubleVi: 'Vị chua gắt & chảy nhanh (<20s): xay mịn hơn. Vị đắng khét & nhỏ giọt chậm (>35s): xay thô hơn.',
      troubleEn: 'Sour & fast (<20s): grind finer. Bitter & choked (>35s): grind coarser.',
    },
    {
      nameVi: 'Pour-over (V60)',
      nameEn: 'Pour-over',
      doseG: 15,
      waterMl: 250,
      temp: '90–93°C',
      time: '2:30–3:00',
      grindVi: 'Vừa (Medium)',
      grindEn: 'Medium',
      equipVi: 'Phễu lọc V60, giấy lọc, bình rót cổ ngỗng, cân bấm giờ',
      equipEn: 'Pour-over dripper, paper filter, gooseneck kettle, timer scale',
      stepsVi: [
        'Tráng ướt giấy lọc để khử mùi giấy và làm ấm bình.',
        'Cho 15g cà phê, rót 45ml nước ủ nở trong 35–40 giây.',
        'Chia thành 2–3 lần rót xoắn ốc đều tay đến tổng 250ml nước.',
      ],
      stepsEn: [
        'Rinse paper filter thoroughly with hot water.',
        'Add 15g coffee and bloom with 45ml water for 35–40 seconds.',
        'Pour in concentric circles across 2–3 pulses up to 250ml total.',
      ],
      troubleVi: 'Nước rút chậm: giữ dòng rót nhẹ ở tâm, không khuấy quá mạnh.',
      troubleEn: 'Slow drawdown: keep pours gentle and centered without excessive agitation.',
    },
    {
      nameVi: 'French Press',
      nameEn: 'French Press',
      doseG: 18,
      waterMl: 270,
      temp: '92–94°C',
      time: '4:00',
      grindVi: 'Thô (Coarse)',
      grindEn: 'Coarse',
      equipVi: 'Bình ép French Press thủy tinh, thìa khuấy',
      equipEn: 'Glass French Press, stirring spoon',
      stepsVi: [
        'Cho 18g cà phê xay thô vào bình, rót 270ml nước nóng.',
        'Ủ đủ 4 phút, hớt nhẹ lớp bọt bề mặt rồi nhấn pít-tông từ từ.',
      ],
      stepsEn: [
        'Add 18g coarse coffee and pour 270ml hot water.',
        'Steep for 4 minutes, skim surface crust, and press plunger gently.',
      ],
      troubleVi: 'Nhiều cặn mịn: dùng cỡ xay thô đồng nhất hơn và không ép sát đáy quá mạnh.',
      troubleEn: 'Excess sediment: coarsen grind and press steadily without plunging aggressively.',
    },
    {
      nameVi: 'Cold Brew',
      nameEn: 'Cold Brew',
      doseG: 50,
      waterMl: 500,
      temp: t('4–20°C (Ủ lạnh)', '4–20°C (Cold)'),
      time: t('12–16 giờ', '12–16h'),
      grindVi: 'Thô',
      grindEn: 'Coarse',
      equipVi: 'Bình ủ thủy tinh có lõi lọc hoặc giấy lọc lạnh',
      equipEn: 'Cold brew carafe with mesh or paper filter',
      stepsVi: [
        'Ngâm 50g cà phê xay thô với 500ml nước lọc mát theo tỷ lệ 1:10.',
        'Đậy kín và ủ trong ngăn mát tủ lạnh từ 12–16 giờ rồi lọc sạch bã.',
      ],
      stepsEn: [
        'Combine 50g coarse ground coffee with 500ml filtered cold water (1:10 ratio).',
        'Cover and steep refrigerated for 12–16 hours before filtering clean.',
      ],
      troubleVi: 'Nếu muốn uống đậm pha thêm đá, dùng tỷ lệ 1:7 và pha loãng khi phục vụ.',
      troubleEn: 'For concentrate over ice, steep at 1:7 and dilute to taste when serving.',
    },
  ];

  const active = recipes[methodIdx];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00552B] dark:text-[#C6A667]">
          {t('Công thức tham chiếu Barista', 'Reference Brewing Recipes')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA]">
          {t('Hướng Dẫn Pha Chế ROAR COFFEE', 'ROAR COFFEE Brewing Guide')}
        </h1>
        <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75">
          {t(
            'Các thông số dưới đây là công thức tham chiếu chuẩn mực, có thể tinh chỉnh theo khẩu vị và lô rang thực tế.',
            'Reference recipes engineered as reliable starting points — adjustable for your roast lot and personal palate.'
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {recipes.map((r, i) => (
            <button
              key={r.nameEn}
              type="button"
              onClick={() => setMethodIdx(i)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                methodIdx === i ? 'bg-[#00552B] text-white' : 'bg-white dark:bg-[#16221C] border border-[#202020]/15 dark:border-white/15 text-[#202020] dark:text-[#F1EFEA]'
              }`}
            >
              {t(r.nameVi, r.nameEn)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs bg-white dark:bg-[#16221C] border border-[#202020]/15 dark:border-white/15 rounded-lg px-3 py-1.5">
          <span>{t('Số tách:', 'Servings:')}</span>
          {[1, 2, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setServings(n)}
              className={`px-2.5 py-1 rounded font-mono cursor-pointer ${
                servings === n ? 'bg-[#00552B] text-white' : 'hover:bg-[#F8F5EF] dark:hover:bg-white/10'
              }`}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#16221C] rounded-2xl border border-[#202020]/10 dark:border-white/10 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#202020]/10 dark:border-white/10">
          <div>
            <span className="text-xs text-[#202020]/55 dark:text-[#F1EFEA]/55 block">{t('Lượng cà phê', 'Coffee Dose')}</span>
            <span className="text-xl font-bold font-mono text-[#00552B] dark:text-[#C6A667] tabular-nums">{active.doseG * servings}g</span>
          </div>
          <div>
            <span className="text-xs text-[#202020]/55 dark:text-[#F1EFEA]/55 block">{t('Lượng nước / Thành phẩm', 'Water / Output')}</span>
            <span className="text-xl font-bold font-mono text-[#00552B] dark:text-[#C6A667] tabular-nums">{active.waterMl * servings}ml/g</span>
          </div>
          <div>
            <span className="text-xs text-[#202020]/55 dark:text-[#F1EFEA]/55 block flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> {t('Nhiệt độ', 'Temperature')}</span>
            <span className="text-xl font-bold font-mono text-[#202020] dark:text-[#F1EFEA] tabular-nums">{active.temp}</span>
          </div>
          <div>
            <span className="text-xs text-[#202020]/55 dark:text-[#F1EFEA]/55 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t('Thời gian', 'Brew Time')}</span>
            <span className="text-xl font-bold font-mono text-[#202020] dark:text-[#F1EFEA] tabular-nums">{active.time}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F8F5EF] dark:bg-[#0E1512] p-4 rounded-xl">
          <div>
            <strong className="text-[#00552B] dark:text-[#C6A667] block mb-0.5">{t('Dụng cụ chuẩn bị', 'Equipment')}</strong>
            <span>{t(active.equipVi, active.equipEn)}</span>
          </div>
          <div>
            <strong className="text-[#00552B] dark:text-[#C6A667] block mb-0.5">{t('Cỡ xay khuyến nghị', 'Grind Size')}</strong>
            <span>{t(active.grindVi, active.grindEn)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[#202020] dark:text-[#F1EFEA]">{t('Các bước thực hiện', 'Brewing Instructions')}</h2>
          <ol className="space-y-2.5 text-sm text-[#202020]/85 dark:text-[#F1EFEA]/85 list-decimal pl-5">
            {(t(active.stepsVi.join('||'), active.stepsEn.join('||'))).split('||').map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="p-4 rounded-xl bg-[#00552B]/6 dark:bg-[#00552B]/25 border border-[#00552B]/15 dark:border-[#C6A667]/25 text-xs text-[#003D25] dark:text-[#F1EFEA]">
          <strong className="block mb-1 text-[#00552B] dark:text-[#C6A667]">{t('Khắc phục sự cố nhanh', 'Troubleshooting')}</strong>
          <span>{t(active.troubleVi, active.troubleEn)}</span>
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const { theme } = useStore();
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 flex justify-center bg-white dark:bg-[#16221C] p-10 rounded-2xl border border-[#202020]/10 dark:border-white/10">
          <AdaptiveLogo variant="vertical" surface={theme === 'dark' ? 'dark' : 'light'} size="lg" />
        </div>
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00552B] dark:text-[#C6A667]">
            {lang === 'vi' ? 'KHƠI BẢN LĨNH. ĐẬM CHẤT RIÊNG.' : 'IGNITING COURAGE. DEFINING CHARACTER.'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA]">
            {t('Về Thương Hiệu ROAR COFFEE', 'About ROAR COFFEE')}
          </h1>
          <p className="text-base text-[#202020]/80 dark:text-[#F1EFEA]/80 leading-relaxed">
            {t(
              'ROAR COFFEE là thương hiệu cà phê Việt Nam được xây dựng với tầm nhìn phát triển song hành thị trường nội địa và quốc tế. Chúng tôi kết nối di sản vùng trồng cà phê Việt Nam, kỷ luật tuyển chọn nhân xanh, tay nghề rang xay và 7 cá tính thương hiệu đương đại.',
              'ROAR COFFEE is a Vietnamese coffee brand built for both domestic resonance and international growth — uniting authentic Vietnamese coffee heritage, disciplined green bean grading, modern roast craft, and seven distinctive brand personalities.'
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            titleVi: 'Triết lý Nguồn gốc Minh bạch',
            titleEn: 'Transparent Origin Philosophy',
            bodyVi: 'Phân tách rõ ràng thông tin địa lý vùng cà phê Việt Nam với từng lô nguyên liệu được kiểm định chứng thư COA trước khi công bố.',
            bodyEn: 'We clearly distinguish general Vietnamese coffee geography from verified sourcing lots and laboratory COA documentation.',
          },
          {
            titleVi: 'Chuẩn mực Nhân xanh & Rang xay',
            titleEn: 'Green & Roast Discipline',
            bodyVi: 'Từ cấu hình 27 tổ hợp nhân xanh S14/S16/S18 (Natural, Honey, CBU) đến Robusta House Blend, Arabica Selection và Signature Reserve.',
            bodyEn: 'From our 27-variant S14/S16/S18 green bean matrix (Natural, Honey, CBU) to Robusta House Blend, Arabica Selection, and Signature Reserve.',
          },
          {
            titleVi: 'Khát vọng Vươn tầm Quốc tế',
            titleEn: 'International Ambition',
            bodyVi: 'Sẵn sàng đáp ứng tiêu chuẩn hợp tác B2B, HORECA, OEM / Private Label và xuất khẩu trên nền tảng thương mại số minh bạch.',
            bodyEn: 'Engineered to serve domestic HORECA, wholesale partners, private-label OEM clients, and international green coffee buyers.',
          },
        ].map((card) => (
          <div key={card.titleEn} className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-6 space-y-2.5">
            <h2 className="text-lg font-bold text-[#00552B] dark:text-[#C6A667]">{t(card.titleVi, card.titleEn)}</h2>
            <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">{t(card.bodyVi, card.bodyEn)}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#003D25] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{t('Khám phá 7 Cá Tính Thương Hiệu', 'Discover the Seven Brand Personalities')}</h3>
          <p className="text-sm text-[#F8F5EF]/75">{t('Hổ · Sư tử · Cáo · Đại bàng · Sói · Cú mèo · Báo đen', 'Tiger · Lion · Fox · Eagle · Wolf · Owl · Black Panther')}</p>
        </div>
        <Link to={localePath('/personalities')} className="px-6 py-3 bg-[#C6A667] text-[#111111] text-sm font-semibold rounded whitespace-nowrap">
          {t('Xem bộ sưu tập 7 Cá Tính', 'Explore Seven Personalities')}
        </Link>
      </div>
    </div>
  );
};

export const SignatureReservePage: React.FC = () => {
  const { t, localePath } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookletPage, setBookletPage] = useState(0);

  const bookletSlides = [
    {
      titleVi: '01. Tuyển Ngôn Báo Đen',
      titleEn: '01. The Black Panther Ethos',
      bodyVi: 'Quý hiếm, bí ẩn, tinh tế và khác biệt. Signature Reserve ra đời cho những khoảnh khắc thưởng thức đòi hỏi chiều sâu và bản sắc riêng.',
      bodyEn: 'Exclusivity, mystery, sophistication, and distinction. Signature Reserve is conceived for moments that call for composed presence.',
    },
    {
      titleVi: '02. Cấu Trúc Phối Trộn Xác Thực',
      titleEn: '02. Approved Blend Architecture',
      bodyVi: '60% Robusta · 20% Culi · 20% Arabica kết hợp nguyên liệu nhân xanh CBU theo chỉ định kỹ thuật của ROAR COFFEE.',
      bodyEn: '60% Robusta · 20% Culi · 20% Arabica incorporating specified CBU washed green coffee ingredients.',
    },
    {
      titleVi: '03. Quà Tặng Doanh Nghiệp & Đóng Gói Cao Cấp',
      titleEn: '03. Executive & Corporate Gifting',
      bodyVi: 'Hộp thiếc đen nhám 250g, hộp quà cứng 500g và bộ quà tặng doanh nghiệp ánh vàng champagne tùy biến theo số lượng đặt hàng.',
      bodyEn: '250g matte obsidian canisters, 500g presentation boxes, and bespoke corporate gift sets finished in champagne gold.',
    },
  ];

  return (
    <div className="bg-[#0B0B0B] text-[#F8F5EF]">
      <section className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C6A667]">
            {t('Phiên Bản Báo Đen · 60% Robusta · 20% Culi · 20% Arabica', 'Black Panther Edition · 60% Robusta · 20% Culi · 20% Arabica')}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            ROAR COFFEE SIGNATURE RESERVE
          </h1>
          <p className="text-base text-[#F8F5EF]/80 leading-relaxed">
            {t(
              'Phiên bản đỉnh cao của ROAR COFFEE trong diện mạo đen huyền và vàng champagne. Kết hợp sức mạnh của 60% Robusta, độ đậm đặc của 20% Culi và nét thanh lịch của 20% Arabica với thành phần nhân xanh CBU chỉ định.',
              'The pinnacle of ROAR COFFEE in obsidian black and champagne gold — harmonizing 60% Robusta, 20% Culi, and 20% Arabica with specified CBU green coffee ingredients.'
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={localePath('/product/signature-reserve')} className="px-6 py-3 bg-[#C6A667] text-[#111111] text-sm font-semibold rounded hover:bg-[#d4b67a]">
              {t('Đặt mua Signature Reserve', 'Acquire Signature Reserve')}
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 border border-[#C6A667]/50 text-[#C6A667] text-sm font-medium rounded hover:bg-[#C6A667]/10 cursor-pointer"
            >
              {t('Tư vấn Quà tặng Doanh nghiệp', 'Corporate Gifting Inquiry')}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#C6A667]/30 col-span-2">
            <MediaImage imageKey="product_signature_reserve" alt="Signature Reserve packaging" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-xl overflow-hidden border border-[#C6A667]/30">
            <MediaImage imageKey="mascot_panther" alt="Black Panther Emblem" className="w-full h-full object-cover" />
          </div>
          <div className="bg-[#141414] rounded-xl border border-[#C6A667]/30 p-5 flex flex-col justify-between">
            <span className="text-xs uppercase tracking-widest text-[#C6A667]">{t('Khuyến nghị pha', 'Recommended Brew')}</span>
            <div className="text-sm space-y-1 text-[#F8F5EF]/85">
              <p>• Espresso (18g → 36g)</p>
              <p>• {t('Phin Việt Nam (20g)', 'Vietnamese Phin (20g)')}</p>
              <p>• {t('Ghi chú thử nếm: Cập nhật theo lô xác thực', 'Tasting notes: Verified per batch')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Digital Booklet */}
      <section id="gifting" className="border-t border-white/10 py-16">
        <div className="max-w-[960px] mx-auto px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#C6A667]">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">{t('Sổ Tay Thử Nếm Số', 'Digital Tasting Booklet')}</span>
            </div>
            <div className="flex gap-2">
              {bookletSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBookletPage(idx)}
                  className={`w-8 h-8 rounded text-xs font-mono cursor-pointer ${
                    bookletPage === idx ? 'bg-[#C6A667] text-[#111111] font-bold' : 'bg-white/10 text-white'
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] border border-[#C6A667]/25 rounded-2xl p-8 space-y-3">
            <h2 className="text-2xl font-bold text-white">{t(bookletSlides[bookletPage].titleVi, bookletSlides[bookletPage].titleEn)}</h2>
            <p className="text-base text-[#F8F5EF]/80 leading-relaxed">{t(bookletSlides[bookletPage].bodyVi, bookletSlides[bookletPage].bodyEn)}</p>
          </div>
        </div>
      </section>

      <B2BInquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="corporate_gifting"
        productSku="RC-RST-SGR"
        productTitle="ROAR COFFEE SIGNATURE RESERVE — Corporate Gifting"
      />
    </div>
  );
};

export const FarmMembershipPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00552B] dark:text-[#C6A667]">
          {t('Định hướng tương lai · Đề xuất phát triển (Sắp ra mắt)', 'Future Concept · Proposed Community Program')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#202020] dark:text-[#F1EFEA]">
          {t('Trang Trại ROAR & Cộng Đồng Thành Viên', 'ROAR Coffee Farm & Membership Concept')}
        </h1>
        <p className="text-base text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed max-w-3xl">
          {t(
            'Không gian kết nối giáo dục canh tác cà phê bền vững, cập nhật mùa vụ, trải nghiệm tham quan nông trại đối tác và câu chuyện người trồng cà phê. Chương trình này là định hướng cộng đồng trải nghiệm — không phải mô hình sở hữu trang trại, cam kết lợi nhuận hay chia sẻ cổ phần.',
            'A future-ready community concept dedicated to coffee cultivation education, seasonal harvest dispatches, curated farm visits, and grower storytelling. This initiative is strictly educational and experiential — it does not offer farm ownership, investment returns, or profit sharing.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            vi: 'Giáo dục Canh tác & Sơ chế',
            en: 'Cultivation & Processing Education',
            descVi: 'Tìm hiểu vòng đời cây cà phê từ mùa hoa trắng Tây Nguyên đến thu hoạch và phơi Natural, Honey, CBU.',
            descEn: 'Follow the coffee lifecycle from Central Highlands blossom through selective harvest and Natural, Honey, and CBU drying.',
          },
          {
            vi: 'Nhật ký Mùa vụ (Đề xuất)',
            en: 'Seasonal Harvest Updates (Proposed)',
            descVi: 'Cập nhật tiến độ thu hái theo từng vùng nguyên liệu hợp tác khi chương trình chính thức vận hành.',
            descEn: 'Scheduled harvest dispatches across verified partner localities once the program launches.',
          },
          {
            vi: 'Trải nghiệm Nông trại & Cupping',
            en: 'Farm Experiences & Cupping',
            descVi: 'Lịch tham quan và thử nếm dành cho thành viên ROAR Gold & ROAR Reserve (Sắp ra mắt).',
            descEn: 'Curated origin visits and member cupping sessions planned for future ROAR Gold & Reserve cohorts.',
          },
        ].map((item) => (
          <div key={item.en} className="bg-white dark:bg-[#16221C] rounded-xl border border-[#202020]/10 dark:border-white/10 p-6 space-y-2">
            <span className="text-[11px] font-mono text-[#00552B] dark:text-[#C6A667]">{t('Sắp ra mắt / Đề xuất', 'Proposed / Coming Soon')}</span>
            <h2 className="text-lg font-bold text-[#202020] dark:text-[#F1EFEA]">{t(item.vi, item.en)}</h2>
            <p className="text-sm text-[#202020]/75 dark:text-[#F1EFEA]/75 leading-relaxed">{t(item.descVi, item.descEn)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
