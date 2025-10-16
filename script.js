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
    console.log("✅ Página cargada correctamente");
    initializeCarousel();
    initializeEventListeners();
    updateTotal();
    loadSampleData();
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

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    console.log("🔧 Configurando event listeners...");
    
    // Admin Form
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
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

// ==================== BOTONES -/+ (CORREGIDOS) ====================
function updateQuantity(type, change) {
    console.log(`🔄 Botón ${type} presionado: ${change}`);
    
    if (!state.order[type]) {
        console.error(`❌ Tipo no encontrado: ${type}`);
        return;
    }
    
    const newQuantity = state.order[type].quantity + change;
    if (newQuantity >= 0) {
        state.order[type].quantity = newQuantity;
        
        // ACTUALIZAR INTERFAZ
        const quantityElement = document.getElementById(type + 'Qty');
        if (quantityElement) {
            quantityElement.textContent = newQuantity;
            console.log(`✅ ${type} cantidad: ${newQuantity}`);
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
    subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
    
    const total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toLocaleString()}`;
    }
}

// ==================== SISTEMA DE PEDIDOS ====================
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
    subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
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

// ==================== SISTEMA ADMIN ====================
function showAdminModal() {
    console.log("🔓 Abriendo modal admin...");
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log("✅ Modal admin abierto");
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
    console.log("🔐 Procesando login...");
    const usernameInput = document.getElementById('adminUser');
    const passwordInput = document.getElementById('adminPass');
    
    if (!usernameInput || !passwordInput) {
        alert('❌ Error: Campos no encontrados');
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    const cleanUsername = username.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();
    
    const correctUsername = CONFIG.admin.username.toString().trim().toLowerCase();
    const correctPassword = CONFIG.admin.password.toString().trim();

    if (cleanUsername === correctUsername && cleanPassword === correctPassword) {
        state.currentAdmin = { 
            username: cleanUsername, 
            name: 'Administrador',
            loginTime: new Date()
        };
        state.loginAttempts = 0;
        closeAdminModal();
        showAdminPanel();
        updateAdminWelcome();
        alert('✅ ¡Acceso concedido! Bienvenido al panel.');
    } else {
        state.loginAttempts++;
        
        if (state.loginAttempts >= 2) {
            alert(`❌ Credenciales incorrectas\n\n💡 Prueba con:\nUsuario: patron\nContraseña: 2006.01.28.123`);
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
        
        alert('👋 Sesión cerrada');
    }
}

// ==================== UTILIDADES ====================
function isSunday() {
    return new Date().getDay() === 0;
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== DATOS DE EJEMPLO ====================
function loadSampleData() {
    if (state.orders.length === 0) {
        const sampleOrder = {
            id: 'CRISPY-123456',
            customer: {
                name: 'Cliente Demo',
                phone: '3001234567',
                address: 'Calle 123 #45-67, Barrio Demo',
                notes: 'Sin picante por favor'
            },
            items: [
                { type: 'personal', quantity: 2, salsa: 'maiz', unitPrice: 7000 }
            ],
            total: 16000,
            status: 'delivered',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString()
        };
        state.orders.push(sampleOrder);
        updateAnalytics(sampleOrder);
    }
}

function updateAnalytics(order) {
    state.analytics.totalSales += order.total;
    state.analytics.totalOrders++;
    
    const uniqueCustomers = new Set(state.orders.map(o => o.customer.phone));
    state.analytics.totalCustomers = uniqueCustomers.size;
    
    const productCounts = {};
    state.orders.forEach(order => {
        order.items.forEach(item => {
            const productName = item.type === 'personal' ? 'Caja Personal' : 'Caja Familiar';
            productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
        });
    });
    
    const popularProduct = Object.keys(productCounts).reduce((a, b) => 
        productCounts[a] > productCounts[b] ? a : b, '');
    state.analytics.popularProduct = popularProduct;
      }
