import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import fs from "fs";
import inlineCss from 'inline-css'

export const mailSender = async (email,otp,otp_type) => {
    let htmlContent = fs.readFileSync('otp_template.html','utf-8');
    htmlContent = htmlContent.replace('TradeZone_otp', otp);
    htmlContent = htmlContent.replace('TradeZone_otp2', otp_type);

    const options = {
        url : ' ',
    }

    htmlContent = await inlineCss(htmlContent,options);

    try {
       const transporter = nodemailer.createTransport({
             service: "gmail",
             auth: {
               user: process.env.MAIL_USER,
               pass: process.env.MAIL_PASSWORD,
             },
           });
       
           let result = await transporter.sendMail({
             from: `"Coder's Space" <${process.env.MAIL_USER}>`,
             to: email,
             subject: "TradeZone -🔐 Your OTP for Secure Verification",
             html:htmlContent,
           });

           return result;

    } catch (error) {
        console.log('error in mail sender service:', error);
        throw error;
    }

}


export const generateOTP = () => {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    return otp;
}