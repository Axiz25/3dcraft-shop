/* ========================================
   3D CRAFT - Admin Panel JavaScript
   ======================================== */

// Admin credentials (change these!)
const ADMIN_PASSWORD = 'admin3dcraft2026';

// ==========================================
// Admin Login
// ==========================================
function initAdminLogin() {
  const loginForm = document.getElementById('loginForm');
  const loginSection = document.getElementById('loginSection');
  const dashboard = document.getElementById('adminDashboard');
  const errorMsg = document.getElementById('loginError');

  // Check if already logged in
  if (sessionStorage.getItem('3dcraft_admin') === 'true') {
    loginSection.style.display = 'none';
    dashboard.classList.add('active');
    loadAdminDashboard();
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('3dcraft_admin', 'true');
      loginSection.style.display = 'none';
      dashboard.classList.add('active');
      loadAdminDashboard();
      showToast('Welcome back, Admin! 🎉');
    } else {
      errorMsg.classList.add('show');
      document.getElementById('adminPassword').value = '';
      setTimeout(() => errorMsg.classList.remove('show'), 3000);
    }
  });
}

// ==========================================
// Admin Logout
// ==========================================
function adminLogout() {
  sessionStorage.removeItem('3dcraft_admin');
  window.location.reload();
}

// ==========================================
// Load Admin Dashboard
// ==========================================
function loadAdminDashboard() {
  loadAdminStats();
  loadProductsTable();
  initProductForm();
}

// ==========================================
// Admin Stats
// ==========================================
function loadAdminStats() {
  const products = ProductStore.getAll();
  const categories = [...new Set(products.map(p => p.category))];

  document.getElementById('statTotalProducts').textContent = products.length;
  document.getElementById('statCategories').textContent = categories.length;
  document.getElementById('statFeatured').textContent = products.filter(p => p.featured).length;

  const avgPrice = products.length > 0
    ? (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(1)
    : '0';
  document.getElementById('statAvgPrice').textContent = avgPrice + ' TND';
}

// ==========================================
// Products Table
// ==========================================
function loadProductsTable() {
  const products = ProductStore.getAll();
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
          No products yet. Add your first product above! ☝️
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr data-id="${product.id}">
      <td>
        <span style="font-size: 1.5rem;">${getProductEmoji(product.category)}</span>
      </td>
      <td>
        <span class="table-product-name">${product.name}</span>
      </td>
      <td>${Categories[product.category]?.name || product.category}</td>
      <td class="table-price">${formatPrice(product.price)} TND</td>
      <td>
        ${product.badge ? `<span class="badge ${getBadgeClass(product.badge)}">${getBadgeText(product.badge)}</span>` : '—'}
      </td>
      <td>
        <div class="table-actions">
          <button class="table-btn table-btn-edit" onclick="editProduct('${product.id}')" title="Edit">✏️</button>
          <button class="table-btn table-btn-delete" onclick="deleteProduct('${product.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// Add Product Form
// ==========================================
function initProductForm() {
  const form = document.getElementById('addProductForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const product = {
      name: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value,
      price: parseFloat(document.getElementById('productPrice').value),
      description: document.getElementById('productDescription').value.trim(),
      image: document.getElementById('productImage').value.trim(),
      badge: document.getElementById('productBadge').value,
      featured: document.getElementById('productFeatured').checked
    };

    if (!product.name || !product.category || isNaN(product.price)) {
      showToast('Please fill all required fields', '⚠️');
      return;
    }

    const editId = form.dataset.editId;

    if (editId) {
      ProductStore.update(editId, product);
      showToast('Product updated successfully! ✅');
      form.dataset.editId = '';
      document.getElementById('formSubmitBtn').textContent = '➕ Add Product';
      document.getElementById('cancelEditBtn').style.display = 'none';
    } else {
      ProductStore.add(product);
      showToast('Product added successfully! 🎉');
    }

    form.reset();
    loadAdminStats();
    loadProductsTable();
  });
}

// ==========================================
// Edit Product
// ==========================================
function editProduct(id) {
  const products = ProductStore.getAll();
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById('productName').value = product.name;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productDescription').value = product.description || '';
  document.getElementById('productImage').value = product.image || '';
  document.getElementById('productBadge').value = product.badge || '';
  document.getElementById('productFeatured').checked = product.featured || false;

  const form = document.getElementById('addProductForm');
  form.dataset.editId = id;
  document.getElementById('formSubmitBtn').textContent = '💾 Update Product';
  document.getElementById('cancelEditBtn').style.display = 'inline-flex';

  // Scroll to form
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Editing product: ' + product.name, '✏️');
}

// ==========================================
// Cancel Edit
// ==========================================
function cancelEdit() {
  const form = document.getElementById('addProductForm');
  form.reset();
  form.dataset.editId = '';
  document.getElementById('formSubmitBtn').textContent = '➕ Add Product';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

// ==========================================
// Delete Product
// ==========================================
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    ProductStore.delete(id);
    loadAdminStats();
    loadProductsTable();
    showToast('Product deleted', '🗑️');
  }
}

// ==========================================
// Export / Import Products
// ==========================================
function exportProducts() {
  const products = ProductStore.getAll();
  const data = JSON.stringify(products, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '3dcraft_products_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Products exported! 📥');
}

function importProducts() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const products = JSON.parse(ev.target.result);
        if (Array.isArray(products)) {
          ProductStore.save(products);
          loadAdminStats();
          loadProductsTable();
          showToast(`Imported ${products.length} products! 📤`);
        }
      } catch (err) {
        showToast('Invalid file format', '❌');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ==========================================
// Init Admin
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAdminLogin();
});
