/**
 * Функции для работы с Supabase API
 */

// Функция для создания клиента Supabase
function createSupabaseClient() {
  return window.supabase.createClient(
    SUPABASE_CONFIG.SUPABASE_URL,
    SUPABASE_CONFIG.SUPABASE_KEY
  );
}

// Объект с методами для работы с аутентификацией
const authAPI = {
  // Получить текущую сессию
  async getSession() {
    const client = createSupabaseClient();
    const { data, error } = await client.auth.getSession();
    return { data, error };
  },
  
  // Вход по email и паролю
  async signIn(email, password) {
    const client = createSupabaseClient();
    return await client.auth.signInWithPassword({ email, password });
  },
  
  // Регистрация по email и паролю
  async signUp(email, password) {
    const client = createSupabaseClient();
    return await client.auth.signUp({ email, password });
  },
  
  // Выход из системы
  async signOut() {
    const client = createSupabaseClient();
    return await client.auth.signOut();
  },
  
  // Подписка на изменения состояния аутентификации
  onAuthStateChange(callback) {
    const client = createSupabaseClient();
    return client.auth.onAuthStateChange(callback);
  }
};

// Объект с методами для работы с товарами
const productsAPI = {
  // Получить все товары пользователя
  async getUserProducts(userId) {
    const client = createSupabaseClient();
    return await client
      .from('products')
      .select('*')
      .eq('user_id', userId);
  },
  
  // Добавить новый товар
  async addProduct(productData) {
    const client = createSupabaseClient();
    return await client
      .from('products')
      .insert([productData]);
  },
  
  // Обновить существующий товар
  async updateProduct(productId, productData) {
    const client = createSupabaseClient();
    return await client
      .from('products')
      .update(productData)
      .eq('id', productId);
  },
  
  // Удалить товар
  async deleteProduct(productId) {
    const client = createSupabaseClient();
    return await client
      .from('products')
      .delete()
      .eq('id', productId);
  }
};

// Объект с методами для работы с прайс-листами
const priceListsAPI = {
  // Получить прайс-лист по ID
  async getPriceList(priceListId) {
    const client = createSupabaseClient();
    return await client
      .from('price_lists')
      .select('*')
      .eq('id', priceListId)
      .single();
  },
  
  // Получить все прайс-листы пользователя
  async getUserPriceLists(userId) {
    const client = createSupabaseClient();
    return await client
      .from('price_lists')
      .select('*')
      .eq('user_id', userId);
  },
  
  // Добавить новый прайс-лист
  async addPriceList(priceListData) {
    const client = createSupabaseClient();
    return await client
      .from('price_lists')
      .insert([priceListData]);
  },
  
  // Обновить существующий прайс-лист
  async updatePriceList(priceListId, priceListData) {
    const client = createSupabaseClient();
    return await client
      .from('price_lists')
      .update(priceListData)
      .eq('id', priceListId);
  },
  
  // Удалить прайс-лист
  async deletePriceList(priceListId) {
    const client = createSupabaseClient();
    return await client
      .from('price_lists')
      .delete()
      .eq('id', priceListId);
  }
};

// Объект с методами для работы с заказами
const ordersAPI = {
  // Получить все заказы
  async getUserOrders(userId) {
    const client = createSupabaseClient();
    return await client
      .from('orders')
      .select('*')
      .eq('user_id', userId);
  },
  
  // Добавить новый заказ
  async addOrder(orderData) {
    const client = createSupabaseClient();
    return await client
      .from('orders')
      .insert([orderData]);
  }
}; 