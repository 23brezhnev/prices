const SUPABASE_URL = 'https://eeamyvvtzxbtdngdnofc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYW15dnZ0enhidGRuZ2Rub2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjAyMTUsImV4cCI6MjA1NTk5NjIxNX0.tjAJ0ZvyqOcJKI2P1bhXts4higZzemZskAx2OZ-P6_0'

// Создаем клиента Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Проверяем подключение
supabase.from('products').select('count')
    .then(response => {
        if (response.error) {
            console.error('Ошибка подключения:', response.error);
        } else {
            console.log('Подключение к Supabase успешно');
        }
    }); 