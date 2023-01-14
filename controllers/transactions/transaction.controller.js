const db = require("../../models");
const { converToUTCToDate } = require("../../helper/helper.functions");
const logger = require("../../logger/logger");

const prisma = db.prisma; // Creating an instance of the databse

// Get all transaction data for all users
exports.get_all_transaction_data = async (req, res) => {
  await prisma.member_bank_transaction
    .findMany({})
    .then((bank_transaction) => { 
      console.log(bank_transaction);
      let data = bank_transaction;
      // convertUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Get transaction data of one or more users
exports.get_transaction_data_by_member_id = async (req, res) => {
  // member_ids format = [1,2,3]
  const { member_id } = req.body;

  if (member_id === null || member_id === undefined) {
    // 422 - for validation error
    return res
      .status(422)
      .json({ message: "Please send a valid member id" })
      .send();
  }

  await prisma.member_bank_transaction
    .findMany({
      where: {
        member_id: member_id,
      },
      include: {
        receipts: true
      }
    })
    .then((bank_transaction) => {
      // console.log(news);
      let data = bank_transaction;
      //   convertUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// // Get all transaction data for all users
// exports.get_all_transaction_data = async (req, res) => {
//   await prisma.member_bank_transaction
//     .findMany({})
//     .then((bank_transaction) => {
//       console.log(bank_transaction);
//       let data = bank_transaction;
//       // convertUTCToDate(news, data);
//       return res.status(200).json({ data: data }).send();
//     })
//     .catch((err) => {
//       console.log(err);
//       return res.status(500).json({ message: "Internal Server Error" }).send();
//     });
// };

// Get all pending transactions that needs to be accepted or rejected
exports.get_all_pending_transaction = async (req, res) => {
  await prisma.member_bank_transaction
    .findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        requested_date: 'desc'
      },
      include: {
        member: true,
        receipts: true,
      },
    })
    .then((bank_transaction) => {
      console.log(bank_transaction);
      let data = bank_transaction;
      //   convertUTCToDate(news, data);
      return res.status(200).json({ data: data }).send();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" }).send();
    });
};

// Create a new member transaction
exports.create_member_transaction = async (req, res) => {
  // Destructuring the results recieved
  // image_url is recieved from aws s3 after uploading
  // it on the frontend
  const {
    memberID: member_id,
    amountRequested: amount_requested,
    status,
    modules,
    adminID: admin_id,
    adminName: admin_name,
    transactionDate: transaction_date,
    subtractFromBalance: subtract_from_balance,
  } = req.body;

  // Check for response length
  if (amount_requested.length == 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Title cannot be null" }).send();
  }

  try {
    let member_transaction_result = await prisma.member_bank_transaction.create(
      {
        data: {
          amount_requested: Number(amount_requested),
          status: status,
          transaction_date: transaction_date,
          module: modules,
          approved_by: {
            connect: {
              id: admin_id,
            },
          },
          admin_name: admin_name,
          member: {
            connect: {
              id: member_id,
            },
          },
        },
      }
    );

    if (!subtract_from_balance) {
      // IF the admin has not requested subtract from the balance then just send the succes messsage
      return res
        .status(201)
        .json({
          message: "Successfully added the transaction",
          data: member_transaction_result,
        })
        .send();
    }

    let member = await prisma.members.findFirst({
      where: {
        id: member_id,
      },
    });

    // Get the member balance amount
    let member_balance = member.balance_amount;
    // Subtract the amount requested by the user by the member balance left
    member_balance = member_balance - amount_requested;
    // After subtraction if the value is below 0 then send an error to the frontend
    if (member_balance < 0) {
      return res
        .status(406)
        .json({
          message: "Member has " + member.balance_amount + " ruppes left",
        })
        .send();
    }
    // If after subtraction the value is above 0 then update the latest amount in the members table
    let updated_member = await prisma.members.update({
      where: {
        id: member_id,
      },
      data: {
        balance_amount: member_balance.toString(),
      },
    });
    return res
      .status(201)
      .json({ message: "Successfully added the transaction" })
      .send();
  } catch (err) {
    logger.log(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};

// Add Receipts
exports.add_receipts = async (req, res) => {
  const { member_id, module, receipts } = req.body;

  console.log(req.body);

  // Check for response length
  if (receipts.length === 0) {
    // 422 - for validation error
    return res
      .status(422)
      .json({ message: "Please upload atleast one receipt" })
      .send();
  }

  if (member_id.length === 0 || member_id === null || member_id === undefined) {
    // 422 - for validation error
    return res
      .status(422)
      .json({ message: "Please send the request with member_id" })
      .send();
  }

  let receipts_object = [];

  // Format the inputted
  receipts.forEach((current_receipt) => {
    let temp_receipt_object = {
      receipt_link: current_receipt,
    };

    receipts_object.push(temp_receipt_object);
  });

  try {
    let transaction = await prisma.member_bank_transaction.create({
      data: {
        requested_date: new Date(),
        module: module,
        member: {
          connect: {
            id: member_id,
          },
        },
        receipts: {
          createMany: {
            data: receipts_object,
          },
        },
      },
    }); 

    console.log(transaction);

    return res
      .status(201)
      .json({
        message: "Successfully added the transaction",
        data: transaction,
      })
      .send();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};

// Accept the transaction requested by the member
exports.accept_transaction = async (req, res) => {
  const { member_id, transaction_id, amount_requested, admin_name, admin_id } =
    req.body;

  console.log(req.body);

  // Check for response length
  if (amount_requested.length === 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Please send the amount" }).send();
  }

  if (
    transaction_id === null || 
    transaction_id === undefined ||
    member_id === null ||
    member_id === undefined
  ) {
    // 422 - for validation error
    return res
      .status(422)
      .json({ message: "Transaction id cannot be null" })
      .send();
  }

  if (member_id.length === 0 || member_id === null || member_id === undefined) {
    // 422 - for validation error
    return res.status(422).json({ message: "Member id cannot be null" }).send();
  }

  try {
    let curr_member = await prisma.members.findFirst({
      where: {
        id: member_id,
      },
    });

    // Check if member has balance
    let member_old_balance = curr_member.balance_amount;
    if (member_old_balance - amount_requested < 0) {
      return res.status(422).json({ message: "Member balance too low" }).send();
    }

    // If members have balance than add to the transaction
    let transaction = await prisma.member_bank_transaction.update({
      where: {
        id: transaction_id,
      },
      data: {
        status: "APPROVED",
        amount_requested: amount_requested,
        transaction_date: new Date(),
        admin_name: admin_name,
        admin_id: admin_id,
      },
    });

    let new_balance = member_old_balance - amount_requested;

    let new_member_balance = await prisma.members.update({
      where: {
        id: member_id
      },
      data: {
        balance_amount: new_balance.toString()
      }
    });

    return res
      .status(200)
      .json({
        message: "Successfully updated the transaction",
        data: transaction,
      })
      .send();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};



// Reject the transaction requested by the member
exports.reject_transaction = async (req, res) => {
  const { member_id, transaction_id, amount_requested, admin_name, admin_id } =
    req.body;

  console.log("Reject" + req.body);

  // Check for response length
  if (amount_requested.length === 0) {
    // 422 - for validation error
    return res.status(422).json({ message: "Please send the amount" }).send();
  }

  if (
    transaction_id === null || 
    transaction_id === undefined ||
    member_id === null ||
    member_id === undefined
  ) {
    // 422 - for validation error
    return res
      .status(422)
      .json({ message: "Transaction id cannot be null" })
      .send();
  }

  if (member_id.length === 0 || member_id === null || member_id === undefined) {
    // 422 - for validation error
    return res.status(422).json({ message: "Member id cannot be null" }).send();
  }

  try {

    let transaction = await prisma.member_bank_transaction.update({
      where: {
        id: transaction_id,
      },
      data: {
        status: "REJECTED",
        amount_requested: amount_requested,
        transaction_date: new Date(),
        admin_name: admin_name,
        admin_id: admin_id,
      },
    });
    return res
      .status(200)
      .json({
        message: "Successfully rejected the transaction",
        data: transaction,
      })
      .send();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};