/**
 * This script generates side bar elements is built using jQuery and Bootstrap only.
 * It is a container for the sidebar items.
 * It is a stateless component.
 * It receives the following props:
 * - items: an array of objects, each object representing a sidebar item.
 * 
 * Each sidebar item object has the following properties:
 * - id: a unique identifier for the sidebar item.
 * - icon: the icon to be displayed for the sidebar item.
 * - label: the label to be displayed for the sidebar item.
 * - link: the link to navigate to when the sidebar item is clicked.
 * - active: a boolean indicating whether the sidebar item is active.
 * - disabled: a boolean indicating whether the sidebar item is disabled.
 */

const generateSidebarElements = (items) => {
    const html = /*html*/
        `   <ul class="sidebar">
            ${items.map(item => `
                <li>
                    <a href="${item.link}" data-label="${item.label}">
                        <i class="${item.icon}"></i>
                    </a>
                </li>
            `).join('')}
        </ul>
    `;

    return html;
};

const elements = [
    { label: "Dashboard", icon: "iconoir-activity", link: "/dashboard", active: true, disabled: false },
    { label: "Channels", icon: "iconoir-contactless", link: "/channels", active: false, disabled: false },
    { label: "Flows", icon: "iconoir-network-reverse", link: "/flows", active: false, disabled: false },
    { label: "Contacts", icon: "iconoir-group", link: "/contacts", active: false, disabled: false },
    { label: "Campaigns", icon: "iconoir-megaphone", link: "/campaigns", active: false, disabled: false }
];

$(document).ready(() => {
    let siebarHtml = /*html*/
        `<div class="sidebar-header">
        <img src="../../../static/img/brand/hudhud-Logo.png" width="35px" alt="Hudhud Logo" style="margin-bottom: 30px;"/>
        ${generateSidebarElements(elements)}
    </div>

    <div class="sidebar-footer">
        <ul class="sidebar">
            <li>
                <a href="/change-language/ar" data-label="Change language">
                    <i class="iconoir-globe"></i>
                </a>
            </li> 
            <li>
                <a href="/settings" data-label="Settings" data-toggle="tooltip" data-placement="top" title="Tooltip on top">
                    <i class="iconoir-more-vert-circle"></i>
                </a>
            </li>   
            <li>                     
                <a href="#">
                    <img class="rounded-circle" src=" https://storage.googleapis.com/hudhud-production-environment-user-data/7d595021-e046-4d6c-bf6d-9ef7685de8bd.png" width="25px">
                </a>
            </li>
        </ul>
    </div>`;

    $('aside#sidebar').html(siebarHtml);

    // now add a tooltip to each sidebar item, to display the item label
    $('aside#sidebar .sidebar li:not(:last)').each(function () {
        // add title attribute to the anchor tag
        $(this).find('a').attr('title', $(this).find('a').data('label'));
        $(this).find('a').tooltip({
            container: 'body',
            title: $(this).find('a').data('label'),
            html: false,
            placement: 'right',
            trigger: 'hover'
        });
    });
});





