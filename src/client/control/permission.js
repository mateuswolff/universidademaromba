import { ls } from "../lib/LocalStorage.js";

export async function checkClientPermission(page) {

    return true
    // Get all user's permission
    let permissions = ls.getObj("permissions", {});

    // Filter all page permissions
    let pagePerms = permissions.clientside.filter(x => x.object.match(new RegExp(page)));

    // Disable all elemements that the user don't have permission
    let disableItens = pagePerms.filter(x => x.enabled == false);

    for (let item of disableItens) {
        let itemId = item.object.split('.').pop();
        if (itemId && $$(itemId))
            $$(itemId).disable();
    }

}

export async function checkObjectPermission(object) {
    // Get all user's permission
    let permissions = ls.getObj("permissions", {});

    // Filter all page permissions
    let pagePerms = permissions.clientside.filter(x => x.object.match(new RegExp(object)));

    return pagePerms[0].enabled;
}