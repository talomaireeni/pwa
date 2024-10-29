
const getAllTags = async () => {
    return [
        {
            "id": "1189370091",
            "name": "عروض جلدية",
            "color": "#417ec8"
        },
        {
            "id": "406939769",
            "name": "تيك توك فراكشنال",
            "color": "#417ec8"
        },
        {
            "id": "2043770700",
            "name": "تحويل  بنكي",
            "color": "#417ec8"
        },
        {
            "id": "836900462",
            "name": "حجز مؤكد",
            "color": "#417ec8"
        }
    ];

    // TODO: remove mock

    var settings = {
        "url": "/apis/get_tags",
        "method": "GET",
        "timeout": 0,
    };

    return $.ajax(settings);
};

export { getAllTags };