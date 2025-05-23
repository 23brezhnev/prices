// Конфигурация Supabase
const SUPABASE_CONFIG = {
    // URL проекта Supabase
    SUPABASE_URL: 'https://eeamyvvtzxbtdngdnofc.supabase.co',
    
    // Анонимный ключ API (публичный)
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYW15dnZ0enhidGRuZ2Rub2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjAyMTUsImV4cCI6MjA1NTk5NjIxNX0.tjAJ0ZvyqOcJKI2P1bhXts4higZzemZskAx2OZ-P6_0'
};

// Самопроверка конфигурации
(function checkConfig() {
    if (!SUPABASE_CONFIG.SUPABASE_URL || !SUPABASE_CONFIG.SUPABASE_KEY) {
        console.error('Supabase конфигурация не полная. Проверьте URL и ключ API.');
    }
    
    // Проверка URL
    if (SUPABASE_CONFIG.SUPABASE_URL.includes('your-project-id') || 
        SUPABASE_CONFIG.SUPABASE_URL === '') {
        console.error('Supabase URL не настроен. Замените placeholder на реальный URL проекта.');
    }
    
    // Проверка ключа
    if (SUPABASE_CONFIG.SUPABASE_KEY.includes('your-anon-key') || 
        SUPABASE_CONFIG.SUPABASE_KEY === '') {
        console.error('Supabase API ключ не настроен. Замените placeholder на реальный ключ API.');
    }
})();

// Вспомогательная функция для создания клиента Supabase
function createSupabaseClient() {
  return window.supabase.createClient(
    SUPABASE_CONFIG.SUPABASE_URL,
    SUPABASE_CONFIG.SUPABASE_KEY
  );
}

// Проверяем подключение
createSupabaseClient().auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    if (session) {
        console.log('User is authenticated');
    } else {
        console.log('User is not authenticated');
    }
}); 