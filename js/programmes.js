(() => {
  const data = {
    'one-on-one': {
      tag: 'Premium Coaching Experience',
      title: 'Premium One-on-One Coaching',
      description: 'Our most personalised coaching experience, tailored for entrepreneurs, professionals, academics and aspiring leaders who are ready to achieve their next level of success. Through confidential one-on-one coaching with Dr Gail, you’ll gain clarity, overcome limiting beliefs, strengthen your leadership and develop a practical action plan aligned with your personal and professional goals.',
      ideal: 'Entrepreneurs, executives, professionals, academics and individuals seeking focused personal growth.',
      image: 'assets/dr-gail-blue-shirt.jpeg',
      alt: 'Dr Gail Motlhaudi-Banda',
      href: 'contact.html?type=one-on-one'
    },
    'group-mentorship': {
      tag: 'Community, Coaching and Accountability',
      title: 'Exclusive Group Mentorship Programme',
      description: 'This exclusive mentorship programme provides a supportive community where members receive monthly coaching, practical business and mindset training, accountability and shared learning experiences. Together, members explore entrepreneurship, leadership, purpose, confidence, resilience and sustainable success while building meaningful connections with fellow growth-minded individuals.',
      ideal: 'Entrepreneurs, professionals and emerging leaders who value learning within a community.',
      image: 'assets/dr-gail-colourful.jpeg',
      alt: 'Dr Gail Motlhaudi-Banda',
      href: 'contact.html?type=group-mentorship'
    },
    teens: {
      tag: 'Youth Leadership Camp',
      title: 'Mind Power 4 Teens Camp',
      description: '<p class="big-intro">Igniting Purpose. Building Confidence. Shaping Future Leaders.</p><img src="assets/teens-academy-1.jpeg" alt="Teenagers participating in the Mind Power 4 Teens Camp"/><p>The Mind Power 4 Teens Camp is a transformational personal development experience designed to equip teenagers with the mindset, confidence and life skills they need to thrive in an ever-changing world. Inspired by the principles in Dr Gail’s book Mind Power 4 Teens Journal, the camp empowers teenagers to develop emotional resilience, self-belief, leadership, effective communication, financial literacy and an entrepreneurial mindset. Participants leave with practical tools to overcome challenges, set meaningful goals and confidently pursue lives of purpose and impact.</p><p>Since its launch, the Mind Power 4 Teens Camp has inspired young people to believe in themselves, embrace their unique potential and take ownership of their future. Participants have reported increased confidence, improved self-esteem, stronger leadership qualities and a renewed sense of purpose after attending the programme.</p><p>Parents and educators have also recognised positive changes in participants’ attitudes, motivation, communication and willingness to pursue personal and academic goals. The camp continues to make a meaningful contribution to developing confident, resilient and purpose-driven young leaders.</p>',
      ideal: 'Teenagers, parents, schools, NGOs and organisations investing in youth leadership.',
      image: 'assets/teens-academy-2.jpeg',
      alt: 'Teenagers at the Mind Power 4 Teens Camp',
      href: 'contact.html?type=teens-camp'
    },
    speakerpreneur: {
      tag: 'Self-Paced Online Programme',
      title: 'Speakerpreneur Academy',
      description: 'Speakerpreneur Academy equips aspiring and established speakers with the knowledge and confidence to build a profitable speaking brand. Learn how to craft compelling presentations, position yourself as an authority, attract speaking opportunities and create multiple income streams from your expertise.',
      ideal: 'Coaches, consultants, entrepreneurs, professionals, academics and aspiring keynote speakers.',
      image: 'assets/dr-gail-speaking-2.jpeg',
      alt: 'Dr Gail speaking on stage',
      href: 'contact.html?type=speakerpreneur'
    },
    blitz: {
      tag: 'Focused 1-on-1 Consultation',
      title: 'Blitz Session',
      description: 'A fast, focused one-on-one consultation for when you need clarity or a practical action plan without committing to a full coaching programme. Bring your biggest challenge or decision and leave with concrete next steps.',
      ideal: 'Anyone who needs focused guidance on a specific challenge, decision or goal — fast.',
      price: 'R400 per hour',
      image: 'assets/dr-gail-panel.jpeg',
      alt: 'Dr Gail Motlhaudi-Banda',
      href: 'contact.html?type=blitz-session'
    }
  };

  const tabs = [...document.querySelectorAll('.programme-tab')];
  if (!tabs.length) return;
  const image = document.getElementById('programme-image');
  const tag = document.getElementById('programme-tag');
  const title = document.getElementById('programme-title');
  const description = document.getElementById('programme-description');
  const ideal = document.getElementById('programme-ideal');
  const link = document.getElementById('programme-link');
  const price = document.getElementById('programme-price');
  const actions = document.getElementById('programme-actions');

  function select(key, updateHash = false) {
    const item = data[key] || data['one-on-one'];
    tabs.forEach(tab => {
      const active = tab.dataset.programme === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    image.style.opacity = '0';
    window.setTimeout(() => {
      image.src = item.image;
      image.alt = item.alt;
      image.style.opacity = '1';
    }, 120);
    tag.textContent = item.tag;
    title.textContent = item.title;
    if (price) { price.textContent = item.price || ''; price.style.display = item.price ? '' : 'none'; }
    description.innerHTML = item.description;
    ideal.innerHTML = `<strong>Ideal for:</strong> ${item.ideal}`;
    link.href = item.href;
    if (actions) {
      const isBlitz = key === 'blitz';
      actions.style.display = isBlitz ? '' : 'none';
      link.style.display = isBlitz ? 'none' : '';
    }
    if (updateHash) history.replaceState(null, '', key === 'teens' ? '#teens' : `#${key}`);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.programme, true)));
  const requested = location.hash.replace('#', '');
  select(data[requested] ? requested : 'one-on-one');
})();
