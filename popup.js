const areaCodeMapPromise = fetch('data/area_codes.json').then(r => r.json());
const countryMapPromise = fetch('data/country_codes.json').then(r => r.json());

function getCurrentTime(tz) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: false
    }).format(new Date());
  } catch {
    return '';
  }
}

function parseInput(input) {
  const clean = input.replace(/[^\d\+]/g, '');
  const isIntl = clean.startsWith('+');
  const digits = isIntl ? clean.slice(1) : clean;
  return { digits, isIntl };
}

async function lookup(input) {
  const resultDiv = document.getElementById('result');
  if (!input.trim()) return resultDiv.textContent = '';

  const { digits, isIntl } = parseInput(input);
  const areaCodeMap = await areaCodeMapPromise;
  const countryMap = await countryMapPromise;

  if (isIntl) {
    for (let len = 4; len >= 1; len--) {
      const code = digits.slice(0, len);
      if (countryMap[code]) {
        const data = countryMap[code];
        const times = (data.tz || []).map(tz => `${data.label} — <strong>${getCurrentTime(tz)}</strong>`);
        resultDiv.innerHTML = `<strong>${data.country}</strong><br>${times.join('<br>')}`;
        return;
      }
    }
    resultDiv.textContent = 'Unknown country code';
  } else {
    const area = digits.slice(0, 3);
    const entry = areaCodeMap[area];
    if (entry) {
      const time = getCurrentTime(entry.tzid);
      resultDiv.innerHTML = `<strong>${entry.city}, ${entry.state} (${entry.abbr})</strong><br>${entry.label} — <strong>${time}</strong>`;
    } else {
      resultDiv.textContent = 'Unknown area code';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('phone').addEventListener('input', (e) => lookup(e.target.value));
});