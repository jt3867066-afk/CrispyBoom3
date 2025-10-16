// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    whatsapp: "573144751047",
    prices: { personal: 7000, familiar: 21000, domicilio: 2000 }
};

// ==================== ESTADO GLOBAL ====================
let state = { 
    personal: 0, 
    familiar: 0, 
    salsa: '',
    currentAdmin: null,
    loginAttempts: 0
};

// ==================== SISTEMA DE COMENTARIOS ====================
let comments = JSON.parse(localStorage.getItem('crispyboom_comments')) || [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Página cargada - JavaScript ACTIVO");
    
    initializeCarousel();
    initializeEventListeners();
    initializeCommentsSystem();
    updateTotal();
    
    alert("🚀 Página cargada correctamente - Todos los sistemas activos");
});

// ==================== CARRUSEL ====================
function initializeCarousel() {
    let currentIndex = 0;
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        setInterval(() => {
            items.forEach(item => item.classList.remove('active'));
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('active');
        }, 5000);
    }
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Formulario admin
    const adminForm = document.getElementById('adminForm');
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAdminLogin();
        });
    }
    
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.id === 'adminModal') {
            closeAdminModal();
        }
    });
}

// ==================== BOTONES -/+ (100% FUNCIONALES) ====================
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

// ==================== BOTÓN ADMIN (100% FUNCIONAL) ====================
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

function handleAdminLogin() {
    console.log("🔐 Procesando login...");
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    
    if (username === 'patron' && password === '2006.01.28.123') {
        state.currentAdmin = { username: username, name: 'Administrador' };
        state.loginAttempts = 0;
        closeAdminModal();
        showAdminPanel();
        updateAdminMode();
        alert('✅ ¡Acceso concedido! Modo administrador activado.');
    } else {
        state.loginAttempts++;
        alert('❌ Usuario o contraseña incorrectos');
    }
}

function showAdminPanel() {
    document.querySelector('main').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    updateAdminStats();
}

function logoutAdmin() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        state.currentAdmin = null;
        document.getElementById('adminPanel').style.display = 'none';
        document.querySelector('main').style.display = 'block';
        updateAdminMode();
        alert('👋 Sesión de administrador cerrada');
    }
}

// ==================== SISTEMA DE PEDIDOS WHATSAPP ====================
function placeOrder() {
    console.log("🛒 Procesando pedido...");
    
    if (state.personal === 0 && state.familiar === 0) {
        alert('❌ Por favor agrega productos a tu pedido');
        return;
    }

    if (state.personal > 0 && !state.salsa) {
        alert('❌ Por favor selecciona una salsa para la caja personal');
        return;
    }

    const name = prompt('👤 ¿Cuál es tu nombre completo?');
    if (!name) return;
    
    const phone = prompt('📞 ¿Tu número de WhatsApp? (Ej: 3001234567)');
    if (!phone) return;
    
    const address = prompt('📍 ¿Tu barrio y dirección para el domicilio?');
    if (!address) return;
    
    const notes = prompt('📝 ¿Alguna nota adicional? (Ej: Sin picante, llamar antes...)\n(Presiona Cancelar si no hay notas)');

    sendWhatsAppOrder({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes ? notes.trim() : ''
    });
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
        const choribolasCount = isSunday() ? state.personal * 3 : state.personal * 2;
        message += `• ${state.personal}x Caja Personal (${choribolasCount} choribolas)`;
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
    message += `¡Listo para enviar el comprobante de pago!`;

    const url = `https://wa.me/${CONFIG.whatsapp}?text=${message}`;
    
    // Resetear pedido
    resetOrder();
    
    window.open(url, '_blank');
    alert(`✅ ¡Pedido creado! Se abrirá WhatsApp para que envíes tu comprobante.\n\nTotal: $${total.toLocaleString()}`);
}

function getSalsaName(salsa) {
    const names = {
        'maiz': 'Salsa de Maíz',
        'tocineta': 'Salsa de Tocineta', 
        'ahumada': 'Salsa Ahumada'
    };
    return names[salsa] || salsa;
}

function resetOrder() {
    state.personal = 0;
    state.familiar = 0;
    state.salsa = '';
    document.getElementById('personalQty').textContent = '0';
    document.getElementById('familiarQty').textContent = '0';
    document.querySelectorAll('input[name="salsa"]').forEach(radio => radio.checked = false);
    updateTotal();
}

// ==================== SISTEMA DE COMENTARIOS ====================
function initializeCommentsSystem() {
    loadComments();
    setupCommentForm();
    updateAdminMode();
}

function setupCommentForm() {
    const commentForm = document.getElementById('commentForm');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('commentRating');
    
    // Sistema de estrellas
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            
            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('active');
            }
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('active');
            }
        });
    });
    
    // Reset estrellas al quitar mouse
    document.querySelector('.star-rating').addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingInput.value);
        stars.forEach(s => s.classList.remove('active'));
        for (let i = 0; i < currentRating; i++) {
            stars[i].classList.add('active');
        }
    });
    
    // Enviar comentario
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('commentName').value.trim();
        const text = document.getElementById('commentText').value.trim();
        const rating = parseInt(ratingInput.value);
        
        if (!name || !text) {
            alert('Por favor completa tu nombre y comentario');
            return;
        }
        
        if (rating === 0) {
            alert('Por favor califica con estrellas');
            return;
        }
        
        addComment(name, text, rating);
        commentForm.reset();
        ratingInput.value = 0;
        stars.forEach(s => s.classList.remove('active'));
    });
}

function addComment(name, text, rating) {
    const newComment = {
        id: Date.now().toString(),
        user: name,
        text: text,
        rating: rating,
        date: new Date().toISOString(),
        replies: []
    };
    
    comments.unshift(newComment);
    saveComments();
    loadComments();
    
    alert('¡Gracias por tu comentario! 🎉');
}

function addReply(commentId, text, isAdmin = false) {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        const reply = {
            id: Date.now().toString(),
            user: isAdmin ? 'Administrador 👑' : 'Cliente',
            text: text,
            date: new Date().toISOString(),
            isAdmin: isAdmin
        };
        
        comment.replies.push(reply);
        saveComments();
        loadComments();
    }
}

function deleteComment(commentId) {
    if (!state.currentAdmin) {
        alert('Solo el administrador puede eliminar comentarios');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
        comments = comments.filter(comment => comment.id !== commentId);
        saveComments();
        loadComments();
        updateAdminStats();
    }
}

function loadComments() {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <p>No hay comentarios aún. ¡Sé el primero en opinar!</p>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <div class="comment-header">
                <div class="comment-user">
                    <div class="user-avatar">${comment.user.charAt(0).toUpperCase()}</div>
                    <div class="user-info">
                        <h4>${comment.user}</h4>
                        <div class="comment-date">${formatDate(comment.date)}</div>
                    </div>
                </div>
                <div class="comment-rating">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</div>
            </div>
            
            <div class="comment-content">
                ${comment.text}
            </div>
            
            <div class="comment-actions">
                <button class="reply-btn" onclick="showReplyForm('${comment.id}')">
                    <i class="fas fa-reply"></i> Responder
                </button>
                <button class="delete-btn admin-only" onclick="deleteComment('${comment.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
            
            <div class="reply-form" id="replyForm-${comment.id}">
                <textarea id="replyText-${comment.id}" placeholder="Escribe tu respuesta..."></textarea>
                <div class="reply-actions">
                    <button class="btn btn-primary" onclick="submitReply('${comment.id}')">
                        <i class="fas fa-paper-plane"></i> Enviar Respuesta
                    </button>
                    <button class="btn btn-outline" onclick="hideReplyForm('${comment.id}')">Cancelar</button>
                </div>
            </div>
            
            ${comment.replies.length > 0 ? `
                <div class="replies-list">
                    ${comment.replies.map(reply => `
                        <div class="reply-card">
                            <div class="reply-header">
                                <span class="reply-user ${reply.isAdmin ? 'admin-reply' : ''}">
                                    ${reply.user}
                                </span>
                                <span class="reply-date">${formatDate(reply.date)}</span>
                            </div>
                            <div class="reply-content">${reply.text}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function showReplyForm(commentId) {
    document.querySelectorAll('.reply-form').forEach(form => {
        form.style.display = 'none';
    });
    document.getElementById(`replyForm-${commentId}`).style.display = 'block';
}

function hideReplyForm(commentId) {
    document.getElementById(`replyForm-${commentId}`).style.display = 'none';
}

function submitReply(commentId) {
    const replyText = document.getElementById(`replyText-${commentId}`).value.trim();
    if (!replyText) {
        alert('Por favor escribe una respuesta');
        return;
    }
    
    const isAdmin = !!state.currentAdmin;
    addReply(commentId, replyText, isAdmin);
    hideReplyForm(commentId);
}

function saveComments() {
    localStorage.setItem('crispyboom_comments', JSON.stringify(comments));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateAdminMode() {
    if (state.currentAdmin) {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }
}

function updateAdminStats() {
    document.getElementById('totalComments').textContent = comments.length;
    document.getElementById('pendingComments').textContent = comments.length; // Por simplicidad
}

// ==================== FUNCIONES UTILITARIAS ====================
function isSunday() {
    return new Date().getDay() === 0;
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
