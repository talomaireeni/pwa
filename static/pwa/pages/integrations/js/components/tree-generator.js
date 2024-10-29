import { getTypeBadge, formatValue } from '../utils/json-formatter.js';

export function generateArrayElements(array, path) {
    let html = '<ul class="list-unstyled ms-4 array-elements">';
    array.forEach((value, index) => {
        const elementPath = `${path}[${index}]`;
        const isObject = value && typeof value === 'object' && !Array.isArray(value);
        const isArray = Array.isArray(value);
        
        html += `
            <li class="mb-2">
                <div class="form-check d-flex align-items-center">
                    <input class="form-check-input" type="checkbox" id="key-${elementPath}" data-path="${elementPath}">
                    <label class="form-check-label ms-2" for="key-${elementPath}">
                        <span class="fw-medium">[${index}]</span>
                        ${getTypeBadge(value)}
                        <span class="text-muted ms-2 small">${formatValue(value)}</span>
                    </label>
                </div>
                ${isObject ? generateKeyTree(value, elementPath) : ''}
                ${isArray ? generateArrayElements(value, elementPath) : ''}
            </li>
        `;
    });
    html += '</ul>';
    return html;
}

export function generateKeyTree(obj, prefix = '') {
    let html = '<ul class="list-unstyled ms-4">';
    for (const key in obj) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        const isObject = value && typeof value === 'object' && !Array.isArray(value);
        const isArray = Array.isArray(value);
        
        html += `
            <li class="mb-2">
                <div class="form-check d-flex align-items-center">
                    <input class="form-check-input" type="checkbox" id="key-${fullPath}" data-path="${fullPath}">
                    <label class="form-check-label ms-2" for="key-${fullPath}">
                        <span class="fw-medium">${key}</span>
                        ${getTypeBadge(value)}
                        <span class="text-muted ms-2 small">${formatValue(value)}</span>
                    </label>
                </div>
                ${isObject ? generateKeyTree(value, fullPath) : ''}
                ${isArray ? generateArrayElements(value, fullPath) : ''}
            </li>
        `;
    }
    html += '</ul>';
    return html;
}