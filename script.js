// ── CONFIG — edit these values ──────────────────────────────────────────────
const WHATSAPP_NUMBER = '2348085929614'; // Replace with actual number

const RATES = {
  btc:    { name:'Bitcoin (BTC)',     symbol:'BTC', rate: 95000,  nairaPerUSD: 1540, unit:'USD',  sub:['—'] },
  usdt:   { name:'USDT',             symbol:'USDT',rate: 1,      nairaPerUSD: 1540, unit:'USD',  sub:['TRC20','ERC20','BEP20'] },
  eth:    { name:'Ethereum (ETH)',    symbol:'ETH', rate: 3400,   nairaPerUSD: 1540, unit:'USD',  sub:['ERC20'] },
  bnb:    { name:'BNB',              symbol:'BNB', rate: 580,    nairaPerUSD: 1540, unit:'USD',  sub:['BEP20'] },
  amazon: { name:'Amazon Gift Card',  symbol:'AGC', rate: 1,      nairaPerUSD: 1240, unit:'USD',  sub:['US','UK','CA'] },
  itunes: { name:'iTunes Gift Card',  symbol:'iTunes',rate:1,     nairaPerUSD: 1180, unit:'USD',  sub:['US','UK','AU'] },
  steam:  { name:'Steam Gift Card',   symbol:'Steam', rate:1,     nairaPerUSD: 1100, unit:'USD',  sub:['US'] },
  google: { name:'Google Play Card',  symbol:'GPay',  rate:1,     nairaPerUSD: 1150, unit:'USD',  sub:['US','UK'] },
  vanilla:{ name:'Vanilla Gift Card', symbol:'Vanilla',rate:1,    nairaPerUSD: 1080, unit:'USD',  sub:['US'] },
  sephora:{ name:'Sephora Gift Card', symbol:'Sephora',rate:1,    nairaPerUSD: 1050, unit:'USD',  sub:['US'] },
};
// ────────────────────────────────────────────────────────────────────────────

let selectedAsset  = 'btc';
let selectedSub    = '';
let currentAmount  = 0;

// Ticker
function buildTicker() {
  const items = [
    { sym:'BTC',   price:'$95,421',  pct:'+2.4%',  up:true },
    { sym:'USDT',  price:'₦1,540/$', pct:'0.0%',   up:true },
    { sym:'ETH',   price:'$3,412',   pct:'+1.8%',  up:true },
    { sym:'BNB',   price:'$582',     pct:'-0.5%',  up:false},
    { sym:'AMAZON',price:'₦1,240/$', pct:'Buying', up:true },
    { sym:'ITUNES',price:'₦1,180/$', pct:'Buying', up:true },
    { sym:'STEAM', price:'₦1,100/$', pct:'Buying', up:true },
    { sym:'GPLAY', price:'₦1,150/$', pct:'Buying', up:true },
    { sym:'VANILLA',price:'₦1,080/$', pct:'Buying', up:true },
    { sym:'SEPHORA',price:'₦1,050/$', pct:'Buying', up:true },
  ];
  const html = [...items,...items].map(i=>`
    <div class="ticker-item">
      <span class="symbol">${i.sym}</span>
      <span>${i.price}</span>
      <span class="${i.up?'up':'down'}">${i.pct}</span>
    </div>
  `).join('');
  document.getElementById('ticker').innerHTML = html;
}

// Asset tab selection
function setupAssetTabs() {
  document.querySelectorAll('.asset-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.asset-tab').forEach(t=>t.classList.remove('selected'));
      tab.classList.add('selected');
      selectedAsset = tab.dataset.asset;
      selectedSub = '';
      renderSubOptions();
      updateStepProgress(2);
      calculate();
    });
  });
}

function renderSubOptions() {
  const data = RATES[selectedAsset];
  const wrap = document.getElementById('subOptions');
  if (!data || !data.sub || data.sub[0]==='—') { wrap.style.display='none'; return; }
  wrap.style.display='flex';
  wrap.innerHTML = data.sub.map((s,i)=>`
    <div class="sub-chip ${i===0?'selected':''}" data-sub="${s}">${s}</div>
  `).join('');
  selectedSub = data.sub[0];
  wrap.querySelectorAll('.sub-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      wrap.querySelectorAll('.sub-chip').forEach(c=>c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedSub = chip.dataset.sub;
      calculate();
    });
  });
}

// Amount input
function setupAmountInput() {
  const inp = document.getElementById('amountInput');
  inp.addEventListener('input', () => {
    currentAmount = parseFloat(inp.value) || 0;
    if (currentAmount > 0) updateStepProgress(3);
    calculate();
  });
}

function calculate() {
  const data = RATES[selectedAsset];
  if (!data || currentAmount <= 0) {
    document.getElementById('resultPane').classList.remove('show');
    document.getElementById('rateLiveText').textContent = 'Select an asset and enter amount to calculate';
    updateWABtn('', '');
    return;
  }

  const nairaOut = Math.round(currentAmount * data.nairaPerUSD);
  const formatted = nairaOut.toLocaleString('en-NG');

  document.getElementById('rAsset').textContent   = data.name;
  document.getElementById('rAmount').textContent  = `$${currentAmount.toLocaleString()}`;
  document.getElementById('rRate').textContent    = `₦${data.nairaPerUSD.toLocaleString()} per $1`;
  document.getElementById('rNetwork').textContent = selectedSub || '—';
  document.getElementById('rPayout').textContent  = `₦${formatted}`;
  document.getElementById('resultPane').classList.add('show');

  document.getElementById('rateLiveText').textContent =
    `Current rate: ₦${data.nairaPerUSD.toLocaleString()}/$1 for ${data.name}`;

  document.getElementById('calcCard').classList.add('active');
  updateStepProgress(4);

  // Build WhatsApp message
  const msg = `Hi SwiftRates 👋\n\nI want to trade:\n• Asset: ${data.name}${selectedSub?' ('+selectedSub+')':''}\n• Amount: $${currentAmount.toLocaleString()}\n• Expected payout: ₦${formatted}\n\nPlease confirm the rate and let's proceed!`;
  updateWABtn(msg, data.name);
}

function updateWABtn(msg, assetName) {
  const btn  = document.getElementById('waBtn');
  const fBtn = document.getElementById('floatWA');
  const url  = msg
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;
  btn.href  = url;
  fBtn.href = url;
}

function openWA(msg) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Step progress
function updateStepProgress(activeStep) {
  ['sp1','sp2','sp3','sp4'].forEach((id, i)=>{
    const el = document.getElementById(id);
    el.classList.remove('active','done');
    const stepNum = i + 1;
    if (stepNum < activeStep) el.classList.add('done');
    else if (stepNum === activeStep) el.classList.add('active');
  });
}

// FAQ
const faqs = [
  { q:'How fast will I receive my payment?', a:'Most trades are settled in under 5 minutes once we confirm receipt of your crypto or gift card. Bank transfers to GTB, Access, Opay, Kuda, and other banks are instant.' },
  { q:'Are the rates shown fixed or can they change?', a:'The rates shown are indicative and updated regularly. The final rate is locked when you start the trade on WhatsApp. Rates rarely differ significantly from what the calculator shows.' },
  { q:'What crypto wallets and networks do you support?', a:'We support Bitcoin (any wallet), USDT (TRC20, ERC20, BEP20), Ethereum (ERC20), and BNB (BEP20). Always confirm the network with our agent before sending.' },
  { q:'Which gift cards do you accept?', a:'Amazon (US, UK, CA), iTunes (US, UK, AU), Steam (US), Google Play (US, UK), Vanilla (US), Sephora (US), and many more. If you have a card not listed, message us on WhatsApp — we likely accept it.' },
  { q:'Is there a minimum or maximum trade amount?', a:'Minimum is $50 per trade. For large amounts above $10,000, please message us first so we can prepare the appropriate payout. There is no hard maximum.' },
  { q:'Do you accept bank transfers or only crypto?', a:'We are a buyer — you send us crypto or gift cards, and we pay you in naira. We do not accept naira deposits.' },
];

function buildFAQ() {
  const list = document.getElementById('faqList');
  list.innerHTML = faqs.map((f,i)=>`
    <div class="faq-item" id="faq${i}">
      <div class="faq-q" onclick="toggleFAQ(${i})">
        <span>${f.q}</span>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-a">${f.a}</div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const item = document.getElementById('faq'+i);
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el=>el.classList.remove('open'));
  if (!open) item.classList.add('open');
}

// Nav active link scroll
function setupNavScroll() {
  const sections = ['calculator','how','trust','faq'];
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY + 120;
    sections.forEach(id=>{
      const el = document.getElementById(id);
      if (!el) return;
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (!link) return;
      if (el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
        link.style.color = 'var(--white)';
      } else {
        link.style.color = '';
      }
    });
  });
}

// Mobile nav toggle
function setupNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Init
buildTicker();
setupAssetTabs();
renderSubOptions();
setupAmountInput();
buildFAQ();
setupNavScroll();
setupNavToggle();
updateWABtn('', '');
