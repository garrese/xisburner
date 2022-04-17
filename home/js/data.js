import * as logMod from "/js/log.js";
import { Logger } from "/js/log.js";
import { NSLoggedService } from "/js/ns-logged-service.js";


/** @param {NS} ns */
export function log(ns, msg) {
	ns.print(msg);
	ns.tprint(msg);
}

/** @param {NS} ns */
export async function main(ns) {
	var logger = new Logger(ns, { server: "home", threads: 1, scope: "main" });
	logger.p.printLevel = logMod.TRACE;
	logger.p.tprintLevel = logMod.TRACE;




	var dataService = new DataService(ns, logger);
	logger.warn(dataService);

	logger.info("init");


	var o = {
		uno: 1,
		dos: "dos"
	};


	await dataService.writeLocal(o);
	logger.info(dataService.readLocal());

	var server = LOCAL_SKELETON;
	server.name = "name1";
	logger.info(server);


}
export const LOCAL_PATH = "/data/local.txt";

export const SERVER_SKELETON = {
	name: null,
	moneyAvailable: null,
	maxMoney: null,
	securityLevel: null,
	minSecurityLevel: null,
	requiredHackingLevel: null,
	numPortsRequired: null,
	maxRam: null,
	usedRam: null
}
export const LOCAL_SKELETON = SERVER_SKELETON



export class DataService extends NSLoggedService {

	async write(filePath, data, append) {
		var mode = 'w';
		if (append) {
			mode = 'a';
		}
		this.logger.debug("writting(" + mode + ") into", filePath);
		data = JSON.stringify(data);
		this.logger.trace("data=", data);
		await this.ns.write(filePath, data, mode);
	};

	read(filePath) {
		this.logger.debug("reading", filePath);
		var readed = this.ns.read(filePath);
		this.logger.trace("readed=", readed)
		if (readed) {
			readed = JSON.parse(readed);
		} else {
			readed = {}
		}
		return readed;
	};

	readLocal() {
		return this.read(LOCAL_PATH);;
	};

	writeLocal(data) {
		return this.write(LOCAL_PATH, data, false);
	};

}