import * as logMod from "/js/log.js";
import { Logger } from "/js/log.js";


/** @type {NS} ns */
let ns;
/** @type {Hacknet} ns */
let hacknet;
export let log;

let maxNumNodes;

let minPlayerSavings;
let minPlayerDynamicSavingRatio;
let sleepAfterPurchase;
let sleepAfterNotPurchased;
let newNodesPriceFactor;
let productionMult;
let analysisMode;

const LEVEL = "level";
const RAM = "ram";
const CORES = "cores";
const COMPONENT_TYPES = [LEVEL, RAM, CORES];

const MAX_UPGRADES = {
	[LEVEL]: 200,
	[RAM]: 64,
	[CORES]: 16
}

const PURCHASING_COMPONENT = "PURCHASING_COMPONENT";
const PURCHASING_NEW_NODE = "PURCHASING_NEW_NODE";


export function config(nsIn) {
	ns = nsIn;
	hacknet = ns.hacknet;
	log = new Logger(ns);
	log.p.printLevel = logMod.DEBUG;
	log.p.tprintLevel = logMod.SUCCESS;
	log.p.server = "home";
	log.p.scope = "hacknet";
	minPlayerSavings = 0;
	minPlayerDynamicSavingRatio = 30;
	sleepAfterPurchase = 200;
	sleepAfterNotPurchased = 1000 * 30;
	newNodesPriceFactor = 3;
	productionMult = 1;
	analysisMode = false;
}


/** @param {NS} ns */
export async function main(ns) {
	config(ns);
	if (ns.args[0] === "analysis") {
		log.warn("ANALYSIS MODE ACTIVATED");
		analysisMode = true;
	}
	if (analysisMode){
		log.p.printLevel = logMod.TRACE;
		log.p.tprintLevel = logMod.TRACE;
	}
	log.succ("INI");

	maxNumNodes = hacknet.maxNumNodes();
	log.debug("maxNumNodes=" + maxNumNodes + "??");

	productionMult = ns.getPlayer().hacknet_node_money_mult;
	log.debug("productionMult="+productionMult);

	let totalProduction = 0;
	let nodes = getAllNodesStats(node => {
	});
	log.debug("============= GET ALL NODES TRACE ============");
	log.debug(nodes);
	log.debug("==============================================");
	log.info("Total Nodes: " + nodes.length);
	log.info("totalProduction=" + totalProduction);



	let component;
	let purchaseNodeCost;
	let notMaxedNodes;
	let purchasing;
	let componentsPurchased=0;
	let newNodesPurchased=0;
	let timeStart = new Date();
	let analyze = true;
	do {

		if (analyze) {
			analyze = false;
			log.debug("Analyzing...");

			purchaseNodeCost = hacknet.getPurchaseNodeCost();
			log.debug("purchaseNodeCost=" + purchaseNodeCost);

			totalProduction = 0;
			notMaxedNodes = 0;
			let availableMoney = getPlayerAvailableMoney(totalProduction);
			nodes.forEach(node => {
				totalProduction += node.production;
				if (!node.maxed) {
					notMaxedNodes++;
				}
				forEachNode(node, component => {
					calcGainCostBuyTimeRatios(component, availableMoney, totalProduction);
				});
			});
			log.debug("totalProduction=" + totalProduction);
			log.debug("notMaxedNodes=" + notMaxedNodes);
			log.trace("================ NODES ANALYZED ==============");
			log.trace(nodes);
			log.trace("==============================================");

			let bestComponentsByRatios = selectBestComponentsByRatios(nodes);
			log.trace("bestComponentsByRatios=", bestComponentsByRatios);

			component = bestComponentsByRatios.bestComponentBySavings;
			if (component != null) {
				purchasing = PURCHASING_COMPONENT;
			}

			var bestComponentByProduction = bestComponentsByRatios.bestComponentByProduction;
			if (component != null) log.debug("bestComponentByProduction.cost * newNodesPriceFactor=" + (bestComponentByProduction.cost * newNodesPriceFactor));
			if (component == null || purchaseNodeCost < (bestComponentByProduction.cost * newNodesPriceFactor)) {
				purchasing = PURCHASING_NEW_NODE;
			}

			log.debug("purchasing=" + purchasing);
		}// analyze

		if (!analysisMode) {

			let availableMoney = getPlayerAvailableMoney(totalProduction);
			if (purchasing === PURCHASING_NEW_NODE) {
				analyze = purchaseNewNode(availableMoney, purchaseNodeCost);
				if(analyze){
					newNodesPurchased++;
				}
			} else if (purchasing === PURCHASING_COMPONENT) {
				analyze = purchaseComponent(availableMoney, component);
				if (analyze) {
					componentsPurchased++;
					nodes[component.parent] = getNodeStats(component.parent);
				}
			} else {
				log.error("Not purchasing anything?! purchasing=" + purchasing);
			}

			if (analyze) {
				await ns.sleep(sleepAfterPurchase);
			} else {
				await ns.sleep(sleepAfterNotPurchased);
			}

			if (lookForNewNodes(nodes)) {
				log.info("New node found. Total Nodes: " + nodes.length);
				analyze = true;
			}

			let timeElapsed = new Date() - timeStart;
			log.debug("timeElapsed="+timeElapsed);
			if(timeElapsed > 1000 * 60 * 10){
				log.succ("ACTIVE: "+componentsPurchased+" components and "+newNodesPurchased+" new nodes purchased in "+timeElapsed/1000/60+" mins.");
				componentsPurchased = 0;
				newNodesPurchased = 0;
				timeStart = new Date();
			}


		} //!analysisMode

	} while (!analysisMode);


	let components = [];
	forEachNodeList(nodes, (node, component) => {
		if (!component.maxed) components[components.length] = component;
	});

	components.sort((a, b) => b.gainCostProductionBuyTimeRatio - a.gainCostProductionBuyTimeRatio);
	log.trace("================ COMPONENTS BY gainCostProductionBuyTimeRatio ==============");
	log.trace(components);
	log.trace("==============================================");

	components.sort((a, b) => b.gainCostSavingsBuyTimeRatio - a.gainCostSavingsBuyTimeRatio);
	log.trace("================ COMPONENTS BY gainCostSavingsBuyTimeRatio ==============");
	log.trace(components);
	log.trace("==============================================");

	// See http://json2table.com/#

	log.warn("ANALYSIS FINISHED");
}

export function getPlayerAvailableMoney(totalProduction) {
	let playerMoney = ns.getPlayer().money;
	let protectedMoney;
	let minPlayerDynamicSaving = totalProduction * minPlayerDynamicSavingRatio;
	log.debug("minPlayerDynamicSaving(" + minPlayerDynamicSavingRatio + ")=>" + minPlayerDynamicSaving);

	if (minPlayerDynamicSaving > minPlayerSavings) {
		protectedMoney = minPlayerDynamicSaving;
		log.debug("protectedMoney=minPlayerDynamicSaving=" + protectedMoney);
	} else {
		protectedMoney = minPlayerSavings;
		log.debug("protectedMoney=minPlayerSavings=" + protectedMoney);
	}
	let availableMoney = playerMoney - protectedMoney;
	log.debug("availableMoney=" + availableMoney + ", protectedMoney=" + protectedMoney + ", playerMoney=" + playerMoney);
	return availableMoney;
}

export function checkPlayerSavings(purchaseCost, availableMoney, purchaseDesc) {

	if (availableMoney < purchaseCost) {
		log.info("Purchase of " + purchaseDesc + " not available. purchaseCost=" + purchaseCost + ", availableMoney=" + availableMoney);
		return false;

	} else {
		return true;
	}
}

export function purchaseNewNode(playerMoney, purchaseNodeCost) {
	if (checkPlayerSavings(purchaseNodeCost, playerMoney, "NEW NODE")) {

		let nodePurchased = hacknet.purchaseNode();
		if (nodePurchased > 0) {
			log.info("PURCHASED NEW NODE-" + nodePurchased + " for " + purchaseNodeCost);
			return true;

		} else {
			log.info("Impossible to purchase NEW NODE by " + purchaseNodeCost + " (playerMoney=" + playerMoney + ")");
			return false;
		}
	}
}

export function purchaseComponent(availableMoney, component) {
	var purchaseDesc = "UPGRADE FOR NODE-" + component.parent + " " + component.type.toUpperCase() + " " + component.upgrade;
	if (checkPlayerSavings(component.cost, availableMoney, purchaseDesc)) {

		let upgraded = upgradeComponent(component.parent, component.type, 1);
		if (upgraded) {
			log.info("PURCHASED " + purchaseDesc + "(+1)" + " for " + component.cost);
			return true;
		} else {
			log.info("Impossible to purchase " + purchaseDesc + " by " + component.cost + " (availableMoney=" + availableMoney + ")");
			return false;
		}
	}
}

export function initNodeComponents(node) {
	node.components = {};
	COMPONENT_TYPES.forEach((componentType) => {
		node.components[componentType] = {
			parent: node.index,
			type: componentType
		};
	});
}

export function forEachNode(node, f) {
	COMPONENT_TYPES.forEach(componentType => {
		f(node.components[componentType]);
	});
	//USE: forEachNode(node, component =>{ ... })
}

export function forEachNodeList(nodes, f) {
	nodes.forEach(node => {
		COMPONENT_TYPES.forEach(componentType => {
			f(node, node.components[componentType]);
		});
	});
	//USE: forEachNodeList(nodes, (node, component) =>{ ... })
}


export function getBasicNodeStats(index) {
	let node = { index: index }
	var stats = hacknet.getNodeStats(index);

	node.name = stats.name;
	node.production = stats.production;
	node.totalProduction = stats.totalProduction;
	node.timeOnline = stats.timeOnline;

	if (node.components == null) initNodeComponents(node);
	node.components[LEVEL].upgrade = stats.level;
	node.components[RAM].upgrade = stats.ram;
	//node.ramUsed = stats.ramUsed; 
	node.components[CORES].upgrade = stats.cores;
	//node.cache = stats.cache;
	//node.hashCapacity = stats.hashCapacity;

	return node;

}

export function getComponentCost(nodeIndex, componentType, upgrades) {
	switch (componentType) {
		case LEVEL:
			return hacknet.getLevelUpgradeCost(nodeIndex, upgrades);
		case RAM:
			return hacknet.getRamUpgradeCost(nodeIndex, upgrades);
		case CORES:
			return hacknet.getCoreUpgradeCost(nodeIndex, upgrades);
	}
}

export function upgradeComponent(nodeIndex, componentType, upgrades) {
	switch (componentType) {
		case LEVEL:
			return hacknet.upgradeLevel(nodeIndex, upgrades);
		case RAM:
			return hacknet.upgradeRam(nodeIndex, upgrades);
		case CORES:
			return hacknet.upgradeCore(nodeIndex, upgrades);
	}
}

export function production(level, ram, cores) {
	return (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * productionMult;
}

export function levelGain(ram, cores) {
	return (1 * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * productionMult;
}

export function ramGain(level, ram, cores) {
	return (level * 1.5) * (Math.pow(1.035, (2 * ram) - 1) - Math.pow(1.035, ram - 1)) * ((cores + 5) / 6) * productionMult;
}

export function coreGain(level, ram) {
	return (level * 1.5) * Math.pow(1.035, ram - 1) * (1 / 6) * productionMult;
}

export function calcGain(node, componentType) {
	let level = node.components[LEVEL].upgrade;
	let ram = node.components[RAM].upgrade;
	let cores = node.components[CORES].upgrade;
	switch (componentType) {
		case LEVEL:
			return levelGain(ram, cores);
		case RAM:
			return ramGain(level, ram, cores);
		case CORES:
			return coreGain(level, ram);
	}
}


export function calcGainCostRatio(node, component) {
	if (component.upgrade === MAX_UPGRADES[component.type]) {
		component.maxed = true;
	} else {
		component.maxed = false;
		component.cost = getComponentCost(node.index, component.type, 1);
		component.gain = calcGain(node, component.type);
		component.gainCostRatio = component.gain / component.cost * 10000000;
	}
}


export function calcGainCostBuyTimeRatios(component, playerMoney, totalProduction) {
	component.productionBuyTime = component.cost / totalProduction;
	component.gainCostProductionBuyTimeRatio = component.gainCostRatio / component.productionBuyTime;

	if (component.cost > playerMoney) {
		component.savingsBuyTime = (component.cost - playerMoney) / totalProduction;
		component.gainCostSavingsBuyTimeRatio = component.gainCostRatio / component.savingsBuyTime;
	} else {
		component.savingsBuyTime = 0;
		component.gainCostSavingsBuyTimeRatio = component.gainCostRatio;
	}
}

export function getNodeStats(index) {
	var node = getBasicNodeStats(index);
	forEachNode(node, component => {
		calcGainCostRatio(node, component);
	});
	node.maxed = true;
	forEachNode(node, component => {
		if (!component.maxed) {
			node.maxed = false;
		}
	});
	return node;
}

export function getAllNodesStats(forEachNode) {
	let numNodes = hacknet.numNodes();

	let nodes = []
	for (let i = 0; i < numNodes; i++) {
		let node = getNodeStats(i);
		if (forEachNode != null) forEachNode(node);
		nodes[i] = node;
	}

	return nodes;
}

export function selectBestComponentsByRatios(nodes) {
	let bestComponentByProduction;
	let bestComponentBySavings;

	let maxRatioByProduction = 0;
	let maxRatioBySavings = 0;
	forEachNodeList(nodes, (node, component) => {

		var ratioByProduction = component.gainCostProductionBuyTimeRatio;
		if (ratioByProduction > maxRatioByProduction) {
			maxRatioByProduction = ratioByProduction;

			bestComponentByProduction = component;
		}

		var ratioBySavings = component.gainCostSavingsBuyTimeRatio;
		if (ratioBySavings > maxRatioBySavings) {
			maxRatioBySavings = ratioBySavings;

			bestComponentBySavings = component;
		}

	});

	return {
		bestComponentByProduction: bestComponentByProduction,
		bestComponentBySavings: bestComponentBySavings,
	};
}


export function lookForNewNodes(nodes) {
	let numNodes = hacknet.numNodes();
	if (numNodes !== nodes.length) {
		for (let i = nodes.length; i < numNodes; i++) {
			nodes[i] = getNodeStats(i);
		}
		return true;
	} else {
		return false;
	}
}