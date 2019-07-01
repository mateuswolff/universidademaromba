import { WebixWindow } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";

let barcodeDetector;
let timeout;
export async function showModal() {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 400,
            onClosed: (modal) => {
                closeModal(modal, resolve, null);
            }
        });

        modal.body = {
            id: "formReadRawMaterial",
            cols: [
                {
                    rows: [
                        {
                            view: 'template', id: "tmpReader", scroll: true, template: ''
                        }
                    ]
                }
            ]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Read QR"));
        scanning(modal, resolve);
    });
}

async function scanning(modal, resolve) {
    $$('tmpReader').setHTML(`
                <div id="error"></div> <br>
                <div id="sucess"></div>
                <br>
                <video id="player" autoplay></video><br>
                <canvas id="canvas" width=500 height=500></canvas>`);

    const player = document.getElementById('player');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const error = document.getElementById('error');
    const sucess = document.getElementById('sucess');



    async function snap() {
        // Draw the video frame to the canvas.
        context.drawImage(player, 0, 0, canvas.width, canvas.height);

        barcodeDetector = new BarcodeDetector({
            // (Optional) A series of barcode formats to search for.
            // Not all formats may be supported on all platforms
            formats: [
                'aztec',
                'code_128',
                'code_39',
                'code_93',
                'codabar',
                'data_matrix',
                'ean_13',
                'ean_8',
                'itf',
                'pdf417',
                'qr_code',
                'upc_a',
                'upc_e'
            ]
        });

        try {
            var image = new Image();
            image.id = "pic"
            image.onload = async () => {
                try {
                    const barcodes = await barcodeDetector.detect(image);
                    if (barcodes.length > 0) {
                        let content = barcodes;
                        content = content[0].rawValue;
                        sucess.innerHTML = `Código lido: ${content}`;
                        let idlot = content.trim();
                        idlot = idlot.slice(0, 10);
                        idlot = Number(idlot);
                        webix.message(i18n('The lot read was @n').replace('@n', idlot));
                        clearInterval(timeout);
                        closeModal(modal, resolve, idlot);
                    } else {
                        error.innerHTML = "Não está conseguindo ler";
                    }
                } catch (err) {
                    error.innerHTML = err;
                    //webix.message(err.message);
                    //console.error(err)
                }
            }
            image.src = canvas.toDataURL();

        } catch (e) {
            error.innerHTML = e;
            console.error('Barcode detection failed:', e);
        } finally {
            timeout = setTimeout(snap, 100);
        }
    }

    // Attach the video stream to the video element and autoplay.
    navigator.mediaDevices.enumerateDevices().then((devs) => {
        let dev;
        for (let i of devs) {
            if (i.kind === "videoinput") {
                dev = i;
            }
        }

        const constraints = {
            video: {
                optional: [{ sourceId: dev.deviceId }]
            },
            audio: false
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                player.srcObject = stream;
                snap();
            });

    }).catch((err) => {
        error.innerHTML = err;
    });

}

/**
 * Precisa ser revista pois não está desligando a camera
 * @param {*} modal 
 */
function closeModal(modal, resolve, idlot) {
    let vid = document.getElementById("player");
    vid.innerHTML = "";
    // vid.parentNode.removeChild(vid);
    navigator.getUserMedia({ audio: false, video: true },
        function (stream) {
            // let pp = document.getElementById('player');
            // sucess.innerHTML = stream;
            // can also use getAudioTracks() or getVideoTracks()
            // stream.stop();
            
            var track = stream.getTracks()[0];  // if only one media track
            stream.removeTrack(track);
            // track.forEach(element => {
            //     console.log(element)
            //     element.stop();
            // });
            clearInterval(timeout);
            barcodeDetector = null;
        },
        function (err) {
            error.innerHTML = err;
            console.log('getUserMedia() error', err);
        });

    resolve(idlot);
    modal.close();
}