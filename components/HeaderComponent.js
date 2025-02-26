app.component('header-component', {
    template: `
        <header class="user-info">
            <span class="user-email">{{ user.email }}</span>
            <button @click="$emit('logout')" class="auth-button auth-button-secondary">
                <i class="fas fa-sign-out-alt"></i> Выйти
            </button>
        </header>
    `,
    props: {
        user: {
            type: Object,
            required: true
        }
    }
}); 