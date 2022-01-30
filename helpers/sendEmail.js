const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_API_KEY, EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

/*
data = {
    to: "lohimec589@peykesabz.com",
    subject: "Новая заявка с сайта",
    html: "<p>Ваша заявка принята</p>"
}
*/

const sendEmail = async (data) => {
  try {
    const email = { ...data, from: `${EMAIL}` };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
