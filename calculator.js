const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const keys = document.querySelectorAll('[data-key]');
const equalsBtn = document.getElementById('equals');
const clearBtn = document.getElementById('clearBtn');
const langSelect = document.getElementById('lang');
const ariaAnnouncer = document.getElementById('ariaAnnouncer');

let expr = '';

function updateDisplay(){
  expressionEl.textContent = expr || '0';
  resultEl.textContent = expr ? '' : '0';
}

function safeEvaluate(input){
  if (!/^[0-9+\-*/().\s]+$/.test(input)) throw new Error('Invalid characters');
  try{
    const value = Function('return (' + input + ')')();
    if (typeof value === 'number' && isFinite(value)) return value;
    throw new Error('Calculation error');
  }catch(e){ throw e }
}

function speak(text){
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langSelect.value || 'en-US';
  const voices = speechSynthesis.getVoices();
  const match = voices.find(v => v.lang && v.lang.startsWith(utter.lang.split('-')[0]));
  if (match) utter.voice = match;
  utter.rate = 0.93;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
  ariaAnnouncer.textContent = text;
}

function announceResult(value){
  const lang = (langSelect.value === 'az-AZ') ? 'az' : 'en';
  if(lang === 'az') speak('Nəticə: ' + value);
  else speak('Result: ' + value);
}

keys.forEach(k => k.addEventListener('click', () => {
  const key = k.dataset.key;
  if(key === '=') return compute();
  expr += key;
  updateDisplay();
}));

equalsBtn.addEventListener('click', compute);
clearBtn.addEventListener('click', () => { expr = ''; updateDisplay(); speakClear(); });

function speakClear(){
  const lang = (langSelect.value === 'az-AZ') ? 'az' : 'en';
  if(lang === 'az') speak('Təmizləndi');
  else speak('Cleared');
}

function compute(){
  if(!expr) return;
  try{
    const value = safeEvaluate(expr);
    resultEl.textContent = String(value);
    announceResult(String(value));
    expr = String(value);
  }catch(e){
    const lang = (langSelect.value === 'az-AZ') ? 'az' : 'en';
    const errMsg = (lang === 'az') ? 'Hesablama xətası' : 'Calculation error';
    resultEl.textContent = errMsg;
    speak(errMsg);
  }
  updateDisplay();
}

window.addEventListener('keydown', (ev) => {
  if(ev.key === 'Enter') { ev.preventDefault(); compute(); return }
  if(ev.key === 'Backspace') { expr = expr.slice(0,-1); updateDisplay(); return }
  if(ev.key === 'Escape'){ expr = ''; updateDisplay(); speakClear(); return }
  if(/^[0-9+\-*/().]$/.test(ev.key)){
    expr += ev.key; updateDisplay();
  }
});

function initVoices(){
  speechSynthesis.getVoices();
}
window.speechSynthesis.onvoiceschanged = initVoices;
initVoices();

window.addEventListener('load', () => {
  updateDisplay();
  const lang = (langSelect.value === 'az-AZ') ? 'az' : 'en';
  if(lang === 'az') speak('Kalkulyator yükləndi. Əməliyyatları düymələri ilə və ya klaviatura istifadə edərək daxil edin.');
  else speak('Calculator ready. Enter operations using buttons or your keyboard.');
});
