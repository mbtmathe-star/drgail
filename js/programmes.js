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
      tag: 'Self-Paced Online Programme',
      title: 'Mind Power 4 Teens Academy',
      description: 'Built on the principles of Dr Gail’s book Mind Power 4 Teens Journal, this online programme empowers young people to develop confidence, resilience, emotional intelligence and a success-oriented mindset. Through engaging lessons and practical activities, teenagers learn how to manage challenges, make positive decisions and unlock their full potential.',
      ideal: 'Teenagers, parents, schools and youth development organisations.',
      image: 'assets/teens-academy-1.jpeg',
      alt: 'Teenagers at a Mind Power 4 Teens Academy event',
      href: 'contact.html?type=teens-academy'
    },
    speakerpreneur: {
      tag: 'Self-Paced Online Programme',
      title: 'Speakerpreneur Academy',
      description: 'Speakerpreneur Academy equips aspiring and established speakers with the knowledge and confidence to build a profitable speaking brand. Learn how to craft compelling presentations, position yourself as an authority, attract speaking opportunities and create multiple income streams from your expertise.',
      ideal: 'Coaches, consultants, entrepreneurs, professionals, academics and aspiring keynote speakers.',
      image: 'assets/dr-gail-speaking-2.jpeg',
      alt: 'Dr Gail speaking on stage',
      href: 'contact.html?type=speakerpreneur'
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
    description.textContent = item.description;
    ideal.innerHTML = `<strong>Ideal for:</strong> ${item.ideal}`;
    link.href = item.href;
    if (updateHash) history.replaceState(null, '', key === 'teens' ? '#teens' : `#${key}`);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.programme, true)));
  const requested = location.hash.replace('#', '');
  select(data[requested] ? requested : 'one-on-one');
})();
