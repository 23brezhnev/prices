app.component('products-section', {
    template: `
        <div class="section">
            <div class="section-header">
                <h2>Список товаров</h2>
                <button @click="$emit('add-product')" class="add-button">
                    <i class="fas fa-plus"></i> Добавить новый товар
                </button>
            </div>

            <div v-if="!products.length" class="empty-state">
                <p>Список товаров пуст</p>
            </div>
            <table v-else class="products-table">
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
                    <tr v-for="product in products" :key="product.id">
                        <td class="product-image-cell">
                            <img 
                                :src="product.images?.[product.mainImageIndex] || 'placeholder.png'"
                                :alt="product.name"
                                @click="$emit('edit-product', product)"
                            >
                        </td>
                        <td>{{ product.name }}</td>
                        <td>{{ product.description || 'Нет описания' }}</td>
                        <td>{{ formatPrice(product.basePrice) }} ₽</td>
                        <td class="actions">
                            <div class="dropdown">
                                <button class="dropdown-toggle" @click="toggleDropdown($event)">
                                    Действия <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="dropdown-menu">
                                    <button @click="$emit('edit-product', product)">
                                        <i class="fas fa-edit"></i> Изменить
                                    </button>
                                    <button class="delete-action" @click="confirmDelete(product)">
                                        <i class="fas fa-trash"></i> Удалить
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    props: {
        products: {
            type: Array,
            required: true
        }
    },
    setup(props, { emit }) {
        const formatPrice = (price) => {
            return new Intl.NumberFormat('ru-RU').format(price);
        };

        const toggleDropdown = (event) => {
            event.stopPropagation();
            const dropdown = event.target.closest('.dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            // Закрываем все открытые меню
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            
            menu.classList.toggle('show');
        };

        const confirmDelete = (product) => {
            if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
                emit('delete-product', product.id);
            }
        };

        // Закрытие всех меню при клике вне них
        onMounted(() => {
            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            });
        });

        return {
            formatPrice,
            toggleDropdown,
            confirmDelete
        };
    }
}); 