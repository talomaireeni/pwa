let currentType = localStorage.getItem('lastSelectedType') || 'rest';

function renderIntegrations(items) {
    $('#integrationsTable').html(
        items.map(integration => `
            <tr>
                <td>${integration.name}</td>
                <td>${integration.type === 'rest' ? 'REST API' : 'Webhook'}</td>
                <td>
                    <span class="badge bg-${integration.status === 'active' ? 'success' : 'secondary'}">
                        ${integration.status}
                    </span>
                </td>
                <td>${integration.created}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2 modify-btn" data-id="${integration.id}">
                        Modify
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${integration.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('')
    );
}

function updateTypeToggleButtons() {
    $('.type-toggle').removeClass('active')
        .filter(`[data-type="${currentType}"]`)
        .addClass('active');
    
    const addButton = $('.btn-primary:contains("Add New")');
    const buttonText = currentType === 'rest' ? '+ Add New REST API' : '+ Add New Webhook';
    const buttonHref = currentType === 'rest' ? '/test/new-integration' : '/test/new-webhook';
    addButton.text(buttonText).attr('href', buttonHref);
}

function deleteIntegration(id) {
    if (confirm('Are you sure you want to delete this integration?')) {
        IntegrationsData.delete(id);
        loadIntegrations();
    }
}

function loadIntegrations(searchTerm = '') {
    const integrations = IntegrationsData.getAll();
    const filteredIntegrations = integrations
        .filter(integration => 
            integration.type === currentType &&
            (searchTerm ? 
                integration.name.toLowerCase().includes(searchTerm.toLowerCase())
                : true
            )
        );
    
    renderIntegrations(filteredIntegrations);
    updateTypeToggleButtons();
}

function initializeEventListeners() {
    $('#searchInput').on('input', function() {
        loadIntegrations($(this).val());
    });

    $('#typeToggle').on('click', '.type-toggle', function() {
        currentType = $(this).data('type');
        localStorage.setItem('lastSelectedType', currentType);
        loadIntegrations($('#searchInput').val());
    });

    $(document).on('click', '.modify-btn', function() {
        const id = $(this).data('id');
        const integration = IntegrationsData.getById(parseInt(id));
        const page = integration.type === 'rest' ? 'new-integration' : 'new-webhook';
        window.location.href = `/test/${page}?id=${id}`;
    });

    $(document).on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        deleteIntegration(id);
    });
}

$(document).ready(function() {
    initializeEventListeners();
    loadIntegrations();
});