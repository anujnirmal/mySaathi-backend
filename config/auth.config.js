module.exports = {
  secret: "thisisthesecretkeyirandomtexthere",
  msg91_auth_key: "387019AD7sOH3Zzyw563a080d6P1",
  // admin_jwt_expiration: 3600,           // 1 hour
  // admin_jwt_refreshexpiration: 86400,   // 24 hours

  /* for test */
  admin_jwt_expiration: 60,          // 1 minute
  admin_jwt_refreshexpiration: 120,  // 2 minutes
  member_jwt_expiration: 60,          // 1 minute
  member_jwt_refreshexpiration: 120,  // 2 minutes
};
