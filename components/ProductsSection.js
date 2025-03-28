const ProductsSection = {
  props: {
    products: Array
  },
  template: `
    <div class="section-container">
      <div class="section-header">
        <h2>Товары</h2>
        <button @click="$emit('open-product-modal')" class="btn btn-primary">
          <span class="icon">+</span> Добавить товар
        </button>
      </div>
      
      <div v-if="products.length === 0" class="empty-state">
        <p>У вас пока нет товаров. Добавьте первый товар!</p>
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image">
            <img v-if="product.image" :src="product.image" :alt="product.name">
            <div v-else class="no-image">Нет изображения</div>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="product-price">{{ formatPrice(product.price) }}</p>
            <p v-if="product.description" class="product-description">{{ product.description }}</p>
          </div>
          <div class="product-actions">
            <button @click="$emit('open-product-modal', product)" class="btn btn-secondary">
              <span class="icon">✏️</span> Редактировать
            </button>
            <button @click="deleteProduct(product.id)" class="btn btn-danger">
              <span class="icon">🗑️</span> Удалить
            </button>
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
    async deleteProduct(id) {
      if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
      
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        this.$emit('refresh-data');
      } catch (error) {
        alert('Ошибка при удалении товара: ' + error.message);
      }
    }
  }
}; 