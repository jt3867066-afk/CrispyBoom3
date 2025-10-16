// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    whatsapp: "573144751047",
    prices: { personal: 7000, familiar: 21000, domicilio: 2000 }
};

// ==================== ESTADO ====================
let state = { 
    personal: 0, 
    familiar: 0, 
    salsa: '' 
};

// ==================== BOTONES -/+ (GARANTIZADOS) ====================
function updateQuantity(type, change) {
    console.log("🔘 BOTÓN PRESIONADO:", type, change);
    
    if (type === 'personal') {
        state.personal = Math.max(0, state.personal + change);
        document.getElementById('personalQty').textContent = state.personal;
    } else if (type === 'familiar') {
        state.familiar = Math.max(0, state.familiar + change);
        document.getElementById('familiarQty').textContent = state.familiar;
    }
    
    updateTotal();
}

function selectSalsa(salsa) {
    console.log("🌶️ Salsa seleccionada:", salsa);
    state.salsa = salsa;
}

function updateTotal() {
    let subtotal = (state.personal * CONFIG.prices.personal) + (state.familiar * CONFIG.prices.familiar);
    let total = subtotal + (subtotal > 0 ? CONFIG.prices.domicilio : 0);
    document.getElementById('totalAmount').textContent = `Total: $${total.toLocaleString()}`;
}

// ==================== BOTÓN ADMIN (GARANTIZADO) ====================
function showAdminModal() {
    console.log("🔓 Abriendo modal admin");
    document.getElementById('adminModal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
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

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página cargada - JavaScript ACTIVO");
    
    // Carrusel automático
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        setInterval(() => {
            items.forEach(item => item.classList.remove('active'));
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('active');
        }, 5000);
    }
    
    // Formulario admin
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUser').value;
            const password = document.getElementById('adminPass').value;
            
            if (username === 'patron' && password === '2006.01.28.123') {
                alert('✅ ¡Acceso concedido!');
                closeAdminModal();
                showAdminPanel();
            } else {
                alert('❌ Usuario o contraseña incorrectos');
            }
        });
    }
    
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.id === 'adminModal') {
            closeAdminModal();
        }
    });
    
    alert("🚀 JavaScript cargado - Botones -/+ y Admin deberían funcionar");
});

// ==================== FUNCIONES ADMIN ====================
function showAdminPanel() {
    document.querySelector('main').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
}

function logoutAdmin() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        document.getElementById('adminPanel').style.display = 'none';
        document.querySelector('main').style.display = 'block';
    }
}

// ==================== FUNCIONES EXTRAS ====================
function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
}

function placeOrder() {
    console.log("🛒 Procesando pedido...");
    // Tu código de pedidos aquí
}
