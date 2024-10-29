import multiLevelDropdown from "../../../../common/vendor/js/bootstrap-multi-level-dropdown.js";
// import NestedDropdown from "../../../../common/shared-components/nested-dropdown/NestedDropdown.js";

class FiltersSection {
    constructor(teams = [], channels = [], tags = [], dateRange = [], initialFilters = {}, inboxApp) {
        this.teams = teams;
        this.channels = channels;
        this.tags = tags;
        this.dateRange = dateRange;
        this.initialFilters = initialFilters;
        this.inboxApp = inboxApp;
        this.view = this.createView();
    }

    createView() {
        const view = $(/*html*/`
        <!-- Filters Section -->
        <div class="filters bg-light" style="height: 100vh;">
            <h4 class="p-3" style="font-weight: 600; letter-spacing: -.25px;">Inbox</h4>
            <div class="filters-trigger p-3">
                <input id="search" type="text" class="form-control" placeholder="Search messages">
                <!-- clear content -->
                <span id="clear-search-content" style="cursor: pointer;line-height: 1">
                    <i class="iconoir-xmark" style="font-size: larger;color: var(--bs-secondary);margin-left: -30px;"></i>
                </span>
                <!-- filter button -->
                <span class="filter-button" style="cursor: pointer;">
                    <i class="iconoir-filter-list" style="font-size: larger;color: var(--bs-primary);"></i>
                    <span class="applied-filters-count"></span>
                </span>
            </div>
            <div class="p-3">
                <ul class="filters-list">
                    <li class="assignment-list-item ${this.inboxApp.filters?.assignee == 'me'? 'active' : ''}">
                        <a id="assignee-me" data-assignee-value="me" href="#"> <i class="iconoir-user"></i> <span>Mine</span> </a>
                        <span class="badge bg-primary">10</span>
                    </li>
                    <li class="assignment-list-item ${this.inboxApp.filters?.assignee == 'unassigned'? 'active' : ''}">
                        <a id="assignee-unassigned" data-assignee-value="unassigned" href="#"> <i class="iconoir-chat-bubble-question"></i> <span>Unassigned</span> </a>
                        <span class="badge bg-primary">10</span>
                    </li>
                    <li class="assignment-list-item ${this.inboxApp.filters?.assignee == 'all'? 'active' : ''}">
                        <a id="assignee-all" data-assignee-value="all" href="#"> <i class="iconoir-box"></i> <span>All</span> </a>
                        <span class="badge bg-primary">10</span>
                    </li>
                </ul>
            </div>
        </div>`);


        $('.app-container').append(this.renderFiltersModal());
        $('#filtersModal').hide(); // the modal is shown when the filter button is clicked

        this.renderTeams(view);
        this.attachEventHandlers(view);

        return view;
    }

    attachEventHandlers(view) {
        view.find('.filter-button').click((e) => {
            e.preventDefault();
            $('#filtersModal').modal('show');
        });

        view.find('#search').on('keyup', (e) => {
            if (e.keyCode === 13) {
                const searchValue = view.find('#search').val();
                if (searchValue.length > 2) {
                    this.inboxApp.updateFilters({ search: searchValue });
                }
            }
        });

        // clear-search-content click event
        view.find('#clear-search-content').click((e) => {
            view.find('#search').val('');
            // update filters in the InboxApp
            this.inboxApp.updateFilters({ search: '' });
        });

        // assignee filters click event
        view.find('.filters-list li').click((e) => {
            e.preventDefault();
            view.find('.filters-list li.assignment-list-item').removeClass('active');
            $(e.currentTarget).addClass('active');

            const assignee = $(e.currentTarget).find('a').data('assignee-value');
            const assigneeFilters = { assignee: assignee };
            this.inboxApp.updateFilters(assigneeFilters);
        });
    }

    renderTeams(view) {
        this.teams.forEach((team) => {
            const teamView = $(/*html*/`
            <li class="team-list-item ${team.id === this.inboxApp.filters?.teams?.find((t) => t.id === team.id)?.id ? 'active' : ''}">
                <a href="#"> <i class="iconoir-group"></i> <span>${team.name}</span> </a>
                <span class="badge bg-primary">${team.conversations_count || 0}</span>
            </li>
            `);

            teamView.click((e) => {
                e.preventDefault();

                // add active class to the clicked team
                view.find('.filters-list li.team-list-item').removeClass('active');
                teamView.addClass('active');

                // find the team in filters modal matching the clicked team and make it checked
                const teamCheckbox = $('#filtersModal')
                    .find(`input#teams-${team.id}`)
                    .prop('checked', true);

                // uncheck all other teams in the teams dropdown
                $('#filtersModal')
                    .find('#teams-section')
                    .find('.form-check-input')
                    .not(`#teams-${team.id}`)
                    .prop('checked', false);

                this.updateSelectedItemsCount($('#filtersModal'));
                this.inboxApp.updateFilters({ teams: [team] });
            });

            view.find('.filters-list').append(teamView);
        });
    }

    renderFiltersModal() {
        const teams = this.updateCheckedStatus(this.teams, this.initialFilters.teams);
        const channels = this.updateCheckedStatus(this.channels, this.initialFilters.channels);
        const tags = this.updateCheckedStatus(this.tags, this.initialFilters.tags);
        const dateRange = this.updateCheckedStatus(this.dateRange, this.initialFilters.dateRange, true);

        const view = $(/*html*/`
        <!-- Filters Modal -->
        <div class="modal fade" id="filtersModal" tabindex="-1" aria-labelledby="filtersModalLabel" aria-hidden="true" style="display: block;width: 400px;left: 260px;top: 90px;height: fit-content;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="filtersModalLabel">Filters</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3 d-flex flex-column align-items-center">
                        <div class="d-flex justify-content-end w-100">
                            <button id="clear-all-filters" class="btn btn-sm btn-dark">Clear all filters <i class="iconoir-xmark"></i></button>
                        </div>
                        ${this.renderDropdownSection('Teams', teams)}
                        ${this.renderDropdownSection('Channels', channels)}
                        ${this.renderDropdownSection('Tags', tags)}
                        ${this.renderDropdownSection('Date Range', dateRange, true)}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Discard</button>
                        <button id="apply-filters" type="button" class="btn btn-primary">Apply Filters</button>
                    </div>
                </div>
            </div>
        </div>`);

        this.attachModalEventHandlers(view);

        return view;
    }

    updateCheckedStatus(items, initialItems, isRadio = false) {
        return items.map(item => {
            item.checked = initialItems && (isRadio ? item.id === initialItems.id : initialItems.map(i => i.id).includes(item.id));
            return item;
        });
    }

    renderDropdownSection(title, items, isRadio = false) {
        const normalizedTitle = title.toLowerCase().replace(' ', '-');
        const inputType = isRadio ? 'radio' : 'checkbox';
        const inputName = isRadio ? `${normalizedTitle}Group` : '';


        return `
        <div id="${normalizedTitle}-section">
            <div class="d-flex">
                <div class="dropdown mt-3">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" id="${normalizedTitle}Dropdown"
                        data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-orignal-label="Select ${title}">
                        Select ${title}
                    </button>
                    <div class="dropdown-menu" aria-labelledby="${normalizedTitle}Dropdown">
                        ${items.map(item => `
                            <div class="form-check">
                                <input class="form-check-input" type="${inputType}" name="${inputName}" value="${item.id}" id="${normalizedTitle}-${item.id}" ${item.checked ? 'checked' : ''}>
                                <label class="form-check-label" for="${normalizedTitle}-${item.id}">
                                    ${item.name}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>`;
    }

    attachModalEventHandlers(view) {
        view.find('#clear-all-filters').click((e) => {
            e.preventDefault();
            // uncheck all checkboxes
            view.find('.form-check-input').prop('checked', false);
            // clear search input
            $('#search').val('');
            // remove active class from all teams
            $('.filters-list li').removeClass('active');

            // update filters in the InboxApp
            this.inboxApp.updateFilters({ teams: [], channels: [], tags: [], dateRange: [], search: '', assignee: 'all' });
            this.updateSelectedItemsCount(view);
        });

        view.find('.dropdown-menu').on('click', '.form-check-input', () => {
            this.updateSelectedItemsCount(view);
        });

        view.find('#apply-filters').click((e) => {
            e.preventDefault();
            const appliedFilters = this.getAppliedFilters();
            this.inboxApp.updateFilters(appliedFilters);
            $('#filtersModal').modal('hide');

            // if more than one team is selected, remove active class from all teams
            if (appliedFilters.teams.length > 1) {
                $('.filters-list li.team-list-item').removeClass('active');
            }
        });

        this.updateSelectedItemsCount(view);
    }

    updateSelectedItemsCount(view) {
        view.find('.dropdown').each((index, dropdown) => {
            const selectedItems = $(dropdown).find('.form-check-input:checked').length;
            if (selectedItems > 0) {
                $(dropdown).find('.btn').text(`${selectedItems} Selected`);
            } else {
                $(dropdown).find('.btn').text($(dropdown).find('.btn').data('orignal-label'));
            }
        });
    }

    getAppliedFilters() {
        const view = $('#filtersModal');
        const selectedTeams = this.teams.filter(team => view.find(`#teams-${team.id}`).is(':checked'));
        const selectedChannels = this.channels.filter(channel => view.find(`#channels-${channel.id}`).is(':checked'));
        const selectedTags = this.tags.filter(tag => view.find(`#tags-${tag.id}`).is(':checked'));
        const selectedDateRange = this.dateRange.filter(range => view.find(`#date-range-${range.id}`).is(':checked'));

        return { teams: selectedTeams, channels: selectedChannels, tags: selectedTags, dateRange: selectedDateRange };
    }
}

export default FiltersSection;