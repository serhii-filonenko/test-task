import { Database } from './database.service';
import { Notification } from './notification.service';
import { FileStorage } from './fileStorage.service';
import { config } from '../config';

const notification = new Notification();

const fileStorage = new FileStorage({ notification });

const database = new Database({
	notification,
	fileStorage,
	config,
});

export { database, notification };
