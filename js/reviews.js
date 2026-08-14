(() => {
  // Approved by Dr Gail for publication.
  const DATA = {
    books: [
      {
        quote: 'Mind Power 4 Teens Journal is a thoughtful and practical resource that encourages teenagers to understand themselves, build confidence and make positive decisions about their future.',
        label: 'Sipho Smith'
      },
      {
        quote: 'This journal created meaningful conversations between me and my child. The activities are engaging, relevant and easy for young people to understand.',
        label: 'Lerato Kagiso'
      },
      {
        quote: 'The journal helped me think more clearly about my goals, my strengths and the person I want to become. It made personal growth feel simple and achievable.',
        label: 'Mandla Davies'
      },
      {
        quote: 'Dr Gail has created more than a journal. It is a practical guide that helps young people reflect, grow and develop a stronger mindset.',
        label: 'Taylor Wilson'
      },
      {
        quote: 'The questions and exercises helped me understand myself better and become more confident about my future. I would recommend it to other teenagers.',
        label: 'Zinhle Cooper'
      }
    ],
    coaching: [
      {
        quote: 'Before GGM Coaching I was confused by what my life’s purpose is and I thought being in my profession was a mistake. Also, I had no savings. However, after joining GGM Coaching, I learnt about affirmations and within a month, I attracted an appointment that made me an additional R35 000, I started a small business and closed 3 clothing accounts.',
        label: 'Prudence — Exclusive Group Mentorship Programme'
      },
      {
        quote: 'Mind Power 4 Teens has taught me about the power of my thoughts, words and actions and I now take them very serious.',
        label: 'Zandi — Mind Power 4 Teens Academy'
      },
      {
        quote: 'Reflecting on my past self, compared to now, I notice growth in managing money, progress at work, and personal development. GGM Coaching has truly shaped me as an individual, and I recognize there’s more to learn and celebrate.',
        label: 'Onalenna — Exclusive Group Mentorship Programme'
      },
      {
        quote: 'I can clearly see the impact that Mind Power has had on my life. I have grown so much, become more positive and I am grateful.',
        label: 'Lulu — Mind Power 4 Teens Academy'
      },
      {
        quote: 'Since joining the GGM Coaching Exclusive Mentorship Group Programme I have become more confident in myself and in what I bring to the table. I acknowledge myself more because I can actually see the results and I am more intentional about getting and doing better. I honestly just wanted a mental shift and I’m proud to say that I’m well on my way there.',
        label: 'Bonolo — Exclusive Group Mentorship Programme'
      },
      {
        quote: 'Mind Power 4 Teens programme by Dr Gail has helped me a lot and I would recommend it to teenagers so they can grow their inner child and their subconscious mind.',
        label: 'Lesedi — Mind Power 4 Teens Academy'
      },
      {
        quote: 'What Dr Gail teaches works. I had stopped doing my affirmations and I was stressed. I needed a financial breakthrough for my daughter to go to school abroad. So, I started affirming and doing the inner work and in less than a week, the amount I needed was available. I am so grateful.',
        label: 'Makopoi — Exclusive Group Mentorship Programme'
      },
      {
        quote: 'The Speakerpreneur Programme has liberated many areas of my life. I have become a more confident and articulate speaker in my professional and personal relationships, and I look forward to using my voice to generate additional income.',
        label: 'Angie — Speakerpreneur Programme'
      }
    ]
  };

  document.querySelectorAll('[data-reviews-slider]').forEach(slider => {
    const REVIEWS = DATA[slider.dataset.reviewsSet || 'books'];
    if (!REVIEWS) return;

    const track = slider.querySelector('[data-reviews-track]');
    const prevBtn = slider.querySelector('[data-reviews-prev]');
    const nextBtn = slider.querySelector('[data-reviews-next]');
    const dotsWrap = slider.parentElement?.querySelector('[data-reviews-dots]');
    if (!track || !dotsWrap) return;

    track.innerHTML = REVIEWS.map(r => `
      <article class="review-card" role="group" aria-label="Review">
        <div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <p>${r.quote}</p>
        <cite>${r.label}</cite>
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
  });
})();
