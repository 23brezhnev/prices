app.component('auth-component', {
    template: `
        <div class="auth-container">
            <!-- Форма входа -->
            <div v-if="!isRegistering" class="auth-form">
                <h2>Вход в систему</h2>
                <form @submit.prevent="handleLogin">
                    <input 
                        type="email" 
                        v-model="loginForm.email" 
                        placeholder="Email" 
                        required
                    >
                    <input 
                        type="password" 
                        v-model="loginForm.password" 
                        placeholder="Пароль" 
                        required
                    >
                    <button type="submit" class="auth-button">Войти</button>
                </form>
                <p class="auth-switch">
                    Нет аккаунта? 
                    <a href="#" @click.prevent="toggleMode">Зарегистрироваться</a>
                </p>
            </div>

            <!-- Форма регистрации -->
            <div v-else class="auth-form">
                <h2>Регистрация</h2>
                <form @submit.prevent="handleRegister">
                    <input 
                        type="email" 
                        v-model="registerForm.email" 
                        placeholder="Email" 
                        required
                    >
                    <input 
                        type="password" 
                        v-model="registerForm.password" 
                        placeholder="Пароль" 
                        required
                    >
                    <input 
                        type="password" 
                        v-model="confirmPassword" 
                        placeholder="Подтвердите пароль" 
                        required
                    >
                    <button type="submit" class="auth-button">Зарегистрироваться</button>
                </form>
                <p class="auth-switch">
                    Уже есть аккаунт? 
                    <a href="#" @click.prevent="toggleMode">Войти</a>
                </p>
            </div>
        </div>
    `,
    
    setup(props, { emit }) {
        const isRegistering = ref(false);
        const loginForm = reactive({
            email: '',
            password: ''
        });
        const registerForm = reactive({
            email: '',
            password: ''
        });
        const confirmPassword = ref('');

        const toggleMode = () => {
            isRegistering.value = !isRegistering.value;
            // Очищаем формы при переключении
            loginForm.email = '';
            loginForm.password = '';
            registerForm.email = '';
            registerForm.password = '';
            confirmPassword.value = '';
        };

        const handleLogin = () => {
            emit('login', {
                email: loginForm.email,
                password: loginForm.password
            });
        };

        const handleRegister = () => {
            if (registerForm.password !== confirmPassword.value) {
                alert('Пароли не совпадают');
                return;
            }
            emit('register', {
                email: registerForm.email,
                password: registerForm.password
            });
        };

        return {
            isRegistering,
            loginForm,
            registerForm,
            confirmPassword,
            toggleMode,
            handleLogin,
            handleRegister
        };
    }
}); 