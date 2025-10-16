// ==================== CONFIGURACIÓN UNIVERSAL ====================
const CONFIG = {
    whatsapp: "573144751047",
    admin: {
        username: "patron",
        password: "2006.01.28.123"
    },
    prices: {
        personal: 7000,
        familiar: 21000,
        domicilio: 2000
    }
};

// ==================== ESTADO GLOBAL ====================
let state = {
    order: {
        personal: { quantity: 0, salsa: '' },
        familiar: { quantity: 0 }
    },
    currentAdmin: null,
    loginAttempts: 0,
    orders: [],
    products: [
        {
            id: 1,
            name: "Caja Personal",
            description: "2 Choribolas + 1 Salsa a elección",
            price: 7000,
            image: "https://i.ibb.co/tMb1N7td/IMG-20250915-170950.jpg",
            category: "combo"
        },
        {
            id: 2,
            name: "Caja Familiar",
            description: "6 Choribolas + Las 3 Salsas de la casa",
            price: 21000,
            image: "https://i.ibb.co/Y48bT8Wy/IMG-20250915-170714.jpg",
            category: "combo"
        }
    ],
    analytics: {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        popularProduct: "",
        dailySales: [12000, 18000, 15000, 21000, 25000, 30000, 35000],
        topProducts: [
            { name: "Caja Personal", sales: 25 },
            { name: "Caja Familiar", sales: 18 }
        ]
    }
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🌐 Sitio cargado - Versión Profesional 2.0");
    initializeCarousel();
    initializeEventListeners();
    updateTotal();
    loadSampleData();
    initializeAdminTabs();
});

// ==================== CARRUSEL ====================
function initializeCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    
    function showSlide(index) {
        items.forEach(item => item.classList.remove('active'));
        if (items[index]) {
            items[index].classList.add('active');
        }
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }, 5000);
    
    showSlide(currentIndex);
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Admin Form
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
        });
    }

    // Admin Settings Form
    const adminSettingsForm = document.getElementById('adminSettingsForm');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateAdminSettings();
        });
    }

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('adminModal');
        if (e.target === modal) {
            closeAdminModal();
        }
    });
}

// ==================== MOSTRAR/OCULTAR CONTRASEÑA ====================
function togglePassword() {
    const passwordInput = document.getElementById('adminPass');
    const toggleIcon = document.querySelector('.toggle-password i');
    
    if (!passwordInput) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// ==================== SISTEMA ADMIN UNIVERSAL ====================
function showAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    const form = document.getElementById('adminForm');
    if (form) {
        form.reset();
    }
    
    // Resetear ojo
    const toggleIcon = document.querySelector('.toggle-password i');
    const passwordInput = document.getElementById('adminPass');
    if (passwordInput && toggleIcon) {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function handleAdminLogin() {
    const usernameInput = document.getElementById('adminUser');
    const passwordInput = document.getElementById('adminPass');
    
    if (!usernameInput || !passwordInput) {
        alert('❌ Error: No se encontraron los campos de login');
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    // LIMPIAR Y COMPARAR - MÉTODO UNIVERSAL
    const cleanUsername = username.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();
    
    const correctUsername = CONFIG.admin.username.toString().trim().toLowerCase();
    const correctPassword = CONFIG.admin.password.toString().trim();

    if (cleanUsername === correctUsername && cleanPassword === correctPassword) {
        // ✅ CREDENCIALES CORRECTAS
        state.currentAdmin = { 
            username: cleanUsername, 
            name: 'Administrador',
            loginTime: new Date()
        };
        state.loginAttempts = 0;
        closeAdminModal();
        showAdminPanel();
        updateAdminWelcome();
        loadAdminData();
        alert('✅ ¡Acceso concedido! Bienvenido al panel de administración.');
    } else {
        // ❌ CREDENCIALES INCORRECTAS
        state.loginAttempts++;
        
        if (state.loginAttempts >= 2) {
            alert(`❌ Credenciales incorrectas\n\n💡 Prueba con:\nUsuario: patron\nContraseña: 2006.01.28.123\n\n(Sin tildes y sin espacios)`);
        } else {
            alert('❌ Usuario o contraseña incorrectos');
        }
    }
}

function updateAdminWelcome() {
    const welcomeElement = document.getElementById('adminWelcome');
    if (welcomeElement && state.currentAdmin) {
        const time = new Date().getHours();
        const greeting = time < 12 ? 'Buenos días' : time < 18 ? 'Buenas tardes' : 'Buenas noches';
        welcomeElement.textContent = `${greeting}, ${state.currentAdmin.name}`;
    }
}

function showAdminPanel() {
    const main = document.querySelector('main');
    const adminPanel = document.getElementById('adminPanel');
    
    if (main && adminPanel) {
        main.style.display = 'none';
        adminPanel.style.display = 'block';
    }
}

function logoutAdmin() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        state.currentAdmin = null;
        
        const main = document.querySelector('main');
        const adminPanel = document.getElementById('adminPanel');
        
        if (main && adminPanel) {
            adminPanel.style.display = 'none';
            main.style.display = 'block';
        }
        
        alert('👋 Sesión de administrador cerrada');
    }
}

// ==================== PANEL ADMIN - PESTAÑAS ====================
function initializeAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchAdminTab(tabId);
        });
    });

    // Filtros de pedidos
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            filterOrders(filter);
        });
    });
}

function switchAdminTab(tabId) {
    // Ocultar todas las pestañas y contenido
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar pestaña seleccionada
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`${tabId}-content`);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeContent.classList.add('active');
    }
    
    // Cargar datos específicos de la pestaña
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'products':
            loadProducts();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    // Actualizar estadísticas
    document.getElementById('totalSales').textContent = `$${state.analytics.totalSales.toLocaleString()}`;
    document.getElementById('totalOrders').textContent = state.analytics.totalOrders;
    document.getElementById('totalCustomers').textContent = state.analytics.totalCustomers;
    document.getElementById('popularProduct').textContent = state.analytics.popularProduct || '-';
    
    // Actualizar actividad reciente
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    if (state.orders.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-shopping-cart"></i>
                <span>No hay actividad reciente</span>
            </div>
        `;
        return;
    }
    
    const recentOrders = state.orders.slice(0, 5).reverse();
    activityList.innerHTML = recentOrders.map(order => `
        <div class="activity-item">
            <i class="fas fa-shopping-cart ${order.status === 'delivered' ? 'text-success' : order.status === 'preparing' ? 'text-warning' : 'text-info'}"></i>
            <div>
                <strong>Pedido ${order.id}</strong>
                <br>
                <small>${order.customer.name} - $${order.total.toLocaleString()} - ${getStatusText(order.status)}</small>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'preparing': 'En preparación',
        'delivered': 'Entregado'
    };
    return statusMap[status] || status;
}

// ==================== GESTIÓN DE PEDIDOS ====================
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    if (state.orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-cart"></i>
                <p>No hay pedidos registrados</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = state.orders.map(order => `
        <div class="order-card-admin">
            <div class="order-header">
                <div>
                    <div class="order-id">Pedido #${order.id}</div>
                    <div><strong>${order.customer.name}</strong> - ${order.customer.phone}</div>
                    <div>${order.customer.address}</div>
                    ${order.customer.notes ? `<div>📝 ${order.customer.notes}</div>` : ''}
                    <div>Total: $${order.total.toLocaleString()}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div>${item.quantity}x ${item.type === 'personal' ? 'Caja Personal' : 'Caja Familiar'} ${item.salsa ? `- ${getSalsaName(item.salsa)}` : ''}</div>
                `).join('')}
            </div>
            <div class="order-actions">
                ${order.status === 'pending' ? 
                    `<button class="action-btn btn-prepare" onclick="updateOrderStatus('${order.id}', 'preparing')">
                        <i class="fas fa-utensils"></i> En Preparación
                    </button>` : ''}
                ${order.status === 'preparing' ? 
                    `<button class="action-btn btn-deliver" onclick="updateOrderStatus('${order.id}', 'delivered')">
                        <i class="fas fa-check"></i> Entregado
                    </button>` : ''}
                <button class="action-btn" onclick="contactCustomer('${order.customer.phone}')" style="background: #25D366; color: white;">
                    <i class="fab fa-whatsapp"></i> Contactar
                </button>
                <button class="action-btn delete" onclick="deleteOrder('${order.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function filterOrders(filter) {
    const orders = document.querySelectorAll('.order-card-admin');
    orders.forEach(order => {
        const status = order.querySelector('.order-status').className;
        if (filter === 'all' || status.includes(filter)) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date();
        loadOrders();
        updateDashboard();
        alert(`✅ Pedido ${orderId} actualizado a: ${getStatusText(newStatus)}`);
    }
}

function deleteOrder(orderId) {
    if (confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
        state.orders = state.orders.filter(o => o.id !== orderId);
        updateAnalytics();
        loadOrders();
        updateDashboard();
        alert('✅ Pedido eliminado correctamente');
    }
}

function contactCustomer(phone) {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
}

// ==================== GESTIÓN DE PRODUCTOS ====================
function loadProducts() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = state.products.map(product => `
        <div class="product-card-admin">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toLocaleString()}</div>
            </div>
            <div class="product-actions">
                <button class="action-btn edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
            </div>
        </div>
    `).join('');
}

function showAddProductForm() {
    const name = prompt('Nombre del nuevo producto:');
    if (!name) return;
    
    const description = prompt('Descripción del producto:');
    const price = parseInt(prompt('Precio del producto:'));
    const image = prompt('URL de la imagen del producto:');
    
    if (description && !isNaN(price) && image) {
        const newProduct = {
            id: Date.now(),
            name: name,
            description: description,
            price: price,
            image: image,
            category: 'product'
        };
        
        state.products.push(newProduct);
        loadProducts();
        alert('✅ Producto agregado correctamente');
    } else {
        alert('❌ Por favor completa todos los campos correctamente');
    }
}

function editProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    const newPrice = prompt(`Nuevo precio para ${product.name}:`, product.price);
    if (newPrice && !isNaN(newPrice)) {
        product.price = parseInt(newPrice);
        loadProducts();
        alert('✅ Precio actualizado correctamente');
    }
}

// ==================== ANALYTICS ====================
function loadAnalytics() {
    updateTopProducts();
    // En una implementación real, aquí cargarías gráficos con Chart.js
}

function updateTopProducts() {
    const topProductsElement = document.getElementById('topProducts');
    if (!topProductsElement) return;
    
    topProductsElement.innerHTML = state.analytics.topProducts.map((product, index) => `
        <div class="product-rank">
            <span class="rank">${index + 1}</span>
            <span class="product-name">${product.name}</span>
            <span class="sales-count">${product.sales} ventas</span>
        </div>
    `).join('');
}

function exportData(format) {
    alert(`📊 Función de exportación ${format.toUpperCase()} activada\n\nEn una implementación completa, esto generaría un archivo ${format} con todos los datos.`);
}

// ==================== CONFIGURACIÓN ====================
function loadSettings() {
    document.getElementById('ordersToday').textContent = state.orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    }).length;
}

function updateAdminSettings() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newUsername && !newPassword) {
        alert('❌ Por favor ingresa nuevos datos para actualizar');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('❌ Las contraseñas no coinciden');
        return;
    }
    
    if (newUsername) {
        CONFIG.admin.username = newUsername;
    }
    
    if (newPassword) {
        CONFIG.admin.password = newPassword;
    }
    
    // Limpiar formulario
    document.getElementById('adminSettingsForm').reset();
    
    alert('✅ Configuración actualizada correctamente\n\n⚠️ Recuerda las nuevas credenciales para el próximo acceso.');
}

function updatePrices() {
    const personalPrice = parseInt(document.getElementById('pricePersonal').value);
    const familiarPrice = parseInt(document.getElementById('priceFamiliar').value);
    const deliveryPrice = parseInt(document.getElementById('priceDelivery').value);
    
    if (!isNaN(personalPrice)) CONFIG.prices.personal = personalPrice;
    if (!isNaN(familiarPrice)) CONFIG.prices.familiar = familiarPrice;
    if (!isNaN(deliveryPrice)) CONFIG.prices.domicilio = deliveryPrice;
    
    alert('✅ Precios actualizados correctamente');
}

// ==================== SISTEMA DE PEDIDOS ====================
function updateQuantity(type, change) {
    if (!state.order[type]) return;
    
    const newQuantity = state.order[type].quantity + change;
    
    if (newQuantity >= 0) {
        state.order[type].quantity = newQuantity;
        const quantityElement = document.getElementById(type + 'Qty');
        if (quantityElement) {
            quantityElement.textContent = newQuantity;
        }
        updateTotal();
    }
}

function selectSalsa(salsa) {
    state.order.personal.salsa = salsa;
}

function updateTotal() {
    let subtotal = 0;
    
    if (state.order.personal) {
        subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    }
    if (state.order.familiar) {
        subtotal += state.order.familiar.quantity * CONFIG.pri
