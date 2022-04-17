import {run2} from "js/staticTest/2test.js"

/** @param {NS} ns */
export async function main(ns) {
	
	await run3(ns);

}

export async function run3(ns){
	await run2(ns);
}