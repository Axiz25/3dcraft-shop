const Store = {
  KEY: '3dcraft_products',
  async loadRemote() {
    try {
      const res = await fetch('data/products.json?v=' + Date.now());
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.save(remote);
          return remote;
        }
      }
    } catch(e) {
      console.log('Using local products cache');
    }
    return this.getAll();
  },
  getAll() {
    const d = localStorage.getItem(this.KEY);
    if (!d) return this.init();
    let prods = JSON.parse(d);
    // Assurer que les nouveaux produits de catégories sont présents
    const defaults = this.getDefaults();
    let modified = false;
    defaults.forEach(def => {
      if (!prods.some(p => p.id === def.id)) {
        prods.push(def);
        modified = true;
      }
    });
    if (modified) this.save(prods);
    return prods;
  },
  save(p) {
    localStorage.setItem(this.KEY, JSON.stringify(p));
  },
  add(p) {
    const l = this.getAll();
    p.id = Date.now().toString();
    l.unshift(p);
    this.save(l);
    return p;
  },
  update(id, u) {
    const l = this.getAll(), i = l.findIndex(p => p.id === id);
    if (i !== -1) {
      l[i] = { ...l[i], ...u };
      this.save(l);
      return l[i];
    }
    return null;
  },
  delete(id) {
    this.save(this.getAll().filter(p => p.id !== id));
  },
  byCat(c) {
    return this.getAll().filter(p => p.category === c);
  },
  getDefaults() {
    return [
      { id: '1', name: 'Dragon Bookend Set', category: 'home-decor', price: 45, description: 'Serre-livres dragons haute finition en PLA.', badge: 'popular', featured: true },
      { id: '2', name: 'Gaming Controller Stand', category: 'gaming', price: 28, description: 'Support universel manettes PS5, Xbox et Switch.', badge: 'new', featured: true },
      { id: '3', name: 'Figurine Anime Guerrier', category: 'anime', price: 65, description: 'Sculpture détaillée peinte avec finitions lisses.', badge: 'popular', featured: true },
      { id: '4', name: 'Robot Articulé Flexible', category: 'toys', price: 22, description: 'Jouet print-in-place articulé toutes directions.', badge: 'new', featured: true },
      { id: '5', name: 'Support Smartphone Bureau', category: 'accessories', price: 18, description: 'Support réglable avec passage de câble de charge.', badge: '', featured: true },
      { id: '6', name: 'Vase Géométrique Moderne', category: 'home-decor', price: 35, description: 'Design torsadé minimaliste pour fleurs et déco.', badge: 'sale', featured: true },
      { id: '7', name: 'Support Mural Casque Gamer', category: 'gaming', price: 15, description: 'Accroche murale solide avec passe-câbles.', badge: '', featured: false },
      { id: '8', name: 'Pack 4 Chibi Collectibles', category: 'anime', price: 42, description: 'Collection de 4 mini personnages pour bureau.', badge: 'new', featured: false },
      { id: '9', name: 'Dosaure Articulé Flexi-Rex', category: 'toys', price: 12, description: 'Dino flexible très populaire et anti-stress.', badge: 'popular', featured: false },
      { id: '10', name: 'Organiseur de Câbles Magnétique', category: 'accessories', price: 10, description: 'Pack de clips magnétiques pour bureau propre.', badge: '', featured: false },
      { id: '11', name: 'Lampe Lune Lithophanie', category: 'home-decor', price: 55, description: 'Sphère lunaire lumineuse avec socle bois.', badge: 'new', featured: true },
      { id: '12', name: 'Touche Clavier Artisanale', category: 'gaming', price: 32, description: 'Keycap custom pour claviers mécaniques.', badge: '', featured: true },
      // NOUVELLES CATÉGORIES :
      { id: '13', name: 'Organiseur d\'Embouts Hex & Tournevis', category: 'tools', price: 18, description: 'Support magnétique robuste pour 24 embouts de précision.', badge: 'new', featured: true },
      { id: '14', name: 'Jauge de Filetage & Calibre d\'Angle 3D', category: 'tools', price: 14, description: 'Outil de mesure rapide et précis pour atelier et bricolage.', badge: '', featured: false },
      { id: '15', name: 'Lithophanie Cœur Lumineux Personnalisé', category: 'gifts', price: 49, description: 'Photo personnelle révélée en relief sous la lumière LED.', badge: 'popular', featured: true },
      { id: '16', name: 'Boîte Cryptex Mécanique à Code', category: 'gifts', price: 38, description: 'Boîte surprise avec combinaison rotative mécanique.', badge: 'new', featured: false },
      { id: '17', name: 'Porte-clés Prénom Bicolore Personnalisé', category: 'keychains', price: 12, description: 'Prénom en relief 3D bicolore avec anneau métallique renforcé.', badge: 'popular', featured: true },
      { id: '18', name: 'Porte-clés Logo Voiture / Marque Custom', category: 'keychains', price: 15, description: 'Emblème automobile ou marque préférée en relief haute précision.', badge: 'new', featured: true },
      { id: '19', name: 'Porte-clés Code Spotify Scannable', category: 'keychains', price: 14, description: 'Scannez le code avec votre téléphone pour lancer votre chanson.', badge: 'sale', featured: false }
    ];
  },
  init() {
    const d = this.getDefaults();
    this.save(d);
    return d;
  }
};

const CATS = {
  'home-decor': { name: 'Décoration Maison', icon: '🏠', desc: 'Vases, veilleuses, lampes et serre-livres' },
  'gaming': { name: 'Gaming Setup', icon: '🎮', desc: 'Supports de manettes, casques et touches custom' },
  'anime': { name: 'Anime & Figurines', icon: '⚔️', desc: 'Statues et figurines haute définition' },
  'toys': { name: 'Jouets & Gadgets', icon: '🧸', desc: 'Jouets articulés, flexi-rex et casse-têtes' },
  'accessories': { name: 'Accessoires Bureau', icon: '🎧', desc: 'Supports smartphone, range-câbles et utilitaires' },
  'tools': { name: 'Outils & Atelier', icon: '🔧', desc: 'Rangements d\'outils, calibres et gabarits de mesure' },
  'gifts': { name: 'Idées Cadeaux', icon: '🎁', desc: 'Lithophanies photo, boîtes secrètes et surprises' },
  'keychains': { name: 'Porte-clés Custom', icon: '🔑', desc: 'Porte-clés prénom bicolore, logos auto et codes Spotify' }
};

const EMOJIS = {
  'home-decor': ['🏺', '🪴', '💡', '🏠'],
  'gaming': ['🎮', '🕹️', '⌨️', '🎧'],
  'anime': ['⚔️', '🐉', '🎭', '🗡️'],
  'toys': ['🧸', '🤖', '🦕', '🚀'],
  'accessories': ['📱', '⌚', '💼', '🧲'],
  'tools': ['🔧', '🛠️', '📐', '⚙️'],
  'gifts': ['🎁', '💝', '✨', '🎀'],
  'keychains': ['🔑', '🏷️', '🚗', '🎵']
};

function getEmoji(cat, i = 0) {
  const a = EMOJIS[cat] || ['📦'];
  return a[i % a.length];
}

function orderWA(n, p) {
  const msg = encodeURIComponent(`Bonjour 3D Craft! 👋\nJe souhaite commander:\n📦 Produit: ${n}\n💰 Prix: ${p} TND\n\nMerci de me confirmer la disponibilité.`);
  window.open(`https://wa.me/21646595833?text=${msg}`, '_blank');
}

function toast(m) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function cardHTML(p, i = 0) {
  const badge = p.badge ? `<span class="badge badge-${p.badge}">${p.badge === 'new' ? '✨ New' : p.badge === 'sale' ? '🔥 Sale' : '⭐ Popular'}</span>` : '';
  const img = p.image ? `<img src="${p.image}" alt="${p.name}">` : `<span class="product-emoji">${getEmoji(p.category, i)}</span>`;
  return `
    <div class="product-card">
      <div class="product-img">
        ${img}
        <div class="product-badge-wrap">${badge}</div>
      </div>
      <div class="product-info">
        <span class="product-cat">${CATS[p.category]?.name || p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description || ''}</p>
        <div class="product-foot">
          <div class="product-price">${parseFloat(p.price).toFixed(2)} <span>TND</span></div>
          <button class="product-order-btn" title="Commander via WhatsApp" onclick="orderWA('${p.name}', '${p.price}')">💬</button>
        </div>
      </div>
    </div>
  `;
}
