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
    const total_members = await prisma.members.findMany({});

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
      },
    });
  } catch (error) {
    console.log(error);
  }
};
