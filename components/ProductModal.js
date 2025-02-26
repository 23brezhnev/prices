app.component('product-modal', {
    template: `
        <div class="modal" @click.self="$emit('close')">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ isEditing ? 'Редактировать товар' : 'Добавить товар' }}</h2>
                    <span class="close" @click="$emit('close')">&times;</span>
                </div>
                <form @submit.prevent="handleSubmit">
                    <div class="image-gallery" id="imageGallery">
                        <div 
                            v-for="(image, index) in images" 
                            :key="index" 
                            class="image-gallery-item"
                            :class="{ main: index === mainImageIndex }"
                        >
                            <img :src="image" :alt="'Фото товара ' + (index + 1)">
                            <div class="image-gallery-actions">
                                <button type="button" @click="setMainImage(index)">
                                    Главное
                                </button>
                                <button type="button" @click="removeImage(index)">
                                    Удалить
                                </button>
                            </div>
                        </div>
                        <div class="image-upload-container">
                            <input 
                                type="file" 
                                ref="imageInput"
                                accept="image/*"
                                multiple
                                @change="handleImageUpload"
                                style="display: none"
                            >
                            <button 
                                type="button"
                                class="upload-button"
                                @click="$refs.imageInput.click()"
                            >
                                Добавить фото
                            </button>
                        </div>
                    </div>

                    <input 
                        type="text" 
                        v-model="form.name"
                        placeholder="Название товара" 
                        required
                    >
                    <input 
                        type="number" 
                        v-model="form.basePrice"
                        placeholder="Базовая цена"
                        step="0.01"
                        min="0"
                        required
                    >
                    <textarea 
                        v-model="form.description"
                        placeholder="Описание товара"
                        maxlength="250"
                        rows="3"
                    ></textarea>
                    <button type="submit">Сохранить</button>
                </form>
            </div>
        </div>
    `,
    props: {
        product: {
            type: Object,
            default: null
        },
        isEditing: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const images = ref(props.product?.images || []);
        const mainImageIndex = ref(props.product?.mainImageIndex || 0);
        const form = reactive({
            name: props.product?.name || '',
            basePrice: props.product?.basePrice || '',
            description: props.product?.description || ''
        });

        const handleImageUpload = (event) => {
            const files = event.target.files;
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    images.value.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        };

        const setMainImage = (index) => {
            mainImageIndex.value = index;
        };

        const removeImage = (index) => {
            images.value.splice(index, 1);
            if (mainImageIndex.value >= images.value.length) {
                mainImageIndex.value = images.value.length - 1;
            }
        };

        const handleSubmit = () => {
            const productData = {
                ...form,
                basePrice: parseFloat(form.basePrice),
                images: images.value,
                mainImageIndex: mainImageIndex.value
            };

            if (props.isEditing) {
                productData.id = props.product.id;
            }

            emit('save', productData);
        };

        return {
            images,
            mainImageIndex,
            form,
            handleImageUpload,
            setMainImage,
            removeImage,
            handleSubmit
        };
    }
}); 