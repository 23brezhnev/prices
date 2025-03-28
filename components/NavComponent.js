const NavComponent = {
  props: {
    activeSection: String
  },
  template: `
    <nav class="app-nav">
      <button 
        @click="$emit('change-section', 'products')" 
        class="nav-button" 
        :class="{ active: activeSection === 'products' }">
        <span class="icon">📦</span>
        <span>Товары</span>
      </button>
      <button 
        @click="$emit('change-section', 'priceLists')" 
        class="nav-button" 
        :class="{ active: activeSection === 'priceLists' }">
        <span class="icon">📋</span>
        <span>Прайс-листы</span>
      </button>
    </nav>
  `
}; 