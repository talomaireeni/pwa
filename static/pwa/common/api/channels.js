// var settings = {
//     "url": "{{platform_url}}/apis/channels",
//     "method": "GET",
//     "timeout": 0,
//   };

//   $.ajax(settings).done(function (response) {
//     console.log(response);
//   });

const getAllActiveChannels = async () => {
    var settings = {
        "url": "/apis/channels",
        "method": "GET",
        "timeout": 0,
    };

    // return $.ajax(settings);

    return [
        {
            "id": 1756302025,
            "name": "\u0645\u062c\u0645\u0639 \u0633\u064a\u0645\u0627\u064a \u0627\u0644\u0637\u0628\u064a",
            "channel_type": "whatsapp_360dialog",
            "status": "Active",
            "channel_details": {
                "whatsapp_number": "966550292664",
                "whatsapp_display_name": "\u0645\u062c\u0645\u0639 \u0633\u064a\u0645\u0627\u064a \u0627\u0644\u0637\u0628\u064a"
            },
            "image": "http://app.mysite.com/local_storage/channel_image_1756302025_089a989d-122a-45ef-b016-01fb360ee1bb.jpg",
            "identifier": "966550292664",
            "is_deleted": false,
            "channel_permissions": {
                "can_read": true,
                "can_reply": true,
                "can_reassign": true,
                "can_close": true
            }
        },
        {
            "id": 924985379,
            "name": "\u0645\u062c\u0645\u0639 \u0633\u064a\u0645\u0627\u064a \u0627\u0644\u0637\u0628\u064a",
            "channel_type": "whatsapp_360dialog",
            "status": "Inactive",
            "channel_details": {
                "whatsapp_number": "966550292664",
                "whatsapp_display_name": "\u0645\u062c\u0645\u0639 \u0633\u064a\u0645\u0627\u064a \u0627\u0644\u0637\u0628\u064a"
            },
            "image": "http://app.mysite.com/local_storage/https%3A/pps.whatsapp.net/v/t61.24694-24/328750109_735681324689242_2184565454107603820_n.jpg%3Fstp%3Ddst-jpg_s96x96%26ccb%3D11-4%26oh%3D01_AdSkpYvrZ0YxzRmCQbcdGnaV3rvQFmr4-Jo0B-lpXEY54A%26oe%3D643A6ACD",
            "identifier": "966550292664",
            "is_deleted": true,
            "channel_permissions": {
                "can_read": true,
                "can_reply": true,
                "can_reassign": true,
                "can_close": true
            }
        },
        {
            "id": 420682068,
            "name": "\u0645\u062c\u0645\u0639 \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f \u0627\u0644\u0637\u0628\u064a",
            "channel_type": "whatsapp_360dialog",
            "status": "Active",
            "channel_details": {
                "whatsapp_number": "966545571004",
                "whatsapp_display_name": "\u0645\u062c\u0645\u0639 \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f \u0627\u0644\u0637\u0628\u064a"
            },
            "image": "http://app.mysite.com/local_storage/channel_image_420682068_4bfd14f6-8021-472f-86e0-afadd6405ad2.jpg",
            "identifier": "966545571004",
            "is_deleted": false,
            "channel_permissions": {
                "can_read": true,
                "can_reply": true,
                "can_reassign": true,
                "can_close": true
            }
        }
    ];
};

export { getAllActiveChannels };