const ProductModal = {
  props: {
    product: Object
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        price: 0,
        image: null
      },
      imagePreview: null,
      loading: false,
      error: ''
    }
  },
  created() {
    // Копируем данные из props в локальное состояние
    if (this.product) {
      this.form.name = this.product.name || '';
      this.form.description = this.product.description || '';
      this.form.price = this.product.price || 0;
      this.imagePreview = this.product.image || null;
    }
  },
  template: `
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ product.id ? 'Редактировать товар' : 'Добавить товар' }}</h2>
          <button @click="$emit('close')" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="product-name">Название товара*</label>
            <input 
              type="text" 
              id="product-name" 
              v-model="form.name" 
              placeholder="Введите название товара"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="product-description">Описание</label>
            <textarea 
              id="product-description" 
              v-model="form.description" 
              placeholder="Введите описание товара"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="product-price">Цена*</label>
            <input 
              type="number" 
              id="product-price" 
              v-model.number="form.price" 
              min="0" 
              step="0.01"
              required
            >
          </div>
          
          <div class="form-group">
            <label>Изображение</label>
            <div class="image-upload-container">
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Предпросмотр">
                <button @click="removeImage" class="btn btn-danger btn-sm">Удалить</button>
              </div>
              <div v-else class="image-upload">
                <label for="product-image" class="upload-label">
                  <span class="icon">📷</span>
                  <span>Выберите изображение</span>
                </label>
                <input 
                  type="file" 
                  id="product-image" 
                  @change="handleImageUpload" 
                  accept="image/*"
                  class="file-input"
                >
              </div>
            </div>
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
        </div>
        
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">Отмена</button>
          <button @click="saveProduct" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  `,
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Проверяем тип файла
      if (!file.type.match('image.*')) {
        this.error = 'Пожалуйста, выберите изображение';
        return;
      }
      
      // Проверяем размер файла (не более 5 МБ)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Размер изображения не должен превышать 5 МБ';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeImage() {
      this.imagePreview = null;
    },
    async saveProduct() {
      // Валидация формы
      if (!this.form.name.trim()) {
        this.error = 'Название товара обязательно';
        return;
      }
      
      if (this.form.price < 0) {
        this.error = 'Цена не может быть отрицательной';
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      try {
        const productData = {
          name: this.form.name.trim(),
          description: this.form.description.trim(),
          price: this.form.price,
          image: this.imagePreview,
          user_id: supabase.auth.user().id
        };
        
        let result;
        
        if (this.product.id) {
          // Обновляем существующий товар
          result = await supabase
            .from('products')
            .update(productData)
            .eq('id', this.product.id);
        } else {
          // Создаем новый товар
          result = await supabase
            .from('products')
            .insert([productData]);
        }
        
        if (result.error) throw result.error;
        
        this.$emit('refresh-data');
        this.$emit('close');
      } catch (error) {
        this.error = 'Ошибка при сохранении товара: ' + error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}; 