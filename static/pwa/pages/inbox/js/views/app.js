import Inbox from '../models/InboxApp.js';
import ConversationsListSection from './ConversationsListSection.js';

self.app = new Inbox('.app-container');
await self.app.initialize();
// TODO: remove the following line after fixing the API
self.app.agents = available_agents;
self.app.conversationsListSection = new ConversationsListSection(app.conversations, app);
self.app.render();