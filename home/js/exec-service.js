import * as logMod from "/js/log.js";
import { Logger } from "/js/log.js";
//import * as dataMod from "/js/data.js";
//import { DataService } from "/js/data.js";

/** @type {NS} ns */
let ns;
export let logger;

export function init(nsIn, loggerIn) {
	ns = nsIn;
	if (loggerIn != null) {
		logger = loggerIn;
	} else {
		logger = new Logger(ns);
	}
	logger.p.tprintLevel = logMod.INFO;
	logger.p.scope = "exec-service";
}

export let execConfig = {
	server: null,
	source: null,
	script: null,
	dependencies: [],
	overrideScript: true,
	threads: 1,
	args: null,
	isJsonArgs: true,
	includeExecConfigArg: true
};


/** @param {NS} ns */
export async function main(ns) {
	init(ns);
	logger.p.tprintLevel = logMod.TRACE;
	logger.debug("INI");

	var execConfig = {};
	execConfig.server = ns.getHostname();
	execConfig.source = ns.getHostname();
	execConfig.script = '/js/test.js';
	execConfig.threads = 1;
	execConfig.includeExecConfigArg = true;

	execConfig.args = { uno: 1, dos: "dos" };
	execConfig.isJsonArgs = true;
	//execConfig.args = [1, 2, 3];
	//execConfig.isJsonArgs = false;


	if (ns.args[0] != null) execConfig.server = ns.args[0];
	if (ns.args[1] != null) execConfig.script = ns.args[1];
	if (ns.args[2] != null) execConfig.threads = ns.args[2];
	if (ns.args[3] != null) execConfig.target = ns.args[3];
	logger.p.server = execConfig.server;
	logger.p.threads = execConfig.threads;
	logger.trace("execConfig=", execConfig);


	/*
	var dataService = new DataService(ns, logger);
	logger.trace("dataService=", dataService);
	var local = dataService.readLocal();
	if (!local.server) {
		logger.warn("no local server found");
		// TODO llamada separada
		local.server = ns.getHostname();
		await dataService.writeLocal(local);
	}else{
		logger.debug("local found");
	}
	*/

	exec(execConfig);

	logger.debug("FIN")

}


/** @param {NS} ns */
export async function exec(execConfig) {
	logger.debug("exec INI: ", execConfig)
	var args
	var pid;

	await ns.scp(execConfig.script, execConfig.source, execConfig.server);
	for (const dependency of execConfig.dependencies) {
		await ns.scp(dependency, execConfig.source, execConfig.server);
	}

	if (execConfig.isJsonArgs) {
		logger.trace("Executing with json args");
		args = composeJsonArgs(execConfig)
		pid = ns.exec(execConfig.script, execConfig.server, execConfig.threads, args);
	} else {
		logger.trace("Executing with array args");
		args = composeArrayArgs(execConfig);
		pid = ns.exec(execConfig.script, execConfig.server, execConfig.threads, ...args);
	}

	if (pid != 0) {
		logger.succ("Executed: pid=", pid, " ", execConfig);
	} else {
		logger.error("Not executed: ", execConfig);
	}
}

export function composeJsonArgs(execConfig) {
	var args;
	if (execConfig.includeExecConfigArg) {
		args = Object.assign({}, execConfig.args);
		args.execConfig = execConfig;
	} else {
		args = execConfig.args;
	}
	args = JSON.stringify(args);
	logger.trace("composeJsonArgs: ", args);
	return args;
}

export function composeArrayArgs(execConfig) {
	var args = execConfig.args;
	if (execConfig.includeExecConfigArg) {
		args.splice(args.length, 0, JSON.stringify(execConfig));
	}
	logger.trace("composeArrayArgs: ", args);
	return args;
}


/** @param {NS} ns */
export function getExecConfig(execConfig) {
	return JSON.parse(ns.args[0]).execConfig;
}

/** @param {NS} ns */
export function setExecConfig(execConfig) {
	return JSON.parse(ns.args[0]).execConfig;
}