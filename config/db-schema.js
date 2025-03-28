/**
 * Схема базы данных Supabase
 * Этот файл содержит названия таблиц, колонок и другие метаданные для работы с БД
 */

// Названия таблиц
const DB_TABLES = {
  PRODUCTS: 'products',
  PRICE_LISTS: 'price_lists',
  ORDERS: 'orders'
};

// Схема таблиц (поля)
const DB_SCHEMA = {
  // Схема таблицы products
  PRODUCTS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    PRICE: 'price',
    IMAGES: 'images',
    MAIN_IMAGE_INDEX: 'main_image_index',
    USER_ID: 'user_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Схема таблицы price_lists
  PRICE_LISTS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    ITEMS: 'items',
    IS_PUBLIC: 'is_public',
    USER_ID: 'user_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Схема таблицы orders
  ORDERS: {
    ID: 'id',
    PRICE_LIST_ID: 'price_list_id',
    CUSTOMER_NAME: 'customer_name',
    CUSTOMER_PHONE: 'customer_phone',
    CUSTOMER_EMAIL: 'customer_email',
    CUSTOMER_COMMENT: 'customer_comment',
    ITEMS: 'items',
    TOTAL: 'total',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  }
};

// Статусы заказов
const ORDER_STATUSES = {
  NEW: 'new',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}; 