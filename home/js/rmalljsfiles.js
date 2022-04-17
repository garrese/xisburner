/** @param {NS} ns */
export async function main(ns) {
    var arr = ns.ls(ns.getHostname(), ".js");
    for (var i in arr) {
        if (ns.rm(arr[i]))
            ns.tprint("successfully deleted " + arr[i]);
        else
            ns.tprint("failed to delete " + arr[i]);
    }
}