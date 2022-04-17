export class NSService {

	/** type {NS} ns */
	ns;

	constructor(ns) {
		if(ns==null) throw ("No NS provided. "+new Error().stack);
		this.ns = ns;
	}

}

export class NSLoggedService extends NSService {

	/** type {NS} ns */
	logger;

	constructor(ns, logger) {
		super.constructor(ns);
		this.logger = new Logger(ns, logger.p);
		this.logger.p.scope = this.constructor.name;
	}

}