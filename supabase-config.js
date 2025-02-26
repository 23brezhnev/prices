// Проверяем наличие переменных окружения
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Создаем клиент Supabase для браузера
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Инициализация Supabase клиента
const supabase = supabaseCreateClient(supabaseUrl, supabaseAnonKey);

// Функция для создания клиента Supabase
function supabaseCreateClient(url, key) {
  return window.supabase.createClient(url, key);
}

// Проверяем подключение
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    if (session) {
        console.log('User is authenticated');
    } else {
        console.log('User is not authenticated');
    }
}); 