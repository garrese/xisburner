//import * as logMod from "/js/log.js";
//import { Logger } from "/js/log.js";
//import { DataService } from "/js/data.js";

/** @param {import("../..").NS } ns */
export async function main(ns) {

	ns.tprint("SUCCESS INI test in "+ns.getHostname());

	var o = {
		name: "pepe",
		level: {
			i:1
		}
	}

	var array = [
		"zero",
		{ 
			a:1,
			sub:{b:"uno"}
		},
		{ 
			uno:2,
			sub:{b:"dos"}
		}
	];

	
	let timeStart = new Date();
	await ns.sleep(6000);
	
	let timeElapsed = new Date() - timeStart;
	ns.tprint(timeElapsed);
	if(timeElapsed > 50 ){
		ns.tprint("ACTIVE: "+2+" components and "+0+" new nodes purchased in "+timeElapsed/1000/60+" mins.");
	}

	/*
	ns.tprint("ini");
   	var logger = new Logger(ns);
	logger.p.printLevel = logMod.TRACE;
	logger.p.tprintLevel = logMod.TRACE;
	var dataService = new DataService(ns, logger);
	var o = {uno: 1,dos: "dos"};

	logger.warn(ns.args);
	ns.tprint("mid");

	await dataService.writeLocal(o);
	logger.info(dataService.readLocal());

	ns.tprint("fin");

	*/


}

function test(ns, txt, func){
	ns.tprint("lvl1");
	ns.tprint(func(txt));
}

function arg(txt){
	return txt;
}