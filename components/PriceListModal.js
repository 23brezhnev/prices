app.component('price-list-modal', {
    template: `
        <div class="modal" @click.self="$emit('close')">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h2>{{ isEditing ? 'Редактировать прайс-лист' : 'Создать прайс-лист' }}</h2>
                    <span class="close" @click="$emit('close')">&times;</span>
                </div>
                <form @submit.prevent="handleSubmit">
                    <input 
                        type="text" 
                        v-model="form.name"
                        placeholder="Название прайс-листа" 
                        required
                    >
                    
                    <div class="products-selection">
                        <table class="products-selection-table">
                            <thead>
                                <tr>
                                    <th class="checkbox-column">
                                        <input 
                                            type="checkbox" 
                                            :checked="allSelected"
                                            @change="toggleAllProducts"
                                        >
                                    </th>
                                    <th>Товар</th>
                                    <th>Текущая цена</th>
                                    <th>Новая цена</th>
                                    <th>Количество</th>
                                    <th>Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="product in products" :key="product.id">
                                    <td>
                                        <input 
                                            type="checkbox"
                                            v-model="selectedProducts[product.id]"
                                            @change="updateProductSelection(product)"
                                        >
                                    </td>
                                    <td>
                                        <div class="product-info">
                                            <img 
                                                :src="product.images?.[product.mainImageIndex] || 'placeholder.png'"
                                                :alt="product.name"
                                            >
                                            <span>{{ product.name }}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span 
                                            class="current-price"
                                            :class="{ strikethrough: hasCustomPrice(product.id) }"
                                        >
                                            {{ formatPrice(product.basePrice) }} ₽
                                        </span>
                                    </td>
                                    <td>
                                        <input 
                                            type="number"
                                            v-model="customPrices[product.id]"
                                            class="new-price-input"
                                            step="0.01"
                                            min="0"
                                            @input="updateTotalSum(product)"
                                        >
                                    </td>
                                    <td>
                                        <input 
                                            type="number"
                                            v-model="quantities[product.id]"
                                            class="quantity-input"
                                            min="1"
                                            step="1"
                                            @input="updateTotalSum(product)"
                                        >
                                    </td>
                                    <td>
                                        <span class="total-sum">
                                            {{ formatPrice(calculateItemTotal(product)) }} ₽
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="price-list-summary">
                        <div class="summary-item">
                            <span>Выбрано товаров:</span>
                            <strong>{{ selectedProductsCount }}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Общее количество:</span>
                            <strong>{{ totalQuantity }} ед.</strong>
                        </div>
                        <div class="summary-item">
                            <span>Общая сумма:</span>
                            <strong>{{ formatPrice(totalSum) }} ₽</strong>
                        </div>
                    </div>

                    <button type="submit">Сохранить прайс-лист</button>
                </form>
            </div>
        </div>
    `,
    props: {
        priceList: {
            type: Object,
            default: null
        },
        products: {
            type: Array,
            required: true
        },
        isEditing: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const form = reactive({
            name: props.priceList?.name || ''
        });

        const selectedProducts = reactive({});
        const customPrices = reactive({});
        const quantities = reactive({});

        // Инициализация данных при редактировании
        if (props.priceList) {
            props.priceList.items.forEach(item => {
                selectedProducts[item.productId] = true;
                customPrices[item.productId] = item.price;
                quantities[item.productId] = item.quantity || 1;
            });
        }

        const formatPrice = (price) => {
            return new Intl.NumberFormat('ru-RU').format(price);
        };

        const hasCustomPrice = (productId) => {
            return !!customPrices[productId];
        };

        const calculateItemTotal = (product) => {
            if (!selectedProducts[product.id]) return 0;
            const price = customPrices[product.id] || product.basePrice;
            const quantity = quantities[product.id] || 1;
            return price * quantity;
        };

        const updateTotalSum = (product) => {
            if (selectedProducts[product.id]) {
                // Автоматически выбираем товар при изменении цены или количества
                selectedProducts[product.id] = true;
            }
        };

        const toggleAllProducts = (event) => {
            const checked = event.target.checked;
            props.products.forEach(product => {
                selectedProducts[product.id] = checked;
                if (checked && !quantities[product.id]) {
                    quantities[product.id] = 1;
                }
            });
        };

        const updateProductSelection = (product) => {
            if (selectedProducts[product.id] && !quantities[product.id]) {
                quantities[product.id] = 1;
            }
        };

        // Вычисляемые свойства
        const allSelected = computed(() => {
            return props.products.every(product => selectedProducts[product.id]);
        });

        const selectedProductsCount = computed(() => {
            return Object.values(selectedProducts).filter(Boolean).length;
        });

        const totalQuantity = computed(() => {
            return props.products.reduce((sum, product) => {
                return sum + (selectedProducts[product.id] ? (quantities[product.id] || 1) : 0);
            }, 0);
        });

        const totalSum = computed(() => {
            return props.products.reduce((sum, product) => {
                if (!selectedProducts[product.id]) return sum;
                return sum + calculateItemTotal(product);
            }, 0);
        });

        const handleSubmit = () => {
            const items = props.products
                .filter(product => selectedProducts[product.id])
                .map(product => ({
                    productId: product.id,
                    price: customPrices[product.id] || product.basePrice,
                    quantity: quantities[product.id] || 1
                }));

            const priceListData = {
                name: form.name,
                items
            };

            if (props.isEditing) {
                priceListData.id = props.priceList.id;
            }

            emit('save', priceListData);
        };

        return {
            form,
            selectedProducts,
            customPrices,
            quantities,
            formatPrice,
            hasCustomPrice,
            calculateItemTotal,
            updateTotalSum,
            toggleAllProducts,
            updateProductSelection,
            allSelected,
            selectedProductsCount,
            totalQuantity,
            totalSum,
            handleSubmit
        };
    }
}); 