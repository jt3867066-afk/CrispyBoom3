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

// ==================== INICIALIZACIÓN PRINCIPAL ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🌐 Sitio cargado - Versión Corregida");
    initializeCarousel();
    initializeEventListeners();
    updateTotal();
    loadSampleData();
    
    // Solo inicializar tabs admin si estamos en el panel
    if (document.getElementById('adminPanel')) {
        initializeAdminTabs();
    }
});

// ==================== CARRUSEL ====================
function initializeCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    
    if (items.length === 0) return;
    
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

// ==================== EVENT LISTENERS PRINCIPALES ====================
function initializeEventListeners() {
    console.log("🔧 Inicializando event listeners...");
    
    // Admin Form - SOLO si existe
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
        });
        console.log("✅ Admin form listener agregado");
    }

    // Admin Settings Form - SOLO si existe
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
    
    console.log("✅ Todos los event listeners configurados");
}

// ==================== SISTEMA DE PEDIDOS - FUNCIONES PRINCIPALES ====================
function updateQuantity(type, change) {
    console.log(`🔄 Actualizando cantidad: ${type}, cambio: ${change}`);
    
    if (!state.order[type]) {
        console.error(`❌ Tipo de pedido no encontrado: ${type}`);
        return;
    }
    
    const newQuantity = state.order[type].quantity + change;
    
    if (newQuantity >= 0) {
        state.order[type].quantity = newQuantity;
        const quantityElement = document.getElementById(type + 'Qty');
        if (quantityElement) {
            quantityElement.textContent = newQuantity;
            console.log(`✅ Cantidad actualizada: ${newQuantity}`);
        } else {
            console.error(`❌ Elemento de cantidad no encontrado: ${type}Qty`);
        }
        updateTotal();
    }
}

function selectSalsa(salsa) {
    console.log(`🌶️ Salsa seleccionada: ${salsa}`);
    state.order.personal.salsa = salsa;
}

function updateTotal() {
    let subtotal = 0;
    
    if (state.order.personal) {
        subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    }
    if (state.order.familiar) {
        subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
    }
    
    const total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toLocaleString()}`;
        console.log(`💰 Total actualizado: $${total.toLocaleString()}`);
    }
}

function placeOrder() {
    console.log("🛒 Procesando pedido...");
    const total = calculateSubtotal();
    
    if (total === 0) {
        alert('❌ Por favor agrega productos a tu pedido');
        return;
    }

    if (state.order.personal.quantity > 0 && !state.order.personal.salsa) {
        alert('❌ Por favor selecciona una salsa para la caja personal');
        return;
    }

    processOrder();
}

function calculateSubtotal() {
    let subtotal = 0;
    if (state.order.personal) {
        subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    }
    if (state.order.familiar) {
        subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
    }
    return subtotal;
}

function processOrder() {
    const customerName = prompt('👤 ¿Cuál es tu nombre completo?');
    if (!customerName) return;
    
    const customerPhone = prompt('📞 ¿Tu número de WhatsApp? (Ej: 3001234567)');
    if (!customerPhone) return;
    
    const customerAddress = prompt('📍 ¿Tu barrio y dirección para el domicilio?');
    if (!customerAddress) return;
    
    const customerNotes = prompt('📝 ¿Alguna nota adicional? (Ej: Sin picante, llamar antes...)\n(Presiona Cancelar si no hay notas)');

    const order = createOrder({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        notes: customerNotes ? customerNotes.trim() : ''
    });
    
    sendOrderToWhatsApp(order);
}

function createOrder(customer) {
    const orderId = 'CRISPY-' + Date.now().toString().slice(-6);
    const subtotal = calculateSubtotal();
    const total = subtotal + CONFIG.prices.domicilio;
    
    const order = {
        id: orderId,
        customer: customer,
        items: getOrderItems(),
        total: total,
        status: 'pending',
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Agregar a historial
    state.orders.push(order);
    updateAnalytics(order);
    
    return order;
}

function getOrderItems() {
    const items = [];
    if (state.order.personal.quantity > 0) {
        items.push({
            type: 'personal',
            quantity: state.order.personal.quantity,
            salsa: state.order.personal.salsa,
            unitPrice: CONFIG.prices.personal
        });
    }
    if (state.order.familiar.quantity > 0) {
        items.push({
            type: 'familiar',
            quantity: state.order.familiar.quantity,
            unitPrice: CONFIG.prices.familiar
        });
    }
    return items;
}

function sendOrderToWhatsApp(order) {
    let message = `¡Hola Crispy Boom! Quiero hacer un pedido:%0A%0A`;
    message += `📦 *Pedido #${order.id}*%0A`;
    message += `👤 *Cliente:* ${order.customer.name}%0A`;
    message += `📞 *WhatsApp:* ${order.customer.phone}%0A`;
    message += `📍 *Dirección:* ${order.customer.address}%0A`;
    
    if (order.customer.notes) {
        message += `📝 *Notas:* ${order.customer.notes}%0A`;
    }
    
    message += `%0A🛒 *Detalle del pedido:*%0A`;
    
    if (state.order.personal.quantity > 0) {
        const choribolasCount = isSunday() ? state.order.personal.quantity * 3 : state.order.personal.quantity * 2;
        message += `• ${state.order.personal.quantity}x Caja Personal (${choribolasCount} choribolas)`;
        if (state.order.personal.salsa) {
            message += ` - ${getSalsaName(state.order.personal.salsa)}`;
        }
        message += `%0A`;
    }
    
    if (state.order.familiar.quantity > 0) {
        message += `• ${state.order.familiar.quantity}x Caja Familiar (${state.order.familiar.quantity * 6} choribolas)%0A`;
    }
    
    message += `%0A💰 *Subtotal:* $${(order.total - CONFIG.prices.domicilio).toLocaleString()}%0A`;
    message += `🚚 *Domicilio:* $${CONFIG.prices.domicilio.toLocaleString()}%0A`;
    message += `💵 *TOTAL:* $${order.total.toLocaleString()}%0A%0A`;
    message += `¡Listo para enviar el comprobante de pago!`;

    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${message}`;
    
    resetOrder();
    window.open(whatsappUrl, '_blank');
    
    alert(`✅ ¡Pedido #${order.id} creado!\n\nSe abrirá WhatsApp para que envíes tu comprobante.\n\nTotal: $${order.total.toLocaleString()}`);
}

function getSalsaName(salsaKey) {
    const salsas = {
        'maiz': 'Salsa de Maíz',
        'tocineta': 'Salsa de Tocineta', 
        'ahumada': 'Salsa Ahumada'
    };
    return salsas[salsaKey] || salsaKey;
}

function resetOrder() {
    state.order = {
        personal: { quantity: 0, salsa: '' },
        familiar: { quantity: 0 }
    };
    
    const personalQty = document.getElementById('personalQty');
    const familiarQty = document.getElementById('familiarQty');
    
    if (personalQty) personalQty.textContent = '0';
    if (familiarQty) familiarQty.textContent = '0';
    
    const salsaRadios = document.querySelectorAll('input[name="salsa"]');
    salsaRadios.forEach(radio => radio.checked = false);
    
    updateTotal();
}

// ==================== SISTEMA ADMIN - FUNCIONES SEPARADAS ====================
function showAdminModal() {
    console.log("🔓 Mostrando modal admin...");
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log("✅ Modal admin mostrado");
    } else {
        console.error("❌ Modal admin no encontrado");
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

function handleAdminLogin() {
    console.log("🔐 Procesando login admin...");
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

    console.log("🔍 Comparando credenciales:", {
        ingresado: { user: cleanUsername, pass: cleanPassword },
        correcto: { user: correctUsername, pass: correctPassword }
    });

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
        console.log("✅ Panel admin mostrado");
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

// ==================== FUNCIONES DEL PANEL ADMIN ====================
function initializeAdminTabs() {
    console.log("📑 Inicializando tabs admin...");
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

function updateDashboard() {
    console.log("📊 Actualizando dashboard...");
    
    // Actualizar estadísticas
    const totalSalesElement = document.getElementById('totalSales');
    const totalOrdersElement = document.getElementById('totalOrders');
    const totalCustomersElement = document.getElementById('totalCustomers');
    const popularProductElement = document.getElementById('popularProduct');
    
    if (totalSalesElement) {
        totalSalesElement.textContent = `$${state.analytics.totalSales.toLocaleString()}`;
    }
    if (totalOrdersElement) {
        totalOrdersElement.textContent = state.analytics.totalOrders;
    }
    if (totalCustomersElement) {
        totalCustomersElement.textContent = state.analytics.totalCustomers;
    }
    if (popularProductElement) {
        popularProductElement.textContent = state.analytics.popularProduct || '-';
    }
    
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
    
    // Ordenar pedidos por fecha (más recientes primero)
    const recentOrders = [...state.orders]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    activityList.innerHTML = recentOrders.map(order => `
        <div class="activity-item">
            <i class="fas fa-shopping-cart"></i>
            <span>
                <strong>Pedido ${order.id}</strong> - 
                ${order.customer.name} - 
                $${order.total.toLocaleString()} - 
                <span class="status-${order.status}">${getStatusText(order.status)}</span>
            </span>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'preparing': 'En Preparación',
        'delivered': 'Entregado'
    };
    return statusMap[status] || status;
}

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
    
    // Mostrar todos los pedidos inicialmente
    filterOrders('all');
}

function filterOrders(filter) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    let filteredOrders = state.orders;
    
    if (filter !== 'all') {
        filteredOrders = state.orders.filter(order => order.status === filter);
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-shopping-cart"></i>
                <p>No hay pedidos ${filter !== 'all' ? `con estado "${getStatusText(filter)}"` : 'registrados'}</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    ordersList.innerHTML = filteredOrders.ma
