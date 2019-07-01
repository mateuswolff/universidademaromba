export async function generateQRCode(item) {
    return new QRious({
        element: document.getElementById('qr'),
        value: item.toString(),
        size: 80,
    });
}