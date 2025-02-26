app.component('price-lists-section', {
    template: `
        <div class="section">
            <div class="section-header">
                <h2>Список прайс-листов</h2>
                <button @click="$emit('add-price-list')" class="add-button">
                    <i class="fas fa-plus"></i> Создать прайс-лист
                </button>
            </div>

            <div v-if="!priceLists.length" class="empty-state">
                <p>Список прайс-листов пуст</p>
            </div>
            <table v-else class="price-lists-table">
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
                    <tr v-for="priceList in priceLists" :key="priceList.id">
                        <td>{{ priceList.name }}</td>
                        <td>{{ getItemsCount(priceList) }} шт.</td>
                        <td>{{ getTotalUnits(priceList) }} ед.</td>
                        <td>{{ formatPrice(getTotalSum(priceList)) }} ₽</td>
                        <td class="actions">
                            <div class="dropdown">
                                <button class="dropdown-toggle" @click="toggleDropdown($event)">
                                    Действия <i class="fas fa-chevron-down"></i>
                                </button>
                                <div class="dropdown-menu">
                                    <button @click="$emit('edit-price-list', priceList)">
                                        <i class="fas fa-edit"></i> Изменить
                                    </button>
                                    <button @click="$emit('share-price-list', priceList.id)">
                                        <i class="fas fa-share-alt"></i> Поделиться
                                    </button>
                                    <button class="delete-action" @click="confirmDelete(priceList)">
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
        priceLists: {
            type: Array,
            required: true
        },
        products: {
            type: Array,
            required: true
        }
    },
    setup(props, { emit }) {
        const formatPrice = (price) => {
            return new Intl.NumberFormat('ru-RU').format(price);
        };

        const getItemsCount = (priceList) => {
            return priceList.items?.length || 0;
        };

        const getTotalUnits = (priceList) => {
            return priceList.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        };

        const getTotalSum = (priceList) => {
            return priceList.items?.reduce((sum, item) => {
                const product = props.products.find(p => p.id === item.productId);
                return sum + (item.price || product?.basePrice || 0) * (item.quantity || 1);
            }, 0) || 0;
        };

        const toggleDropdown = (event) => {
            event.stopPropagation();
            const dropdown = event.target.closest('.dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
            
            menu.classList.toggle('show');
        };

        const confirmDelete = (priceList) => {
            if (confirm(`Вы уверены, что хотите удалить прайс-лист "${priceList.name}"?`)) {
                emit('delete-price-list', priceList.id);
            }
        };

        onMounted(() => {
            document.addEventListener('click', () => {
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            });
        });

        return {
            formatPrice,
            getItemsCount,
            getTotalUnits,
            getTotalSum,
            toggleDropdown,
            confirmDelete
        };
    }
}); 