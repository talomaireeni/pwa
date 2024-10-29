const getAllConversations = async (filters) => {
    const agent_id = '1300151988037239081';
    let settings = {
        "url": "/ajax-core-event/load_conversations/",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "accept": "*/*",
            "accept-language": "en-SA,en;q=0.9,ar-SA;q=0.8,ar;q=0.7,en-US;q=0.6,ka;q=0.5",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "cookie": "csrftoken=UUKEWLcKTK3lyZFKu1Ix04zFVeSKs8KQLhTVlKKrHQOVKnSccNhSQetnY8MY7bBd; django_language=en; sessionid=l3evoarc6itt6r1w03t0dd17a7l024lb; org_id=808599373",
        },
        "data": `filters={"conversation_per_page":100}&agent_id=1300151988037239081`

    };
    return $.ajax(settings);
}

export { getAllConversations };