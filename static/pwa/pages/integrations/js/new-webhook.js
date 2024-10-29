import { isValidJSON, formatJSON } from './utils/json-formatter.js';
import { generateKeyTree } from './components/tree-generator.js';
import { updateCheckboxStates, initializeCheckboxHandlers } from './components/checkbox-manager.js';

let currentWebhook = null;
let selectedFields = new Set();

function showParseButton(show, autoExpand = false) {
    let parseButton = $('#parsePayload');
    if (show) {
        if (parseButton.length === 0) {
            const textarea = $('textarea[name="payloadStructure"]');
            textarea.after(`
                <div class="mt-2">
                    <button type="button" id="parsePayload" class="btn btn-outline-primary">
                        Parse Payload
                    </button>
                </div>
                <div id="keyTreeContainer" class="mt-3 border rounded p-3" style="display: none;">
                    <div class="mb-3 d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-secondary select-all">Select All</button>
                        <button type="button" class="btn btn-sm btn-secondary unselect-all">Unselect All</button>
                    </div>
                    <div id="keyTree"></div>
                </div>
            `);
            
            const expandTree = () => {
                const payload = JSON.parse($('textarea[name="payloadStructure"]').val());
                const treeHtml = generateKeyTree(payload);
                $('#keyTree').html(treeHtml);
                $('#keyTreeContainer').slideDown();
                
                if (selectedFields.size > 0) {
                    selectedFields.forEach(path => {
                        $(`input[data-path="${path}"]`).prop('checked', true);
                    });
                }
                
                updateCheckboxStates($('#keyTree'));
            };

            $('#parsePayload').on('click', expandTree);

            if (autoExpand) {
                expandTree();
            }

            $('.select-all').on('click', function() {
                $('#keyTree input[type="checkbox"]').prop('checked', true);
                updateCheckboxStates($('#keyTree'));
                selectedFields = new Set();
                $('#keyTree input[type="checkbox"]').each(function() {
                    selectedFields.add($(this).data('path'));
                });
            });

            $('.unselect-all').on('click', function() {
                $('#keyTree input[type="checkbox"]').prop('checked', false)
                    .prop('indeterminate', false);
                selectedFields.clear();
            });

            initializeCheckboxHandlers($('#keyTreeContainer'));
            
            $('#keyTreeContainer').on('change', 'input[type="checkbox"]', function() {
                const path = $(this).data('path');
                if ($(this).prop('checked')) {
                    selectedFields.add(path);
                } else {
                    selectedFields.delete(path);
                }
            });
        }
    } else {
        parseButton.remove();
        $('#keyTreeContainer').remove();
    }
}

function initializeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const webhookId = urlParams.get('id');

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el, {
        html: true,
        placement: 'right'
    }));

    if (webhookId) {
        currentWebhook = IntegrationsData.getById(webhookId);
        if (currentWebhook && currentWebhook.type === 'webhook') {
            $('.card-title').text('Modify Webhook');
            
            $('input[name="name"]').val(currentWebhook.name);
            const payloadValue = currentWebhook.payloadStructure ? 
                JSON.stringify(currentWebhook.payloadStructure, null, 2) : 
                '';
            $('textarea[name="payloadStructure"]').val(payloadValue);
            
            if (currentWebhook.selectedFields) {
                selectedFields = new Set(currentWebhook.selectedFields);
            }
            
            if (payloadValue && isValidJSON(payloadValue)) {
                showParseButton(true, true);
            }
        }
    } else {
        const defaultPayload = JSON.stringify({
            event: "order.created",
            data: {
                orderId: "ORD-123",
                items: [
                    { id: 1, name: "Product A", quantity: 2 },
                    { id: 2, name: "Product B", quantity: 1 }
                ],
                amounts: [99.99, 49.99],
                tags: ["electronics", "sale"],
                status: "pending"
            }
        }, null, 2);
        $('textarea[name="payloadStructure"]').val(defaultPayload);
        showParseButton(true);
    }
}

function initializeEventListeners() {
    $('#webhookForm').on('submit', function(e) {
        e.preventDefault();
        
        const payloadStructure = $('textarea[name="payloadStructure"]').val();
        
        if (!isValidJSON(payloadStructure)) {
            alert('Please enter a valid JSON structure for the payload');
            return;
        }

        const formData = {
            name: $('input[name="name"]').val(),
            type: 'webhook',
            webhookUrl: $('input[name="webhookUrl"]').val(),
            payloadStructure: JSON.parse(payloadStructure),
            selectedFields: Array.from(selectedFields)
        };

        if (currentWebhook) {
            formData.id = currentWebhook.id;
            formData.status = currentWebhook.status;
            formData.created = currentWebhook.created;
        }

        IntegrationsData.save(formData);
        window.location.href = '/test/integrations';
    });

    $('textarea[name="payloadStructure"]').on('input', function() {
        const value = $(this).val();
        if (value) {
            if (!isValidJSON(value)) {
                $(this).addClass('is-invalid');
                showParseButton(false);
            } else {
                $(this).removeClass('is-invalid');
                $(this).val(formatJSON(value));
                showParseButton(true);
            }
        } else {
            $(this).removeClass('is-invalid');
            showParseButton(false);
        }
    });
}

$(document).ready(function() {
    initializeForm();
    initializeEventListeners();
});