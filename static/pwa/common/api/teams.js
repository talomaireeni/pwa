/**
 * This file is used to call the teams API endpoints.
 * All calls are made using jQuery AJAX requests.
 * 1- getTeams: Get all teams:
 *    example payload:
 *     var settings = {
            "url": "/apis/teams",
            "method": "GET",
            "timeout": 0,
        };
        
        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    
    example response:
    [
        {
            "id": 792482838,
            "name": "All Members",
            "assignment_method": "Round-robin",
            "is_default": true,
            "members": [
                {
                    "id": 2056400910,
                    "full_name": "saleh9",
                    "email": "when.need1+testagent@gmail.com",
                    "created_at": "2022-07-19T12:22:32.967518Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "en"
                },
                {
                    "id": 1967657373,
                    "full_name": "saleh2",
                    "email": "alresaini.s@gmail.com",
                    "created_at": "2021-06-27T07:37:18.707920Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_admin",
                    "language": "en"
                }
            ],
            "channel_configurations": [
                {
                    "channel_id": 763896078,
                    "team_id": 792482838,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true
                },
                {
                    "channel_id": 902053773,
                    "team_id": 792482838,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true
                }
            ]
        }
    ]
 * 
 */

const getAllTeams = async () => {
    var settings = {
        "url": "/apis/teams",
        "method": "GET",
        "timeout": 0,
    };

    // return $.ajax(settings);

    return [
        {
            "id": 1321084410,
            "name": "All Members",
            "assignment_method": "Round-robin",
            "is_default": true,
            "members": [
                {
                    "id": 1750216102,
                    "full_name": "\u0634\u0647\u062f",
                    "email": "shahad4369@gmail.com",
                    "created_at": "2023-06-11T11:33:39.456892Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "en"
                },
                {
                    "id": 384388931,
                    "full_name": "\u062a\u0631\u0643\u064a - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "turki@myhealth-co.com.sa",
                    "created_at": "2023-04-06T17:23:43.981876Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "en"
                },
                {
                    "id": 1306985308,
                    "full_name": "\u0648\u062c\u062f\u064a",
                    "email": "wssss2006@gmail.com",
                    "created_at": "2023-06-06T11:42:33.598657Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1267804081,
                    "full_name": "\u0641\u0648\u0632\u064a\u0629 \u0627\u0644\u0639\u0646\u0632\u064a",
                    "email": "foozrl1987@gmail.com",
                    "created_at": "2023-05-17T11:53:57.833898Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 50094057,
                    "full_name": "\u0633\u062f\u064a\u0645 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "sadeemalmasaad@gmail.com",
                    "created_at": "2023-04-09T21:12:52.618947Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 854357654,
                    "full_name": "\u0623\u0641\u0646\u0627\u0646 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "fnoxxo@hotmail.com",
                    "created_at": "2023-05-09T11:33:37.655058Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1792478672,
                    "full_name": "\u0647\u062f\u0649 - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "hudaa880@hotmail.com",
                    "created_at": "2023-04-09T21:41:25.357497Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 589645155,
                    "full_name": "\u0631\u064a\u0645 \u0627\u0644\u0642\u062d\u0637\u0627\u0646\u064a",
                    "email": "reemrakanal49@gmail.com",
                    "created_at": "2023-10-04T15:27:14.004014Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 220480889,
                    "full_name": "\u062c\u0645\u0627\u0644",
                    "email": "cmaimc@gmail.com",
                    "created_at": "2023-03-26T12:53:17.067184Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1172051821,
                    "full_name": "\u0635\u062d\u062a\u064a \u0627\u0644\u0637\u0628\u064a\u0629",
                    "email": "info@myhealth-co.com.sa",
                    "created_at": "2023-03-23T11:10:12.959193Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_admin",
                    "language": "en"
                },
                {
                    "id": 1176121829,
                    "full_name": "\u0647\u064a\u0641\u0627\u0621 - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "haiifa.salem@gmail.com",
                    "created_at": "2023-04-05T19:53:04.880843Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1252283252,
                    "full_name": "\u0623\u0633\u0645\u0627\u0621 - \u0645\u062c\u0645\u0639 \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "asma.saad4433@gmail.com",
                    "created_at": "2024-02-06T16:51:28.277834Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 777481406,
                    "full_name": "\u0645\u0646\u064a\u0631\u0629 \u0627\u0644\u0645\u062d\u064a\u0627 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "mu_almuhaya@hotmail.com",
                    "created_at": "2023-04-09T21:15:05.205091Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                }
            ],
            "channel_configurations": [
                {
                    "channel_id": 924985379,
                    "team_id": 1321084410,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true,
                    "is_private": false
                },
                {
                    "channel_id": 420682068,
                    "team_id": 1321084410,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true,
                    "is_private": false
                },
                {
                    "channel_id": 1756302025,
                    "team_id": 1321084410,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true,
                    "is_private": false
                }
            ]
        },
        {
            "id": 1249320013,
            "name": "\u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
            "assignment_method": "Round-robin",
            "is_default": false,
            "members": [
                {
                    "id": 384388931,
                    "full_name": "\u062a\u0631\u0643\u064a - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "turki@myhealth-co.com.sa",
                    "created_at": "2023-04-06T17:23:43.981876Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "en"
                },
                {
                    "id": 1176121829,
                    "full_name": "\u0647\u064a\u0641\u0627\u0621 - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "haiifa.salem@gmail.com",
                    "created_at": "2023-04-05T19:53:04.880843Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 50094057,
                    "full_name": "\u0633\u062f\u064a\u0645 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "sadeemalmasaad@gmail.com",
                    "created_at": "2023-04-09T21:12:52.618947Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1792478672,
                    "full_name": "\u0647\u062f\u0649 - \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "hudaa880@hotmail.com",
                    "created_at": "2023-04-09T21:41:25.357497Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 1252283252,
                    "full_name": "\u0623\u0633\u0645\u0627\u0621 - \u0645\u062c\u0645\u0639 \u0623\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "asma.saad4433@gmail.com",
                    "created_at": "2024-02-06T16:51:28.277834Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 854357654,
                    "full_name": "\u0623\u0641\u0646\u0627\u0646 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "fnoxxo@hotmail.com",
                    "created_at": "2023-05-09T11:33:37.655058Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                },
                {
                    "id": 777481406,
                    "full_name": "\u0645\u0646\u064a\u0631\u0629 \u0627\u0644\u0645\u062d\u064a\u0627 - \u0627\u0633\u0631\u0629 \u0627\u0644\u0645\u062c\u062f",
                    "email": "mu_almuhaya@hotmail.com",
                    "created_at": "2023-04-09T21:15:05.205091Z",
                    "phone": null,
                    "profile_image": null,
                    "status": "Active",
                    "role": "organization_operator",
                    "language": "ar"
                }
            ],
            "channel_configurations": [
                {
                    "channel_id": 924985379,
                    "team_id": 1249320013,
                    "default_agent": null,
                    "can_read": false,
                    "can_reply": false,
                    "can_close": false,
                    "can_reassign": false,
                    "is_private": false
                },
                {
                    "channel_id": 420682068,
                    "team_id": 1249320013,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true,
                    "is_private": true
                },
                {
                    "channel_id": 1756302025,
                    "team_id": 1249320013,
                    "default_agent": null,
                    "can_read": true,
                    "can_reply": true,
                    "can_close": true,
                    "can_reassign": true,
                    "is_private": true
                }
            ]
        }
    ];
};

export { getAllTeams };