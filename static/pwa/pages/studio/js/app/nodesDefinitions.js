/*
Defining the node types along with color, icon and category.
Nodes with the same category will be grouped together in the node palette and share the same color.
*/

const FLOW_CONTROL_NODES = [
    {
        name: 'Trigger',
        type: 'Trigger',
        color: 'var(--bs-dark)',
        icon: 'iconoir-flash',
        category: 'Flow Control',
        maxOutputs: 0
    },
    {
        name: 'Time delay',
        type: 'TimeDelay',
        color: 'var(--bs-dark)',
        icon: 'iconoir-timer',
        category: 'Flow Control',
        maxOutputs: 1
    },
    {
        name: 'If condition',
        type: 'IfCondition',
        color: 'var(--bs-dark)',
        icon: 'iconoir-axes',
        category: 'Flow Control',
        maxOutputs: 2
    },
    {
        name: 'Branch by variable',
        type: 'BranchByVariable',
        color: 'var(--bs-dark)',
        icon: 'iconoir-network-reverse',
        category: 'Flow Control',
        maxOutputs: 99
    },
    {
        name: 'Keyword search',
        type: 'KeywordSearch',
        color: 'var(--bs-dark)',
        icon: 'iconoir-text-magnifying-glass',
        category: 'Flow Control',
        maxOutputs: 99
    },
    {
        name: 'Goto node',
        type: 'GotoNode',
        color: 'var(--bs-dark)',
        icon: 'iconoir-dot-arrow-right',
        category: 'Flow Control',
        maxOutputs: 0
    },
    {
        name: 'Goto another flow',
        type: 'GotoAnotherFlow',
        color: 'var(--bs-dark)',
        icon: 'iconoir-long-arrow-up-left',
        category: 'Flow Control',
        maxOutputs: 0
    },
    {
        name: 'Close conversation',
        type: 'CloseConversation',
        color: 'var(--bs-dark)',
        icon: 'iconoir-chat-bubble-check',
        category: 'Flow Control',
        maxOutputs: 0
    },
    {
        name: 'Handover to human',
        type: 'HandoverToHuman',
        color: 'var(--bs-dark)',
        icon: 'iconoir-user-badge-check',
        category: 'Flow Control',
        maxOutputs: 0
    },
];

const WHATSAPP_NODES = [
    {
        name: 'Send WhatsApp message',
        type: 'SendWhatsAppMessage',
        color: 'var(--bs-teal)',
        icon: 'iconoir-chat-bubble',
        category: 'Conversation Management',
        maxOutputs: 1
    },
    // {
    //     name: 'Send Quick Reply',
    //     type: 'SendQuickReply',
    //     color: 'var(--bs-teal)',
    //     icon: 'iconoir-bubble-star',
    //     category: 'Conversation Management',
    //     maxOutputs: 1
    // },
    {
        name: 'Send WhatsApp Message with Buttons',
        type: 'SendWhatsAppMessageWithButtons',
        color: 'var(--bs-teal)',
        icon: 'iconoir-view-structure-up',
        category: 'Conversation Management',
        maxOutputs: 3
    },
    {
        name: 'Send WhatsApp Message with List',
        type: 'SendWhatsAppMessageWithList',
        color: 'var(--bs-teal)',
        icon: 'iconoir-list',
        category: 'Conversation Management',
        maxOutputs: 10
    },
    {
        name: 'Send WhatsApp Message with Dynamic List',
        type: 'SendWhatsAppMessageWithDynamicList',
        color: 'var(--bs-teal)',
        icon: 'iconoir-playlist-plus',
        category: 'Conversation Management',
        maxOutputs: 99
    },
    {
        name: 'Send Template Message',
        type: 'SendTemplateMessage',
        color: 'var(--bs-teal)',
        icon: 'iconoir-quote-message',
        category: 'Conversation Management',
        maxOutputs: 3
    },
    {
        name: 'Ask User for Text Input',
        type: 'AskForTextInput',
        color: 'var(--bs-teal)',
        icon: 'iconoir-input-field',
        category: 'Conversation Management',
        maxOutputs: 1
    },
    {
        name: 'Ask User for Location',
        type: 'AskForLocation',
        color: 'var(--bs-teal)',
        icon: 'iconoir-map-pin',
        category: 'Conversation Management',
        maxOutputs: 1
    },
    {
        name: 'Ask User for File',
        type: 'AskForFile',
        color: 'var(--bs-teal)',
        icon: 'iconoir-attachment',
        category: 'Conversation Management',
        maxOutputs: 1
    },
    {
        name: 'Ask User for Photo',
        type: 'AskForPhoto',
        color: 'var(--bs-teal)',
        icon: 'iconoir-media-image-plus',
        category: 'Conversation Management',
        maxOutputs: 1
    }
];

const DATA_MANAGEMENT_NODES = [{
    name: 'Set variable',
    type: 'SetVariable',
    color: 'var(--bs-primary)',
    icon: 'iconoir-code-brackets',
    category: 'Data Management',
    maxOutputs: 1
},

{
    name: 'Delete variable',
    type: 'DeleteVariable',
    color: 'var(--bs-primary)',
    icon: 'iconoir-code-brackets',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Set contact attribute',
    type: 'SetContactAttribute',
    color: 'var(--bs-primary)',
    icon: 'iconoir-user-plus',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Delete contact attribute',
    type: 'DeleteContactAttribute',
    color: 'var(--bs-primary)',
    icon: 'iconoir-user-xmark',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Add tag',
    type: 'AddTag',
    color: 'var(--bs-primary)',
    icon: 'iconoir-label',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Remove tag',
    type: 'RemoveTag',
    color: 'var(--bs-primary)',
    icon: 'iconoir-label',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Send rating',
    type: 'SendRating',
    color: 'var(--bs-primary)',
    icon: 'iconoir-star',
    category: 'Data Management',
    maxOutputs: 1
},
{
    name: 'Call API',
    type: 'CallAPI',
    color: 'var(--bs-primary)',
    icon: 'iconoir-code',
    category: 'Data Management',
    maxOutputs: 2
}];

export { FLOW_CONTROL_NODES, WHATSAPP_NODES, DATA_MANAGEMENT_NODES }