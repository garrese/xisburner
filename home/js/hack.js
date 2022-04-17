import * as logMod from "/js/log.js";
import { Logger } from "/js/log.js";


/** @param {NS} ns */
export async function main(ns) {

  var args = JSON.parse(ns.args[0]);
  var logger = new Logger(ns);

  logger.p.printLevel = logMod.TRACE;
  logger.p.tprintLevel = logMod.SUCCESS;
  logger.p.server = args.execConfig.server;
  logger.p.threads = args.execConfig.threads;
  //logger.p.scope = "main";
  logger.trace(logger.p);

  logger.info("INI");

  var target = args.execConfig.server;
  var threads = args.execConfig.threads;
  var moneyThresh = args.moneyThresh;
  var seclThresh = args.minSecl + 0.05 * threads;

  var weakened;
  var growed;
  var hacked;

  logger.debug("target ", target);
  logger.debug("threads ", threads);
  logger.debug("seclThresh ", seclThresh);
  logger.debug("moneyThresh ", moneyThresh);

  var summ = getNewSummary();
  var startSumm = new Date();
  var endSumm = null;
  while (true) {
    summ.c++;

    var secl = ns.getServerSecurityLevel(target);
    logger.trace("secl ", secl);

    var money = ns.getServerMoneyAvailable(target);
    logger.trace("money ", money);

    if (secl > seclThresh) {
      logger.trace("Weakening...");
      weakened = await ns.weaken(target);
      summ.weakCount++;
      logger.info("Weakened=", weakened);

    } else if (money < moneyThresh) {
      logger.trace("Growing...");
      growed = await ns.grow(target);
      summ.growCount++;
      logger.info("Growed=", growed);

    } else {
      logger.trace("Hacking...");
      hacked = await ns.hack(target);
      summ.hackCount++;
      summ.totalMoney += hacked;
      logger.info("Hacked=", hacked);
    }

    if (summ.c >= 25) {
      endSumm = new Date();

      var t = new Date(endSumm - startSumm);
      summ.time = t.getMinutes() + "m " + t.getSeconds() + "s " + t.getMilliseconds() + "ms";

      var avgT = new Date(t / summ.c);
      summ.avgTime = avgT.getSeconds() + "s " + avgT.getMilliseconds() + "ms";

      summ.averageHackMoney = summ.totalMoney / summ.hackCount;

      logger.succ("SUMMARY: ", summ);

      summ = getNewSummary();
      startSumm = new Date();
    }

  }

}

function getNewSummary() {
  var summ = {};
  summ.c = 0;
  summ.totalMoney = 0;
  summ.weakCount = 0;
  summ.growCount = 0;
  summ.hackCount = 0;
  return summ;
}