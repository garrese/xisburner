export class NSService {

	/** type {NS} ns */
	ns;

	constructor(ns) {
		if(ns==null) throw ("No NS provided. "+new Error().stack);
		this.ns = ns;
	}

}