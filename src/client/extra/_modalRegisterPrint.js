import {
    WebixWindow, WebixInputText
} from "../lib/WebixWrapper.js";
import {
    i18n
} from "../lib/I18n.js";
import {
    App
} from "../lib/App.js";

// const yamljs = require("yamljs");

// //yaml
// let f = process.env.NODE_ENV ? `config/${process.env.NODE_ENV}.yaml` : 'config/config-dev.yaml';
// const env = yamljs.load(f);

// let imgpath = env.storage.img

let modal = null;

export async function showModal(order) {
    return new Promise(async function (resolve, reject) {


        let allimages = await loadimages(order);

        let numImages = allimages.length;
        let disabled = false;

        if (numImages > 1)
            disabled = true;


        let img = {
            height: 70,
            id: 'listimages',
            view: "list",
            data: allimages,
            template: "<icon class='webix_icon fa fa-image'></icon> #value#",
            on: {
                onItemClick: function (id, e) {
                    //webix.message("onItemClick on " + id);
                    showimage(id, allimages)
                }
            }
        }

        let allowExtensions = ['jpeg', 'png', 'jpg', 'tiff', 'gif']

        modal = new WebixWindow({
            width: 600,
            height: 400
        });
        modal.body = {
            id: "formRegisterPrint",
            padding: 20,
            css: "webix-button-secondary",
            rows: [
                img,
                {
                    view: "uploader",
                    id: "uploaderPrint",
                    height: 37,
                    align: "center",
                    type: "iconButton",
                    icon: "fa fa-camera",
                    css: "webix-button-secondary",
                    //width: 100,
                    label: i18n('Add Images'),
                    autosend: false,
                    link: "mylist",
                    disabled: disabled,
                    on: {
                        onBeforeFileAdd: (item) => {
                            const type = item.type.toLowerCase();

                            let contfiles = $$('uploaderPrint').files.data.order.length
                            let totalfiles = contfiles + numImages

                            if (totalfiles > 1) {

                                if (numImages > 0) {
                                    webix.message(i18n("There is another registered image for this order.") + " " + i18n("You can insert only two images!"));
                                    return false
                                }
                                else {
                                    webix.message(i18n("You can insert only two images!"));
                                    return false;
                                }
                            }

                            if (allowExtensions.indexOf(type) === -1) {
                                webix.message(i18n("Invalid type of file!"));
                                return false;
                            }
                        },
                    }
                },
                {
                    borderless: true,
                    view: "list",
                    id: "mylist",
                    type: "uploader",
                    autoheight: true,
                    minHeight: 50
                },
                {
                    id: "buttons",
                    cols: [
                        {
                            view: "button",
                            label: i18n('Cancelar'),
                            css: "font-18",
                            height: 35,
                            type: "iconButton",
                            icon: "fa fa-times",
                            click: () => modal.close(),
                            align: "center",
                        },

                        {
                            view: "button",
                            label: i18n('Send'),
                            type: "iconButton",
                            id: "btnsend",
                            css: "font-18",
                            icon: "fa fa-upload",
                            height: 35,
                            disabled: disabled,
                            click: () => {

                                let files = [];
                                let id = $$('uploaderPrint').files.getFirstId()

                                while (id) {
                                    files.push($$('uploaderPrint').files.getItem(id));
                                    id = $$('uploaderPrint').files.getNextId(id);
                                }
                                if (files.length)
                                    sendFiles(files, order);

                            }, align: "center"
                        },
                        
                    ]
                }
            ]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Image upload"));

    });
}

async function loadimages(order) {

    let allimages = await App.api.ormDbFind('image', { idorder: order.idordermes })
    allimages = allimages.data;

    allimages.map(elem => {
        elem.value = elem.name
    })

    return allimages
}

function showimage(id, images) {

    modal = new WebixWindow({
        width: 500,
        height: 400
    });

    let item = images.find(e => e.id == id)

    modal.body = {
        id: "tmp",
        view: "template",
        template: "<img src='/" + item.adress + "' class='fit_parent'></img>",
    }

    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Image"));
}

async function sendFiles(files, order) {
    const data = await setBody(files);

    for (let i = 0; i < data.length; i++) {
        data[i].order = order;
    }

    //remove lotes alocados mas não utilizados
    let result = await App.api.ormDbSaveImage(data);

    if (result.success) {
        webix.message(i18n('Registered Successfully!'))

        let allimages = await loadimages(order);
        $$('listimages').parse(allimages, "json");
        $$('uploaderPrint').setValue('');

        if (allimages.length > 1) {
            $$('uploaderPrint').disable();
            $$('btnsend').disable();
        }

    }
    else {
        webix.message(i18('There is an error to upload the images. Please, contact the support!'))
    }
}

async function setBody(files) {
    const data = [];
    for (let file of files) {
        data.push({
            name: file.name,
            content: await toBase64(file.file),
            extension: file.type
        })
    }
    return data;
}

async function toBase64(file) {
    return new Promise((resolve, reject) => {

        let reader = new FileReader();

        reader.onloadend = (e) => {
            let base64 = reader.result.toString().split(',');
            resolve(base64[1])
        }
        reader.readAsDataURL(file);
    })
}