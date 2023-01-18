const { v4: uuidv4 } = require("uuid");

exports.createToken = async function (refresh_token_expiry) {
    
    let refresh_token_details = {};

    let expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + refresh_token_expiry);

    // let expiry_at = expiredAt.getTime();
    let expiry_at = expiredAt;

    let _token = uuidv4();

    refresh_token_details.expiry_at = expiry_at;
    refresh_token_details.token = _token;
    
    return refresh_token_details;

};

exports.verifyExpiration = (expiry_at) => {
    console.log(expiry_at);
    return expiry_at.getTime() < new Date().getTime();
};
