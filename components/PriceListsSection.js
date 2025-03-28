const PriceListsSection = {
  props: {
    priceLists: Array,
    products: Array
  },
  template: `
    <div class="section-container">
      <div class="section-header">
        <h2>Прайс-листы</h2>
        <button @click="$emit('open-price-list-modal')" class="btn btn-primary">
          <span class="icon">+</span> Создать прайс-лист
        </button>
      </div>
      
      <div v-if="priceLists.length === 0" class="empty-state">
        <p>У вас пока нет прайс-листов. Создайте первый прайс-лист!</p>
      </div>
      
      <div v-else class="price-lists-container">
        <div v-for="priceList in priceLists" :key="priceList.id" class="price-list-card">
          <div class="price-list-header">
            <h3>{{ priceList.name }}</h3>
            <div class="price-list-actions">
              <button @click="$emit('open-price-list-modal', priceList)" class="btn btn-secondary">
                <span class="icon">✏️</span> Редактировать
              </button>
              <button @click="deletePriceList(priceList.id)" class="btn btn-danger">
                <span class="icon">🗑️</span> Удалить
              </button>
              <button @click="sharePriceList(priceList.id)" class="btn btn-primary">
                <span class="icon">🔗</span> Поделиться
              </button>
            </div>
          </div>
          
          <p v-if="priceList.description" class="price-list-description">{{ priceList.description }}</p>
          
          <div class="price-list-items">
            <table v-if="priceList.price_list_items && priceList.price_list_items.length > 0">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Цена</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in priceList.price_list_items" :key="item.id">
                  <td>{{ getProductName(item.product_id) }}</td>
                  <td>{{ formatPrice(getProductPrice(item.product_id)) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatPrice(getProductPrice(item.product_id) * item.quantity) }}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3">Итого:</td>
                  <td>{{ formatPrice(calculateTotal(priceList)) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="empty-items">В этом прайс-листе пока нет товаров</p>
          </div>
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
    calculateTotal(priceList) {
      if (!priceList.price_list_items || priceList.price_list_items.length === 0) return 0;
      
      return priceList.price_list_items.reduce((total, item) => {
        const price = this.getProductPrice(item.product_id);
        return total + (price * item.quantity);
      }, 0);
    },
    async deletePriceList(id) {
      if (!confirm('Вы уверены, что хотите удалить этот прайс-лист?')) return;
      
      try {
        // Сначала удаляем все элементы прайс-листа
        const { error: itemsError } = await supabase
          .from('price_list_items')
          .delete()
          .eq('price_list_id', id);
          
        if (itemsError) throw itemsError;
        
        // Затем удаляем сам прайс-лист
        const { error } = await supabase
          .from('price_lists')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        this.$emit('refresh-data');
      } catch (error) {
        alert('Ошибка при удалении прайс-листа: ' + error.message);
      }
    },
    sharePriceList(id) {
      const shareUrl = `${window.location.origin}/share.html?id=${id}`;
      
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('Ссылка на прайс-лист скопирована в буфер обмена');
        })
        .catch(err => {
          alert('Не удалось скопировать ссылку: ' + err);
          // Показываем ссылку, если не удалось скопировать
          alert('Ссылка на прайс-лист: ' + shareUrl);
        });
    }
  }
}; 