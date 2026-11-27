/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — Core State & Data Engine (v4)
   Shared across /tedu/ (Main Site & 3D/2D Map), /tedu-app/ (Participant App),
   and /tedu-dashboard/ (Campus Wayfinding & Live Status Display).
   ========================================================================== */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'summitted_2026_state_v4';
  const BADGE_KEY = 'summitted_2026_badge_v4';
  const CHANNEL_NAME = 'summitted_2026_channel_v4';

  const GATES = [
    {
      id: 'gate-1',
      code: 'GATE-1',
      name: 'Gate 1 · Ziya Gökalp Ana Giriş Çadırı',
      shortName: 'Gate 1 · İncesu Ana Kapı',
      campus: 'incesu',
      location: 'Ziya Gökalp Cad. No:48 · İncesu Ana Giriş Kanopisi',
      role: 'Ana Akreditasyon, SummitTED Yaka Kartı Teslimi & Turnike Geçişi',
      qrCode: 'SUMMITTED://GATE/gate-1',
      baseCheckedIn: 342
    },
    {
      id: 'gate-2',
      code: 'GATE-2',
      name: 'Gate 2 · Aksu Hızlı Check-in Çadırı',
      shortName: 'Gate 2 · Aksu / Metro',
      campus: 'aksu',
      location: 'Kolej Metrosu Çıkışı · Aksu Yaya Girişi Kanopisi',
      role: 'Hızlı QR Turnike Doğrulaması, Kampüs Geçiş & Yönlendirme Noktası',
      qrCode: 'SUMMITTED://GATE/gate-2',
      baseCheckedIn: 218
    },
    {
      id: 'gate-3',
      code: 'GATE-3',
      name: 'Gate 3 · Kurumsal & VIP Karşılama Çadırı',
      shortName: 'Gate 3 · K Blok VIP',
      campus: 'incesu',
      location: 'K Blok Doğu Protokol Kapısı · Kültür Merkezi Önü',
      role: 'Şirket İK Heyetleri, Üst Düzey Konuşmacılar & Basın Akreditasyonu',
      qrCode: 'SUMMITTED://GATE/gate-3',
      baseCheckedIn: 86
    }
  ];

  const ZONES = [
    {
      id: 'red',
      code: 'Z-RED',
      name: 'Red Zone · Kurumsal Fuaye',
      shortName: 'Red Zone',
      campus: 'incesu',
      building: 'K Blok · Fatma-Semih Akbil Fuaye Alanı',
      category: 'company',
      categoryLabel: 'Şirket Stantları',
      accent: '#E41513',
      capacity: 240,
      baseCount: 184,
      qrCode: 'SUMMITTED://ZONE/red',
      summary: 'Finans, holding, denetim ve hızlı tüketim liderlerinin kurumsal kariyer stantları ve hızlı ön görüşme masaları.',
      map2d: { x: 760, y: 215, w: 155, h: 118 },
      stands: [
        { id: 'akfen', code: 'R-01', name: 'Akfen Holding', sector: 'Holding & Enerji', capacity: 28, baseCount: 22, focus: 'Yatırım, Enerji & Altyapı MT' },
        { id: 'denizbank', code: 'R-02', name: 'DenizBank', sector: 'Bankacılık & FinTech', capacity: 28, baseCount: 24, focus: 'Finansal Teknolojiler & Analitik' },
        { id: 'ey', code: 'R-03', name: 'EY Türkiye', sector: 'Denetim & Danışmanlık', capacity: 26, baseCount: 19, focus: 'Strateji, Vergi & Kurumsal Finans' },
        { id: 'cci', code: 'R-04', name: 'Coca-Cola İçecek', sector: 'FMCG & Operasyon', capacity: 26, baseCount: 21, focus: 'Tedarik Zinciri & Ticari Liderlik' },
        { id: 'kpmg', code: 'R-05', name: 'KPMG Türkiye', sector: 'Danışmanlık & Siber', capacity: 24, baseCount: 17, focus: 'Risk, Veri Analitiği & Denetim' },
        { id: 'efes', code: 'R-06', name: 'Anadolu Efes', sector: 'Global FMCG', capacity: 24, baseCount: 18, focus: 'Global MT, Pazarlama & Veri' }
      ]
    },
    {
      id: 'blue',
      code: 'Z-BLUE',
      name: 'Blue Zone · Savunma & Mühendislik',
      shortName: 'Blue Zone',
      campus: 'aksu',
      building: 'E Blok · Spor Merkezi Ana Salon',
      category: 'company',
      categoryLabel: 'Şirket Stantları',
      accent: '#292E6F',
      capacity: 280,
      baseCount: 226,
      qrCode: 'SUMMITTED://ZONE/blue',
      summary: 'Savunma sanayii, havacılık, yazılım ve enerji teknolojisi öncülerinin büyük ölçekli stant ve mühendislik deneyim alanı.',
      map2d: { x: 250, y: 330, w: 150, h: 98 },
      stands: [
        { id: 'aselsan', code: 'B-01', name: 'ASELSAN', sector: 'Savunma Elektroniği', capacity: 38, baseCount: 34, focus: 'Radar, Aviyonik & Gömülü Yazılım' },
        { id: 'tusas', code: 'B-02', name: 'TUSAŞ', sector: 'Havacılık & Uzay', capacity: 38, baseCount: 32, focus: 'Uçuş Bilimleri & Yapısal Tasarım' },
        { id: 'milsoft', code: 'B-03', name: 'MİLSOFT', sector: 'Komuta Kontrol & AI', capacity: 30, baseCount: 25, focus: 'Veri Füzyonu, C4ISR & Yapay Zeka' },
        { id: 'fnss', code: 'B-04', name: 'FNSS', sector: 'Kara Sistemleri', capacity: 28, baseCount: 21, focus: 'Mekanik Tasarım & Güç Grubu' },
        { id: 'roketsan', code: 'B-05', name: 'ROKETSAN', sector: 'Güdüm & İtki', capacity: 34, baseCount: 29, focus: 'Kontrol, İtki & Sistem Mühendisliği' },
        { id: 'gama', code: 'B-06', name: 'GAMA Enerji', sector: 'Enerji & Altyapı', capacity: 24, baseCount: 17, focus: 'Yenilenebilir Enerji & Şebeke' }
      ]
    },
    {
      id: 'promenade',
      code: 'Z-PROM',
      name: 'İncesu Bulvarı · Kurumsal Çadırlar',
      shortName: 'Kurumsal Çadırlar',
      campus: 'incesu',
      building: 'İncesu Üst Avlu Yürüyüş Aksı (Açık Hava Pavilyonları)',
      category: 'company',
      categoryLabel: 'Kurumsal Çadırlar',
      accent: '#B91C1C',
      capacity: 150,
      baseCount: 102,
      qrCode: 'SUMMITTED://ZONE/promenade',
      summary: 'İncesu yürüyüş aksında kurgulanan açık hava işveren markası çadırları, canlı vaka istasyonları ve deneyim pavilyonları.',
      map2d: { x: 565, y: 120, w: 180, h: 66 },
      stands: [
        { id: 'bbva-tech', code: 'P-01', name: 'Garanti BBVA Teknoloji House', sector: 'FinTech & Bulut', capacity: 26, baseCount: 20, focus: 'Bulut Mimarisi & Ürün Tasarımı' },
        { id: 'turkcell-ai', code: 'P-02', name: 'Turkcell AI & 6G Pavilyonu', sector: 'Telekom & AI', capacity: 28, baseCount: 22, focus: 'Büyük Dil Modelleri & Şebeke' },
        { id: 'havelsan', code: 'P-03', name: 'HAVELSAN Siber Çadırı', sector: 'Siber Güvenlik & Yazılım', capacity: 26, baseCount: 19, focus: 'Siber Savunma & Dijital İkiz' },
        { id: 'migros-up', code: 'P-04', name: 'Migros Up İnovasyon Lounge', sector: 'Perakende Teknolojisi', capacity: 22, baseCount: 15, focus: 'Hızlı Ticaret & Veri Bilimi' }
      ]
    },
    {
      id: 'communities',
      code: 'Z-COMM',
      name: 'Topluluklar Köyü · Çim Amfi',
      shortName: 'Topluluklar Köyü',
      campus: 'incesu',
      building: 'İncesu Çim Amfi & Yarım Daire Yürüyüş Aksı Çadırları',
      category: 'community',
      categoryLabel: 'Topluluk Çadırları',
      accent: '#D92D20',
      capacity: 200,
      baseCount: 148,
      qrCode: 'SUMMITTED://ZONE/communities',
      summary: 'TEDÜ öğrenci topluluklarının modüler çadırları, proje sergileri, mini vaka yarışmaları ve RadioTEDU canlı yayın merkezi.',
      map2d: { x: 545, y: 215, w: 190, h: 112 },
      stands: [
        { id: 'kariyer-onculeri', code: 'T-01', name: 'TEDÜ Kariyer Öncüleri', sector: 'Ev Sahibi Topluluk', capacity: 28, baseCount: 24, focus: 'CV Kliniği & Zirve Koordinasyon' },
        { id: 'radiotedu', code: 'T-02', name: 'RadioTEDU Yayın Kabini', sector: 'Kampüs Medya', capacity: 22, baseCount: 19, focus: 'Canlı Zirve Röportajları & Podcast' },
        { id: 'ieee-tedu', code: 'T-03', name: 'IEEE TEDÜ Öğrenci Kolu', sector: 'Mühendislik & AI', capacity: 26, baseCount: 21, focus: 'Robotik, Gömülü & AI Projeleri' },
        { id: 'tedu-eru', code: 'T-04', name: 'TEDU Economics Research Union', sector: 'Ekonomi & Politika', capacity: 22, baseCount: 17, focus: 'Makroekonomi & Ticaret Analizi' },
        { id: 'girisimcilik', code: 'T-05', name: 'Girişimcilik Topluluğu', sector: 'Startup & Ideathon', capacity: 24, baseCount: 19, focus: 'Kurucu Ortak Buluşmaları' },
        { id: 'veri-bilimi', code: 'T-06', name: 'Veri Bilimi & AI Topluluğu', sector: 'Veri & Analitik', capacity: 24, baseCount: 18, focus: 'Canlı Veri Sprinti & Uygulama Atölyesi' }
      ]
    },
    {
      id: 'innovation',
      code: 'Z-INNO',
      name: 'Startup & Innovation Alley',
      shortName: 'Innovation Alley',
      campus: 'aksu',
      building: 'İstasyon TEDÜ (E Blok Kat 2) & Ön Avlu',
      category: 'innovation',
      categoryLabel: 'İnovasyon & Girişim',
      accent: '#0284C7',
      capacity: 130,
      baseCount: 92,
      qrCode: 'SUMMITTED://ZONE/innovation',
      summary: 'İstasyon TEDÜ kuluçka girişimleri, bitirme projesi prototipleri, yatırımcı ofis saatleri ve 5 dakikalık açık Pitch sahnesi.',
      map2d: { x: 245, y: 232, w: 155, h: 82 },
      stands: [
        { id: 'istasyon', code: 'I-01', name: 'İstasyon TEDÜ Kuluçka', sector: 'Sosyal İnovasyon', capacity: 26, baseCount: 20, focus: 'Etki Girişimciliği & Mentorluk' },
        { id: 'pitch-deck', code: 'I-02', name: '5 Dk Açık Pitch Sahnesi', sector: 'Yatırımcı Sunumu', capacity: 40, baseCount: 31, focus: 'Öğrenci Girişim Sunum Turları' },
        { id: 'vc-desk', code: 'I-03', name: 'Teknokent & VC Masası', sector: 'Tohum Yatırım', capacity: 20, baseCount: 16, focus: 'Ön Tohum Değerlendirme' },
        { id: 'capstone', code: 'I-04', name: 'TEDÜ AR-GE & Prototip Sergisi', sector: 'Mühendislik & Ürün', capacity: 30, baseCount: 22, focus: 'Bitirme Projeleri Prototip Sergisi' }
      ]
    },
    {
      id: 'matchmaking',
      code: 'Z-MP',
      name: 'G Blok Eşleşme Alanı (MP-01..24)',
      shortName: 'Meeting Points · G Blok',
      campus: 'aksu',
      building: 'G Blok Zemin Salon · Numaralı Görüşme Alanı',
      category: 'matchmaking',
      categoryLabel: 'Meeting Points (5 Dk)',
      accent: '#E41513',
      capacity: 120,
      baseCount: 84,
      qrCode: 'SUMMITTED://ZONE/matchmaking',
      summary: 'Numaralandırılmış MP-01..MP-16 (5 dk hızlı eşleşme) ve MP-17..MP-24 (15 dk bire bir kurumsal mülakat) masaları.',
      map2d: { x: 115, y: 112, w: 225, h: 86 },
      stands: []
    },
    {
      id: 'plenary',
      code: 'Z-PLEN',
      name: 'Ana Sahne · Ahmet Ersan Salonu',
      shortName: 'Ana Sahne · K Blok',
      campus: 'incesu',
      building: 'K Blok · Ahmet Ersan Konferans Salonu',
      category: 'stage',
      categoryLabel: 'Konferans Sahnesi',
      accent: '#1E293B',
      capacity: 198,
      baseCount: 174,
      qrCode: 'SUMMITTED://ZONE/plenary',
      summary: 'Rektörlük açılışı, üst düzey yönetim kurulu panelleri ve ana vizyon konuşmaları (stantsız konferans düzeni).',
      map2d: { x: 760, y: 112, w: 155, h: 88 },
      stands: []
    },
    {
      id: 'tech',
      code: 'Z-TECH',
      name: 'Tech & Innovation Stage',
      shortName: 'Tech&Innovation · D Blok',
      campus: 'aksu',
      building: 'D Blok Konferans Amfisi',
      category: 'stage',
      categoryLabel: 'Konferans Sahnesi',
      accent: '#1D4ED8',
      capacity: 210,
      baseCount: 168,
      qrCode: 'SUMMITTED://ZONE/tech',
      summary: 'ASELSAN, MİLSOFT, TUSAŞ ve teknoloji liderlerinin mühendislik, yapay zeka ve sistem mimarisi söyleşileri.',
      map2d: { x: 42, y: 212, w: 96, h: 190 },
      stands: []
    },
    {
      id: 'teacher-plus',
      code: 'Z-TEACH',
      name: 'Teacher+ & Eğitim İnovasyonu',
      shortName: 'Teacher+ · A/B Blok',
      campus: 'incesu',
      building: 'A / B Blok Konferans Salonu',
      category: 'stage',
      categoryLabel: 'Konferans Sahnesi',
      accent: '#292E6F',
      capacity: 180,
      baseCount: 126,
      qrCode: 'SUMMITTED://ZONE/teacher-plus',
      summary: 'Prof. Dr. Kürşat Çağıltay, TED Ankara Koleji İK ve akademisyenlerle eğitim teknolojileri ve gelecek yetkinlikleri oturumları.',
      map2d: { x: 472, y: 348, w: 265, h: 78 },
      stands: []
    },
    {
      id: 'plaza',
      code: 'Z-PLAZA',
      name: 'Networking Plaza & İkram Çadırları',
      shortName: 'Networking Plaza',
      campus: 'aksu',
      building: 'Aksu Merkez Avlu (C / F Blok Önü Pergola)',
      category: 'lounge',
      categoryLabel: 'İkram & Sosyal',
      accent: '#475569',
      capacity: 220,
      baseCount: 136,
      qrCode: 'SUMMITTED://ZONE/plaza',
      summary: 'Kahve ve ikram çadırları, bistro tipi hızlı tanışma masaları ve oturum arası açık hava dinlenme alanı.',
      map2d: { x: 152, y: 228, w: 82, h: 182 },
      stands: []
    }
  ];

  const SESSIONS = [
    {
      id: 'ses-01',
      start: '10:00',
      end: '11:00',
      startMin: 600,
      endMin: 660,
      zoneId: 'plenary',
      stageLabel: 'Ana Sahne · Ahmet Ersan Salonu',
      title: 'SummitTED 2026 Açılış & Liderlik Vizyonu',
      speaker: 'TEDÜ Rektörlüğü & TED Genel Merkezi',
      tag: 'AÇILIŞ OTURUMU'
    },
    {
      id: 'ses-02',
      start: '11:00',
      end: '12:00',
      startMin: 660,
      endMin: 720,
      zoneId: 'plenary',
      stageLabel: 'Ana Sahne · Ahmet Ersan Salonu',
      title: 'Belirsizlik Çağında Kurumsal Dönüşüm ve Yatırım',
      speaker: 'Akfen Holding & DenizBank Üst Düzey Liderlik Paneli',
      tag: 'LİDERLİK PANELİ'
    },
    {
      id: 'ses-03',
      start: '12:00',
      end: '13:30',
      startMin: 720,
      endMin: 810,
      zoneId: 'tech',
      stageLabel: 'Tech & Innovation · D Blok Amfi',
      title: 'ASELSAN Söyleşisi: Kritik Teknolojiler ve Sistem Mühendisliği',
      speaker: 'ASELSAN Mühendislik ve İK Direktörlüğü',
      tag: 'SAVUNMA & AR-GE'
    },
    {
      id: 'ses-04',
      start: '13:30',
      end: '14:15',
      startMin: 810,
      endMin: 855,
      zoneId: 'tech',
      stageLabel: 'Tech & Innovation · D Blok Amfi',
      title: 'MİLSOFT Söyleşisi: Gerçek Zamanlı Komuta Kontrol ve Yapay Zeka',
      speaker: 'MİLSOFT Yazılım ve Yapay Zeka Mimarisi Ekibi',
      tag: 'YAPAY ZEKA'
    },
    {
      id: 'ses-05',
      start: '13:30',
      end: '14:15',
      startMin: 810,
      endMin: 855,
      zoneId: 'innovation',
      stageLabel: 'Innovation Alley · İstasyon TEDÜ',
      title: '5 Dakikalık Startup Pitch Serisi: Kampüsten Yatırıma',
      speaker: 'İstasyon TEDÜ Girişimleri & VC Jüri Masası',
      tag: '5 DK PITCH'
    },
    {
      id: 'ses-06',
      start: '14:00',
      end: '15:00',
      startMin: 840,
      endMin: 900,
      zoneId: 'teacher-plus',
      stageLabel: 'Teacher+ · A/B Blok Konferans Salonu',
      title: 'Prof. Dr. Kürşat Çağıltay Konferansı: Yapay Zeka Çağında Öğrenme',
      speaker: 'Prof. Dr. Kürşat Çağıltay',
      tag: 'TEACHER+'
    },
    {
      id: 'ses-07',
      start: '14:00',
      end: '14:50',
      startMin: 840,
      endMin: 890,
      zoneId: 'plenary',
      stageLabel: 'Ana Sahne · Ahmet Ersan Salonu',
      title: 'TUSAŞ Milli Muharip Havacılık ve Geleceğin Mühendisleri',
      speaker: 'TUSAŞ Uçuş Bilimleri ve Yetenek Kazanımı',
      tag: 'HAVACILIK'
    },
    {
      id: 'ses-08',
      start: '15:15',
      end: '16:00',
      startMin: 915,
      endMin: 960,
      zoneId: 'plenary',
      stageLabel: 'Ana Sahne · Ahmet Ersan Salonu',
      title: 'Küresel Danışmanlık, Sürdürülebilirlik ve Veri Odaklı Strateji',
      speaker: 'EY Türkiye & KPMG Türkiye Ortak Oturumu',
      tag: 'STRATEJİ'
    },
    {
      id: 'ses-09',
      start: '16:00',
      end: '17:00',
      startMin: 960,
      endMin: 1020,
      zoneId: 'teacher-plus',
      stageLabel: 'Teacher+ · A/B Blok Konferans Salonu',
      title: 'TED Ankara Koleji İK Müdürü Söyleşisi: Eğitimde Kurum Kültürü',
      speaker: 'TED Ankara Koleji İnsan Kaynakları Müdürlüğü',
      tag: 'TEACHER+'
    },
    {
      id: 'ses-10',
      start: '16:30',
      end: '17:30',
      startMin: 990,
      endMin: 1050,
      zoneId: 'tech',
      stageLabel: 'Tech & Innovation · D Blok Amfi',
      title: 'ROKETSAN İleri İtki, Güdüm ve Sistem Mühendisliği Teknolojileri',
      speaker: 'ROKETSAN Ar-Ge Mühendislik Liderleri',
      tag: 'AR-GE KAPANIŞ'
    }
  ];

  const SLOTS_5MIN = [
    '13:50–13:55', '13:55–14:00', '14:00–14:05', '14:05–14:10',
    '14:10–14:15', '14:15–14:20', '14:20–14:25', '14:25–14:30',
    '14:30–14:35', '14:35–14:40', '14:45–14:50', '15:00–15:05',
    '15:05–15:10', '15:10–15:15', '15:15–15:20', '15:30–15:35'
  ];

  const MEETING_POINTS = Array.from({ length: 24 }, (_, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const isCorporate1to1 = idx >= 16;
    return {
      id: `MP-${num}`,
      code: `MP-${num}`,
      wing: isCorporate1to1 ? 'G Blok Doğu · 1:1 Kurumsal Kabin' : 'G Blok Batı · 5 Dk Speed Masa',
      mode: isCorporate1to1 ? '15 Dk Mülakat' : '5 Dk Eşleşme',
      qrCode: `SUMMITTED://MP/MP-${num}`
    };
  });

  const PEERS = [
    {
      id: 'peer-aselsan-01',
      name: 'Dr. Burak Özdemir',
      roleType: 'company',
      roleBadge: 'ŞİRKET / MÜHENDİSLİK',
      title: 'Aviyonik Sistemler Takım Lideri',
      org: 'ASELSAN',
      zoneId: 'blue',
      tags: ['Gömülü Yazılım', 'Savunma', 'C++', 'Staj & Aday Müh.'],
      lookingFor: 'Bilgisayar, Elektrik-Elektronik ve Yazılım Mühendisliği 3-4. sınıf öğrencileri',
      availableSlots: ['13:55–14:00', '14:05–14:10', '14:20–14:25', '15:00–15:05'],
      online: true
    },
    {
      id: 'peer-tusas-02',
      name: 'Selin Kaya',
      roleType: 'company',
      roleBadge: 'ŞİRKET / İK',
      title: 'Kıdemli Yetenek Kazanımı Uzmanı',
      org: 'TUSAŞ',
      zoneId: 'blue',
      tags: ['Havacılık', 'SKY Experience', 'Makine', 'Yeni Mezun'],
      lookingFor: 'Mühendislik ve Havacılık tutkusu olan aday mühendis & yeni mezunlar',
      availableSlots: ['13:50–13:55', '14:10–14:15', '14:25–14:30', '15:05–15:10'],
      online: true
    },
    {
      id: 'peer-milsoft-03',
      name: 'Kaan Arslan',
      roleType: 'company',
      roleBadge: 'ŞİRKET / AI',
      title: 'Yapay Zeka ve Veri Füzyonu Mimarı',
      org: 'MİLSOFT',
      zoneId: 'tech',
      tags: ['Yapay Zeka', 'Veri Füzyonu', 'Python', 'Dağıtık Sistemler'],
      lookingFor: 'Gerçek zamanlı algoritmalar ve derin öğrenme üzerine çalışan yetenekler',
      availableSlots: ['14:15–14:20', '14:20–14:25', '14:30–14:35', '15:10–15:15'],
      online: true
    },
    {
      id: 'peer-denizbank-04',
      name: 'Ece Demirtaş',
      roleType: 'company',
      roleBadge: 'ŞİRKET / FINTECH',
      title: 'Dijital Bankacılık ve Ürün Müdürü',
      org: 'DenizBank',
      zoneId: 'red',
      tags: ['FinTech', 'Ürün Yönetimi', 'Ekonomi', 'MT Programı'],
      lookingFor: 'İktisat, İşletme, Endüstri ve Yazılım geçmişli analitik ürün adayları',
      availableSlots: ['13:55–14:00', '14:00–14:05', '14:15–14:20', '14:45–14:50'],
      online: true
    },
    {
      id: 'peer-ey-05',
      name: 'Mert Yılmazer',
      roleType: 'company',
      roleBadge: 'ŞİRKET / STRATEJİ',
      title: 'Strateji ve Kurumsal Finansman Müdürü',
      org: 'EY Türkiye',
      zoneId: 'red',
      tags: ['Strateji', 'Kurumsal Finans', 'Denetim', 'ESG'],
      lookingFor: 'Finansal modelleme, birleşme-devralma ve sürdürülebilirlik ilgilileri',
      availableSlots: ['14:05–14:10', '14:25–14:30', '14:35–14:40', '15:15–15:20'],
      online: true
    },
    {
      id: 'peer-akfen-06',
      name: 'Zeynep Karahan',
      roleType: 'company',
      roleBadge: 'ŞİRKET / YATIRIM',
      title: 'Enerji ve Altyapı Yatırımları Analisti',
      org: 'Akfen Holding',
      zoneId: 'red',
      tags: ['Yenilenebilir Enerji', 'Proje Finansmanı', 'Ekonomi', 'MT'],
      lookingFor: 'Enerji ekonomisi, finans ve proje yönetimi odaklı genç yetenekler',
      availableSlots: ['13:50–13:55', '14:10–14:15', '14:30–14:35', '15:00–15:05'],
      online: true
    },
    {
      id: 'peer-bbva-07',
      name: 'Emre Çelik',
      roleType: 'company',
      roleBadge: 'KURUMSAL ÇADIR / TECH',
      title: 'Bulut Platformları Mühendislik Lideri',
      org: 'Garanti BBVA Teknoloji',
      zoneId: 'promenade',
      tags: ['Cloud', 'DevOps', 'FinTech', 'Yazılım'],
      lookingFor: 'Bulut mimarisi, mikroservisler ve ölçeklenebilir bankacılık ilgilileri',
      availableSlots: ['14:00–14:05', '14:15–14:20', '14:35–14:40', '15:05–15:10'],
      online: true
    },
    {
      id: 'peer-turkcell-08',
      name: 'Derya Aydın',
      roleType: 'company',
      roleBadge: 'KURUMSAL ÇADIR / AI',
      title: 'Üretken Yapay Zeka Ürün Lideri',
      org: 'Turkcell',
      zoneId: 'promenade',
      tags: ['LLM', 'Veri Bilimi', 'Ürün', 'Genç Yetenek'],
      lookingFor: 'Türkçe dil modelleri ve veri ürünleri üzerine çalışan öğrenciler',
      availableSlots: ['13:55–14:00', '14:20–14:25', '14:45–14:50', '15:30–15:35'],
      online: true
    },
    {
      id: 'peer-vc-09',
      name: 'Hakan Soylu',
      roleType: 'startup',
      roleBadge: 'YATIRIMCI / VC',
      title: 'Tohum Yatırım Ortağı (Partner)',
      org: 'Ankara Teknokent Girişim Fonu',
      zoneId: 'innovation',
      tags: ['Tohum Yatırım', 'B2B SaaS', 'DeepTech', 'Pitch'],
      lookingFor: 'MVP aşamasındaki öğrenci girişimleri ve teknik kurucu ortaklar',
      availableSlots: ['14:15–14:20', '14:25–14:30', '14:30–14:35', '15:00–15:05'],
      online: true
    },
    {
      id: 'peer-startup-10',
      name: 'Elif Naz Koç',
      roleType: 'startup',
      roleBadge: 'KURUCU / STARTUP',
      title: 'Kurucu Ortak (İstasyon TEDÜ Mezunu)',
      org: 'GridPulse Enerji AI',
      zoneId: 'innovation',
      tags: ['CleanTech', 'Kurucu Ortak', 'Full-Stack', 'Veri'],
      lookingFor: 'İklim teknolojileri girişimimize katılacak yazılım & iş geliştirme stajyerleri',
      availableSlots: ['13:50–13:55', '14:05–14:10', '14:20–14:25', '15:10–15:15'],
      online: true
    },
    {
      id: 'peer-comm-11',
      name: 'Bora Şahin',
      roleType: 'community',
      roleBadge: 'TOPLULUK LİDERİ',
      title: 'Zirve Eş Koordinatörü',
      org: 'TEDÜ Kariyer Öncüleri',
      zoneId: 'communities',
      tags: ['Organizasyon', 'Kurumsal İlişkiler', 'Networking', 'TEDÜ'],
      lookingFor: 'Şirket temsilcileri, topluluk başkanları ve kariyer elçisi adayları',
      availableSlots: ['13:55–14:00', '14:10–14:15', '14:35–14:40', '15:15–15:20'],
      online: true
    },
    {
      id: 'peer-comm-12',
      name: 'İrem Tuncer',
      roleType: 'community',
      roleBadge: 'KAMPÜS MEDYA',
      title: 'Canlı Yayın ve İçerik Direktörü',
      org: 'RadioTEDU',
      zoneId: 'communities',
      tags: ['Medya', 'Podcast', 'Söyleşi', 'Yaratıcı Endüstriler'],
      lookingFor: 'Zirve özel yayınında 5 dakikalık canlı konuk olmak isteyen konuşmacı ve öğrenciler',
      availableSlots: ['14:00–14:05', '14:15–14:20', '14:45–14:50', '15:05–15:10'],
      online: true
    },
    {
      id: 'peer-student-13',
      name: 'Cemre Yıldız',
      roleType: 'student',
      roleBadge: 'ÖĞRENCİ / AKRAN',
      title: 'Endüstri Mühendisliği 4. Sınıf · Araştırma Asistanı',
      org: 'TED Üniversitesi',
      zoneId: 'matchmaking',
      tags: ['Optimizasyon', 'Tedarik Zinciri', 'Vaka Takımı', 'Python'],
      lookingFor: 'Vaka yarışmaları için takım arkadaşı ve üretim/planlama mühendisleriyle tanışma',
      availableSlots: ['13:50–13:55', '14:05–14:10', '14:30–14:35', '15:30–15:35'],
      online: true
    },
    {
      id: 'peer-ted-14',
      name: 'Pınar Aksoy',
      roleType: 'speaker',
      roleBadge: 'KONUŞMACI / EĞİTİM',
      title: 'İnsan Kaynakları ve Akademik Gelişim Kıdemli Uzmanı',
      org: 'TED Ankara Koleji',
      zoneId: 'teacher-plus',
      tags: ['Eğitim', 'Öğretmenlik', 'Psikolojik Danışmanlık', 'TED'],
      lookingFor: 'Eğitim Fakültesi öğrencileri ve eğitim teknolojileri geliştiricileri',
      availableSlots: ['14:25–14:30', '14:35–14:40', '15:00–15:05', '15:15–15:20'],
      online: true
    }
  ];

  const DEFAULT_BADGE = {
    id: 'tedu-badge-2026-01',
    name: 'Zirve Katılımcısı',
    email: 'katilimci@tedu.edu.tr',
    roleType: 'student',
    roleLabel: 'ÖĞRENCİ / YETENEK',
    org: 'TED Üniversitesi · İktisadi ve İdari Bilimler / Mühendislik',
    department: '3. Sınıf',
    tags: ['Yapay Zeka', 'FinTech', 'Strateji', 'Staj'],
    bio: 'SummitTED 2026 kapsamında 5 dakikalık hızlı eşleşmeler ve kurumsal stant görüşmeleri için aktifim.',
    registered: false,
    checkedInGate: 'gate-1',
    activeZoneId: 'red',
    savedSessions: ['ses-04', 'ses-06']
  };

  function seedInitialMeetings() {
    return [
      {
        id: 'mtg-seed-01',
        direction: 'incoming',
        peerId: 'peer-milsoft-03',
        peerName: 'Kaan Arslan',
        peerOrg: 'MİLSOFT',
        peerTitle: 'Yapay Zeka ve Veri Füzyonu Mimarı',
        slot: '14:20–14:25',
        durationMin: 5,
        status: 'pending',
        tableId: null,
        note: 'Profilinizdeki Yapay Zeka etiketi dikkatimi çekti; D Blok söyleşisi sonrası G Blok\'ta 5 dk tanışalım mı?',
        createdAt: Date.now() - 420000
      },
      {
        id: 'mtg-seed-02',
        direction: 'incoming',
        peerId: 'peer-startup-10',
        peerName: 'Elif Naz Koç',
        peerOrg: 'GridPulse Enerji AI (İstasyon TEDÜ)',
        peerTitle: 'Kurucu Ortak',
        slot: '14:05–14:10',
        durationMin: 5,
        status: 'pending',
        tableId: null,
        note: 'Enerji & veri analitiği tarafında ürün ekibimizi büyütüyoruz; 5 dk hızlı eşleşme için uygun musunuz?',
        createdAt: Date.now() - 260000
      },
      {
        id: 'mtg-seed-03',
        direction: 'outgoing',
        peerId: 'peer-denizbank-04',
        peerName: 'Ece Demirtaş',
        peerOrg: 'DenizBank',
        peerTitle: 'Dijital Bankacılık ve Ürün Müdürü',
        slot: '14:00–14:05',
        durationMin: 5,
        status: 'accepted',
        tableId: 'MP-04',
        checkedIn: false,
        note: 'FinTech MT programı ve ürün yönetimi kariyer yolu hakkında 5 dk görüşmek isterim.',
        createdAt: Date.now() - 900000
      }
    ];
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 4) return parsed;
      }
    } catch (_) {}
    const initial = {
      version: 4,
      gateCheckins: { 'gate-1': 0, 'gate-2': 0, 'gate-3': 0 },
      zoneDeltas: {},
      standDeltas: {},
      meetings: seedInitialMeetings(),
      scanHistory: [
        { ts: Date.now() - 960000, type: 'GATE', code: 'GATE-1', label: 'Gate 1 · Ziya Gökalp Ana Giriş Akreditasyonu' },
        { ts: Date.now() - 540000, type: 'ZONE', code: 'Z-RED', label: 'Red Zone · K Blok Fuaye Girişi' }
      ],
      activeTimer: null,
      updatedAt: Date.now()
    };
    saveState(initial, false);
    return initial;
  }

  let channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch (_) {}

  const listeners = new Set();

  function saveState(state, notify = true) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
    if (notify) {
      if (channel) {
        try { channel.postMessage({ type: 'STATE_UPDATED', ts: state.updatedAt }); } catch (_) {}
      }
      emit();
    }
  }

  function loadBadge() {
    try {
      const raw = localStorage.getItem(BADGE_KEY);
      if (raw) return Object.assign({}, DEFAULT_BADGE, JSON.parse(raw));
    } catch (_) {}
    return Object.assign({}, DEFAULT_BADGE);
  }

  function saveBadge(partial) {
    const next = Object.assign({}, loadBadge(), partial, { registered: true });
    try {
      localStorage.setItem(BADGE_KEY, JSON.stringify(next));
    } catch (_) {}
    if (channel) {
      try { channel.postMessage({ type: 'BADGE_UPDATED', ts: Date.now() }); } catch (_) {}
    }
    emit();
    return next;
  }

  function emit() {
    const snap = getSnapshot();
    listeners.forEach((fn) => {
      try { fn(snap); } catch (_) {}
    });
  }

  if (channel) {
    channel.onmessage = () => emit();
  }
  if (typeof global.addEventListener === 'function') {
    global.addEventListener('storage', (ev) => {
      if (ev.key === STORAGE_KEY || ev.key === BADGE_KEY) emit();
    });
  }

  function hashCode(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function allocateMeetingPoint(slot, seedStr, isCorporate15Min = false) {
    const state = loadState();
    const occupied = new Set(
      state.meetings
        .filter((m) => m.status === 'accepted' && m.slot === slot && m.tableId)
        .map((m) => m.tableId)
    );
    const pool = isCorporate15Min ? MEETING_POINTS.slice(16, 24) : MEETING_POINTS.slice(0, 16);
    if (seedStr) {
      const startIdx = hashCode(seedStr + '|' + slot) % pool.length;
      for (let offset = 0; offset < pool.length; offset++) {
        const candidate = pool[(startIdx + offset) % pool.length];
        if (!occupied.has(candidate.id)) return candidate.id;
      }
    }
    const free = pool.find((t) => !occupied.has(t.id)) || MEETING_POINTS.find((t) => !occupied.has(t.id)) || pool[0];
    return free.id;
  }

  // Summit Clock: during preview outside 20-21 Oct 2026 daytime, cycles smoothly around 13:48-14:12
  // so both "Şu an Sahnede" (13:30-14:15 MİLSOFT & Pitch) AND "15 dk içinde ->" (14:00 Kürşat Çağıltay & TUSAŞ)
  // are authentically visible and dynamic!
  const bootEpoch = Date.now();
  function getSummitClock() {
    const now = new Date();
    const isSummitDay = now.getFullYear() === 2026 && now.getMonth() === 9 && (now.getDate() === 20 || now.getDate() === 21);
    const realMinutes = now.getHours() * 60 + now.getMinutes();
    if (isSummitDay && realMinutes >= 570 && realMinutes <= 1080) {
      return {
        minutes: realMinutes,
        hhmm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        ss: String(now.getSeconds()).padStart(2, '0'),
        wallClock: now.toTimeString().slice(0, 8),
        isSimulated: false
      };
    }
    const elapsedMin = Math.floor((Date.now() - bootEpoch) / 20000) % 28;
    const simMin = 828 + elapsedMin; // 13:48 -> 14:15
    const hh = Math.floor(simMin / 60);
    const mm = simMin % 60;
    return {
      minutes: simMin,
      hhmm: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      ss: String(now.getSeconds()).padStart(2, '0'),
      wallClock: now.toTimeString().slice(0, 8),
      isSimulated: true
    };
  }

  function statusForPct(pct) {
    if (pct >= 84) return { key: 'high', label: 'YOĞUN', color: '#E41513' };
    if (pct >= 62) return { key: 'moderate', label: 'DENGELİ AKIŞ', color: '#0284C7' };
    return { key: 'open', label: 'MÜSAİT', color: '#10B981' };
  }

  function getSnapshot() {
    const state = loadState();
    const badge = loadBadge();
    const clock = getSummitClock();
    const wave = Math.sin(Date.now() / 19000);

    const gates = GATES.map((g, idx) => {
      const count = g.baseCheckedIn + (state.gateCheckins[g.id] || 0) + Math.round(Math.sin(Date.now() / 24000 + idx) * 2);
      return Object.assign({}, g, { count });
    });

    const zones = ZONES.map((z, idx) => {
      const delta = state.zoneDeltas[z.id] || 0;
      const micro = Math.round(Math.sin(Date.now() / 17000 + idx * 1.3) * 2);
      const count = Math.max(8, Math.min(z.capacity, z.baseCount + delta + micro));
      const pct = Math.min(100, Math.round((count / z.capacity) * 100));
      const status = statusForPct(pct);
      const stands = (z.stands || []).map((s, sIdx) => {
        const sDelta = state.standDeltas[s.id] || 0;
        const sMicro = Math.round(Math.cos(Date.now() / 21000 + sIdx) * 1);
        const sCount = Math.max(2, Math.min(s.capacity, s.baseCount + sDelta + sMicro));
        const sPct = Math.min(100, Math.round((sCount / s.capacity) * 100));
        return Object.assign({}, s, {
          zoneId: z.id,
          qrCode: `SUMMITTED://STAND/${z.id}/${s.id}`,
          count: sCount,
          pct: sPct,
          status: statusForPct(sPct)
        });
      });
      return Object.assign({}, z, { count, pct, status, stands });
    });

    const zonesById = {};
    zones.forEach((z) => { zonesById[z.id] = z; });

    const liveSessions = [];
    const upcomingSoonSessions = [];
    const allSessions = SESSIONS.map((s) => {
      let stateTag = 'upcoming';
      let minsUntil = s.startMin - clock.minutes;
      if (clock.minutes >= s.startMin && clock.minutes < s.endMin) {
        stateTag = 'live';
      } else if (minsUntil > 0 && minsUntil <= 20) {
        stateTag = 'soon';
      } else if (clock.minutes >= s.endMin) {
        stateTag = 'ended';
      }
      const enriched = Object.assign({}, s, {
        stateTag,
        minsUntil,
        zone: zonesById[s.zoneId]
      });
      if (stateTag === 'live') liveSessions.push(enriched);
      if (stateTag === 'soon') upcomingSoonSessions.push(enriched);
      return enriched;
    });

    const acceptedMeetings = state.meetings.filter((m) => m.status === 'accepted');
    const pendingIncoming = state.meetings.filter((m) => m.status === 'pending' && m.direction === 'incoming');
    const occupiedTablesCount = Math.min(24, 11 + acceptedMeetings.length + Math.round((wave + 1) * 1.5));

    const totalAccredited = gates.reduce((acc, g) => acc + g.count, 0);
    const totalInsideZones = zones.reduce((acc, z) => acc + z.count, 0);

    return {
      clock,
      badge,
      gates,
      zones,
      zonesById,
      sessions: allSessions,
      liveSessions,
      upcomingSoonSessions,
      meetings: state.meetings,
      acceptedMeetings,
      pendingIncoming,
      meetingPoints: MEETING_POINTS,
      occupiedTablesCount,
      totalTablesCount: MEETING_POINTS.length,
      peers: PEERS,
      slots5Min: SLOTS_5MIN,
      scanHistory: state.scanHistory || [],
      activeTimer: state.activeTimer,
      totalAccredited,
      totalInsideZones
    };
  }

  // Matchmaking Actions
  function sendMatchRequest({ peerId, slot, note }) {
    const peer = PEERS.find((p) => p.id === peerId);
    if (!peer) return null;
    const state = loadState();
    const chosenSlot = slot || peer.availableSlots[0] || SLOTS_5MIN[2];
    const req = {
      id: 'mtg-' + Date.now().toString(36),
      direction: 'outgoing',
      peerId: peer.id,
      peerName: peer.name,
      peerOrg: peer.org,
      peerTitle: peer.title,
      slot: chosenSlot,
      durationMin: 5,
      status: 'pending',
      tableId: null,
      checkedIn: false,
      note: (note || '').trim() || `${peer.org} bünyesindeki çalışmalarınız üzerine 5 dakikalık hızlı eşleşme talep ediyorum.`,
      createdAt: Date.now()
    };
    state.meetings.unshift(req);
    saveState(state, true);
    return req;
  }

  function respondToMeeting(meetingId, action, newSlot) {
    const state = loadState();
    if (action === 'cancel') {
      state.meetings = state.meetings.filter((item) => item.id !== meetingId);
      saveState(state, true);
      return { id: meetingId, status: 'cancelled' };
    }
    const m = state.meetings.find((item) => item.id === meetingId);
    if (!m) return null;
    if (action === 'accept') {
      if (newSlot) m.slot = newSlot;
      m.status = 'accepted';
      m.tableId = m.tableId || allocateMeetingPoint(m.slot, m.id + '|' + m.peerId, m.durationMin > 5);
      state.zoneDeltas.matchmaking = (state.zoneDeltas.matchmaking || 0) + 2;
    } else if (action === 'decline') {
      m.status = 'declined';
      m.tableId = null;
    } else if (action === 'reschedule' && newSlot) {
      m.slot = newSlot;
      m.status = 'accepted';
      m.tableId = allocateMeetingPoint(newSlot, m.id + '|' + m.peerId, m.durationMin > 5);
    }
    saveState(state, true);
    return m;
  }

  function startMeetingTimer(meetingId) {
    const state = loadState();
    const m = state.meetings.find((item) => item.id === meetingId);
    if (!m) return null;
    if (m.status !== 'accepted') {
      m.status = 'accepted';
      m.tableId = m.tableId || allocateMeetingPoint(m.slot, m.id, false);
    }
    m.checkedIn = true;
    const durationSec = (m.durationMin || 5) * 60;
    state.activeTimer = {
      meetingId: m.id,
      peerName: m.peerName,
      peerOrg: m.peerOrg,
      tableId: m.tableId,
      slot: m.slot,
      startedAt: Date.now(),
      endsAt: Date.now() + durationSec * 1000,
      durationSec
    };
    state.scanHistory.unshift({
      ts: Date.now(),
      type: 'MP',
      code: m.tableId,
      label: `${m.tableId} · ${m.peerName} (${m.peerOrg}) 5 Dk Görüşme Başladı`
    });
    saveState(state, true);
    return state.activeTimer;
  }

  function stopMeetingTimer() {
    const state = loadState();
    state.activeTimer = null;
    saveState(state, true);
  }

  // Universal QR Processor (Gate, Zone, Stand, Meeting Point, or Peer Badge Handshake URL)
  function processQRCode(rawInput) {
    const text = String(rawInput || '').trim();
    if (!text) return { ok: false, message: 'Geçersiz veya boş QR verisi.' };
    const state = loadState();

    // Check URL query connect payload (?qr=... or ?connect=...)
    let normalized = text;
    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        const u = new URL(text);
        const q = u.searchParams.get('qr');
        const connect = u.searchParams.get('connect');
        if (connect) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(connect))));
          const slot = decoded.slot || SLOTS_5MIN[3];
          const tableId = allocateMeetingPoint(slot, decoded.id + '|' + loadBadge().id, false);
          const peerMtg = {
            id: 'mtg-qr-' + Date.now().toString(36),
            direction: 'incoming',
            peerId: decoded.id || 'peer-qr',
            peerName: decoded.name || 'Kampüs Katılımcısı',
            peerOrg: decoded.org || 'TED Üniversitesi',
            peerTitle: decoded.roleLabel || 'Katılımcı',
            slot,
            durationMin: 5,
            status: 'accepted',
            tableId,
            checkedIn: true,
            note: 'Yaka kartı QR okutularak anlık 5 dakikalık eşleşme doğrulandı.',
            createdAt: Date.now()
          };
          state.meetings.unshift(peerMtg);
          state.activeTimer = {
            meetingId: peerMtg.id,
            peerName: peerMtg.peerName,
            peerOrg: peerMtg.peerOrg,
            tableId,
            slot,
            startedAt: Date.now(),
            endsAt: Date.now() + 300 * 1000,
            durationSec: 300
          };
          state.scanHistory.unshift({
            ts: Date.now(),
            type: 'BADGE',
            code: tableId,
            label: `Yaka QR Eşleşmesi: ${peerMtg.peerName} → ${tableId} (05:00 Başladı)`
          });
          saveState(state, true);
          return { ok: true, kind: 'BADGE', code: tableId, label: `${peerMtg.peerName} ile anlık eşleşme kuruldu (${tableId})!`, meeting: peerMtg };
        }
        if (q) normalized = q;
      }
    } catch (_) {}

    const upper = normalized.toUpperCase();

    // 1. Gate match
    const gate = GATES.find((g) => upper.includes(g.id.toUpperCase()) || upper === g.code);
    if (gate) {
      state.gateCheckins[gate.id] = (state.gateCheckins[gate.id] || 0) + 1;
      saveBadge({ checkedInGate: gate.id });
      state.scanHistory.unshift({ ts: Date.now(), type: 'GATE', code: gate.code, label: `${gate.name} — Akreditasyon Onaylandı` });
      saveState(state, true);
      return { ok: true, kind: 'GATE', code: gate.code, label: `${gate.shortName} girişiniz doğrulandı.` };
    }

    // 2. Meeting Point match (MP-01 .. MP-24)
    const mpMatch = upper.match(/MP[-_ ]?(\d{1,2})/);
    if (mpMatch) {
      const mpId = `MP-${String(parseInt(mpMatch[1], 10)).padStart(2, '0')}`;
      const existing = state.meetings.find((m) => m.status === 'accepted' && m.tableId === mpId) ||
                       state.meetings.find((m) => m.status === 'accepted');
      if (existing) {
        existing.tableId = mpId;
        const timer = startMeetingTimer(existing.id);
        return { ok: true, kind: 'MP', code: mpId, label: `${mpId} doğrulandı — ${existing.peerName} ile 05:00 görüşme başladı!`, timer };
      }
      state.zoneDeltas.matchmaking = (state.zoneDeltas.matchmaking || 0) + 1;
      state.scanHistory.unshift({ ts: Date.now(), type: 'MP', code: mpId, label: `${mpId} · Bire Bir Görüşme Masası Check-in` });
      saveState(state, true);
      return { ok: true, kind: 'MP', code: mpId, label: `${mpId} masasına check-in yapıldı.` };
    }

    // 3. Company / Community Stand match
    for (const z of ZONES) {
      for (const s of (z.stands || [])) {
        if (upper.includes(s.id.toUpperCase()) || upper === s.code) {
          state.standDeltas[s.id] = (state.standDeltas[s.id] || 0) + 1;
          state.zoneDeltas[z.id] = (state.zoneDeltas[z.id] || 0) + 1;
          saveBadge({ activeZoneId: z.id });
          state.scanHistory.unshift({ ts: Date.now(), type: 'STAND', code: s.code, label: `${s.name} (${z.shortName}) Masası Check-in & Profil İletildi` });
          saveState(state, true);
          return { ok: true, kind: 'STAND', code: s.code, label: `${s.name} masasına check-in yapıldı ve dijital yaka kartınız paylaşıldı.` };
        }
      }
    }

    // 4. Zone match
    const zone = ZONES.find((z) => upper.includes(z.id.toUpperCase()) || upper === z.code);
    if (zone) {
      state.zoneDeltas[zone.id] = (state.zoneDeltas[zone.id] || 0) + 1;
      saveBadge({ activeZoneId: zone.id });
      state.scanHistory.unshift({ ts: Date.now(), type: 'ZONE', code: zone.code, label: `${zone.name} Giriş QR Okutuldu` });
      saveState(state, true);
      return { ok: true, kind: 'ZONE', code: zone.code, label: `${zone.name} bölgesine giriş kaydedildi.` };
    }

    return { ok: false, message: `Tanınmayan QR kodu: "${text}". Kapı (GATE-1), Bölge (Z-RED), Stant (B-01) veya Masa (MP-04) okutun.` };
  }

  function buildBadgeShareUrl(originBase) {
    const b = loadBadge();
    const payload = {
      id: b.id,
      name: b.name,
      org: b.org,
      roleLabel: b.roleLabel,
      slot: SLOTS_5MIN[3]
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const base = originBase || (global.location ? `${global.location.origin}/tedu-app/` : 'https://arda-akgul.com/tedu-app/');
    return `${base}?connect=${encodeURIComponent(encoded)}`;
  }

  function toggleSavedSession(sessionId) {
    const b = loadBadge();
    const list = new Set(b.savedSessions || []);
    if (list.has(sessionId)) list.delete(sessionId);
    else list.add(sessionId);
    return saveBadge({ savedSessions: Array.from(list) });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // Periodic subtle heartbeat so live clocks & telemetry stay fresh
  setInterval(() => emit(), 5000);

  global.SummitTEDCore = {
    GATES,
    ZONES,
    SESSIONS,
    SLOTS_5MIN,
    MEETING_POINTS,
    PEERS,
    getSnapshot,
    loadBadge,
    saveBadge,
    sendMatchRequest,
    respondToMeeting,
    startMeetingTimer,
    stopMeetingTimer,
    processQRCode,
    buildBadgeShareUrl,
    toggleSavedSession,
    subscribe
  };

  // Backwards-compatible alias for 3D campus scene if referenced
  global.SubmitTEDTelemetry = global.SummitTEDCore;
})(typeof window !== 'undefined' ? window : globalThis);
