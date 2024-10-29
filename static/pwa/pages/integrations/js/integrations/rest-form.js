let currentIntegration = null;

function initializeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const integrationId = urlParams.get('id');

    if (integrationId) {
        currentIntegration = IntegrationsData.getById(integrationId);
        if (currentIntegration) {
            $('.card-title').text('Modify Integration');
            
            $('input[type="text"]').first().val(currentIntegration.name);
            $('select').first().val(currentIntegration.requestMethod);
            $('input[type="url"]').val(currentIntegration.endpoint);
            
            if (currentIntegration.headers) {
                $('#headerFields').empty();
                Object.entries(currentIntegration.headers).forEach(([key, value]) => {
                    addHeaderRow(key, value);
                });
            }
        }
    }
}

function addHeaderRow(key = '', value = '') {
    const $newRow = $(`
        <div class="header-row row mb-2">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="Key" value="${key}">
            </div>
            <div class="col-5">
                <input type="text" class="form-control" placeholder="Value" value="${value}">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-outline-danger remove-header">Remove</button>
            </div>
        </div>
    `);
    $('#headerFields').append($newRow);
}

function initializeEventListeners() {
    $('#addHeader').on('click', () => addHeaderRow());

    $(document).on('click', '.remove-header', function() {
        $(this).closest('.header-row').remove();
    });

    $('#integrationForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('input[type="text"]').first().val(),
            type: 'rest',
            requestMethod: $('select').first().val(),
            endpoint: $('input[type="url"]').val(),
        };

        if (currentIntegration) {
            formData.id = currentIntegration.id;
            formData.status = currentIntegration.status;
            formData.created = currentIntegration.created;
        }

        formData.headers = {};
        $('.header-row').each(function() {
            const key = $(this).find('input').first().val().trim();
            const value = $(this).find('input').last().val().trim();
            if (key && value) {
                formData.headers[key] = value;
            }
        });

        IntegrationsData.save(formData);
        window.location.href = '/test/integrations';
    });

    $('#testConnection').on('click', async function() {
        const url = $('input[type="url"]').val();

        if (!url) {
            alert('Please enter a valid URL first');
            return;
        }

        try {
            const headers = {};
            $('.header-row').each(function() {
                const key = $(this).find('input').first().val().trim();
                const value = $(this).find('input').last().val().trim();
                if (key && value) {
                    headers[key] = value;
                }
            });

            const response = await fetch(url, { 
                method: $('select').first().val(),
                headers
            });
            alert(response.ok ? 'Connection successful!' : 'Connection failed!');
        } catch (error) {
            alert('Connection failed: ' + error.message);
        }
    });
}

$(document).ready(function() {
    initializeForm();
    initializeEventListeners();
});