// Kolkata One — enhanced front-end only
// Uses: Open-Meteo, OpenStreetMap Overpass, Leaflet. No keys required.

const KOLKATA = { lat: 22.5726, lon: 88.3639 };

// ---- ROUTER ----
function showPage(id) {
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'foodPage') generateFoodCards();
  if (id === 'tourPage') renderTourCards();
  if (id === 'mapPage') initMap();
  if (id === 'bookmarksPage') renderSaved();
}

window.addEventListener('load', () => {
  // Weather + initial page
  loadWeather();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (currentUser) showPage('homePage');
});

// ---- WEATHER (Open-Meteo) ----
async function loadWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${KOLKATA.lat}&longitude=${KOLKATA.lon}&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();
    const w = data.current_weather;
    const icon = w && w.temperature > 30 ? "fa-sun" : "fa-cloud-sun";
    document.getElementById('weatherWidget').innerHTML =
      `<i class="fa-solid ${icon} mr-1"></i>${Math.round(w.temperature)}°C • ${w.windspeed} km/h`;
  } catch (e) {
    document.getElementById('weatherWidget').textContent = "Weather unavailable";
  }
}

// ---- AUTH (local only) ----
function handleSignup(e){
  e.preventDefault();
  const user = Object.fromEntries(new FormData(e.target));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u=>u.email===user.email)) return showMessage('Error','Email already exists!');
  users.push(user); localStorage.setItem('users', JSON.stringify(users));
  showMessage('Success','Registration successful! Please login.');
  setTimeout(()=>showPage('loginPage'), 800);
}
function handleLogin(e){
  e.preventDefault();
  const login = Object.fromEntries(new FormData(e.target));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u=>u.email===login.email && u.password===login.password);
  if (!user) return showMessage('Error', 'Wrong email or password!');
  localStorage.setItem('currentUser', JSON.stringify(user));
  showMessage('Success','Login successful!');
  setTimeout(()=>showPage('homePage'), 600);
}

// ---- MODALS ----
function showMessage(title, html){
  document.getElementById('messageModalTitle').textContent = title;
  document.getElementById('messageModalBody').innerHTML = html;
  $('#messageModal').modal('show');
}
function showCommunityModal(){
  showMessage('Community', `
    <h5>Join Our Community</h5>
    <p>Share tips, plans & meetups with Kolkata travelers and locals.</p>
    <div class="text-center">
      <a class="btn btn-primary mr-2" target="_blank" rel="noopener" href="https://www.facebook.com/groups/"><i class="fab fa-facebook mr-1"></i> Facebook</a>
      <a class="btn btn-info mr-2" target="_blank" rel="noopener" href="https://t.me/"><i class="fab fa-telegram mr-1"></i> Telegram</a>
      <a class="btn btn-success" target="_blank" rel="noopener" href="https://wa.me/"><i class="fab fa-whatsapp mr-1"></i> WhatsApp</a>
    </div>
  `);
}
function showContactModal(){
  showMessage('Contact', `
    <p><i class="fas fa-phone mr-2"></i> +91 98765 43210</p>
    <p><i class="fas fa-envelope mr-2"></i> hello@kolkata.one</p>
    <p><i class="fas fa-map-marker-alt mr-2"></i> Park Street, Kolkata 700016</p>
  `);
}
function showBookGuideModal() {
  const minDate = new Date().toISOString().split('T')[0];
  showMessage('Book Tour Guide', `
    <form onsubmit="handleGuideBooking(event)">
      <div class="form-group"><label>Date</label><input type="date" min="${minDate}" class="form-control" required></div>
      <div class="form-group"><label>People</label><input type="number" class="form-control" min="1" max="20" required></div>
      <div class="form-group"><label>Language</label>
        <select class="form-control" required>
          <option value="">Select</option><option>English</option><option>Bengali</option><option>Hindi</option>
        </select>
      </div>
      <div class="form-group"><label>Tour type</label>
        <select class="form-control" required>
          <option value="">Select</option><option>Heritage Walk</option><option>Food Trail</option><option>Cultural</option><option>Custom</option>
        </select>
      </div>
      <button class="btn btn-success btn-block">Request Booking</button>
    </form>
  `);
}
function handleGuideBooking(e){
  e.preventDefault();
  $('#messageModal').modal('hide');
  setTimeout(()=> showMessage('Success','Guide request submitted! We will contact you soon.'), 400);
}

// ---- SEARCH ----
function globalSearch(e){
  const term = e.target.value.toLowerCase();
  if (term.includes('food') || term.includes('cafe') || term.includes('restaurant')) showPage('foodPage');
  else if (term.includes('hotel') || term.includes('stay')) showPage('hotelPage');
  else if (term.includes('metro') || term.includes('bus') || term.includes('tram') || term.includes('taxi')) showPage('transportPage');
  else if (term.trim().length>0) showPage('tourPage');
}
function filterCards(containerId, term){
  term = (term||'').toLowerCase();
  document.querySelectorAll(`#${containerId} .card`).forEach(c=>{
    const txt = c.innerText.toLowerCase();
    c.style.display = txt.includes(term) ? '' : 'none';
  });
}
function openExternal(url){ window.open(url, '_blank'); }

// ---- TOUR SPOTS ----
const TOUR_SPOTS = [
  { name: "Victoria Memorial", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Victoria_Memorial_Kolkata_12.jpg/1280px-Victoria_Memorial_Kolkata_12.jpg", desc:"Marble icon dedicated to Queen Victoria (1906–1921).", q:"Victoria Memorial Kolkata" },
  { name: "Howrah Bridge", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Howrah_bridge_calcutta.jpg/1280px-Howrah_bridge_calcutta.jpg", desc:"Cantilever bridge linking Howrah & Kolkata over Hooghly.", q:"Howrah Bridge" },
  { name: "Dakshineswar Kali Temple", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Dakshineswar_Kali_Temple_from_River_Hooghly.jpg/1280px-Dakshineswar_Kali_Temple_from_River_Hooghly.jpg", desc:"Famed 19th-century temple on the riverbank.", q:"Dakshineswar Kali Temple" },
  { name: "Belur Math", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Belur_Math%2C_Belur%2C_Howrah%2C_West_Bengal.jpg/1280px-Belur_Math%2C_Belur%2C_Howrah%2C_West_Bengal.jpg", desc:"Headquarters of Ramakrishna Mission with serene campus.", q:"Belur Math" },
  { name: "Prinsep Ghat", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Prinsep_Ghat_Kolkata_1.jpg/1280px-Prinsep_Ghat_Kolkata_1.jpg", desc:"Riverside promenade with views & evening vibe.", q:"Prinsep Ghat" },
  { name: "Indian Museum", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Indian_Museum_Kolkata_2.jpg/1280px-Indian_Museum_Kolkata_2.jpg", desc:"Oldest museum in India—art, archaeology & fossils.", q:"Indian Museum Kolkata" },
  { name: "Science City", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Science_City_Kolkata.jpg/1280px-Science_City_Kolkata.jpg", desc:"Interactive science center & digitarium.", q:"Science City Kolkata" },
  { name: "Eco Park", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Eco_Park_Gate_1%2C_New_Town%2C_Kolkata.jpg/1280px-Eco_Park_Gate_1%2C_New_Town%2C_Kolkata.jpg", desc:"Large urban park with themed gardens & boating.", q:"Eco Park Kolkata" },
  { name: "Kumartuli", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Kumartuli%2C_Kolkata.jpg/1280px-Kumartuli%2C_Kolkata.jpg", desc:"Artisans' quarter—Durga idols being made.", q:"Kumartuli" },
  { name: "South Park Street Cemetery", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/South_Park_Street_Cemetery_2018.jpg/1280px-South_Park_Street_Cemetery_2018.jpg", desc:"18th-century cemetery with Gothic tombs.", q:"South Park Street Cemetery" },
  { name: "Marble Palace", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Marble_Palace_Kolkata.JPG/1280px-Marble_Palace_Kolkata.JPG", desc:"1830s mansion with European art collection.", q:"Marble Palace Kolkata" },
  { name: "National Library", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/National_Library_Kolkata_2011-06-24_8320.JPG/1280px-National_Library_Kolkata_2011-06-24_8320.JPG", desc:"India's largest library (public since 1953).", q:"National Library Kolkata" },
];
function renderTourCards(){
  const wrap = document.getElementById('tourCards');
  wrap.innerHTML='';
  TOUR_SPOTS.forEach(spot=>{
    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card position-relative">
          <button class="save" onclick="toggleSave(event,'${spot.name}','tour','${spot.img}','${spot.desc}')"><i class="fa-regular fa-heart"></i></button>
          <img class="card-img-top" src="${spot.img}" alt="${spot.name}">
          <div class="card-body">
            <h5 class="card-title">${spot.name}</h5>
            <p class="card-text">${spot.desc}</p>
            <div class="d-flex">
              <a class="btn btn-primary mr-2" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.q)}"><i class="fa-solid fa-map-location-dot"></i> Location</a>
              <button class="btn btn-outline-light" onclick="addToPlan('${spot.name}')"><i class="fa-solid fa-plus"></i> Add</button>
            </div>
          </div>
        </div>
      </div>
    `);
  });
}

// ---- FOOD (curated + Overpass) ----
const CURATED_FOOD = [
  { name:"Peter Cat", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Peter_Cat_restaurant%2C_Park_Street%2C_Kolkata.jpg/1280px-Peter_Cat_restaurant%2C_Park_Street%2C_Kolkata.jpg", desc:"Legendary Chelo Kebab & continental since 1975." },
  { name:"Flurys", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Flurys%2C_Park_Street%2C_Kolkata.jpg/1280px-Flurys%2C_Park_Street%2C_Kolkata.jpg", desc:"Iconic tearoom for breakfast & pastries." },
  { name:"Bhojohori Manna", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Bhojohori_Manna%2C_Kolkata.jpg/1280px-Bhojohori_Manna%2C_Kolkata.jpg", desc:"Homestyle Bengali classics—fish curry, kosha mangsho." },
  { name:"Arsalan", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Arsalan%2C_Park_Circus%2C_Kolkata.jpg/1280px-Arsalan%2C_Park_Circus%2C_Kolkata.jpg", desc:"Kolkata biryani favourite." },
  { name:"Indian Coffee House", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Coffee_House_College_Street.jpg/1280px-Coffee_House_College_Street.jpg", desc:"Historic adda spot on College Street." },
  { name:"Balaram Mullick & Radharaman Mullick", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Mithai_Shop_in_Kolkata.jpg/1280px-Mithai_Shop_in_Kolkata.jpg", desc:"Century-old sweets—sandesh & rosogolla." },
  { name:"6 Ballygunge Place", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Six_Ballygunge_Place%2C_Kolkata.jpg/1280px-Six_Ballygunge_Place%2C_Kolkata.jpg", desc:"Elegant Bengali spread in a bungalow." },
  { name:"Nizam's", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Kathi_roll.jpg/1280px-Kathi_roll.jpg", desc:"Birthplace of Kolkata Kathi rolls." },
  { name:"Mocambo", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Prawn_a_la_russe.jpg/1280px-Prawn_a_la_russe.jpg", desc:"Retro continental icon on Park Street." },
  { name:"Mitra Café", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Fish_Kobiraji.jpg/1280px-Fish_Kobiraji.jpg", desc:"Famous for fish kobiraji." },
  { name:"Paramount Sherbat", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Paramount_College_Street.jpg/1280px-Paramount_College_Street.jpg", desc:"Heritage sherbet house since 1918." },
  { name:"Golbari", img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kosha_Mangsho.jpg/1280px-Kosha_Mangsho.jpg", desc:"Spicy kosha mangsho at Shyambazar." }
];

async function generateFoodCards(){
  const wrap = document.getElementById('foodCards');
  wrap.innerHTML = '';
  CURATED_FOOD.forEach(item => insertFoodCard(item.name, item.img, item.desc));

  // Live nearby food via Overpass
  document.getElementById('foodLoading').style.display = 'block';
  const pos = await getPositionSafe();
  const around = pos || KOLKATA;
  const q = `[out:json][timeout:25];
    (
      node(around:3500,${around.lat},${around.lon})["amenity"~"restaurant|cafe|fast_food|ice_cream|food_court"];
      way(around:3500,${around.lat},${around.lon})["amenity"~"restaurant|cafe|fast_food|ice_cream|food_court"];
    ); out center 30;`;
  try{
    const data = await overpass(q);
    const picks = (data.elements||[]).slice(0,12);
    picks.forEach(el => {
      const name = (el.tags && el.tags.name) || "Unnamed place";
      const cuisine = el.tags && el.tags.cuisine ? ` • ${el.tags.cuisine}` : "";
      const photo = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=60";
      insertFoodCard(name, photo, `OpenStreetMap result${cuisine}`);
    });
  }catch(e){
    // ignore error
  }finally{
    document.getElementById('foodLoading').style.display = 'none';
  }
}
function insertFoodCard(name, img, desc){
  const wrap = document.getElementById('foodCards');
  wrap.insertAdjacentHTML('beforeend', `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card position-relative">
        <button class="save" onclick="toggleSave(event,'${name}','food','${img}','${desc}')"><i class="fa-regular fa-heart"></i></button>
        <img class="card-img-top" src="${img}" alt="${name}">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">${desc}</p>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' Kolkata')}">
            <i class="fa-solid fa-map-marker-alt mr-1"></i> Location
          </a>
        </div>
      </div>
    </div>
  `);
}

// ---- MAP (Leaflet) ----
let map, markers;
function initMap(){
  const container = document.getElementById('map');
  if (!map) {
    map = L.map('map').setView([KOLKATA.lat, KOLKATA.lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    markers = L.layerGroup().addTo(map);
  }
  markers.clearLayers();
  TOUR_SPOTS.forEach(s=>{
    const m = L.marker([KOLKATA.lat, KOLKATA.lon]); // center placeholder
    const popup = `<strong>${s.name}</strong><br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name+' Kolkata')}">Open in Google Maps</a>`;
    m.bindPopup(popup).addTo(markers);
  });
}

// ---- OVERPASS HELPERS ----
async function overpass(query){
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: query, headers: {'Content-Type':'text/plain'}
  });
  return res.json();
}
function getPositionSafe(){
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  });
}

// ---- TRANSPORT ----
function showTransportTips(){
  showMessage('Hailing a yellow taxi', `
    <ul>
      <li>Wave at an empty taxi (roof light on). Tell the destination before boarding.</li>
      <li>Use meter fares; carry small change. Night surcharges may apply.</li>
      <li>For longer trips, compare with Uber/Ola pricing.</li>
    </ul>
  `);
}

async function findNearest(type){
  const pos = await getPositionSafe() || KOLKATA;
  let filter = '';
  if (type==='subway') filter = '["station"="subway"]';
  if (type==='tram') filter = '["railway"="tram_stop"]';
  if (type==='ferry') filter = '["amenity"="ferry_terminal"]';
  if (type==='bus') filter = '["highway"="bus_stop"]';

  const q = `[out:json][timeout:25];
    node(around:6000,${pos.lat},${pos.lon})${filter};
    out body 10;`;
  try{
    const data = await overpass(q);
    if (!data.elements || !data.elements.length) return showMessage('Oops','No nearby stops found.');
    const items = data.elements.map(n => {
      const d = haversine(pos.lat,pos.lon, n.lat, n.lon).toFixed(1);
      const name = (n.tags && (n.tags.name || n.tags.ref)) || 'Unnamed stop';
      return { name, d, lat:n.lat, lon:n.lon };
    }).sort((a,b)=>a.d-b.d).slice(0,5);

    const html = items.map(i => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${i.name} <span class="badge badge-primary badge-pill">${i.d} km</span>
        <a class="btn btn-sm btn-outline-primary ml-2" target="_blank" rel="noopener"
           href="https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lon}">Go</a>
      </li>`).join('');
    showMessage('Nearest '+type, `<ul class="list-group">${html}</ul>`);
  }catch(e){
    showMessage('Error', 'Could not fetch data right now.');
  }
}

function haversine(lat1, lon1, lat2, lon2){
  const toRad = d=> d*Math.PI/180;
  const R = 6371;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ---- HOTELS (Overpass) ----
async function fetchHotels(){
  document.getElementById('hotelLoading').style.display = 'block';
  const wrap = document.getElementById('hotelCards');
  wrap.innerHTML='';
  const pos = await getPositionSafe() || KOLKATA;
  const q = `[out:json][timeout:25];
    (
      node(around:6000,${pos.lat},${pos.lon})["tourism"="hotel"];
      way(around:6000,${pos.lat},${pos.lon})["tourism"="hotel"];
    ); out center 24;`;
  try{
    const data = await overpass(q);
    (data.elements||[]).slice(0,18).forEach(el=>{
      const name = (el.tags && el.tags.name) || 'Unnamed Hotel';
      const lat = el.lat || (el.center && el.center.lat), lon = el.lon || (el.center && el.center.lon);
      const d = haversine(pos.lat,pos.lon,lat,lon).toFixed(1);
      const img = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=60";
      wrap.insertAdjacentHTML('beforeend', `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card position-relative">
            <button class="save" onclick="toggleSave(event,'${name}','hotel','${img}','Approx. ${d} km away')"><i class="fa-regular fa-heart"></i></button>
            <img class="card-img-top" src="${img}" alt="${name}">
            <div class="card-body">
              <h5 class="card-title">${name}</h5>
              <p class="card-text muted">Approx. ${d} km away</p>
              <a class="btn btn-primary" target="_blank" rel="noopener"
                 href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' Kolkata')}">Open in Maps</a>
            </div>
          </div>
        </div>
      `);
    });
  }catch(e){
    showMessage('Error', 'Unable to load hotels right now.');
  }finally{
    document.getElementById('hotelLoading').style.display = 'none';
  }
}

// ---- SAVED / ITINERARY ----
function toggleSave(ev, name, type, img, note){
  ev.stopPropagation();
  const icon = ev.currentTarget.querySelector('i');
  icon.classList.toggle('fa-regular');
  icon.classList.toggle('fa-solid');
  const saved = JSON.parse(localStorage.getItem('saved')||'[]');
  const id = name+'|'+type;
  const exists = saved.find(s=>s.id===id);
  if (exists) {
    const next = saved.filter(s=>s.id!==id);
    localStorage.setItem('saved', JSON.stringify(next));
  } else {
    saved.push({ id, name, type, img, note });
    localStorage.setItem('saved', JSON.stringify(saved));
  }
}
function renderSaved(){
  const wrap = document.getElementById('savedCards');
  const empty = document.getElementById('savedEmpty');
  const saved = JSON.parse(localStorage.getItem('saved')||'[]');
  wrap.innerHTML='';
  empty.style.display = saved.length ? 'none':'block';
  saved.forEach(s=>{
    wrap.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card">
          <img class="card-img-top" src="${s.img}" alt="${s.name}">
          <div class="card-body">
            <span class="badge badge-gradient mb-2 text-uppercase">${s.type}</span>
            <h5 class="card-title">${s.name}</h5>
            <p class="card-text muted">${s.note||''}</p>
            <a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name+' Kolkata')}">Open in Maps</a>
          </div>
        </div>
      </div>
    `);
  });
}
function addToPlan(name){
  const saved = JSON.parse(localStorage.getItem('saved')||'[]');
  if (!saved.find(s=>s.id===name+'|tour')) {
    saved.push({ id:name+'|tour', name, type:'tour', img:'', note:'Planned visit' });
    localStorage.setItem('saved', JSON.stringify(saved));
  }
  showMessage('Saved', `${name} added to your itinerary.`);
}
function exportItinerary(){
  const saved = JSON.parse(localStorage.getItem('saved')||'[]');
  if (!saved.length) return showMessage('Info','Nothing to export yet.');
  const lines = saved.map(s=> `- [${s.type}] ${s.name}`);
  const txt = `Kolkata One — My Plan\n\n${lines.join('\n')}\n`;
  const blob = new Blob([txt], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'kolkata_plan.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ---- PWA: Service Worker registration ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .catch(err => console.log('SW registration failed', err));
  });
}
