/** @param {NS} ns */
export async function main(ns) {
	var serverInfo = getServerInfo(ns);
	ns.print(serverInfo);
	ns.tprint(serverInfo);
}

export function emptyFunction(){

}

/** @param {NS} ns */
export function getServerInfo(ns){
	var serverName;

	if(ns.args[0] != null){
		serverName = ns.args[0];
	}else{
		serverName = ns.getHostname();
	}


	var serverInfo = {};
	serverInfo.name = serverName;
	serverInfo.moneyAvailable = ns.getServerMoneyAvailable(serverName)
	serverInfo.maxMoney = ns.getServerMaxMoney(serverName)
	serverInfo.securityLevel = ns.getServerSecurityLevel(serverName)
	serverInfo.minSecurityLevel = ns.getServerMinSecurityLevel(serverName)
	serverInfo.requiredHackingLevel = ns.getServerRequiredHackingLevel(serverName)
	serverInfo.numPortsRequired = ns.getServerNumPortsRequired(serverName)
	serverInfo.maxRam = ns.getServerMaxRam(serverName)
	serverInfo.usedRam = ns.getServerUsedRam(serverName)

	return serverInfo;
}