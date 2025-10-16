// ==================== CONFIGURACIÓN BÁSICA ====================
const CONFIG = {
    whatsapp: "573144751047",
    prices: { personal: 7000, familiar: 21000, domicilio: 2000 }
};

// ==================== ESTADO SIMPLE ====================
let state = {
    personal: 0,
    familiar: 0,
    salsa: ''
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página cargada");
    startCarousel();
});

// ==================== CARRUSEL ====================
function startCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    function showSlide(index) {
        items.forEach(item => item.classList.remove('active'));
        if (items[index]) items[index].classList.add('active');
    }

    setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }, 5000);
}

// ==================== BOTONES -/+ (100% FUNCIONALES) ====================
function updateQuantity(type, change) {
    console.log(`🔘 Botón ${type} presionado: ${change}`);
    
    // Actualizar estado
    if (type === 'personal') {
        state.personal = Math.max(0, state.personal + change);
        document.getElementById('personalQty').textContent = state.personal;
    } else if (type === 'familiar') {
        state.familiar = Math.max(0, state.familiar + change);
        document.getElementById('familiarQty').textContent = state.familiar;
    }
    
    updateTotal();
}

function selectSalsa(salsaType) {
    console.log(`🌶️ Salsa seleccionada: ${salsaType}`);
    state.salsa = salsaType;
}

function updateTotal() {
    let subtotal = (state.personal * CONFIG.prices.personal) + (state.familiar * CONFIG.prices.familiar);
    let total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    
    document.getElementById('totalAmount').textContent = `Total: $${total.toLocaleString()}`;
    console.log(`💰 Total actualizado: $${total}`);
}

// ==================== BOTÓN ADMIN (100% FUNCIONAL) ====================
function showAdminModal() {
    console.log("🔓 Abriendo modal admin");
    document.getElementById('adminModal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('adminForm').reset();
}

function togglePassword() {
    const passwordInput = document.getElementById('adminPass');
    const icon = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    console.log("🔐 Intentando login...");
    
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    
    if (username === 'patron' && password === '2006.01.28.123') {
        alert('✅ ¡Acceso concedido!');
        closeAdminModal();
        showAdminPanel();
    } else {
        alert('❌ Usuario o contraseña incorrectos');
    }
}

function showAdminPanel() {
    document.querySelector('main').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function logoutAdmin() {
    if (confirm('¿Cerrar sesión?')) {
        document.getElementById('adminPanel').style.display = 'none';
        document.querySelector('main').style.display = 'block';
        alert('👋 Sesión cerrada');
    }
}

// ==================== PEDIDO WHATSAPP ====================
function placeOrder() {
    if (state.personal === 0 && state.familiar === 0) {
        alert('❌ Agrega productos a tu pedido');
        return;
    }
    
    if (state.personal > 0 && !state.salsa) {
        alert('❌ Selecciona una salsa para la caja personal');
        return;
    }
    
    const name = prompt('👤 ¿Tu nombre completo?');
    if (!name) return;
    
    const phone = prompt('📞 ¿Tu WhatsApp? (Ej: 3001234567)');
    if (!phone) return;
    
    const address = prompt('📍 ¿Tu dirección para el domicilio?');
    if (!address) return;
    
    const notes = prompt('📝 ¿Alguna nota adicional? (Opcional)');
    
    sendWhatsAppOrder({ name, phone, address, notes: notes || '' });
}

function sendWhatsAppOrder(customer) {
    let message = `¡Hola Crispy Boom! Quiero hacer un pedido:%0A%0A`;
    message += `👤 *Cliente:* ${customer.name}%0A`;
    message += `📞 *WhatsApp:* ${customer.phone}%0A`;
    message += `📍 *Dirección:* ${customer.address}%0A`;
    
    if (customer.notes) {
        message += `📝 *Notas:* ${customer.notes}%0A`;
    }
    
    message += `%0A🛒 *Pedido:*%0A`;
    
    if (state.personal > 0) {
        const choribolas = isSunday() ? state.personal * 3 : state.personal * 2;
        message += `• ${state.personal}x Caja Personal (${choribolas} choribolas)`;
        if (state.salsa) {
            message += ` - ${getSalsaName(state.salsa)}`;
        }
        message += `%0A`;
    }
    
    if (state.familiar > 0) {
        message += `• ${state.familiar}x Caja Familiar (${state.familiar * 6} choribolas)%0A`;
    }
    
    const subtotal = (state.personal * CONFIG.prices.personal) + (state.familiar * CONFIG.prices.familiar);
    const total = subtotal + CONFIG.prices.domicilio;
    
    message += `%0A💰 *Subtotal:* $${subtotal.toLocaleString()}%0A`;
    message += `🚚 *Domicilio:* $${CONFIG.prices.domicilio.toLocaleString()}%0A`;
    message += `💵 *TOTAL:* $${total.toLocaleString()}%0A%0A`;
    message += `¡Listo para enviar comprobante!`;

    const url = `https://wa.me/${CONFIG.whatsapp}?text=${message}`;
    
    // Resetear pedido
    state.personal = 0;
    state.familiar = 0;
    state.salsa = '';
    document.getElementById('personalQty').textContent = '0';
    document.getElementById('familiarQty').textContent = '0';
    document.querySelectorAll('input[name="salsa"]').forEach(radio => radio.checked = false);
    updateTotal();
    
    window.open(url, '_blank');
    alert(`✅ ¡Pedido creado! Se abrirá WhatsApp. Total: $${total.toLocaleString()}`);
}

function getSalsaName(salsa) {
    const names = {
        'maiz': 'Salsa de Maíz',
        'tocineta': 'Salsa de Tocineta', 
        'ahumada': 'Salsa Ahumada'
    };
    return names[salsa] || salsa;
}

function isSunday() {
    return new Date().getDay() === 0;
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    // Formulario admin
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.id === 'adminModal') {
            closeAdminModal();
        }
    });
    
    console.log("🎯 Todos los event listeners configurados");
});
