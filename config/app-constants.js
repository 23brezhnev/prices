/**
 * Общие константы приложения
 */

// Форматирование цен
const PRICE_FORMAT = {
  CURRENCY: 'RUB',
  LOCALE: 'ru-RU',
  OPTIONS: { 
    style: 'currency', 
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
};

// Сообщения об ошибках
const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Необходима авторизация',
  PRODUCT_NOT_FOUND: 'Товар не найден',
  PRICE_LIST_NOT_FOUND: 'Прайс-лист не найден',
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
  LOADING_ERROR: 'Ошибка загрузки данных'
};

// Сообщения успеха
const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Заказ успешно отправлен!',
  PRODUCT_SAVED: 'Товар успешно сохранен',
  PRODUCT_DELETED: 'Товар успешно удален',
  PRICE_LIST_SAVED: 'Прайс-лист успешно сохранен',
  PRICE_LIST_DELETED: 'Прайс-лист успешно удален',
  LINK_COPIED: 'Ссылка скопирована в буфер обмена'
};

// Функция для форматирования цены
function formatPrice(price) {
  return new Intl.NumberFormat(PRICE_FORMAT.LOCALE, PRICE_FORMAT.OPTIONS).format(price);
} 