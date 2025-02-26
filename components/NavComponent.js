app.component('nav-component', {
    template: `
        <nav class="navigation">
            <button 
                v-for="tab in tabs" 
                :key="tab.id"
                class="nav-btn" 
                :class="{ active: activeTab === tab.id }"
                @click="$emit('change-tab', tab.id)"
            >
                <i :class="tab.icon"></i> {{ tab.name }}
            </button>
        </nav>
    `,
    props: {
        activeTab: {
            type: String,
            required: true
        }
    },
    setup() {
        const tabs = [
            { id: 'products', name: 'Товары', icon: 'fas fa-box' },
            { id: 'price-lists', name: 'Прайс-листы', icon: 'fas fa-list-alt' }
        ];
        
        return { tabs };
    }
}); 