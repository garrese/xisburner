import { NSService } from "/js/ns-service.js";


export const TRACE = { n: -2, s: "TRACE" };
export const DEBUG = { n: -1, s: "DEBUG" };
export const INFO = { n: 0, s: "INFO" };
export const SUCCESS = { n: 1, s: "SUCCESS" };
export const WARN = { n: 2, s: "WARN" };;
export const ERROR = { n: 3, s: "ERROR" };

// @typedef {Logger} Logger
/**
 * Class definition
 * @property {NS} ns - propriety description
 * @filename: log.js
 * @class {Logger} Logger
 */
export class Logger extends NSService {


	p = {
		server: null,
		threads: null,
		scope: null,

		printEnabled: true,
		printLevel: INFO,
		tprintEnabled: true,
		tprintLevel: INFO
	};

	constructor(ns, p) {
		super(ns);
		if (p == null) {
			p = {}
		}
		this.p.server = p.server;
		this.p.threads = p.threads;
		this.p.scope = p.scope;
		this.p.printEnabled = p.printEnabled != null ? p.printEnabled : true;
		this.p.printLevel = p.printLevel != null ? p.printLevel : INFO;
		this.p.tprintEnabled = p.tprintEnabled != null ? p.tprintEnabled : true;
		this.p.tprintLevel = p.tprintLevel != null ? p.tprintLevel : INFO;

	}

	getHeader(level) {
		var prefix = level.s + " ";
		if (this.p.server) prefix += "[" + this.p.server + "]";
		if (this.p.threads) prefix += "[" + this.p.threads + "]";
		if (this.p.scope) prefix += "[" + this.p.scope + "]";
		return prefix + "> ";
	}

	insertHeader(level, ...args) {
		args.splice(0, 0, this.getHeader(level));
		return args;
	}

	insertSpaces(...args) {
		var length = args.length * 2;
		for (var i = 1; i <= length; i += 2) {
			args.splice(i, 0, " ");
		}
		return args;
	}

	log(level, ...args) {
		var willPrint = this.p.printEnabled && level.n >= this.p.printLevel.n;
		var willTprint = this.p.tprintEnabled && level.n >= this.p.tprintLevel.n;
		if (willPrint || willTprint) {
			args = this.insertHeader(level, ...args);
			//args = this.insertSpaces(...args);
			if (willPrint) {
				this.ns.print(...args);
			}
			if (willTprint) {
				this.ns.tprint(...args);
			}
		}
	}

	trace(...args) {
		this.log(TRACE, ...args);
	}

	debug(...args) {
		this.log(DEBUG, ...args);
	}

	info(...args) {
		this.log(INFO, ...args);
	}

	succ(...args) {
		this.log(SUCCESS, ...args);
	}

	warn(...args) {
		this.log(WARN, ...args);
	}

	error(...args) {
		this.log(ERROR, ...args);
	}


}


export function toString(obj) {
	if (typeof (obj) === "object") {
		obj = JSON.stringify(obj);
	}
	return obj;
}

/** @param {NS} ns */
export function log(ns, msg) {
	ns.print(msg);
	ns.tprint(msg);
}