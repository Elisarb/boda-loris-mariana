const wedding = Date.parse(weddingConfig.date);
const countdown = document.querySelector('#countdown');
const units = countdown.dataset.units.split('|');

function updateCountdown() {
  const seconds = Math.max(0, Math.ceil((wedding - Date.now()) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  countdown.textContent = seconds
    ? values.map((value, index) => value + ' ' + units[index]).join(' · ')
    : countdown.dataset.ended;
}
updateCountdown();
setInterval(updateCountdown, 1000);

const params = new URLSearchParams(location.search);
const guest = (params.get('nombre') || '').trim();
const seats = params.get('plazas') || (weddingConfig.rsvpForms[1] ? '1' : '2');
const guestLabel = document.querySelector('#rsvp-guest');
const capacity = document.querySelector('#rsvp-capacity');
const rsvpLink = document.querySelector('#rsvp-link');
const formTemplate = weddingConfig.rsvpForms[seats];

if (guest) {
  guestLabel.textContent = guest;
  guestLabel.hidden = false;
  capacity.textContent = seats === "2" ? capacity.dataset.double : capacity.dataset.single;
}

if (formTemplate) {
  const formUrl = new URL(formTemplate);
  for (const [field, value] of formUrl.searchParams) {
    if (field.startsWith('entry.') && value === 'NOMBRE_PRUEBA') {
      if (guest) formUrl.searchParams.set(field, guest);
      else formUrl.searchParams.delete(field);
      break;
    }
  }
  rsvpLink.href = formUrl.href;
  rsvpLink.hidden = false;
  document.querySelector('#reply-status').hidden = true;
}

for (const link of document.querySelectorAll('.languages a, footer a')) {
  const destination = new URL(link.href);
  for (const key of ['nombre', 'plazas']) {
    if (params.has(key)) destination.searchParams.set(key, params.get(key));
  }
  link.href = destination.href;
}

// Set this to the filename of the audio clip supplied for the invitation.
const soundtrackFile = 'musica.mp3';
const soundtrack = document.querySelector('#soundtrack');
const musicToggle = document.querySelector('#music-toggle');

if (soundtrackFile) {
  soundtrack.src = soundtrackFile;
  musicToggle.hidden = false;
  soundtrack.addEventListener('play', () => musicToggle.setAttribute('aria-pressed', 'true'));
  soundtrack.addEventListener('pause', () => musicToggle.setAttribute('aria-pressed', 'false'));
  musicToggle.addEventListener('click', () => {
    if (soundtrack.paused) soundtrack.play().catch(() => {});
    else soundtrack.pause();
  });
  if (new URLSearchParams(location.search).get('musica') === '1') {
    soundtrack.play().catch(() => {});
  }
}





