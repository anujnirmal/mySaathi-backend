const db = require("../models");
const config = require("../config/auth.config");
const RefreshToken = require('../models/refreshToken.model')

const prisma = db.prisma;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");



// -----
// Dashboard User CRUD routes begin here
// -----

// Create User who can login in Admin Dashboard
exports.create_dashboard_user = async(req, res) => {
  
  const { email, password, role } = req.body;

  // role = SUPERADMIN, ADMIN

  await prisma.dashboard_users.create({
    data: {
      email_id: email,
      password: bcrypt.hashSync(password, 8),
      role: role,
    }
  })
    .then((user) => {

      console.log(user);
      res.json({message: "Successfully created " + role + " user"}).status(201).send();
    
    })
    .catch((err) => {
      
      console.log(err);

      // P2002 user already exists
      if(err.code == "P2002"){
        
        // 409 = already exists
        res.json({message: "User Already Exists"}).status(409).send();

      }
    
    })
};

// Update passwords of Admin Dashboard users
exports.update_dashboard_password = async(req, res) => {
  // Save User to Database
  const { email, newPassword } = req.body;

  await prisma.dashboard_users.update({
    where: { email_id: email },
    data: { password: bcrypt.hashSync(newPassword, 8) },
  })
    .then((user) => {
      console.log(user);
      res.json({message: "Successfully update password for " + email}).status(200).send();
    })
      .catch((err) => {
        console.log(err);
        if(err.code == "P2025"){

          return res.json({message: "Not user found with this email " + email}).status(500).send();
        
        }

        return res.json({message: "Internal Server Error " + email}).status(500).send();
    })
    
};

// Delete Admin Dashboard users
exports.delete_dashboard_user = async(req, res) => {

  const { email } = req.body;

  await prisma.dashboard_users.delete({
    where: {
      email_id: email
    },
  })
    .then((user) => {

      console.log(user);
      res.json({message: "Successfully created " + role + " user"}).status(201).send();
    
    })
    .catch((err) => {
      
      console.log(err);
      res.json({message: "Internal Server Error " + err}).status(500).send();
    
    })
};

exports.dashboard_sign_in = (req, res) => {

  const { email, password } = req.body;

  prisma.dashboard_users.findUnique({
    where: { email_id: email },
  })
    .then( async (user) => {
      
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        password,
        user.password
      );

      if (!passwordIsValid) {
        return res.json({
          accessToken: null,
          message: "Invalid Password!"
        }).status(401).send();
      }

      var token = jwt.sign({ email: user.email_id }, config.secret, {
        expiresIn: config.jwtExpiration
      });


      let refreshToken = await RefreshToken.createToken(user);

        res.json({
          id: user.id,
          email: user.email_id,
          role: user.role,
          accessToken: token,
          refreshToken: refreshToken
        }).status(200).send();
        
    })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });

      
};


// -----
// Dashboard User CRUD routes ends here
// -----


// -----
// Member User CRUD routes begin here
// -----

// Create member
exports.create_member = async(req, res) => {
  
  // TODO: generate ycf_id
  const { 
    ycf_id,   
    full_name, 
    mobile_number,
    aadhaar_number,
    pancard_number,
    address
  } = req.body;

  await prisma.members.create({
    data: {
      ycf_id: ycf_id.toString(),
      full_name: full_name,
      mobile_number: mobile_number,
      aadhaar_number: aadhaar_number,
      pancard_number: pancard_number,
      address: address,
    }
  })
    .then((member) => {

      console.log(member);
      return res.json({message: "Successfully created member", data: member}).status(201).send();
    
    })
    .catch((err) => {

      console.log(err)
      // P2002 user already exists
      if(err.code == "P2002"){
        
        // 409 = already exists
        return res.json({message: "Record already Exists"}).status(409).send();

      }
    
    })
};




// TODO: Implement refresh token
exports.refreshToken = async (req, res) => {

  const { email, refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    
    // Find using request token
    let user = await prisma.dashboard_users.findUnique({
      where: { token: requestToken },
    })

    console.log(user)

    if (!user) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(user.token)) {

      prisma.dashboard_users.update({ 
        where: { email_id: email },
        data: { token: "" } 
      });
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      
      return;
    
    }

    let newAccessToken = jwt.sign({ email: user.email_id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    }).status(200).send();

  } catch (err) {
    return res.status(500).send({ message: err });
  }
};