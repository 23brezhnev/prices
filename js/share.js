let priceList = null;
let products = [];
let cart = [];

// Загрузка данных при старте
function loadPriceList() {
    try {
        // Проверяем, что все необходимые зависимости загружены
        if (typeof DB_TABLES === 'undefined' || typeof priceListsAPI === 'undefined' ||
            typeof createSupabaseClient === 'undefined') {
            showError('Не удалось загрузить необходимые модули. Пожалуйста, обновите страницу.');
            console.error('API или схема БД не загружены');
            return;
        }
        
        // Получаем ID прайс-листа из URL
        const urlParams = new URLSearchParams(window.location.search);
        const priceListId = urlParams.get('id');
        
        if (!priceListId) {
            showError('Не указан ID прайс-листа');
            return;
        }
        
        // Показываем индикатор загрузки
        showLoading(true);
        
        // Загружаем прайс-лист по ID
        priceListsAPI.getPriceList(priceListId)
            .then(response => {
                if (response.error) {
                    showError('Ошибка загрузки прайс-листа: ' + response.error.message);
                    console.error(response.error);
                    return;
                }

                priceList = response.data;
                if (!priceList) {
                    showError('Прайс-лист не найден');
                    return;
                }
                
                // Загружаем все товары
                const supabase = createSupabaseClient();
                if (!supabase) {
                    showError('Не удалось подключиться к базе данных');
                    return;
                }
                
                supabase
                    .from(DB_TABLES.PRODUCTS)
                    .select('*')
                    .then(response => {
                        // Скрываем индикатор загрузки
                        showLoading(false);
                        
                        if (response.error) {
                            showError('Ошибка загрузки товаров: ' + response.error.message);
                            console.error(response.error);
                            return;
                        }
                        
                        products = response.data || [];
                        
                        if (products.length === 0) {
                            showMessage('В этом прайс-листе пока нет товаров');
                        } else {
                            renderPriceList();
                        }
                    })
                    .catch(error => {
                        showLoading(false);
                        showError('Произошла ошибка при загрузке товаров');
                        console.error('Ошибка при запросе товаров:', error);
                    });
            })
            .catch(error => {
                showLoading(false);
                showError('Произошла ошибка при загрузке прайс-листа');
                console.error('Ошибка при запросе прайс-листа:', error);
            });
    } catch (error) {
        showError('Произошла неожиданная ошибка');
        console.error('Неожиданная ошибка:', error);
    }
}

// Утилиты для отображения сообщений
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div style="color: red; padding: 20px; text-align: center;">
                <h2>Ошибка</h2>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
}

function showMessage(message) {
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>${message}</p>
            </div>
        `;
    }
}

function showLoading(isLoading) {
    const loadingEl = document.getElementById('loading');
    if (!loadingEl) {
        // Создаем элемент, если его нет
        const container = document.querySelector('.container');
        if (container && isLoading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading';
            loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999;';
            loadingDiv.innerHTML = '<div style="padding: 20px; background: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">Загрузка...</div>';
            container.appendChild(loadingDiv);
        }
    } else {
        loadingEl.style.display = isLoading ? 'flex' : 'none';
    }
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
    
    try {
        // Валидация формы
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;
        
        if (!customerName || !customerPhone || !customerEmail) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        if (cart.length === 0) {
            alert('Корзина пуста');
            return;
        }
        
        // Показываем индикатор загрузки
        showLoading(true);
        
        const orderData = {
            [DB_SCHEMA.ORDERS.PRICE_LIST_ID]: priceList.id,
            [DB_SCHEMA.ORDERS.CUSTOMER_NAME]: customerName,
            [DB_SCHEMA.ORDERS.CUSTOMER_PHONE]: customerPhone,
            [DB_SCHEMA.ORDERS.CUSTOMER_EMAIL]: customerEmail,
            [DB_SCHEMA.ORDERS.CUSTOMER_COMMENT]: document.getElementById('customerComment').value,
            [DB_SCHEMA.ORDERS.ITEMS]: cart,
            [DB_SCHEMA.ORDERS.TOTAL]: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            [DB_SCHEMA.ORDERS.CREATED_AT]: new Date().toISOString(),
            [DB_SCHEMA.ORDERS.STATUS]: ORDER_STATUSES.NEW
        };
        
        // Проверяем доступность API
        if (typeof ordersAPI === 'undefined' || typeof ordersAPI.addOrder !== 'function') {
            showLoading(false);
            alert('Не удалось отправить заказ. API недоступен.');
            console.error('API заказов не определен');
            return;
        }
        
        // Используем API для сохранения заказа
        ordersAPI.addOrder(orderData)
            .then(response => {
                showLoading(false);
                
                if (response.error) {
                    console.error('Ошибка при отправке заказа:', response.error);
                    alert('Произошла ошибка при отправке заказа: ' + response.error.message);
                    return;
                }
                
                alert('Заказ успешно отправлен!');
                cart = [];
                updateCartCount();
                toggleOrderForm();
                
                // Очищаем форму
                document.getElementById('orderForm').reset();
            })
            .catch(error => {
                showLoading(false);
                console.error('Ошибка при отправке заказа:', error);
                alert('Произошла ошибка при отправке заказа');
            });
    } catch (error) {
        showLoading(false);
        console.error('Неожиданная ошибка при отправке заказа:', error);
        alert('Произошла неожиданная ошибка');
    }
}

// Запускаем загрузку при старте
loadPriceList(); 