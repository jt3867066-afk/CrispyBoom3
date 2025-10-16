// ==================== CONFIGURACIÓN UNIVERSAL ====================
const CONFIG = {
    whatsapp: "573144751047",
    admin: {
        username: "patron",  // SIN tilde - compatible universal
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
    loginAttempts: 0
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🌐 Sitio cargado - Compatible Móvil/PC");
    initializeCarousel();
    initializeEventListeners();
    updateTotal();
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

    console.log("🔐 Intento de login:", { 
        usuario_ingresado: username, 
        contraseña_ingresada: password,
        usuario_correcto: CONFIG.admin.username,
        contraseña_correcta: CONFIG.admin.password
    });

    // LIMPIAR Y COMPARAR - MÉTODO UNIVERSAL
    const cleanUsername = username.toString().trim().toLowerCase();
    const cleanPassword = password.toString().trim();
    
    const correctUsername = CONFIG.admin.username.toString().trim().toLowerCase();
    const correctPassword = CONFIG.admin.password.toString().trim();

    console.log("🔍 Comparando:", {
        limpio_usuario: cleanUsername,
        limpio_contraseña: cleanPassword,
        correcto_usuario: correctUsername,
        correcto_contraseña: correctPassword
    });

    if (cleanUsername === correctUsername && cleanPassword === correctPassword) {
        // ✅ CREDENCIALES CORRECTAS
        state.currentAdmin = { username: cleanUsername, name: 'Administrador' };
        state.loginAttempts = 0;
        closeAdminModal();
        showAdminPanel();
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

function showAdminPanel() {
    const main = document.querySelector('main');
    const adminPanel = document.getElementById('adminPanel');
    
    if (main && adminPanel) {
        main.style.display = 'none';
        adminPanel.style.display = 'block';
    }
}

function logoutAdmin() {
    state.currentAdmin = null;
    
    const main = document.querySelector('main');
    const adminPanel = document.getElementById('adminPanel');
    
    if (main && adminPanel) {
        adminPanel.style.display = 'none';
        main.style.display = 'block';
    }
    
    alert('👋 Sesión de administrador cerrada');
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
        subtotal += state.order.familiar.quantity * CONFIG.prices.familiar;
    }
    
    const total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = `Total: $${total.toLocaleString()}`;
    }
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

    sendOrderToWhatsApp({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        notes: customerNotes ? customerNotes.trim() : ''
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
    
    message += `%0A💰 *Subtotal:* $${subtotal.toLocaleString()}%0A`;
    message += `🚚 *Domicilio:* $${CONFIG.prices.domicilio.toLocaleString()}%0A`;
    message += `💵 *TOTAL:* $${total.toLocaleString()}%0A%0A`;
    message += `¡Listo para enviar el comprobante de pago!`;

    const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${message}`;
    
    resetOrder();
    window.open(whatsappUrl, '_blank');
    
    alert(`✅ ¡Pedido #${orderId} creado!\n\nSe abrirá WhatsApp para que envíes tu comprobante.\n\nTotal: $${total.toLocaleString()}`);
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

// ==================== DETECCIÓN DE DOMINGO ====================
function isSunday() {
    return new Date().getDay() === 0;
}

// Inicializar promoción
document.addEventListener('DOMContentLoaded', function() {
    const promoText = document.querySelector('.promo-text');
    if (promoText) {
        promoText.style.display = isSunday() ? 'block' : 'none';
    }
});

// ==================== SCROLL ====================
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== CERRAR MODAL AL HACER CLIC FUERA ====================
document.addEventListener('click', function(e) {
    const modal = document.getElementById('adminModal');
    if (e.target === modal) {
        closeAdminModal();
    }
});

// ==================== COMPATIBILIDAD MÓVIL ====================
// Prevenir zoom en inputs (comportamiento móvil común)
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.fontSize = '16px'; // Previene zoom en iOS
        });
    });
});
