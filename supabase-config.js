// Проверяем наличие переменных окружения
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Создаем клиент Supabase для браузера
const supabaseUrl = 'https://eeamyvvtzxbtdngdnofc.supabase.coL';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYW15dnZ0enhidGRuZ2Rub2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjAyMTUsImV4cCI6MjA1NTk5NjIxNX0.tjAJ0ZvyqOcJKI2P1bhXts4higZzemZskAx2OZ-P6_0';

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