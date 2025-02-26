const PriceListModal = {
  props: {
    priceList: Object,
    products: Array
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        items: []
      },
      selectedProduct: null,
      quantity: 1,
      loading: false,
      error: ''
    }
  },
  created() {
    // Копируем данные из props в локальное состояние
    if (this.priceList) {
      this.form.name = this.priceList.name || '';
      this.form.description = this.priceList.description || '';
      
      // Преобразуем элементы прайс-листа в нужный формат
      if (this.priceList.price_list_items) {
        this.form.items = this.priceList.price_list_items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity
        }));
      } else {
        this.form.items = [];
      }
    }
  },
  computed: {
    availableProducts() {
      // Фильтруем товары, которые еще не добавлены в прайс-лист
      const addedProductIds = this.form.items.map(item => item.product_id);
      return this.products.filter(product => !addedProductIds.includes(product.id));
    },
    total() {
      return this.form.items.reduce((sum, item) => {
        const product = this.products.find(p => p.id === item.product_id);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);
    }
  },
  template: `
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h2>{{ priceList.id ? 'Редактировать прайс-лист' : 'Создать прайс-лист' }}</h2>
          <button @click="$emit('close')" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="price-list-name">Название прайс-листа*</label>
            <input 
              type="text" 
              id="price-list-name" 
              v-model="form.name" 
              placeholder="Введите название прайс-листа"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="price-list-description">Описание</label>
            <textarea 
              id="price-list-description" 
              v-model="form.description" 
              placeholder="Введите описание прайс-листа"
              rows="2"
            ></textarea>
          </div>
          
          <div class="price-list-items-section">
            <h3>Товары в прайс-листе</h3>
            
            <div class="add-item-form">
              <div class="form-row">
                <div class="form-group flex-grow">
                  <label for="product-select">Выберите товар</label>
                  <select 
                    id="product-select" 
                    v-model="selectedProduct"
                    :disabled="availableProducts.length === 0"
                  >
                    <option :value="null">Выберите товар</option>
                    <option 
                      v-for="product in availableProducts" 
                      :key="product.id" 
                      :value="product"
                    >
                      {{ product.name }} ({{ formatPrice(product.price) }})
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="quantity">Количество</label>
                  <input 
                    type="number" 
                    id="quantity" 
                    v-model.number="quantity" 
                    min="1" 
                    :disabled="!selectedProduct"
                  >
                </div>
                
                <div class="form-group btn-bottom">
                  <button 
                    @click="addItem" 
                    class="btn btn-primary" 
                    :disabled="!selectedProduct"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="form.items.length === 0" class="empty-state">
              <p>В прайс-листе пока нет товаров</p>
            </div>
            
            <table v-else class="items-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td>{{ getProductName(item.product_id) }}</td>
                  <td>{{ formatPrice(getProductPrice(item.product_id)) }}</td>
                  <td>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      min="1" 
                      class="quantity-input"
                    >
                  </td>
                  <td>{{ formatPrice(getProductPrice(item.product_id) * item.quantity) }}</td>
                  <td>
                    <button @click="removeItem(index)" class="btn btn-danger btn-sm">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr class="total-row">
                  <td colspan="3">Итого:</td>
                  <td>{{ formatPrice(total) }}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
        </div>
        
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">Отмена</button>
          <button @click="savePriceList" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  `,
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: 'RUB' 
      }).format(price);
    },
    getProductName(productId) {
      const product = this.products.find(p => p.id === productId);
      return product ? product.name : 'Товар не найден';
    },
    getProductPrice(productId) {
      const product = this.products.find(p => p.id === productId);
      return product ? product.price : 0;
    },
    addItem() {
      if (!this.selectedProduct) return;
      
      this.form.items.push({
        product_id: this.selectedProduct.id,
        quantity: this.quantity
      });
      
      // Сбрасываем выбор
      this.selectedProduct = null;
      this.quantity = 1;
    },
    removeItem(index) {
      this.form.items.splice(index, 1);
    },
    async savePriceList() {
      // Валидация формы
      if (!this.form.name.trim()) {
        this.error = 'Название прайс-листа обязательно';
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      try {
        const user = supabase.auth.user();
        
        // Данные прайс-листа
        const priceListData = {
          name: this.form.name.trim(),
          description: this.form.description.trim(),
          user_id: user.id
        };
        
        let priceListId;
        
        if (this.priceList.id) {
          // Обновляем существующий прайс-лист
          const { data, error } = await supabase
            .from('price_lists')
            .update(priceListData)
            .eq('id', this.priceList.id)
            .select();
            
          if (error) throw error;
          priceListId = this.priceList.id;
          
          // Удаляем все существующие элементы
          const { error: deleteError } = await supabase
            .from('price_list_items')
            .delete()
            .eq('price_list_id', priceListId);
            
          if (deleteError) throw deleteError;
        } else {
          // Создаем новый прайс-лист
          const { data, error } = await supabase
            .from('price_lists')
            .insert([priceListData])
            .select();
            
          if (error) throw error;
          priceListId = data[0].id;
        }
        
        // Добавляем элементы прайс-листа
        if (this.form.items.length > 0) {
          const itemsData = this.form.items.map(item => ({
            price_list_id: priceListId,
            product_id: item.product_id,
            quantity: item.quantity
          }));
          
          const { error: itemsError } = await supabase
            .from('price_list_items')
            .insert(itemsData);
            
          if (itemsError) throw itemsError;
        }
        
        this.$emit('refresh-data');
        this.$emit('close');
      } catch (error) {
        this.error = 'Ошибка при сохранении прайс-листа: ' + error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}; 