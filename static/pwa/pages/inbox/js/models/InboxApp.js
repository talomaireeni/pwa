/*
This is the main view class for the Inbox. It is responsible for rendering the Inbox class, which is the main container for the app.


The Inbox class consists of the following properties and methods:
- properties:
    - currentUserId: This property stores the ID of the currently logged-in user.
    - channels: This property stores the list of channels.
    - tags: This property stores the list of tags.
    - conversations: This property stores the list of conversations in the inbox.
    - selectedConversation: This property stores the currently selected conversation.

- methods:
    - fetchChannels: This method fetches the list of channels from the server.
    - fetchTags: This method fetches the list of tags from the server.
    - fetchConversations: This method fetches the list of conversations from the server.
    - fetchConversation: This method fetches the details of a specific conversation from the server.
    - fetchContact: This method fetches the details of a specific contact from the server.
    - render: This method renders the Inbox object.
*/

import { getAllActiveChannels } from "../../../../common/api/channels.js";
import { getAllTeams } from "../../../../common/api/teams.js";
import { getAllTags } from "../../../../common/api/tags.js";
import { getAllConversations } from "../../../../common/api/conversations.js";

// importing views
import FiltersSection from "../views/FiltersSection.js";
import ConversationsListSection from "../views/ConversationsListSection.js";
import ConversationDetailsSection from "../views/ConversationDetailsSection.js";
import renderContactDetailsSection from "../views/ContactDetailsSection.js";

// utilities
import days from '../../../../common/vendor/js/days/src/index.js';
import relativeTime from '../../../../common/vendor/js/days/src/plugin/relativeTime/index.js';
import updateLocale from '../../../../common/vendor/js/days/src/plugin/updateLocale/index.js';
import locale from '../../../../common/vendor/js/days/src/locale/ar-sa.js';

class Inbox {
    constructor(container) {
        this.container = $(container);
        this.currentUserId = null;
        this.allTeams = [];
        this.agents = [];
        this.channels = [];
        this.tags = [];
        this.dateRanges = [{ id: 'last-30-days', name: 'Last 30 days' }, { id: 'last-90-days', name: 'Last 90 days' }, { id: 'last-120-days', name: 'Last 120 days' }];
        this.conversations = null;
        this.selectedConversation = null;
        this.filters = { page: 1 };
        this.days = days;

        // reusable API instance
        this.getAllConversations = getAllConversations;

        // sub-view instances
        this.filtersSection = null;
        this.conversationsListSection = null;
        this.conversationDetailsSection = null;
        this.contactDetailsSection = null;
    }

    async initialize() {

        const [channels, allTeams, tags,] = await Promise.all([
            getAllActiveChannels(),
            getAllTeams(),
            getAllTags(),
        ]);

        this.channels = channels.filter((channel) => channel.is_deleted === false);
        this.allTeams = allTeams;
        this.tags = tags;
        this.filters = this.parseQueryParams();
        this.conversations = await this.getAllConversations(this.filters);

        // setup days.js
        days.extend(relativeTime);
        days.extend(updateLocale);
        if ($('html').attr('lang') === 'ar') {
            days.locale(locale);
            days.updateLocale('ar-sa', {
                relativeTime: {
                    future: 'في %s',
                    past: 'منذ %s',
                    s: 'ثوان',
                    ss: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'ثانية';
                        }

                        if (number === 2) {
                            return 'ثانيتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} ثوان`;
                        }

                        return `${number} ثانية`;
                    },
                    m: 'دقيقة',
                    mm: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'دقيقة';
                        }

                        if (number === 2) {
                            return 'دقيقتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} دقائق`;
                        }

                        return `${number} دقيقة`;
                    },
                    h: 'ساعة',
                    hh: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'ساعة';
                        }

                        if (number === 2) {
                            return 'ساعتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} ساعات`;
                        }

                        return `${number} ساعة`;
                    },
                    d: 'يوم',
                    dd: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'يوم';
                        }

                        if (number === 2) {
                            return 'يومين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} أيام`;
                        }

                        return `${number} يوم`;
                    },
                    M: 'شهر',
                    MM: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'شهر';
                        }

                        if (number === 2) {
                            return 'شهرين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} أشهر`;
                        }

                        return `${number} شهر`;
                    },
                    y: 'سنة',
                    yy: (number, withoutSuffix, key, isFuture) => {
                        if (number === 1) {
                            return 'سنة';
                        }

                        if (number === 2) {
                            return 'سنتين';
                        }

                        if (number > 2 && number < 11) {
                            return `${number} سنوات`;
                        }

                        return `${number} سنة`;
                    },
                }
            });
        }

        // relative dates setup
        this.days = days;

        // auto-update the relative time every half a minute [data-timestamp]
        setInterval(() => {
            this.updateRelativeTimes();
        }, 30000);

        // initialising the sub-views
        this.filtersSection = new FiltersSection(this.allTeams, this.channels, this.tags, this.dateRanges, this.filters, this);
        this.updateFilters(this.filters);
        this.conversationsListSection = new ConversationsListSection(this.conversations, this);
        this.conversationDetailsSection = new ConversationDetailsSection(this.selectedConversation, this);
        this.contactDetailsSection = renderContactDetailsSection();
    }

    updateRelativeTimes() {
        $('[data-timestamp]').each((index, element) => {
            const timestamp = $(element).data('timestamp');
            $(element).text(this.days(timestamp).fromNow());

            // get formatted date, then add tooltip
            const formattedDate = this.days(timestamp).format('YYYY-MM-DD hh:mm a');
            $(element).attr('title', formattedDate);
            $(element).tooltip();
        });
    }

    parseQueryParams() {
        // Parse the query parameters from the URL and update the state of the Inbox object
        const queryParams = new URLSearchParams(window.location.search);
        const filters = {};
        // the expected query params are: teams: (list of ids), channels: (list of ids), tags: (list of ids), dateRange: single string id
        if (queryParams.has('search')) {
            filters.search = queryParams.get('search');
        }

        if (queryParams.has('assignee')) {
            filters.assignee = queryParams.get('assignee');
        }

        if (queryParams.has('teams')) {
            filters.teams = queryParams.get('teams').split(',').map(id => (parseInt(id)));
            filters.teams = this.allTeams.filter(team => filters.teams.includes(parseInt(team.id)));
        }

        if (queryParams.has('channels')) {
            filters.channels = queryParams.get('channels').split(',').map(id => (parseInt(id)));
            filters.channels = this.channels.filter(channel => filters.channels.includes(parseInt(channel.id)));
        }

        if (queryParams.has('tags')) {
            filters.tags = queryParams.get('tags').split(',').map(id => (parseInt(id)));
            filters.tags = this.tags.filter(tag => filters.tags.includes(parseInt(tag.id)));
        }

        if (queryParams.has('dateRange')) {
            filters.dateRange = queryParams.get('dateRange');
            filters.dateRange = this.dateRanges.find(dateRange => dateRange.id === filters.dateRange);
        }

        // if no dateRange is selected, select the first one
        if (!filters.dateRange) {
            filters.dateRange = this.dateRanges[0];
        }

        if (queryParams.has('page')) {
            filters.page = queryParams.get('page');
        }

        return filters;
    }

    updateFilters(filters) {
        // Update the filters in the Inbox object
        this.filters = { ...this.filters, ...filters };

        // update the search input value
        this.filtersSection.view.find('#search').val(this.filters.search);

        // update the applied filters count. Counting only NON-EMPTY "this.filters" keys except dateRange
        const appliedFiltersCount = Object.keys(this.filters).filter(key => key !== 'dateRange' && this.filters[key]?.length > 0).length;
        if (appliedFiltersCount) {
            this.filtersSection.view.find('.applied-filters-count').show();
            this.filtersSection.view.find('.applied-filters-count').text(appliedFiltersCount);
        }
        else {
            this.filtersSection.view.find('.applied-filters-count').text('');
            this.filtersSection.view.find('.applied-filters-count').hide();
        }

        const queryParams = new URLSearchParams();
        Object.entries(this.filters).forEach(([key, value]) => {
            switch (key) {
                case 'search':
                    if (value.length > 0) {
                        queryParams.set(key, value);
                    }
                    break;
                case 'assignee':
                    if (value) {
                        queryParams.set(key, value);
                    }
                    break;
                case 'page':
                    if (value) {
                        queryParams.set(key, value);
                    }
                    break;
                default:
                    if (value.length > 0) {
                        queryParams.set(key, value.map(item => item.id).join(','));
                    }
                    break;
            }
        });

        // update the URL with the query params (for bookmarking and sharing) without reloading the page
        window.history.pushState({}, '', `${window.location.pathname}?${queryParams.toString()}`);
    }


    fetchConversation(conversationId) {
        // Fetch the details of a specific conversation from the server
    }

    fetchContact(contactId) {
        // Fetch the details of a specific contact from the server
    }

    render() {
        // Render the Inbox object
        // TODO: conditional rendering/update of sections based on the state of the Inbox object
        this.container.append(this.filtersSection.view);
        this.container.append(this.conversationsListSection.view);
        this.container.append(this.contactDetailsSection);

        // this.updateRelativeTimes();
    }

    showToast(message, bsColor, placement) {
        // create a toast html
        const toast = $(/*html*/`
            <div class="toast align-items-center text-bg-${bsColor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                ${message}
              </div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>
        `);

    }
}

export default Inbox;