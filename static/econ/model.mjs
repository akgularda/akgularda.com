const baseWorld = [2.4, 2.8, 2.0, 1.6, 1.0, 1.3, 2.0, 2.7, 3.0, 2.4];
const baseGrowth = [1.0, 3.1, 1.4, 0.9, 1.9, 0.9, 2.0, 2.8, 3.1, 2.4];
const baseCCI = [100, 102.3, 100.5, 99.5, 98.7, 98.5, 101, 102.8, 103.6, 101.6];

export const lengths = [5, 7, 10];
export const events = {
  oil: { name: 'Petrol fiyatı sıçraması',
    detail: 'Pahalanan enerji ithalatı fiyat baskısını artırıyor.', inflationShock: 1.5 },
  exports: { name: 'İhracat patlaması',
    detail: 'Dış siparişler artıyor. İhracat büyümeyi desteklerken iç fiyat baskısı artabilir.',
    exportShareShock: 0.025 },
  currency: { name: 'Kur şoku',
    detail: 'Yerel para değer kaybediyor. İthalat pahalanırken ihracat daha rekabetçi hâle geliyor.',
    exchangeShock: -6 },
};
export const policies = {
  interest: { label: 'Politika faizi', min: 0, max: 10, step: 0.1, unit: '%',
    help: 'Kredi maliyetini, yatırımı, döviz kurunu ve fiyat baskısını etkiler.' },
  incomeTax: { label: 'Gelir vergisi', min: 0, max: 50, step: 1, unit: '%',
    help: 'Hanehalkının harcanabilir gelirini ve kamu gelirini değiştirir.' },
  corporateTax: { label: 'Kurumlar vergisi', min: 0, max: 50, step: 1, unit: '%',
    help: 'Şirket yatırımlarını, sermaye birikimini ve kamu gelirini etkiler.' },
  spending: { label: 'Kamu harcaması', min: 0, max: 1000, step: 0.1, unit: 'mr $',
    help: 'Talebi destekler. Gelirle karşılanmayan harcama bütçe açığını artırır.' },
};

export const scenarios = {
  base: { name: 'Temel senaryo', tag: 'DENGELİ', description: 'Dengeli bir başlangıç, ardından küresel yavaşlama ve toparlanma.',
    world: baseWorld, cci: baseCCI, growth: baseGrowth, start: [5, 2, 60, 100, 2.5] },
  roller: { name: 'Dalgalı dünya', tag: 'YÜKSEK OYNAKLIK', description: 'Hızlı genişlemeyi sert bir dış talep şoku izler.',
    world: [2.4, 3.2, 1.6, 0.8, -0.4, 0.2, 1.6, 3.3, 0.7, 2.5],
    cci: [100, 103.3, 100.5, 97.8, 96.5, 96.8, 101, 104, 98, 102],
    growth: [1, 4.1, 1, 0.1, -1.9, 0.6, 2.4, 4.4, 0.2, 3.4], start: [5, 2, 60, 100, 2.5] },
  stagnant: { name: 'Durgun dünya', tag: 'DÜŞÜK OYNAKLIK', description: 'Küresel büyüme zayıf. İstihdamı desteklemek sana kalıyor.',
    world: [2.4, 2.6, 2.2, 2, 1.7, 1.9, 2.2, 1.9, 2.1, 2.2],
    cci: [100, 101.8, 100.5, 100.3, 100.1, 100.1, 100.3, 99.8, 100, 100.4],
    growth: [1, 2.5, 1.6, 1.2, 0.6, 1.2, 1.7, 1.2, 1.5, 1.6], start: [5, 2, 60, 100, 2.5] },
  strong: { name: 'Güçlü ülke', tag: 'SAĞLAM BAŞLANGIÇ', description: 'Düşük borç, güçlü güven ve düşük işsizlik. Aşırı ısınmayı önle.',
    world: baseWorld, cci: baseCCI.map(value => value + 7), growth: baseGrowth.map(value => value + 1.25),
    start: [3.6, 1.8, 34, 107, 3.6] },
  crisis: { name: 'Krizdeki ülke', tag: 'ZOR BAŞLANGIÇ', description: 'Yüksek borç, enflasyon ve işsizlik. Önceliklerini dikkatle seç.',
    world: baseWorld, cci: baseCCI.map((value, index) => value - 15 + index),
    growth: baseGrowth.map((value, index) => value - 3 + index * 0.28), start: [11, 8, 98, 85, -2] },
};

const defaultPolicy = { interest: 3, incomeTax: 24, corporateTax: 30, spending: 30 };
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const round = value => Math.round((value + Number.EPSILON) * 10) / 10;

export function settings(input) {
  const { scenario, turns, storyline = 'classic', spendingMultiplier = 1, taxMultiplier = 1,
    eventCards = true } = input ?? {};
  if (!Object.hasOwn(scenarios, scenario) || !lengths.includes(turns) ||
      !['classic', 'revised'].includes(storyline) ||
      ![spendingMultiplier, taxMultiplier].every(value => Number.isFinite(value) && value >= 0 && value <= 3)) {
    throw new Error('Geçerli bir senaryo, tur sayısı ve 0–3 arası çarpan seçin.');
  }
  if (typeof eventCards !== 'boolean') throw new Error('Olay kartları ayarı geçersiz.');
  return { scenario, turns, storyline, spendingMultiplier, taxMultiplier, eventCards, modelVersion: 2 };
}

export function decision(input) {
  return Object.fromEntries(Object.entries(policies).map(([key, policy]) => {
    const value = input?.[key];
    if (!Number.isFinite(value) || value < policy.min || value > policy.max ||
        Math.abs(value / policy.step - Math.round(value / policy.step)) > 1e-8) {
      throw new Error(`${policy.label} için geçerli bir değer girin.`);
    }
    return [key, round(value)];
  }));
}

function seriesIndex(config, index) {
  return config.storyline === 'revised' ? ([0, 1, 4, 3, 2][index] ?? index) : index;
}

export function forecast(config, history) {
  if (history.length >= config.turns) return null;
  const scenario = scenarios[config.scenario];
  const index = history.length;
  const series = seriesIndex(config, index);
  const world = scenario.world[series];
  const growthDelta = history[index - 2]?.growthDelta ?? 0;
  const cci = clamp(scenario.cci[series] + 0.5 * growthDelta, 40, 160);
  const outlook = world < 0 ? 'Küresel daralma ihracat talebini baskılıyor.' :
    world < 1.5 ? 'Dünya ekonomisinde yavaşlama bekleniyor.' :
    world >= 2.6 ? 'Küresel genişleme dış talebi destekliyor.' :
    'Dünya ekonomisinde ılımlı büyüme bekleniyor.';
  const year = index + 1;
  const event = config.modelVersion === 2 && config.eventCards === true ? {
    2: 'oil', [Math.ceil(config.turns / 2)]: 'exports', [config.turns - 1]: 'currency',
  }[year] : undefined;
  return { year, world, cci, outlook, ...(event ? { event } : {}) };
}

export function initial(config) {
  const [unemployment, inflation, debt, cci, growth] = scenarios[config.scenario].start;
  const state = { year: 0, cci, growth, unemployment, inflation, debt, debtRatio: debt, nominal: 100,
    real: 100, cpi: 100, exchange: 100, capital: 100, productivity: 0, consumption: 55,
    investment: 15, exports: 25, imports: 25, trade: 0, incomeRevenue: 24,
    corporateRevenue: 3, budget: -3, balance: -3, policy: { ...defaultPolicy } };
  if (config.modelVersion !== 2) return state;
  const debtRate = debtMarketRate(defaultPolicy.interest, debt);
  const interestCost = debt * debtRate / 100;
  return { ...state, debtRate, interestCost, primaryBudget: state.budget, reserves: 0,
    budget: state.budget - interestCost, balance: state.balance - interestCost };
}

export function score({ growth, unemployment, inflation, balance }) {
  return {
    growth: growth >= 2.5 ? 25 : growth >= 1 ? 10 : 0,
    unemployment: unemployment <= 5 ? 25 : unemployment <= 8 ? 10 : 0,
    inflation: inflation >= 0 && inflation <= 3 ? 25 : inflation > 3 && inflation <= 5 ? 10 : 0,
    balance: balance >= -3 ? 25 : balance >= -6 ? 10 : 0,
  };
}

// Unversioned saved games use their original model until they finish.
function legacyEconomy(config, previous, outlook, policy, referenceGrowth, referenceCCI) {
  const interest = policy.interest - 3;
  const incomeTax = policy.incomeTax - 24;
  const corporateTax = policy.corporateTax - 30;
  const spending = policy.spending - 30;
  const demand = config.spendingMultiplier * 22 * Math.tanh(spending / 22) -
    config.taxMultiplier * (0.29 * incomeTax + 0.14 * corporateTax) - 0.62 * interest;
  const growth = clamp(referenceGrowth + demand + 0.14 * (outlook.cci - referenceCCI), -30, 36);
  const inflation = clamp(1.35 + 0.31 * (previous.inflation - 1.35) +
    0.17 * (growth - 1.8) - 0.32 * interest + 0.055 * Math.max(0, spending) -
    0.045 * (previous.unemployment - 5), -12, 60);
  const unemployment = clamp(previous.unemployment + 0.16 * (5 - previous.unemployment) +
    0.36 * (1.85 - growth), 1, 35);
  const cpi = previous.cpi * (1 + inflation / 100);
  const real = previous.real * (1 + growth / 100);
  const nominal = real * cpi / 100;
  const exchange = clamp(previous.exchange + 0.75 * interest + 0.14 * previous.trade -
    0.25 * (inflation - 2), 38, 180);
  const investment = nominal * clamp(0.15 - 0.006 * interest - 0.0018 * corporateTax +
    0.00055 * (outlook.cci - 100), 0.035, 0.28);
  const capital = previous.capital * 0.93 + investment / (cpi / 100) * 0.78;
  const productivity = 0.55 * (capital / previous.capital - 1) * 100;
  const exports = nominal * clamp(0.25 + 0.009 * (outlook.world - 2.4) - 0.0014 * (exchange - 100), 0.09, 0.42);
  // Purchases beyond domestic capacity are accounted for as imports.
  const imports = Math.max(nominal * clamp(0.25 + 0.0012 * (exchange - 100) +
    0.0025 * (growth - 2.5), 0.10, 0.48), policy.spending + investment + exports - 0.8 * nominal);
  const consumption = nominal - policy.spending - investment - exports + imports;
  const incomeRevenue = nominal * policy.incomeTax / 100;
  const corporateRevenue = nominal * 0.1 * policy.corporateTax / 100;
  const budget = incomeRevenue + corporateRevenue - policy.spending;
  const balance = budget / nominal * 100;
  const debt = Math.max(0, previous.debt - budget);
  return { growth,
    unemployment, inflation, cpi, real, nominal, exchange, investment, capital, productivity,
    exports, imports, consumption, trade: exports - imports, incomeRevenue, corporateRevenue,
    budget, balance, debt, debtRatio: debt / nominal * 100 };
}

function debtMarketRate(interest, debtRatio) {
  return interest + 0.5 + clamp((debtRatio - 60) * 0.025, 0, 5);
}

function economy(config, previous, outlook, policy, referenceGrowth) {
  const event = events[outlook.event];
  const expectedInflation = 2 + 0.58 * (previous.inflation - 2);
  const realRate = policy.interest - expectedInflation;
  const tightness = realRate - 1;
  const confidence = outlook.cci - 100;
  const reference = previous.nominal * (1 + (referenceGrowth + 0.12 * previous.productivity) / 100) *
    (1 + expectedInflation / 100);
  const spendingBaseline = Math.min(defaultPolicy.spending, reference * 0.42);
  const spendingGap = policy.spending - spendingBaseline;
  const capacity = reference * 0.2;
  // Domestic supply absorbs only part of a spending shock. The remainder is imported.
  const domesticSpending = 0.85 * (spendingGap < 0 ? spendingGap : capacity * Math.tanh(spendingGap / capacity));
  const publicImports = spendingGap - domesticSpending;

  const consumptionBase = reference * 0.85 - spendingBaseline;
  const incomeTaxChange = policy.incomeTax - defaultPolicy.incomeTax;
  const corporateTaxChange = policy.corporateTax - defaultPolicy.corporateTax;
  const inducedDemand = 0.28 * config.spendingMultiplier * domesticSpending;
  const consumption = Math.max(reference * 0.15, consumptionBase * clamp(1 - 0.018 * tightness -
    0.011 * config.taxMultiplier * incomeTaxChange + 0.003 * confidence, 0.5, 1.45) + inducedDemand);
  const investment = reference * 0.15 * clamp(1 - 0.065 * tightness -
    0.024 * config.taxMultiplier * corporateTaxChange + 0.004 * confidence, 0.25, 1.65);

  const exchange = clamp(previous.exchange + 0.17 * (100 - previous.exchange) +
    1.35 * tightness + 0.09 * (previous.trade / previous.nominal * 100) +
    (event?.exchangeShock ?? 0), 55, 165);
  const currencyStrength = exchange - 100;
  const exports = reference * clamp(0.25 + 0.005 * (outlook.world - 2.4) -
    0.0015 * currencyStrength + (event?.exportShareShock ?? 0), 0.1, 0.4);
  const privateDemandGap = (consumption + investment - consumptionBase - reference * 0.15) / reference;
  const imports = reference * clamp(0.25 + 0.0014 * currencyStrength + 0.16 * privateDemandGap,
    0.12, 0.42) + publicImports;
  const trade = exports - imports;
  const nominal = consumption + policy.spending + investment + trade;

  const demandGap = (nominal - reference) / previous.nominal * 100;
  const importPricePressure = (previous.exchange / exchange - 1) * 100;
  const inflation = clamp(expectedInflation + 0.18 * demandGap + 0.09 * importPricePressure -
    0.1 * previous.productivity + (event?.inflationShock ?? 0), -10, 35);
  const cpi = previous.cpi * (1 + inflation / 100);
  const real = nominal * 100 / cpi;
  const growth = (real / previous.real - 1) * 100;
  const unemployment = clamp(previous.unemployment + 0.15 * (5 - previous.unemployment) +
    0.32 * (2.1 + 0.12 * previous.productivity - growth), 1, 35);
  const capital = 0.95 * previous.capital + 0.5 * investment * 100 / cpi;
  const productivity = 0.55 * (capital / previous.capital - 1) * 100;

  const incomeRevenue = nominal * policy.incomeTax / 100;
  const corporateRevenue = nominal * 0.1 * policy.corporateTax / 100;
  const primaryBudget = incomeRevenue + corporateRevenue - policy.spending;
  const debtRate = 0.7 * previous.debtRate + 0.3 * debtMarketRate(policy.interest, previous.debtRatio);
  const interestCost = previous.debt * debtRate / 100;
  const budget = primaryBudget - interestCost;
  const netDebt = previous.debt - previous.reserves - budget;
  const debt = Math.max(0, netDebt);
  const reserves = Math.max(0, -netDebt);
  return { growth, unemployment, inflation, cpi, real, nominal, exchange, investment, capital,
    productivity, exports, imports, consumption, trade, incomeRevenue, corporateRevenue,
    primaryBudget, interestCost, debtRate, realRate, budget, balance: budget / nominal * 100,
    debt, debtRatio: debt / nominal * 100, reserves };
}

export function advance(config, history, input) {
  const outlook = forecast(config, history);
  if (!outlook) throw new Error('Bu oyun tamamlandı.');
  const policy = decision(input);
  const previous = history.at(-1) ?? initial(config);
  const scenario = scenarios[config.scenario];
  const index = seriesIndex(config, history.length);
  const referenceGrowth = scenario.growth[index];
  const simulate = config.modelVersion === 2 ? economy : legacyEconomy;
  const result = { ...outlook, policy,
    ...simulate(config, previous, outlook, policy, referenceGrowth, scenario.cci[index]) };
  result.growthDelta = result.growth - referenceGrowth;
  result.points = score(result);
  result.approval = Object.values(result.points).reduce((sum, points) => sum + points, 0);
  result.average = (history.reduce((sum, row) => sum + row.approval, 0) + result.approval) / outlook.year;
  return result;
}

export function advice(result) {
  const messages = [];
  if (result.growth < 1) messages.push('Reel büyüme zayıf. Talebi ve yatırım koşullarını incele.');
  if (result.unemployment > 8) messages.push('İşsizlik yüksek. İstihdam hedefini kararlarında gözet.');
  if (result.inflation > 5) messages.push('Fiyat baskısı güçlü. Talep ile fiyat istikrarı arasındaki dengeye bak.');
  if (result.inflation < 0) messages.push('Fiyatlar düşüyor. Deflasyon, harcama ve yatırımları erteletebilir.');
  if (result.balance < -3) messages.push('Bütçe açığı büyüyor. Gelir, harcama ve borç tablosunu birlikte değerlendir.');
  if (result.interestCost > 0.04 * result.nominal) {
    messages.push('Borç faizinin milli gelirdeki payı yüksek. Faiz dışı dengeye ve borcun seyrine bak.');
  }
  return messages.length ? messages : ['Göstergeler yönetilebilir düzeyde. Yeni dünya tahminini göz önünde bulundur.'];
}

export function approvalExtremes(history) {
  const scores = history.map(row => row.approval);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  return { highest, lowest, bestYears: history.filter(row => row.approval === highest).map(row => row.year),
    hardestYears: history.filter(row => row.approval === lowest).map(row => row.year) };
}
