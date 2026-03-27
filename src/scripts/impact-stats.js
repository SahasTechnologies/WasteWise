// Script for the World Counts counters
const startTime = Date.now();

// Counter 1: Tonnes of waste from households
const start1 = 452088061.72845644;
const rate1 = 63.73668188736682;
const countEl1 = document.getElementById('world-count-1');

// Counter 2: Tonnes of waste dumped
const start2 = 476870803.1619073;
const rate2 = 67.22475900558092;
const countEl2 = document.getElementById('world-count-2');

function updateCounters() {
  const now = Date.now();
  const secondsElapsed = (now - startTime) / 1000;
  
  if (countEl1) {
    const val1 = start1 + (secondsElapsed * rate1);
    countEl1.textContent = Math.floor(val1).toLocaleString('en-US');
  }
  
  if (countEl2) {
    const val2 = start2 + (secondsElapsed * rate2);
    countEl2.textContent = Math.floor(val2).toLocaleString('en-US');
  }

  requestAnimationFrame(updateCounters);
}

// Start animation loop
requestAnimationFrame(updateCounters);

// Script for the impact slider calculation
const slider = document.getElementById('impact-slider');
const valWaste = document.getElementById('val-waste');
const valCo2 = document.getElementById('val-co2');
const valEnergy = document.getElementById('val-energy');
const valWater = document.getElementById('val-water');

if (slider && valWaste && valCo2 && valEnergy && valWater) {
  slider.addEventListener('input', (event) => {
    const target = event.target;
    // @ts-ignore
    const kg = parseInt(target.value, 10);
    valWaste.textContent = kg.toString();
    
    // Using typical averages for mixed recycling (lifecycle assessment data)
    valCo2.textContent = (kg * 2.5).toFixed(1);
    valEnergy.textContent = (kg * 4.0).toFixed(1);
    valWater.textContent = (kg * 10.0).toFixed(1);
  });
}
