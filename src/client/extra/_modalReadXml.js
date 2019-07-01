import { WebixCrudDatatable, WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { generateQRCode } from '../components/componentsComplement/ccQRGenerator.js';
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(XML) {

    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 550,
            height: 600,
        });

        let xml = new XmlBeautify().beautify(XML, {
            indent: " ", //indent pattern like white spaces
            useSelfClosingElement: true //true:use self-closing element when empty element.
        });

        modal.body = {
            view: "form",
            id: "grids",
            rows: [
                {
                    template: `<textarea rows="35" cols="130" style="border:none;" readonly>${xml}</textarea>`
                }
            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('XML Interface'));

    });

}