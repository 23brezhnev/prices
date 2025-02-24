// Структуры данных
let products = [];
let priceLists = [];
let editingProductId = null;
let editingPriceListId = null;

// Добавим новые переменные для работы с изображениями
let currentImages = [];
let mainImageIndex = 0;

// Добавим переменную для временного хранения товаров нового прайс-листа
let tempPriceListItems = [];

// В начале файла добавим проверку подключения
async function checkConnection() {
    try {
        const { data, error } = await supabase.from('products').select('count');
        if (error) throw error;
        console.log('Подключение к Supabase успешно');
    } catch (error) {
        console.error('Ошибка подключения к Supabase:', error);
        alert('Ошибка подключения к базе данных');
    }
}

// Вызовем функцию перед загрузкой данных
checkConnection().then(() => {
    loadData();
});

// Загрузка данных из Supabase
async function loadData() {
    try {
        // Загружаем товары
        const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
        
        if (productsError) throw productsError;
        products = productsData || [];
        
        // Загружаем прайс-листы
        const { data: priceListsData, error: priceListsError } = await supabase
            .from('price_lists')
            .select('*')
        
        if (priceListsError) throw priceListsError;
        priceLists = priceListsData || [];
        
        renderProducts();
        renderPriceLists();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Ошибка при загрузке данных');
    }
}

// Сохранение данных в Supabase
function saveData() {
    supabase.from('products').set(products);
    supabase.from('price_lists').set(priceLists);
}

// Обновим функцию обработки загрузки изображений
function handleImageUpload(event) {
    const files = event.target.files;
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImages.push(e.target.result);
            renderImageGallery();
        };
        reader.readAsDataURL(file);
    });
}

// Функция отрисовки галереи изображений
function renderImageGallery() {
    const gallery = document.getElementById('imageGallery');
    const uploadContainer = gallery.querySelector('.image-upload-container');
    
    // Удаляем все изображения, оставляя контейнер для загрузки
    while (gallery.firstChild) {
        if (gallery.firstChild === uploadContainer) break;
        gallery.removeChild(gallery.firstChild);
    }
    
    currentImages.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = `image-gallery-item ${index === mainImageIndex ? 'main' : ''}`;
        item.innerHTML = `
            <img src="${image}" alt="Фото товара ${index + 1}">
            <div class="image-gallery-actions">
                <button onclick="setMainImage(${index})">Главное</button>
                <button onclick="removeImage(${index})">Удалить</button>
            </div>
        `;
        gallery.insertBefore(item, uploadContainer);
    });
}

// Установка главного изображения
function setMainImage(index) {
    mainImageIndex = index;
    renderImageGallery();
}

// Удаление изображения
function removeImage(index) {
    currentImages.splice(index, 1);
    if (mainImageIndex >= currentImages.length) {
        mainImageIndex = currentImages.length - 1;
    }
    renderImageGallery();
}

// Обновим функцию открытия модального окна
function openProductModal(productId = null, viewOnly = false) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    // Очищаем форму и изображения
    form.reset();
    currentImages = [];
    mainImageIndex = 0;
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        modalTitle.textContent = viewOnly ? 'Информация о товаре' : 'Редактировать товар';
        document.getElementById('productName').value = product.name;
        document.getElementById('basePrice').value = product.basePrice;
        document.getElementById('productDescription').value = product.description || '';
        
        // Загружаем изображения товара
        currentImages = product.images || [];
        mainImageIndex = product.mainImageIndex || 0;
        
        // Блокируем поля при просмотре
        if (viewOnly) {
            form.querySelectorAll('input, textarea').forEach(input => input.disabled = true);
            form.querySelector('button[type="submit"]').style.display = 'none';
        } else {
            form.querySelectorAll('input, textarea').forEach(input => input.disabled = false);
            form.querySelector('button[type="submit"]').style.display = 'block';
        }
        
        editingProductId = viewOnly ? null : productId;
    } else {
        modalTitle.textContent = 'Добавить товар';
        editingProductId = null;
        form.querySelectorAll('input, textarea').forEach(input => input.disabled = false);
        form.querySelector('button[type="submit"]').style.display = 'block';
    }
    
    renderImageGallery();
    modal.style.display = 'block';
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

// Закрытие по клику вне модального окна
window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Обновим обработчик формы товара
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        basePrice: parseFloat(document.getElementById('basePrice').value),
        description: document.getElementById('productDescription').value.trim(),
        images: currentImages || [], // Добавим значение по умолчанию
        mainImageIndex: mainImageIndex || 0 // Добавим значение по умолчанию
    };
    
    try {
        if (editingProductId) {
            // Обновляем существующий товар
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProductId)
                .select() // Добавим select() для получения обновленных данных
            
            if (error) throw error;
        } else {
            // Добавляем новый товар
            const { error } = await supabase
                .from('products')
                .insert([productData])
                .select() // Добавим select() для получения вставленных данных
            
            if (error) throw error;
        }
        
        // Очищаем состояние
        currentImages = [];
        mainImageIndex = 0;
        editingProductId = null;
        
        await loadData(); // Дождемся загрузки данных
        document.getElementById('productModal').style.display = 'none';
    } catch (error) {
        console.error('Ошибка сохранения товара:', error);
        alert('Ошибка при сохранении товара: ' + error.message);
    }
});

// Обновим функцию открытия модального окна прайс-листа
function openPriceListModal(priceListId = null, viewOnly = false) {
    const modal = document.getElementById('priceListModal');
    const modalTitle = document.getElementById('priceListModalTitle');
    const form = document.getElementById('priceListForm');
    
    form.reset();
    editingPriceListId = priceListId;
    
    if (priceListId) {
        const priceList = priceLists.find(pl => pl.id === priceListId);
        if (!priceList) return;
        
        modalTitle.textContent = viewOnly ? 'Просмотр прайс-листа' : 'Редактировать прайс-лист';
        document.getElementById('priceListName').value = priceList.name;
        
        renderProductsSelection(priceList.items);
        
        if (viewOnly) {
            form.querySelectorAll('input, button').forEach(el => el.disabled = true);
        }
    } else {
        modalTitle.textContent = 'Создать прайс-лист';
        renderProductsSelection([]);
    }
    
    modal.style.display = 'block';
}

// Обновим функцию отображения списка товаров для выбора
function renderProductsSelection(existingItems = []) {
    const tbody = document.getElementById('productsSelectionBody');
    
    tbody.innerHTML = products.map(product => {
        const existingItem = existingItems.find(item => item.productId === product.id);
        const newPrice = existingItem ? existingItem.price : '';
        const quantity = existingItem ? existingItem.quantity : 1;
        
        return `
            <tr class="product-selection-row">
                <td>
                    <input type="checkbox" 
                           class="product-checkbox" 
                           data-product-id="${product.id}"
                           ${existingItem ? 'checked' : ''}>
                </td>
                <td>
                    <div class="product-info">
                        <img src="${product.images?.[product.mainImageIndex] || 'placeholder.png'}" 
                             alt="${product.name}">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>
                    <span class="current-price" data-base-price="${product.basePrice}">
                        ${product.basePrice} руб.
                    </span>
                </td>
                <td>
                    <input type="number" 
                           class="new-price-input" 
                           data-product-id="${product.id}"
                           value="${newPrice}"
                           min="0"
                           step="0.01"
                           onchange="updatePriceDisplay(this)">
                </td>
                <td>
                    <input type="number" 
                           class="quantity-input" 
                           data-product-id="${product.id}"
                           value="${quantity}"
                           min="1"
                           step="1"
                           onchange="updateTotalSum(this)">
                </td>
                <td>
                    <span class="total-sum">
                        ${((newPrice || product.basePrice) * quantity).toLocaleString()} руб.
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Добавим функцию обновления суммы
function updateTotalSum(input) {
    const row = input.closest('tr');
    const priceInput = row.querySelector('.new-price-input');
    const currentPrice = row.querySelector('.current-price');
    const totalSumSpan = row.querySelector('.total-sum');
    
    const price = parseFloat(priceInput.value) || parseFloat(currentPrice.dataset.basePrice);
    const quantity = parseInt(input.value) || 0;
    
    totalSumSpan.textContent = `${(price * quantity).toLocaleString()} руб.`;
    
    // Автоматически отмечаем товар при изменении количества
    if (quantity > 0) {
        row.querySelector('.product-checkbox').checked = true;
    }
}

// Обновим функцию обновления отображения цен
function updatePriceDisplay(input) {
    const row = input.closest('tr');
    const currentPrice = row.querySelector('.current-price');
    const basePrice = parseFloat(currentPrice.dataset.basePrice);
    const newPrice = parseFloat(input.value);
    const quantityInput = row.querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value) || 1;
    
    if (newPrice && newPrice < basePrice) {
        currentPrice.classList.add('strikethrough');
    } else {
        currentPrice.classList.remove('strikethrough');
    }
    
    // Обновляем общую сумму
    const totalSumSpan = row.querySelector('.total-sum');
    totalSumSpan.textContent = `${((newPrice || basePrice) * quantity).toLocaleString()} руб.`;
    
    // Автоматически отмечаем товар
    if (newPrice) {
        row.querySelector('.product-checkbox').checked = true;
    }
}

// Функция выбора всех товаров
function toggleAllProducts() {
    const selectAll = document.getElementById('selectAll');
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// Обновим обработчик формы создания/редактирования прайс-листа
document.getElementById('priceListForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('priceListName').value;
    const selectedProducts = [];
    
    document.querySelectorAll('.product-checkbox:checked').forEach(checkbox => {
        const productId = parseInt(checkbox.dataset.productId);
        const row = checkbox.closest('tr');
        const priceInput = row.querySelector('.new-price-input');
        const quantityInput = row.querySelector('.quantity-input');
        
        selectedProducts.push({
            productId,
            price: parseFloat(priceInput.value) || product.basePrice,
            quantity: parseInt(quantityInput.value) || 1
        });
    });
    
    try {
        if (editingPriceListId) {
            // Обновляем существующий прайс-лист
            const { error } = await supabase
                .from('price_lists')
                .update({ 
                    name,
                    items: selectedProducts 
                })
                .eq('id', editingPriceListId)
            
            if (error) throw error;
        } else {
            // Создаем новый прайс-лист
            const { error } = await supabase
                .from('price_lists')
                .insert([{
                    name,
                    items: selectedProducts
                }])
            
            if (error) throw error;
        }
        
        loadData(); // Перезагружаем данные
        closePriceListModal();
    } catch (error) {
        console.error('Ошибка сохранения прайс-листа:', error);
        alert('Ошибка при сохранении прайс-листа');
    }
});

// Добавим функцию для создания выпадающего меню
function createDropdownMenu(actions) {
    return `
        <div class="dropdown">
            <button class="dropdown-toggle" onclick="toggleDropdown(event)">
                Действия <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
                ${actions}
            </div>
        </div>
    `;
}

// Функция для переключения видимости выпадающего меню
function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = event.target.closest('.dropdown');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    // Закрываем все открытые меню
    document.querySelectorAll('.dropdown-menu.show').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    menu.classList.toggle('show');
}

// Закрытие всех меню при клике вне них
document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });
});

// Обновим отображение действий в таблице товаров
function renderProducts() {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>Список товаров пуст</p>';
        return;
    }
    
    productsList.innerHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>Фото</th>
                    <th>Название товара</th>
                    <th>Описание</th>
                    <th>Базовая цена</th>
                    <th class="actions">Действия</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td class="product-image-cell">
                            <img src="${product.images?.[product.mainImageIndex] || 'placeholder.png'}" 
                                 alt="${product.name}"
                                 onclick="openProductModal(${product.id}, true)">
                        </td>
                        <td>${product.name}</td>
                        <td>${product.description || 'Нет описания'}</td>
                        <td>${product.basePrice} руб.</td>
                        <td class="actions">
                            ${createDropdownMenu(`
                                <button onclick="openProductModal(${product.id}, true)">
                                    <i class="fas fa-info-circle"></i> Информация
                                </button>
                                <button onclick="openProductModal(${product.id})">
                                    <i class="fas fa-edit"></i> Изменить
                                </button>
                                <button class="delete-action" onclick="deleteProduct(${product.id})">
                                    <i class="fas fa-trash"></i> Удалить
                                </button>
                            `)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Функции для работы с модальным окном прайс-листа
function closePriceListModal() {
    document.getElementById('priceListModal').style.display = 'none';
}

// Обновим функцию отображения прайс-листов
function renderPriceLists() {
    const container = document.getElementById('priceListsContainer');
    
    if (priceLists.length === 0) {
        container.innerHTML = '<p class="empty-message">Список прайс-листов пуст</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="price-lists-table">
            <thead>
                <tr>
                    <th>Название прайс-листа</th>
                    <th>Количество товаров</th>
                    <th>Количество единиц</th>
                    <th>Общая сумма</th>
                    <th class="actions">Действия</th>
                </tr>
            </thead>
            <tbody>
                ${priceLists.map(priceList => {
                    const itemsCount = priceList.items.length;
                    const totalUnits = priceList.items.reduce((sum, item) => sum + item.quantity, 0);
                    const totalSum = priceList.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    return `
                        <tr>
                            <td>${priceList.name}</td>
                            <td>${itemsCount} шт.</td>
                            <td>${totalUnits} ед.</td>
                            <td>${totalSum.toLocaleString()} ₽</td>
                            <td class="actions">
                                ${createDropdownMenu(`
                                    <button onclick="viewPriceList(${priceList.id})">
                                        <i class="fas fa-eye"></i> Просмотр
                                    </button>
                                    <button onclick="editPriceList(${priceList.id})">
                                        <i class="fas fa-edit"></i> Редактировать
                                    </button>
                                    <button onclick="shareList(${priceList.id})">
                                        <i class="fas fa-share-alt"></i> Поделиться
                                    </button>
                                    <button class="delete-action" onclick="deletePriceList(${priceList.id})">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                `)}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Обновим функцию просмотра прайс-листа
function viewPriceList(priceListId) {
    // Открываем в новой вкладке страницу share.html с нужным ID
    const shareLink = getShareLink(priceListId);
    window.open(shareLink, '_blank');
}

function editPriceList(priceListId) {
    const priceList = priceLists.find(pl => pl.id === priceListId);
    if (!priceList) return;
    
    // Здесь можно добавить логику для редактирования прайс-листа
    openPriceListModal(priceListId);
}

// Обновим функцию удаления товара
async function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    try {
        // Удаляем товар
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)
        
        if (deleteError) throw deleteError;
        
        // Удаляем товар из всех прайс-листов
        const { data: priceLists, error: listsError } = await supabase
            .from('price_lists')
            .select('*')
        
        if (listsError) throw listsError;
        
        for (const list of priceLists) {
            const updatedItems = list.items.filter(item => item.productId !== productId);
            const { error: updateError } = await supabase
                .from('price_lists')
                .update({ items: updatedItems })
                .eq('id', list.id)
            
            if (updateError) throw updateError;
        }
        
        loadData(); // Перезагружаем данные
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка при удалении товара');
    }
}

// Добавим обработку навигации
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок и секций
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
        
        // Добавляем активный класс выбранной кнопке
        button.classList.add('active');
        
        // Показываем соответствующую секцию
        const sectionId = button.dataset.section + '-section';
        document.getElementById(sectionId).classList.add('active');
    });
});

// Функция обновления списка доступных товаров
function updateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    const availableProducts = products.filter(product => 
        !tempPriceListItems.some(item => item.productId === product.id)
    );
    
    productSelect.innerHTML = `
        <option value="">Выберите товар</option>
        ${availableProducts.map(product => `
            <option value="${product.id}">${product.name} (${product.basePrice} руб.)</option>
        `).join('')}
    `;
}

// Обновим функцию добавления товара в прайс-лист
function addProductToPriceList() {
    const productId = parseInt(document.getElementById('productSelect').value);
    const customPrice = parseFloat(document.getElementById('customPrice').value);
    
    if (!productId || !customPrice) {
        alert('Выберите товар и укажите цену');
        return;
    }
    
    // Добавляем товар во временный список
    tempPriceListItems.push({
        productId,
        price: customPrice
    });
    
    // Обновляем отображение и список доступных товаров
    renderPriceListItems();
    updateProductSelect();
    
    // Очищаем поля
    document.getElementById('productSelect').value = '';
    document.getElementById('customPrice').value = '';
}

// Обновим функцию отображения товаров в прайс-листе
function renderPriceListItems() {
    const container = document.getElementById('priceListItems');
    
    if (!tempPriceListItems.length) {
        container.innerHTML = '<p>В прайс-листе пока нет товаров</p>';
        return;
    }
    
    container.innerHTML = tempPriceListItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        
        return `
            <div class="price-list-item">
                <div class="item-info">
                    <img src="${product.images?.[product.mainImageIndex] || 'placeholder.png'}" 
                         alt="${product.name}">
                    <span class="item-name">${product.name}</span>
                    <span class="item-base-price">${product.basePrice} руб.</span>
                    <span class="item-price">${item.price} руб.</span>
                </div>
                <button onclick="removeItemFromPriceList(${item.productId})" 
                        class="delete-button"
                        type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Обновим функцию удаления товара из прайс-листа
function removeItemFromPriceList(productId) {
    tempPriceListItems = tempPriceListItems.filter(item => item.productId !== productId);
    renderPriceListItems();
    updateProductSelect();
}

// Добавим функцию генерации ссылки для шаринга
function getShareLink(priceListId) {
    // Используем window.location.origin вместо разделения URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/share.html?id=${priceListId}`;
}

// Добавим функцию копирования ссылки
function shareList(priceListId) {
    const link = getShareLink(priceListId);
    navigator.clipboard.writeText(link).then(() => {
        alert('Ссылка скопирована в буфер обмена');
    }).catch(err => {
        console.error('Ошибка при копировании ссылки:', err);
        prompt('Скопируйте ссылку:', link);
    });
}

// Обновим функцию удаления прайс-листа
async function deletePriceList(priceListId) {
    if (!confirm('Вы уверены, что хотите удалить этот прайс-лист?')) return;
    
    try {
        // Удаляем прайс-лист
        const { error: deleteError } = await supabase
            .from('price_lists')
            .delete()
            .eq('id', priceListId)
        
        if (deleteError) throw deleteError;
        
        loadData(); // Перезагружаем данные
    } catch (error) {
        console.error('Ошибка удаления прайс-листа:', error);
        alert('Ошибка при удалении прайс-листа');
    }
} 