const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Создаем клиент Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Проверяем подключение
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    if (session) {
        console.log('User is authenticated');
    } else {
        console.log('User is not authenticated');
    }
}); 