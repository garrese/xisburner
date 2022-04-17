//import {dos,incrDos} from "js/staticTest/1test.js"


export let uno = 1;
export function incrUno(){
	uno++;
}

/** @param {NS} ns */
export async function main(ns) {

	incrUno();
	while(true){
		await ns.sleep(3000);
		ns.tprint("1test.uno="+uno);
	}
}