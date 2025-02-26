// Дожидаемся загрузки всех необходимых скриптов
window.addEventListener('load', () => {
    if (!window.Vue || !window.supabase) {
        console.error('Vue или Supabase не загружены');
        return;
    }

    const { createApp, ref, reactive, computed, onMounted } = Vue;

    // Создаем приложение Vue
    const app = createApp({
        setup() {
            console.log('Vue app initializing...'); // Отладочный вывод

            // Состояние приложения
            const currentUser = ref(null);
            const isLoading = ref(false);
            const activeTab = ref('products');
            const products = ref([]);
            const priceLists = ref([]);
            
            // Состояние модальных окон
            const showProductModal = ref(false);
            const showPriceListModal = ref(false);
            const editingProduct = ref(null);
            const editingPriceList = ref(null);

            // Методы для работы с данными
            const loadData = async () => {
                console.log('Loading data...'); // Отладочный вывод
                isLoading.value = true;
                try {
                    // Загружаем товары
                    const { data: productsData, error: productsError } = await supabase
                        .from('products')
                        .select('*');
                    
                    if (productsError) throw productsError;
                    products.value = productsData || [];
                    
                    // Загружаем прайс-листы
                    const { data: priceListsData, error: priceListsError } = await supabase
                        .from('price_lists')
                        .select('*');
                    
                    if (priceListsError) throw priceListsError;
                    priceLists.value = priceListsData || [];

                    console.log('Data loaded successfully'); // Отладочный вывод
                } catch (error) {
                    console.error('Error loading data:', error);
                } finally {
                    isLoading.value = false;
                }
            };

            // Методы для работы с товарами
            const openProductModal = (product = null) => {
                editingProduct.value = product ? { ...product } : null;
                showProductModal.value = true;
            };

            const closeProductModal = () => {
                editingProduct.value = null;
                showProductModal.value = false;
            };

            const saveProduct = async (productData) => {
                isLoading.value = true;
                try {
                    if (editingProduct.value) {
                        // Обновляем существующий товар
                        const { error } = await supabase
                            .from('products')
                            .update(productData)
                            .eq('id', editingProduct.value.id);
                        
                        if (error) throw error;
                        showNotification('Товар успешно обновлен');
                    } else {
                        // Создаем новый товар
                        const { error } = await supabase
                            .from('products')
                            .insert([productData]);
                        
                        if (error) throw error;
                        showNotification('Товар успешно создан');
                    }
                    
                    await loadData();
                    closeProductModal();
                } catch (error) {
                    console.error('Ошибка сохранения товара:', error);
                    showNotification('Ошибка при сохранении товара', 'error');
                } finally {
                    isLoading.value = false;
                }
            };

            const deleteProduct = async (productId) => {
                if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
                
                isLoading.value = true;
                try {
                    const { error } = await supabase
                        .from('products')
                        .delete()
                        .eq('id', productId);
                    
                    if (error) throw error;
                    
                    // Удаляем товар из всех прайс-листов
                    const updatedPriceLists = priceLists.value.map(list => ({
                        ...list,
                        items: list.items.filter(item => item.productId !== productId)
                    }));
                    
                    await Promise.all(updatedPriceLists.map(list => 
                        supabase
                            .from('price_lists')
                            .update({ items: list.items })
                            .eq('id', list.id)
                    ));
                    
                    await loadData();
                    showNotification('Товар успешно удален');
                } catch (error) {
                    console.error('Ошибка удаления товара:', error);
                    showNotification('Ошибка при удалении товара', 'error');
                } finally {
                    isLoading.value = false;
                }
            };

            // Методы для работы с прайс-листами
            const openPriceListModal = (priceList = null) => {
                editingPriceList.value = priceList ? { ...priceList } : null;
                showPriceListModal.value = true;
            };

            const closePriceListModal = () => {
                editingPriceList.value = null;
                showPriceListModal.value = false;
            };

            const savePriceList = async (priceListData) => {
                isLoading.value = true;
                try {
                    if (editingPriceList.value) {
                        // Обновляем существующий прайс-лист
                        const { error } = await supabase
                            .from('price_lists')
                            .update(priceListData)
                            .eq('id', editingPriceList.value.id);
                        
                        if (error) throw error;
                        showNotification('Прайс-лист успешно обновлен');
                    } else {
                        // Создаем новый прайс-лист
                        const { error } = await supabase
                            .from('price_lists')
                            .insert([priceListData]);
                        
                        if (error) throw error;
                        showNotification('Прайс-лист успешно создан');
                    }
                    
                    await loadData();
                    closePriceListModal();
                } catch (error) {
                    console.error('Ошибка сохранения прайс-листа:', error);
                    showNotification('Ошибка при сохранении прайс-листа', 'error');
                } finally {
                    isLoading.value = false;
                }
            };

            const deletePriceList = async (priceListId) => {
                if (!confirm('Вы уверены, что хотите удалить этот прайс-лист?')) return;
                
                isLoading.value = true;
                try {
                    const { error } = await supabase
                        .from('price_lists')
                        .delete()
                        .eq('id', priceListId);
                    
                    if (error) throw error;
                    
                    await loadData();
                    showNotification('Прайс-лист успешно удален');
                } catch (error) {
                    console.error('Ошибка удаления прайс-листа:', error);
                    showNotification('Ошибка при удалении прайс-листа', 'error');
                } finally {
                    isLoading.value = false;
                }
            };

            const sharePriceList = (priceListId) => {
                const link = `${window.location.origin}/share.html?id=${priceListId}`;
                navigator.clipboard.writeText(link)
                    .then(() => showNotification('Ссылка скопирована в буфер обмена'))
                    .catch(() => {
                        prompt('Скопируйте ссылку:', link);
                    });
            };

            // Методы авторизации
            const handleLogin = async (credentials) => {
                isLoading.value = true;
                try {
                    const { data, error } = await supabase.auth.signInWithPassword(credentials);
                    if (error) throw error;
                    currentUser.value = data.user;
                    console.log('Login successful'); // Отладочный вывод
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Ошибка входа: ' + error.message);
                } finally {
                    isLoading.value = false;
                }
            };

            const handleRegister = async (credentials) => {
                isLoading.value = true;
                try {
                    const { data, error } = await supabase.auth.signUp(credentials);
                    if (error) throw error;
                    alert('На ваш email отправлено письмо для подтверждения регистрации');
                    console.log('Registration successful'); // Отладочный вывод
                } catch (error) {
                    console.error('Registration error:', error);
                    alert('Ошибка регистрации: ' + error.message);
                } finally {
                    isLoading.value = false;
                }
            };

            const handleLogout = async () => {
                isLoading.value = true;
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    currentUser.value = null;
                    console.log('Logout successful'); // Отладочный вывод
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Ошибка выхода: ' + error.message);
                } finally {
                    isLoading.value = false;
                }
            };

            // Вспомогательные методы
            const showNotification = (message, type = 'success') => {
                // Здесь можно добавить логику отображения уведомлений
                alert(message);
            };

            const handleTabChange = (tab) => {
                activeTab.value = tab;
            };

            // Инициализация приложения
            onMounted(async () => {
                console.log('Component mounted'); // Отладочный вывод
                
                // Проверяем текущую сессию
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log('Session found'); // Отладочный вывод
                    currentUser.value = session.user;
                    await loadData();
                } else {
                    console.log('No session found'); // Отладочный вывод
                }

                // Слушаем изменения авторизации
                supabase.auth.onAuthStateChange((event, session) => {
                    console.log('Auth state changed:', event); // Отладочный вывод
                    currentUser.value = session?.user || null;
                    if (session) loadData();
                });
            });

            return {
                currentUser,
                isLoading,
                activeTab,
                products,
                priceLists,
                showProductModal,
                showPriceListModal,
                editingProduct,
                editingPriceList,
                handleLogin,
                handleRegister,
                handleLogout,
                loadData,
                showNotification,
                handleTabChange
            };
        }
    });

    // Монтируем приложение
    app.mount('#app');
    console.log('Vue app mounted'); // Отладочный вывод
});
