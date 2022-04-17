import * as execService from "/js/exec-service.js";
import * as logMod from "/js/log.js";
import { Logger } from "/js/log.js";


/** @param {NS} ns */
export async function main(ns) {


	execService.init(ns);
	//execService.logger.p.tprintLevel = logMod.TRACE;

	var execConfig = {};

	//execConfig.server = "home";
	//execConfig.script = '/js/test.js';
	
	//execConfig.server = "n00dles";
	//execConfig.script = '/2test.js';

	execConfig.server = "foodnstuff";
	execConfig.source = "home";
	execConfig.script = '/js/hack.js';
	execConfig.dependencies = ["/js/log.js","/js/ns-service.js"],


	execConfig.threads = 7;
	execConfig.args = { minSecl: 3, moneyThresh: 1500000 };
	execConfig.isJsonArgs = true;
	execConfig.includeExecConfigArg = true;


	await execService.exec(execConfig);


}