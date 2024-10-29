// Data management module
const IntegrationsData = {
    // Initialize with sample data if no data exists
    init() {
        if (!localStorage.getItem('integrations')) {
            const sampleData = [
                {
                    id: 1,
                    name: 'Payment Gateway',
                    type: 'rest',
                    status: 'active',
                    created: '2024-02-20',
                    endpoint: 'https://api.payment.com',
                    authMethod: 'apikey',
                    requestMethod: 'POST'
                },
                {
                    id: 2,
                    name: 'Notification Service',
                    type: 'webhook',
                    status: 'inactive',
                    created: '2024-02-19',
                    webhookUrl: 'https://webhook.notification.com',
                    events: ['create', 'update']
                }
            ];
            localStorage.setItem('integrations', JSON.stringify(sampleData));
        }
    },

    // Get all integrations
    getAll() {
        return JSON.parse(localStorage.getItem('integrations') || '[]');
    },

    // Get single integration by ID
    getById(id) {
        const integrations = this.getAll();
        return integrations.find(i => i.id === parseInt(id));
    },

    // Save or update integration
    save(integration) {
        const integrations = this.getAll();
        if (integration.id) {
            const index = integrations.findIndex(i => i.id === integration.id);
            if (index !== -1) {
                integrations[index] = integration;
            }
        } else {
            integration.id = Date.now();
            integration.created = new Date().toISOString().split('T')[0];
            integration.status = 'inactive';
            integrations.push(integration);
        }
        localStorage.setItem('integrations', JSON.stringify(integrations));
        return integration;
    },

    // Delete integration
    delete(id) {
        const integrations = this.getAll();
        const filtered = integrations.filter(i => i.id !== parseInt(id));
        localStorage.setItem('integrations', JSON.stringify(filtered));
    }
};

// Initialize data when the module loads
IntegrationsData.init();