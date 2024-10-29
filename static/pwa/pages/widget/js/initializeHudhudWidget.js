import HudhudWidget from './HudhudWidgetApp.js';

const widgetConfig = {
    primaryColor: '#027066',
    secondaryColor: '#7bd0c7',
    size: 1,
    languages: ['ar', 'en'],
    defaultLanguage: 'ar',
    direction: 'right',
    logoUrl: 'https://storage.googleapis.com/hudhud-production-environment-user-data/fav-icon.png',
    titleText: 'المساعد الذكي لمنصة تراضي',
    subtitleText: 'المساعد الذكي',
    footer: 'وزارة العدل',
    sessionDuration: 30 * 60 * 1000,
};

const widget = new HudhudWidget(widgetConfig);
widget.renderWidget();
self.widget = widget; // Expose widget to global scope for debugging