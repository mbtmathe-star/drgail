(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle?.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.mobile-panel a').forEach(a => a.addEventListener('click', () => body.classList.remove('menu-open')));
  window.addEventListener('scroll', () => {
    if (!header || header.classList.contains('inner')) return;
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  // Progressive enhancement only: the site remains fully visible if this fails.
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.06, rootMargin: '0px 0px 80px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    // Make above-the-fold content visible immediately.
    requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.1) el.classList.add('visible');
    }));
  }

  document.querySelectorAll('form[data-mailto]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent(data.get('subject') || form.dataset.subject || 'Website enquiry');
      const lines = [];
      for (const [key,val] of data.entries()) if (key !== 'subject') lines.push(`${key}: ${val}`);
      const success = form.querySelector('.success-message');
      if (success) success.classList.add('show');
      window.location.href = `mailto:${form.dataset.mailto}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`;
    });
  });
})();

// "Book Dr Gail" hero button: toggle a small dropdown instead of navigating.
(() => {
  document.querySelectorAll('[data-book-toggle]').forEach(btn => {
    const menu = btn.parentElement.querySelector('[data-book-menu]');
    if (!menu) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const wasHidden = menu.hidden;
      document.querySelectorAll('[data-book-menu]').forEach(m => { m.hidden = true; });
      menu.hidden = !wasHidden;
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('[data-book-menu]').forEach(m => { m.hidden = true; });
  });
})();

// Preselect the enquiry type when a service or programme link sends a visitor to the contact page.
(() => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const select = document.getElementById('enquiry-type');
  if (type && select && [...select.options].some(option => option.value === type)) select.value = type;

  if (params.get('submitted') === '1') {
    const banner = document.createElement('div');
    banner.className = 'submission-banner';
    banner.setAttribute('role', 'status');
    banner.textContent = params.get('status') === 'failed'
      ? 'Your form was received by the website, but the hosting mail service still needs to be configured.'
      : 'Thank you. Your enquiry has been submitted to GGM Coaching.';
    document.body.appendChild(banner);
    window.setTimeout(() => banner.remove(), 7000);
  }
})();


// Open enquiries immediately in a modal instead of sending visitors to a separate page.
(() => {
  const typeOptions = [
    ['general', 'General enquiry'],
    ['coaching', 'GGM Coaching programme'],
    ['one-on-one', 'Premium one-on-one coaching'],
    ['group-mentorship', 'Exclusive group mentorship programme'],
    ['teens-academy', 'Mind Power 4 Teens Academy'],
    ['teens-camp', 'Mind Power 4 Teens Camp'],
    ['speakerpreneur', 'Speakerpreneur Academy'],
    ['workshop', 'Training or workshop'],
    ['speaking', 'Speaking engagement'],
    ['bulk', 'Bulk book order'],
    ['bulk-rewire', 'Bulk order: Rewire Your Mind in 21 Days'],
    ['bulk-teens', 'School or bulk order: Mind Power 4 Teens Journal'],
    ['blitz-session', 'Blitz Session enquiry']
  ];
  const labels = Object.fromEntries(typeOptions);
  const aliases = { teens: 'teens-academy' };
  let previousFocus = null;

  const currentRedirect = () => {
    const file = (window.location.pathname.split('/').pop() || 'index.html').replace(/[^a-zA-Z0-9._-]/g, '');
    const allowed = new Set(['index.html','about.html','coaching.html','books.html','speaking.html','contact.html','cart.html','checkout.html']);
    return `${allowed.has(file) ? file : 'index.html'}?submitted=1`;
  };

  const modalMarkup = `
    <div class="enquiry-modal" id="enquiry-modal" aria-hidden="true">
      <div class="enquiry-modal-backdrop" data-enquiry-close></div>
      <div class="enquiry-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-modal-title">
        <button class="enquiry-modal-close" type="button" aria-label="Close enquiry form" data-enquiry-close>&times;</button>
        <div class="enquiry-modal-intro">
          <div>
            <div class="eyebrow light">Connect with GGM Coaching</div>
            <h2 id="enquiry-modal-title">Your journey starts <em>today.</em></h2>
            <p>Share what you need and GGM Coaching will respond regarding coaching, speaking, training, workshops or book orders.</p>
          </div>
          <div class="enquiry-modal-details">
            <strong>Direct contact</strong>
            <a href="mailto:info@drgail.co.za">info@drgail.co.za</a>
            <a href="tel:+27629499166">062 949 9166</a>
          </div>
        </div>
        <form action="/api/submit" class="enquiry-modal-form" method="post">
          <input aria-hidden="true" autocomplete="off" class="honeypot" name="website" tabindex="-1" type="text">
          <input name="redirect" type="hidden" value="${currentRedirect()}">
          <input name="form_type" type="hidden" value="GGM Coaching website enquiry">
          <div class="form-row">
            <div class="field"><label for="modal-full-name">Full name</label><input id="modal-full-name" name="Full name" required></div>
            <div class="field"><label for="modal-email">Email</label><input id="modal-email" name="Email" type="email" required></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="modal-phone">Phone</label><input id="modal-phone" name="Phone"></div>
            <div class="field"><label for="modal-enquiry-type">Enquiry type</label><select id="modal-enquiry-type" name="Enquiry type">${typeOptions.map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label for="modal-organisation">Organisation, school or company</label><input id="modal-organisation" name="Organisation"></div>
          <div class="field"><label for="modal-message">Tell us what you need</label><textarea id="modal-message" name="Message" required></textarea></div>
          <button class="btn btn-primary" type="submit">Submit Enquiry</button>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalMarkup);
  const modal = document.getElementById('enquiry-modal');
  const select = document.getElementById('modal-enquiry-type');
  const formType = modal.querySelector('input[name="form_type"]');
  const firstInput = document.getElementById('modal-full-name');

  function resolveType(href) {
    try {
      const url = new URL(href, window.location.href);
      const raw = url.searchParams.get('type') || 'general';
      const type = aliases[raw] || raw;
      return labels[type] ? type : 'general';
    } catch (_) { return 'general'; }
  }

  function openModal(type = 'general') {
    const resolved = aliases[type] || type;
    const value = labels[resolved] ? resolved : 'general';
    previousFocus = document.activeElement;
    select.value = value;
    formType.value = `GGM Coaching enquiry — ${labels[value]}`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('enquiry-modal-open');
    window.setTimeout(() => firstInput.focus(), 40);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('enquiry-modal-open');
    previousFocus?.focus?.();
  }

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (!/^contact\.html(?:\?|#|$)/i.test(href)) return;
    event.preventDefault();
    openModal(resolveType(href));
    document.body.classList.remove('menu-open');
  }, true);

  modal.addEventListener('click', event => {
    if (event.target.closest('[data-enquiry-close]')) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
  select.addEventListener('change', () => {
    formType.value = `GGM Coaching enquiry — ${labels[select.value] || 'General enquiry'}`;
  });

  window.openGGMEnquiry = openModal;
})();
