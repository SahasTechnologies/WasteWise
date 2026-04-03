// Script for the World Counts counters
const rate1 = 63.73668188736682;
const countEl1 = document.getElementById('world-count-1');

// Counter 2: Tonnes of waste dumped (ID: 63)
const rate2 = 67.22475900558092;
const countEl2 = document.getElementById('world-count-2');

function updateCounters() {
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0);
  const secondsElapsed = (now.getTime() - startOfYear) / 1000;

  if (countEl1) {
    const val1 = secondsElapsed * rate1;
    countEl1.textContent = Math.floor(val1).toLocaleString('en-AU');
  }

  if (countEl2) {
    const val2 = secondsElapsed * rate2;
    countEl2.textContent = Math.floor(val2).toLocaleString('en-AU');
  }

  requestAnimationFrame(updateCounters);
}

requestAnimationFrame(updateCounters);

// ──────────────────────────────────────────────────────────────
// Material-based impact calculator (from calculator.json data)
// ──────────────────────────────────────────────────────────────

const CALCULATOR = {
  waste_factors: {
    food_waste:      { co2_saved_per_kg: 1.0 },
    garden_waste:    { co2_saved_per_kg: 0.7 },
    paper_cardboard: { co2_saved_per_kg: 1.2 },
    plastics:        { co2_saved_per_kg: 1.5 },
    glass:           { co2_saved_per_kg: 0.3 },
    metals:          { co2_saved_per_kg: 1.8 },
  },
  household_bin_composition: {
    food_waste:      50,
    garden_waste:    8,
    paper_cardboard: 23,
    plastics:        13,
    glass:           2,
    metals:          4,
  },
  equivalents: {
    co2_per_kilometre_car:          0.25,
    co2_per_kwh_electricity:        0.62,
    co2_per_phone_charge:           0.008,
    co2_per_hour_led_light:         0.016,
    co2_per_aviation_passenger_km:  0.15,
    co2_per_litre_petrol:           2.3,
  }
};

const DEFAULT_BIN_KG = 20; // typical AU household bin weight

const MATERIALS = ['food_waste', 'paper_cardboard', 'plastics', 'glass', 'metals', 'garden_waste'];

// Current slider state (copies so we can manipulate)
let sliderValues = { ...CALCULATOR.household_bin_composition };

function getEl(id) { return document.getElementById(id); }

function computeAndDisplay() {
  const totalPct = MATERIALS.reduce((s, k) => s + sliderValues[k], 0);
  const warning = getEl('pct-warning');
  const totalDisplay = getEl('total-kg-display');
  const totalVal = getEl('pct-total-val');

  if (totalDisplay) totalDisplay.textContent = DEFAULT_BIN_KG + ' kg';

  if (Math.abs(totalPct - 100) > 0.5) {
    if (warning) {
      warning.classList.remove('hidden');
      if (totalVal) totalVal.textContent = Math.round(totalPct);
    }
  } else {
    if (warning) warning.classList.add('hidden');
  }

  // Calculate CO2 saved
  let totalCO2 = 0;
  MATERIALS.forEach(key => {
    const pct = sliderValues[key] / 100;
    const kgOfMaterial = DEFAULT_BIN_KG * pct;
    const factor = CALCULATOR.waste_factors[key].co2_saved_per_kg;
    totalCO2 += kgOfMaterial * factor;
  });

  const eq = CALCULATOR.equivalents;
  const carKm = totalCO2 / eq.co2_per_kilometre_car;
  const ledHours = totalCO2 / eq.co2_per_hour_led_light;
  const phoneCharges = totalCO2 / eq.co2_per_phone_charge;

  const co2El = getEl('res-co2');
  const carEl = getEl('res-car');
  const ledEl = getEl('res-led');
  const phoneEl = getEl('res-phone');

  if (co2El) co2El.textContent = totalCO2.toFixed(1);
  if (carEl) carEl.textContent = carKm.toFixed(1);
  if (ledEl) ledEl.textContent = Math.round(ledHours).toLocaleString('en-AU');
  if (phoneEl) phoneEl.textContent = Math.round(phoneCharges).toLocaleString('en-AU');
}

function updateSliderFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill-pct', pct + '%');
}

function redistributeOthers(changedKey, newVal) {
  // Clamp changed value
  newVal = Math.max(0, Math.min(100, newVal));
  sliderValues[changedKey] = newVal;

  const others = MATERIALS.filter(k => k !== changedKey);
  const otherSum = others.reduce((s, k) => s + sliderValues[k], 0);
  const remaining = 100 - newVal;

  if (otherSum === 0) {
    // spread evenly
    const share = remaining / others.length;
    others.forEach(k => { sliderValues[k] = Math.round(share); });
  } else {
    // Scale others proportionally
    others.forEach(k => {
      sliderValues[k] = Math.round((sliderValues[k] / otherSum) * remaining);
    });
  }

  // Fix rounding drift
  let currentSum = MATERIALS.reduce((s, k) => s + sliderValues[k], 0);
  const diff = 100 - currentSum;
  if (diff !== 0) {
    // apply drift to largest other
    const largest = others.reduce((a, b) => sliderValues[a] >= sliderValues[b] ? a : b);
    sliderValues[largest] = Math.max(0, sliderValues[largest] + diff);
  }
}

function syncSlidersToState() {
  MATERIALS.forEach(key => {
    const input = getEl('slider-' + key);
    const pctEl = getEl('pct-' + key);
    if (input) {
      input.value = sliderValues[key];
      updateSliderFill(input);
    }
    if (pctEl) pctEl.textContent = sliderValues[key] + '%';
  });
}

function initMaterialSliders() {
  MATERIALS.forEach(key => {
    const input = getEl('slider-' + key);
    if (!input) return;

    updateSliderFill(input);

    input.addEventListener('input', () => {
      const newVal = parseInt(input.value, 10);
      redistributeOthers(key, newVal);
      syncSlidersToState();
      computeAndDisplay();
    });
  });

  const resetBtn = getEl('impact-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      sliderValues = { ...CALCULATOR.household_bin_composition };
      syncSlidersToState();
      computeAndDisplay();
    });
  }

  computeAndDisplay();
}

if (document.getElementById('material-sliders')) {
  initMaterialSliders();
}
