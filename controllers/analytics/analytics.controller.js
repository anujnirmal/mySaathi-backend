const db = require("../../models");

const prisma = db.prisma; // Creating an instance of the databse

// members: is the list of all members
// module: is the name of the module to search
const count_household_members = (members, module) => {
  let total_count = 0;
  for (let i = 0; i < members.length; i++) {
    members[i].modules.find((element) => {
      if (element === module) {
        total_count++;
      }
    });
  }

  return total_count;
};

// get analytics for dashboard
exports.get_analytics = async (req, res) => {
  try {
    const total_members = await prisma.members.findMany({
      where: {
        trashed: false,
      },
    });

    const trashed_members = await prisma.members.count({
      where: {
        trashed: true,
      },
    });

    const dashboard_users = await prisma.dashboard_users.count({});
    const news_count = await prisma.news.count({});
    const transactions = await prisma.member_bank_transaction.findMany({});
    
    // Get all the pending claims
    let pending_transactions = 0;
    for (let i = 0; i < transactions.length; i++) {
      if(transactions[i].status === "PENDING"){
        pending_transactions++;
      }
    }

    let total_household_member_count = count_household_members(
      total_members,
      "HOUSEHOLD"
    );
    let total_education_member_count = count_household_members(
      total_members,
      "EDUCATION"
    );

    const total_member_count = total_members.length;
    return res.json({
      message: "success",
      data: {
        total_members: total_member_count,
        total_household_members: total_household_member_count,
        total_education_members: total_education_member_count,
        trashed_members: trashed_members,
        dashboard_users: dashboard_users,
        news_count: news_count,
        pending_claims: pending_transactions,
        transactions: transactions,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Internal Server Error"}).send();
  }
};
