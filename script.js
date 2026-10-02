// ---- Theme toggle ----
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  let saved = null;
  try { saved = localStorage.getItem('kf-theme'); } catch(e){}
  if(saved) root.setAttribute('data-theme', saved);
  btn.addEventListener('click', function(){
    const current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('kf-theme', next); } catch(e){}
  });
})();

// ---- Scroll reveal ----
(function(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  if(!('IntersectionObserver' in window)){
    items.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function(el){ io.observe(el); });
})();

// ---- Menu tabs ----
(function(){
  const tabs = document.querySelectorAll('.menu-tab');
  if(!tabs.length) return;
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      document.querySelectorAll('.menu-tab').forEach(function(t){ t.classList.remove('active'); });
      document.querySelectorAll('.menu-panel').forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });
})();

// ---- Booking form ----
(function(){
  const form = document.getElementById('bookingForm');
  if(!form) return;
  const msg = document.getElementById('formMsg');
  const chips = document.querySelectorAll('#timeChips .chip');
  const dateInput = document.getElementById('bDate');
  const confirmBox = document.getElementById('confirmBox');
  let selectedTime = null;

  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);

  function loadBookings(){
    try {
      const raw = localStorage.getItem('kf-bookings');
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }
  function saveBooking(b){
    try {
      const all = loadBookings();
      all.push(b);
      localStorage.setItem('kf-bookings', JSON.stringify(all));
    } catch(e){}
  }

  function refreshChipAvailability(){
    const date = dateInput.value;
    const bookings = loadBookings();
    chips.forEach(function(chip){
      const time = chip.dataset.time;
      const taken = bookings.some(function(b){ return b.date === date && b.time === time; });
      chip.disabled = !!taken;
      if(taken && chip.classList.contains('active')){
        chip.classList.remove('active');
        selectedTime = null;
      }
    });
  }
  dateInput.addEventListener('change', refreshChipAvailability);

  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      if(chip.disabled) return;
      chips.forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      selectedTime = chip.dataset.time;
    });
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'form-msg';

    const name = document.getElementById('bName').value.trim();
    const phone = document.getElementById('bPhone').value.trim();
    const date = dateInput.value;
    const guests = document.getElementById('bGuests').value;
    const notes = document.getElementById('bNotes').value.trim();

    if(!name || !phone || !date || !guests || !selectedTime){
      msg.textContent = 'Please fill every field and pick a time slot.';
      msg.classList.add('error');
      return;
    }

    const booking = { name: name, phone: phone, date: date, time: selectedTime, guests: guests, notes: notes };
    saveBooking(booking);

    document.getElementById('cName').textContent = name;
    document.getElementById('cDetails').textContent =
      date + ' at ' + selectedTime + ' \u00b7 ' + guests + ' guest' + (guests === '1' ? '' : 's');
    document.getElementById('cNotes').textContent = notes ? ('Note: ' + notes) : '';
    confirmBox.classList.add('show');

    form.reset();
    chips.forEach(function(c){ c.classList.remove('active'); });
    selectedTime = null;
    refreshChipAvailability();
    msg.textContent = 'Reservation saved.';
    msg.classList.add('ok');
  });
})();