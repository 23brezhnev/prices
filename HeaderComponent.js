const HeaderComponent = {
  props: {
    user: Object
  },
  template: `
    <header class="app-header">
      <div class="logo">
        <h1>Управление товарами</h1>
      </div>
      <div class="user-info">
        <span>{{ user.email }}</span>
        <button @click="$emit('sign-out')" class="btn btn-outline">Выйти</button>
      </div>
    </header>
  `
}; 