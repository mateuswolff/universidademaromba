const net = require("net");
const moment = require("moment");

let sock = net.connect(9100, "10.247.55.101", () => {
    sock.on("data", (d) => {
        console.log(d.toString());
    })

    sock.on('error', function (ex) {
        console.log("handled error");
        console.log(ex);
    });

    sock.on('end', function (err) {
        console.log(err, "finished");
    });
    
    let data = {
        name: "Honeywell PC42t 01",
        description: "Perto do equipamento",
        ip: "10.247.54.2"
    }

    sock.write(`PP24,260:AN7
    PP 225,245
    FT "Swiss 721 BT",11
    PT "12341234 - 12341234"
    PP 225,200
    FT "Swiss 721 BT",11
    PT "12341234"
    PP 225,155
    FT "Swiss 721 BT",11
    PT "1235135"
    LAYOUT RUN ""
    PF
    PRINT KEY OFF
    `);
    
    
    // sock.write(`PP24,260:AN7
    // NASC "utf-8"
    // FT "Swiss 721 BT",20
    // PP 25,580
    // PT "${company}"

    // PP 650,590:AN7
    // BARSET "QRCODE",1,1,6,2,1
    // PB "${barCodeAndQRCode}"
    
    // FT "Swiss 721 BT",10
    // PP 3,455
    // PL 805,1
   
    // PP 10,455
    // PT "${labelClient}"
    // PP 20,415
    // PT "${client}"
   
    // PP 460,455
    // PT "${labelMaterial}"
    // PP 470,415
    // PT "${idmaterial}"
    
    // PP 3,360 
    // PL 805,1
    
    // PP 10,355
    // PT "${labelNetWeight}"
    // PP 20,325
    // PT "${netWeight}"
    
    // PP 250,355
    // PT "${labelGrossWeight}"
    // PP 260,325
    // PT "${grossWeight}"

    // PP 530,355
    // PT "${labelUN}"
    // PP 540,325
    // PT "${un}"
    
    // PP 3,270 
    // PL 805,1
    
    // PP 10,265
    // PT "${labelDescription}"
    // PP 20,230
    // PT "${material}"
    
    // PP 540,265
    // PT "${labelLot}"
    // PP 560,230
    // PT "${idlot}"
    
    // PP 3,180 
    // PL 805,1

    // PP 10,175
    // PT "${labelOP}"
    // PP 20,145
    // PT "${idorder}"
    
    // PP 150,175
    // PT "${labelOV}"
    // PP 160,145
    // PT "${ov}"

    // PP 290,175
    // PT "${labelItem}"
    // PP 300,145
    // PT "${item}"

    // PP 470,175
    // PT "${labelPieces}"
    // PP 480,145
    // PT "${qtdPieces}"
    
    // PP 550,175
    // PT "${labelLenght}"
    // PP 560,145
    // PT "${length}"

    // PP 650,175
    // PT "${labelTotal}"
    // PP 660,145
    // PT "${total}"

    // PP 3,95 
    // PL 805,1

    // PP 10,90
    // PT "${labelDate}"
    // PP 20,60
    // PT "${moment().format('DD/MM/YYYY')}"

    // PP 250,85
    // BARSET "CODE39",2,1,2,40
    // PB "${barCodeAndQRCode}"
    
    // FT "Swiss 721 BT",8
    // PP 370,45
    // PT "${barCodeAndQRCode}"

    // PF
    // PRINT KEY OFF
    // // `)

    // PP24,260:AN7
    // NASC "utf-8"
    // FT "Swiss 721 BT",20
    // PP 25,580
    // PT "${company}"
    // PP 650,590:AN7
    // BARSET "QRCODE",1,1,6,2,1
    // PB "${barCodeAndQRCode}"
    // FT "Swiss 721 BT",10
    // PP 3,455
    // PL 805,1
    // PP 10,455
    // PT "Cliente"
    // PP 20,415
    // PT "${client}"
    // PP 460,455
    // PT "Material"
    // PP 470,415
    // PT "${idmaterial}"  
    // PP 3,360 
    // PL 805,1   
    // PP 10,355
    // PT "Peso Liq (KG)"
    // PP 20,325
    // PT "${netWeight}"
    // PP 250,355
    // PT "Peso Bruto (KG)"
    // PP 260,325
    // PT "${grossWeight}"
    // PP 530,355
    // PT "Un Metalica"
    // PP 540,325
    // PT "${un}"   
    // PP 3,270 
    // PL 805,1  
    // PP 10,265
    // PT "Desc. do item"
    // PP 20,230
    // PT "${material}"   
    // PP 540,265
    // PT "Lote"
    // PP 560,230
    // PT "${idlot}"    
    // PP 3,180 
    // PL 805,1
    // PP 10,175
    // PT "OP"
    // PP 20,145
    // PT "${idorder}"
    // PP 140,175
    // PT "OV"
    // PP 150,145
    // PT "${ov}"
    // PP 330,175
    // PT "Item"
    // PP 340,145
    // PT "${item}"
    // PP 470,175
    // PT "Qtd"
    // PP 480,145
    // PT "${qtdPieces}"
    // PP 550,175
    // PT "Comp"
    // PP 560,145
    // PT "${length}"
    // PP 650,175
    // PT "Total"
    // PP 660,145
    // PT "${total}"
    // PP 3,95 
    // PL 805,1
    // PP 10,90
    // PT "Data da emissao"
    // PP 20,60
    // PT "${date}"
    // PP 250,85
    // BARSET "CODE39",2,1,2,40
    // PB "${barCodeAndQRCode}"
    // FT "Swiss 721 BT",8
    // PP 370,45
    // PT "${barCodeAndQRCode}"
    // PF
    // PRINT KEY OFF
    
    
    //MODELO ANTIGO
    // sock.write(`PP24,260:AN7
    // NASC "utf-8"

    // FT "Swiss 721 BT",10
    // PP 50,262
    // PT "${company}"
    
    // PP 50,180
    // BARSET "QRCODE",1,1,8,2,1
    // PB "${barCodeAndQRCode}"

    // PP 300,262
    // BARSET "CODE39",2,1,2,40
    // PB "${barCodeAndQRCode}"
    
    // FT "Swiss 721 BT",8
    // PP 420,225
    // PT "${barCodeAndQRCode}"
    
    // FT "Swiss 721 BT",10
    // PP 270,180
    // PT "${labelDescription}: ${material}"

    // PP 270,140
    // PT "${labelWeight}: ${netWeight}
    
    // PP 500,140
    // PT "${labelPieces}: ${qtdPieces}
    
    // PP 270,100
    // PT "${labelLot}: ${idlot}"

    // PP 500,100
    // PT "${labelOrder}: ${idorder}"
   
    // PP 270,60
    // PT "${labelDate}: ${date}"

    // PF
    // PRINT KEY OFF
    // `);


    // PT "Cliente: 45698261"
    // PP 270,225

    // PT "Peso: 392"
    // PP 550,145

    // PT "Lote: 12345678"
    // PP 550,105

    // PT "Ordem: 5196585"
    // PP 550,65
    // FT "Swiss 721 BT",11
    // PT "${moment().format('DD/MM/YYYY HH:mm')}"


    // PT "Comprimento: 294"
    // PP 270,185

    // PT "Diametro: 26.5"
    // PP 270,145

    // PT "Espessura: 1.2"
    // PP 270,105

    // PT "Aço: P430A"
    // PP 270,65

    sock.end();
});

