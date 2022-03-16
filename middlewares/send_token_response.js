// ========== Send Token Response to Client ========== //
const sendTokenReponse = async(user, statusCode, res) => {
    const generated_token = await user.getSignedJWTToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    
    if(process.env.NODE_ENV === "production") {
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie("token", generated_token, options)
        .json({ 
            succes: true,
            token: generated_token
        })
}

module.exports = sendTokenReponse