/**
 * Функции для работы с Supabase API
 */

// Функция для создания клиента Supabase
function createSupabaseClient() {
  // Проверяем наличие объекта конфигурации
  if (typeof SUPABASE_CONFIG === 'undefined') {
    console.error('SUPABASE_CONFIG не определен. Проверьте, что файл config/supabase-config.js подключен до api/supabase-api.js');
    return null;
  }
  
  // Проверяем наличие Supabase клиента
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase клиент не загружен. Проверьте подключение к интернету и убедитесь, что скрипт Supabase загружен.');
    return null;
  }
  
  try {
    return window.supabase.createClient(
      SUPABASE_CONFIG.SUPABASE_URL,
      SUPABASE_CONFIG.SUPABASE_KEY
    );
  } catch (error) {
    console.error('Ошибка создания Supabase клиента:', error);
    return null;
  }
}

// Объект с методами для работы с аутентификацией
const authAPI = {
  // Получить текущую сессию
  async getSession() {
    const client = createSupabaseClient();
    if (!client) return { data: null, error: new Error('Не удалось создать клиент Supabase') };
    
    try {
      const { data, error } = await client.auth.getSession();
      return { data, error };
    } catch (error) {
      console.error('Ошибка при получении сессии:', error);
      return { data: null, error };
    }
  },
  
  // Вход по email и паролю
  async signIn(email, password) {
    const client = createSupabaseClient();
    if (!client) return { data: null, error: new Error('Не удалось создать клиент Supabase') };
    
    try {
      return await client.auth.signInWithPassword({ email, password });
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return { data: null, error };
    }
  },
  
  // Регистрация по email и паролю
  async signUp(email, password) {
    const client = createSupabaseClient();
    if (!client) return { data: null, error: new Error('Не удалось создать клиент Supabase') };
    
    try {
      return await client.auth.signUp({ email, password });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return { data: null, error };
    }
  },
  
  // Выход из системы
  async signOut() {
    const client = createSupabaseClient();
    if (!client) return { error: new Error('Не удалось создать клиент Supabase') };
    
    try {
      return await client.auth.signOut();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      return { error };
    }
  },
  
  // Подписка на изменения состояния аутентификации
  onAuthStateChange(callback) {
    const client = createSupabaseClient();
    if (!client) {
      console.error('Не удалось создать клиент Supabase');
      return { data: { subscription: null }, error: new Error('Не удалось создать клиент Supabase') };
    }
    
    try {
      return client.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Ошибка при подписке на изменения аутентификации:', error);
      return { data: { subscription: null }, error };
    }
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