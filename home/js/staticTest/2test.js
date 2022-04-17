import {uno,incrUno} from "js/staticTest/1test.js"

export let dos = 1;
export function incrDos(){
	dos++;
}

/** @param {NS} ns */
export async function main(ns) {
	await run2(ns);
}

export async function run2(ns){
	incrUno();

	while(true){
		await ns.sleep(3000);
		ns.tprint("2test.uno="+uno);
	}
}