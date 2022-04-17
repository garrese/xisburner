import {run2} from "js/staticTest/2test.js"
import {run3} from "js/staticTest/3test.js"

/** @param {NS} ns */
export async function main(ns) {

	if(ns.args[0] === 1){
		ns.tprint("entrando por 2");
		await run2(ns);
	}else{
		ns.tprint("entrando por 3");
		await run3(ns);
	}
}