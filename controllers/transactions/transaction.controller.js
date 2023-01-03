const db = require("../../models");
const { converToUTCToDate } = require("../../helper/helper.functions");

const prisma = db.prisma; // Creating an instance of the databse

// Get all transaction data
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

exports.get_transaction_data = async (req, res) => {
  // member_ids format = [1,2,3]
  const { member_ids } = req.body;

  await prisma.member_bank_transaction
    .findMany({
      where: {
        in: member_ids,
      },
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

// Create a new news
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

  console.log(req.body);

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
        .json({ message: "Successfully added the transaction", data: member_transaction_result })
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
    console.log("Balance " + member_balance);
    if (member_balance < 0) {
      console.log("here");
      return res.status(406).json({ message: "Member has " + member.balance_amount + " ruppes left"}).send();
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
    console.log(err);
    return res.status(500).json({ message: "Intenral Server Error" }).send();
  }
};
