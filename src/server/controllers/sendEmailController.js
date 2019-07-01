let user = null;
const Email = require('email-templates');
const nodemailer = require('nodemailer');
let moment = require('moment');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'sistema-evo@aperam.com',
        pass: 'gfjhlgulyngfbjxg'
    }
});

class sendEmailController {
    constructor(user) {
        this.user = user;
    }


    async sendEmail() {
        try {
            const email = new Email({
                message: {
                    from: 'sistema-evo@aperam.com'
                },
                send: true,
                preview: false,
                transport: transporter
            });

            let str = JSON.stringify({loc: `createPassword/${this.user.token}`, st: false});
            let b64 = btoa(encodeURI(str));

            return email
                .send({
                    template: 'mars',
                    message: {
                        to: this.user.email
                    },
                    locals: {
                        name: this.user.name,
                        token: b64,
                        tokenexperein: moment(this.user.tokenexperein).format('DD/MM/YYYY')
                    }
                })
                .then((success) => {
                    return success
                })
                .catch((err) => {
                    return err
                });
        } catch (error) {
            console.error(error);
        }

    }
}

const btoa = function(str){ return Buffer.from(str).toString('base64'); }


exports.sendEmailController = sendEmailController;