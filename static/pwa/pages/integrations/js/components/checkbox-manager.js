export function updateCheckboxStates($tree) {
    const checkboxes = $tree.find('input[type="checkbox"]');
    checkboxes.each(function() {
        const path = $(this).data('path');
        const children = $(`input[data-path^="${path}."], input[data-path^="${path}["]`);
        
        if (children.length) {
            const checkedChildren = children.filter(':checked');
            if (checkedChildren.length === 0) {
                $(this).prop('checked', false)
                    .prop('indeterminate', false);
            } else if (checkedChildren.length === children.length) {
                $(this).prop('checked', true)
                    .prop('indeterminate', false);
            } else {
                $(this).prop('indeterminate', true);
            }
        }
    });
}

export function initializeCheckboxHandlers($container) {
    $container.on('change', '.form-check-input', function() {
        const path = $(this).data('path');
        const isChecked = $(this).prop('checked');
        
        $(`[data-path^="${path}."], [data-path^="${path}["]`)
            .prop('checked', isChecked)
            .prop('indeterminate', false);
        
        updateCheckboxStates($container);
    });
}