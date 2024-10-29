export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

export function formatJSON(str) {
    try {
        const parsed = JSON.parse(str);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return str;
    }
}

export function formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') {
        return value.length > 50 ? `"${value.substring(0, 47)}..."` : `"${value}"`;
    }
    if (Array.isArray(value)) {
        return `[${value.length} items]`;
    }
    if (typeof value === 'object') {
        return '{...}';
    }
    return String(value);
}

export function getTypeBadge(value) {
    const type = Array.isArray(value) ? 'array' : typeof value;
    const badges = {
        string: 'bg-success',
        number: 'bg-info',
        boolean: 'bg-warning',
        object: 'bg-primary',
        array: 'bg-secondary'
    };
    return `<span class="badge ${badges[type] || 'bg-dark'} ms-2">${type}</span>`;
}