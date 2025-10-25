import * as Plugin from "iitcpluginkit";


class IitcLiveInventory implements Plugin.Class {

    init() {
        console.log("IitcLiveInventory " + VERSION);

        // eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-require-imports
        require("./styles.css");

        // FILL ME
    }

}

/**
 * use "main" to access you main class from everywhere
 * (same as window.plugin.IitcLiveInventory)
 */
export const main = new IitcLiveInventory();
Plugin.Register(main, "IitcLiveInventory");
