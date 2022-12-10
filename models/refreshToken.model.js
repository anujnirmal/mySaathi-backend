const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../models");

exports.createToken = async function (user) {
    let expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);

    let _token = uuidv4();

    let refreshToken = await prisma.dashboard_users.update({
        where: { email_id: user.email_id },
        data: {
          token: _token,
          expiryDate: expiredAt.getTime()
        }
    })

    console.log(refreshToken.token);

    return refreshToken.token;
};

exports.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
};
