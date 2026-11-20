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
  const action = musicToggle.querySelector('.music-action');
  function syncMusicButton() {
    musicToggle.setAttribute('aria-pressed', String(!soundtrack.paused));
    action.textContent = soundtrack.paused ? action.dataset.play : action.dataset.pause;
  }
  soundtrack.addEventListener('play', syncMusicButton);
  soundtrack.addEventListener('pause', syncMusicButton);
  soundtrack.addEventListener('ended', syncMusicButton);
  musicToggle.addEventListener('click', () => {
    if (soundtrack.paused) soundtrack.play().catch(() => {});
    else soundtrack.pause();
  });
  if (new URLSearchParams(location.search).get('musica') === '1') {
    soundtrack.play().catch(() => {});
  }
}






const intro = document.querySelector('.intro-cover');
if (intro) {
  const opening = intro.querySelector('.opening');
  const letter = document.querySelector('.letter');
  const destination = new URL(opening.href);
  for (const key of ['nombre', 'plazas']) {
    if (params.has(key)) destination.searchParams.set(key, params.get(key));
  }
  opening.href = destination.href;

  opening.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (document.body.classList.contains('opening-now')) return;

    soundtrack.play().catch(() => {});
    document.body.classList.add('opening-now');
    const reveal = () => {
      intro.hidden = true;
      letter.hidden = false;
      document.body.classList.remove('cover-page', 'opening-now');
      const heading = letter.querySelector('h1');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) reveal();
    else setTimeout(reveal, 720);
  });
}


// Keep one visible image throughout the pose cycle.
const lorenzo = document.querySelector('.dog-pose');
if (lorenzo) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const poses = ['lorenzo-1.png', 'lorenzo-2.png', 'lorenzo-3.png'].map(source => {
    const image = new Image();
    image.src = source;
    return image;
  });
  const durations = [3000, 2000, 2000];
  let pose = 0;
  let poseTimer;

  function showPose() {
    lorenzo.src = poses[pose].src;

    poseTimer = setTimeout(() => {
      pose = (pose + 1) % poses.length;
      showPose();
    }, durations[pose]);
  }

  function restartLorenzo() {
    clearTimeout(poseTimer);
    pose = 0;
    lorenzo.src = poses[0].src;

    if (!reducedMotion.matches) showPose();
  }

  Promise.all(poses.map(image => new Promise((resolve, reject) => {
    if (image.complete) {
      if (image.naturalWidth > 0) resolve();
      else reject(new Error('Image unavailable'));
      return;
    }
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', reject, { once: true });
  })))
    .then(() => {
      if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', restartLorenzo);
      else reducedMotion.addListener(restartLorenzo);
      restartLorenzo();
    })
    .catch(() => {
      // Keep the neutral pose if a variant could not be loaded.
    });
}


if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealing');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.panel').forEach(panel => revealObserver.observe(panel));
}
