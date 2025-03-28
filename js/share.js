let priceList = null;
let products = [];
let cart = [];

// Загрузка данных при старте
function loadPriceList() {
    const urlParams = new URLSearchParams(window.location.search);
    const priceListId = urlParams.get('id');
    
    // Загружаем прайс-лист по ID
    priceListsAPI.getPriceList(priceListId)
        .then(response => {
            if (response.error) {
                document.body.innerHTML = '<h1>Ошибка загрузки прайс-листа</h1>';
                console.error(response.error);
                return;
            }

            priceList = response.data;
            if (!priceList) {
                document.body.innerHTML = '<h1>Прайс-лист не найден</h1>';
                return;
            }
            
            // Загружаем все товары
            const supabase = createSupabaseClient();
            supabase
                .from(DB_TABLES.PRODUCTS)
                .select('*')
                .then(response => {
                    if (response.error) {
                        console.error(response.error);
                        return;
                    }
                    products = response.data || [];
                    renderPriceList();
                });
        });
}

function renderPriceList() {
    document.getElementById('priceListName').textContent = priceList.name;
    const grid = document.getElementById('productsGrid');
    
    grid.innerHTML = priceList.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        
        return `
            <div class="product-card">
                <img src="${product.images?.[product.mainImageIndex] || 'placeholder.png'}" 
                     alt="${product.name}"
                     class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description || ''}</div>
                    <div class="product-price">${item.price} ₽</div>
                    <div class="product-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, -1)">-</button>
                            <input type="number" 
                                   class="quantity-input" 
                                   value="1" 
                                   min="1" 
                                   id="quantity-${item.productId}"
                                   onchange="validateQuantity(this)">
                            <button class="quantity-btn" onclick="updateQuantity(${item.productId}, 1)">+</button>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart(${item.productId})">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateQuantity(productId, delta) {
    const input = document.getElementById(`quantity-${productId}`);
    const newValue = parseInt(input.value) + delta;
    if (newValue >= 1) {
        input.value = newValue;
    }
}

function validateQuantity(input) {
    if (input.value < 1) input.value = 1;
}

function addToCart(productId) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
    const priceListItem = priceList.items.find(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId,
            quantity,
            price: priceListItem.price,
            name: product.name,
            image: product.images?.[product.mainImageIndex] || 'placeholder.png'
        });
    }
    
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        renderCart();
        modal.style.display = 'block';
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽</div>
            </div>
            <button onclick="removeFromCart(${item.productId})" class="delete-button">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    document.getElementById('cartTotal').textContent = total.toLocaleString();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartCount();
    renderCart();
}

function toggleOrderForm() {
    const modal = document.getElementById('orderModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function submitOrder() {
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    toggleCart();
    toggleOrderForm();
}

function sendOrder(e) {
    e.preventDefault();
    
    const orderData = {
        [DB_SCHEMA.ORDERS.PRICE_LIST_ID]: priceList.id,
        [DB_SCHEMA.ORDERS.CUSTOMER_NAME]: document.getElementById('customerName').value,
        [DB_SCHEMA.ORDERS.CUSTOMER_PHONE]: document.getElementById('customerPhone').value,
        [DB_SCHEMA.ORDERS.CUSTOMER_EMAIL]: document.getElementById('customerEmail').value,
        [DB_SCHEMA.ORDERS.CUSTOMER_COMMENT]: document.getElementById('customerComment').value,
        [DB_SCHEMA.ORDERS.ITEMS]: cart,
        [DB_SCHEMA.ORDERS.TOTAL]: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        [DB_SCHEMA.ORDERS.CREATED_AT]: new Date().toISOString(),
        [DB_SCHEMA.ORDERS.STATUS]: ORDER_STATUSES.NEW
    };
    
    // Используем API для сохранения заказа
    ordersAPI.addOrder(orderData)
        .then(response => {
            if (response.error) {
                console.error('Ошибка при отправке заказа:', response.error);
                alert('Произошла ошибка при отправке заказа');
                return;
            }
            
            alert('Заказ успешно отправлен!');
            cart = [];
            updateCartCount();
            toggleOrderForm();
        });
}

// Запускаем загрузку при старте
loadPriceList(); 