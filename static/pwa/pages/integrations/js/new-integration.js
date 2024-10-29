let currentIntegration = null;

function initializeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const integrationId = urlParams.get('id');

    if (integrationId) {
        currentIntegration = IntegrationsData.getById(integrationId);
        if (currentIntegration) {
            $('.card-title').text('Modify Integration');
            
            $('input[type="text"]').first().val(currentIntegration.name);
            $('#integrationType').val(currentIntegration.type);
            
            if (currentIntegration.type === 'rest') {
                $('#restFields').show();
                $('#webhookFields').hide();
                
                $('#restFields input[type="url"]').val(currentIntegration.endpoint);
                $('#restFields select').first().val(currentIntegration.requestMethod);
                
                if (currentIntegration.headers) {
                    $('#headerFields').empty();
                    Object.entries(currentIntegration.headers).forEach(([key, value]) => {
                        addHeaderRow(key, value);
                    });
                }
            } else {
                $('#restFields').hide();
                $('#webhookFields').show();
                
                $('#webhookFields input[type="url"]').val(currentIntegration.webhookUrl);
                
                const $eventsSelect = $('#webhookFields select[multiple]');
                $eventsSelect.val(currentIntegration.events);
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
    $('#integrationType').on('change', function() {
        const isRest = $(this).val() === 'rest';
        $('#restFields').toggle(isRest);
        $('#webhookFields').toggle(!isRest);
    });

    $('#addHeader').on('click', () => addHeaderRow());

    $(document).on('click', '.remove-header', function() {
        $(this).closest('.header-row').remove();
    });

    $('#integrationForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('input[type="text"]').first().val(),
            type: $('#integrationType').val(),
        };

        if (currentIntegration) {
            formData.id = currentIntegration.id;
            formData.status = currentIntegration.status;
            formData.created = currentIntegration.created;
        }

        if (formData.type === 'rest') {
            formData.requestMethod = $('#restFields select').first().val();
            formData.endpoint = $('#restFields input[type="url"]').val();
            
            formData.headers = {};
            $('.header-row').each(function() {
                const key = $(this).find('input').first().val().trim();
                const value = $(this).find('input').last().val().trim();
                if (key && value) {
                    formData.headers[key] = value;
                }
            });
        } else {
            formData.webhookUrl = $('#webhookFields input[type="url"]').val();
            formData.events = $('#webhookFields select[multiple]').val();
        }

        IntegrationsData.save(formData);
        window.location.href = '/test/integrations';
    });

    $('#testConnection').on('click', async function() {
        const type = $('#integrationType').val();
        const url = type === 'rest' 
            ? $('#restFields input[type="url"]').val()
            : $('#webhookFields input[type="url"]').val();

        if (!url) {
            alert('Please enter a valid URL first');
            return;
        }

        try {
            const headers = {};
            if (type === 'rest') {
                $('.header-row').each(function() {
                    const key = $(this).find('input').first().val().trim();
                    const value = $(this).find('input').last().val().trim();
                    if (key && value) {
                        headers[key] = value;
                    }
                });
            }

            const response = await fetch(url, { 
                method: type === 'rest' ? $('#restFields select').first().val() : 'HEAD',
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