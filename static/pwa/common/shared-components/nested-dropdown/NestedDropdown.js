const NestedDropdown = (items, label) => {
    const generateDropdown = (items) => {
        return items.map(item => `
            ${Array.isArray(item.items) && item.items.length > 0 ? `
                <div class="dropdown dropend">
                    <a class="dropdown-item dropdown-toggle" href="#" id="dropdown-${item.id}" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${item.label}</a>
                    <div class="dropdown-menu" aria-labelledby="dropdown-${item.id}">
                        ${generateDropdown(item.items)}
                    </div>
                </div>
            ` : `
                <div class="dropdown-item">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${item.id}" id="item-${item.id}" ${item.checked ? 'checked' : ''}>
                        <label class="form-check-label" for="item-${item.id}">
                            ${item.label}
                        </label>
                    </div>
                </div>
            `}
        `).join('');
    };

    return `
        <div class="dropdown mt-3">
            <button class="btn btn-outline-primary dropdown-toggle" type="button"
                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${label}
            </button>
            <div class="dropdown-menu">
                ${generateDropdown(items)}
            </div>
        </div>
    `;
};

export default NestedDropdown;