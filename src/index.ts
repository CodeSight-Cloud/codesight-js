interface IConfig {
	apiKey: string;
	environment: string;
	project: string;
	interval?: number;
}

interface IClient {
	invoke: (name: string, file: string) => void;
	startSession: (config: IConfig) => any;
	closeSession: () => any;
	postSession: () => void;
}

interface ISession {
	apiKey: string,
	id: string,
	project: string | null;
	environment: string | null;
	start: Date,
	end: Date | null,
	events: any;
}

interface IEvent {
	type: EventType;
	count: number;
}

enum EventType {
	function = 0
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const baseUrl = 'platform.codesight.cloud';
const sessionPath = '/api/1/session';

export class Client implements IClient {
	session: ISession;

	constructor(config: IConfig) {
		this.session = this.startSession(config);

		setInterval(this.postSession.bind(this, false), config.interval || 30000);

		if (window) {
			window.addEventListener('beforeunload', () => {
				this.closeSession();

				if (navigator.sendBeacon)				
					navigator.sendBeacon('https://' + baseUrl + sessionPath, JSON.stringify(this.session));
				else
					this.postSession(false);
			});
		}
	}

	private _onEvent = (id: string, event: IEvent) => {
		this.session.events[id] = event;
	}

	public invoke = (name: string, file: string) => {
		const id = encodeURIComponent(name + file);
		let event = this.session.events[id];

		if (event)
			event.count++;
		else
			event = { name, file, count: 1, type: EventType.function };

		this._onEvent(id, event);
	}

	public startSession = (config: IConfig) => {
		this.session = {
			id: guid(),
			apiKey: config.apiKey,
			project: config.project,
			environment: config.environment,
			start: new Date(),
			end: null,
			events: {}
		}
		return this.session;
	}

	public closeSession = () => {
		this.session.end = new Date();
		return this.session;
	}

	public postSession = (async = true) => {
		if (Object.keys(this.session.events).length > 0) {
			if (XMLHttpRequest) {
				const xhr = new XMLHttpRequest();
				xhr.open("POST", 'https://' + baseUrl + sessionPath, async);
				xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4 && xhr.status === 204) {
						this.session.events = {};
					}
				};
				xhr.send(JSON.stringify(this.session));
			}
			else if (require) {
				const https = require('https');
				const sessionData = JSON.stringify(this.session);
			
				const options = {
					hostname: baseUrl,
					port: 443,
					path: sessionPath,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json; charset=utf-8',
						'Content-Length': sessionData.length
					}
				};
				
				const request = https.request(options, (res: any) => {				
					res.on('data', () => {
						this.session.events = {};
					});
				});
							
				request.write(sessionData);
				request.end();
			}			
		}
	}

	public postSessionAndExit = () => {
		if (process) {
			this.closeSession();
			this.postSession();

			setTimeout(() => {
				process.exit();
			}, 5000);
		}
	}
}
 
export let instance: IClient = {
	invoke: () => {},
	startSession: () => {},
	closeSession: () => {},
	postSession: () => {}
};

export const initialize = (config: IConfig): IClient => {
	instance = new Client(config);
	return instance;
} 

export const i = (name: string, file: string) => {
	instance.invoke(name, file);
}
