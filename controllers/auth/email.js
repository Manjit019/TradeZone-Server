
import User from '../../models/user.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError } from '../../errors'
import { generateOTP } from '../../services/mailSender.js'
import OTP from '../../models/otp.js'

const checkEmail = async (req,res) => {
    const {email} = req.body;
    if(!email){
        throw new BadRequestError("Email is required");
    }
    let isExists = true;
    let user = await User.find({email});

    if(!user){
        const otp = await generateOTP();
        await OTP.create({email,otp,otp_type : "email"});
        isExists : false;
    }

    res.status(StatusCodes.OK).json({isExists});
}


export {checkEmail};