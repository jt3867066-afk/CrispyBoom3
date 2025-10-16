// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    whatsapp: "573144751047",
    admin: {
        username: "patron",  // SIN tilde
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
    currentAdmin: null
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initializeEventListeners();
    updateTotal();
    console.log("Sitio cargado correctamente");
});

// ==================== CARRUSEL 100% FUNCIONAL ====================
function initializeCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    function showSlide(index) {
        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        showSlide(currentIndex);
    }

    // Cambiar slide cada 5 segundos
    setInterval(nextSlide, 5000);
    
    // Mostrar primer slide
    showSlide(currentIndex);
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Admin Form
    document.getElementById('adminForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAdminLogin();
    });
}

// ==================== MOSTRAR/OCULTAR CONTRASEÑA ====================
function togglePassword() {
    const passwordInput = document.getElementById('adminPass');
    const toggleIcon = document.querySelector('.toggle-password i');
    
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

// ==================== SISTEMA ADMIN CORREGIDO ====================
function showAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('adminForm').reset();
    
    // Resetear icono del ojo
    const toggleIcon = document.querySelector('.toggle-password i');
    const passwordInput = document.getElementById('adminPass');
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
}

function handleAdminLogin() {
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;

    console.log("Intento de login:", username, password);
    console.log("Credenciales correctas:", CONFIG.admin.username, CONFIG.admin.password);

    // Eliminar espacios en blanco
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (cleanUsername === CONFIG.admin.username && cleanPassword === CONFIG.admin.password) {
        state.currentAdmin = { username: cleanUsername, name: 'Administrador' };
        closeAdminModal();
        showAdminPanel();
        alert('✅ Acceso concedido al panel de administración');
    } else {
        alert('❌ Credenciales incorrectas. Usa: usuario="patron" contraseña="2006.01.28.123"');
    }
}

function showAdminPanel() {
    document.querySelector('main').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function logoutAdmin() {
    state.currentAdmin = null;
    document.getElementById('adminPanel').style.display = 'none';
    document.querySelector('main').style.display = 'block';
    alert('👋 Sesión cerrada');
}

// ==================== SISTEMA DE PEDIDOS 100% FUNCIONAL ====================
function updateQuantity(type, change) {
    const newQuantity = state.order[type].quantity + change;
    
    if (newQuantity >= 0) {
        state.order[type].quantity = newQuantity;
        document.getElementById(type + 'Qty').textContent = newQuantity;
        updateTotal();
    }
}

function selectSalsa(salsa) {
    state.order.personal.salsa = salsa;
}

function updateTotal() {
    let subtotal = 0;
    
    // Calcular subtotal
    subtotal += state.order.personal.quantity * CONFIG.prices.personal;
    subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
    
    // Calcular total con domicilio
    const total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    
    // Actualizar display
    document.getElementById('totalAmount').textContent = `Total: $${total.toLocaleString()}`;
}

// ==================== PROCESAR PEDIDO ====================
function placeOrder() {
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

    sendOrderToWhatsApp({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        notes: customerNotes || ''
    });
}

function sendOrderToWhatsApp(customer) {
    const orderId = 'CRISPY-' + Date.now().toString().slice(-6);
    const subtotal = calculateSubtotal();
    const total = subtotal + CONFIG.prices.domicilio;

    let message = `¡Hola Crispy Boom! Quiero hacer un pedido:%0A%0A`;
    message += `📦 *Pedido #${orderId}*%0A`;
    message += `👤 *Cliente:* ${customer.name}%0A`;
    message += `📞 *WhatsApp:* ${customer.phone}%0A`;
    message += `📍 *Dirección:* ${customer.address}%0A`;
    
    if (customer.notes) {
        message += `📝 *Notas:* ${customer.notes}%0A`;
    }
    
    message += `%0A🛒 *Detalle del pedido:*%0A`;
    
    // Productos personales
    if (state.order.personal.quantity > 0) {
        const choribolasCount = isSunday() ? state.order.personal.quantity * 3 : state.order.personal.quantity * 2;
        message += `• ${state.order.personal.quantity}x Caja Personal (${choribolasCount} choribolas)`;
        if (state.order.personal.salsa) {
            message += ` - ${getSalsaName(state.order.personal.salsa)}`;
        }
        message += `%0A`;
    }
    
    // Productos familiares
    if (state.order.familiar.quantity > 0) {
        message += `• ${state.order.familiar.quantity}x Caja Familiar (${state.order.familiar.quantity * 6} choribolas)%0A`;
    }
    
    message += `%0A💰 *Subtotal:* $${subtotal.toLocaleString()}%0A`;
    message += `🚚 *Domicilio:* $${CONFIG.prices.domicilio.toLocaleString()}%0A`;
    message += `💵 *TOTAL:* $${total.toLocaleString()}%0A%0A`;
    message += `¡Listo para enviar el comprobante de pago!`;

    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${message}`;
    
    // Resetear pedido
    resetOrder();
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    alert(`✅ ¡Pedido #${orderId} creado!\n\nSe abrirá WhatsApp para que envíes tu comprobante.\n\nTotal: $${total.toLocaleString()}`);
}

function getSalsaName(salsaKey) {
    const salsas = {
        'maiz': 'Salsa de Maíz',
        'tocineta': 'Salsa de Tocineta', 
        'ahumada': 'Salsa Ahumada'
    };
    return salsas[salsaKey] || '';
}

function resetOrder() {
    state.order = {
        personal: { quantity: 0, salsa: '' },
        familiar: { quantity: 0 }
    };
    
    document.getElementById('personalQty').textContent = '0';
    document.getElementById('familiarQty').textContent = '0';
    document.querySelectorAll('input[name="salsa"]').forEach(radio => radio.checked = false);
    updateTotal();
}

// ==================== DETECCIÓN DE DOMINGO ====================
function isSunday() {
    return new Date().getDay() === 0;
}

// Actualizar promoción si es domingo
document.addEventListener('DOMContentLoaded', function() {
    const promoText = document.querySelector('.promo-text');
    if (promoText) {
        promoText.style.display = isSunday() ? 'block' : 'none';
    }
});

// ==================== SCROLL FUNCTIONS ====================
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// ==================== CERRAR MODAL AL HACER CLIC FUERA ====================
document.addEventListener('click', function(e) {
    const modal = document.getElementById('adminModal');
    if (e.target === modal) {
        closeAdminModal();
    }
});
