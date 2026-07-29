(() => {
  const slider = document.querySelector('[data-reviews-slider]');
  if (!slider) return;

  // Draft placeholder content — replace each entry with verified reader
  // feedback as it becomes available. No invented names, businesses or
  // personal details; "label" is a generic role only.
  const REVIEWS = [
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'Mind Power 4 Teens Journal is a thoughtful and practical resource that encourages teenagers to understand themselves, build confidence and make positive decisions about their future.',
      label: 'Reader'
    },
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'This journal created meaningful conversations between me and my child. The activities are engaging, relevant and easy for young people to understand.',
      label: 'Parent'
    },
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'The journal helped me think more clearly about my goals, my strengths and the person I want to become. It made personal growth feel simple and achievable.',
      label: 'Teen Reader'
    },
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'Dr Gail has created more than a journal. It is a practical guide that helps young people reflect, grow and develop a stronger mindset.',
      label: 'Programme Participant'
    },
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'The questions and exercises helped me understand myself better and become more confident about my future. I would recommend it to other teenagers.',
      label: 'Teen Reader'
    },
    {
      book: 'Mind Power 4 Teens Journal',
      quote: 'A valuable resource for parents, educators and mentors who want to support teenagers in discovering their purpose and developing a positive mindset.',
      label: 'Educator'
    }
  ];

  const track = slider.querySelector('[data-reviews-track]');
  const prevBtn = slider.querySelector('[data-reviews-prev]');
  const nextBtn = slider.querySelector('[data-reviews-next]');
  const dotsWrap = document.querySelector('[data-reviews-dots]');
  if (!track || !dotsWrap) return;

  track.innerHTML = REVIEWS.map(r => `
    <article class="review-card" role="group" aria-label="Review">
      <div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
      <p>${r.quote}</p>
      <cite>${r.label} · ${r.book}</cite>
    </article>
  `).join('');

  dotsWrap.innerHTML = REVIEWS.map((_, i) =>
    `<button class="reviews-dot" type="button" data-index="${i}" aria-label="Go to review ${i + 1} of ${REVIEWS.length}"></button>`
  ).join('');
  const dots = [...dotsWrap.children];
  const cards = [...track.children];

  let index = 0;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    cards.forEach((c, i) => c.setAttribute('aria-hidden', String(i !== index)));
  }

  function go(i) {
    index = (i + REVIEWS.length) % REVIEWS.length;
    update();
  }

  prevBtn?.addEventListener('click', () => go(index - 1));
  nextBtn?.addEventListener('click', () => go(index + 1));
  dots.forEach(d => d.addEventListener('click', () => go(Number(d.dataset.index))));

  // Touch / swipe support
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (startX === null) return;
    const diff = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(diff) < 40) return;
    diff > 0 ? go(index - 1) : go(index + 1);
  });

  // Keyboard support when the slider has focus
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1);
    if (e.key === 'ArrowRight') go(index + 1);
  });

  update();
})();
