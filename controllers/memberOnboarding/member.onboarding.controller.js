const { GoogleSpreadsheet } = require("google-spreadsheet");
const db = require("../../models");
const prisma = db.prisma; // Creating an instance of the databse

// index of the column starting from 0 = 1
const FULL_NAME = 0;
const GENDER = 1;
const MOBILE_NUMNER = 2;
const ALTERNATE_MOBILE_NUMBER = 3;
const DATE_OF_BIRTH = 4;
const ADDRESS = 5;
const PINCODE = 6;
const REGISTERED_UNION_MEMBER = 7;
const SAATHI_MEMBER_TILL_2022 = 8;
const AADHAAR_NUMBER = 9;
const PANCARD_NUMBER = 10;
const BANK_NAME = 11;
const BANK_ACCOUNT_NUMBER = 12;
const BANK_IFSC_CODE = 13;
const BANK_BRANCH_NAME = 14;
const MONTHLY_SALARY_RANGE = 15;
const RETIRED_PERSON = 16;
const DISABLED_PERSON = 17;
const DISABILITY = 18;
const BENEFIT_SELECTED = 19;

exports.onboard_member_google_sheet = async (req, res) => {
  // Sheet name as it is on the google sheet
  const SHEET_TITLE = "Eligible Saathi members";

  // Initialize google sheet with the sheet id
  const spread_sheet = new GoogleSpreadsheet(
    "1bsucPaiwm87geFnfOm4jfhjkWSXd4TBSlyZqtDTRDz0"
  );

  await spread_sheet.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  //   Load all the sheet property
  await spread_sheet.loadInfo();

  //   Get the sheet to read data from
  const acceptedMemberSheet = await spread_sheet.sheetsByTitle[SHEET_TITLE];
  //   get all the rows
  const rows = await acceptedMemberSheet.getRows();

  let member_object = create_seeding_member_object(rows);

  console.log(member_object[0]);
  await prisma.members
    .createMany({
      data: member_object,
      skipDuplicates: true,
    })
    .then((result) => {
      return res.status(201).json({ message: "success", data: result }).send();
    })
    .catch((err) => {
      console.log(err);
    });
};

const create_seeding_member_object = (rows) => {
  let member_object = [];

  rows.forEach((row) => {
    let data = row._rawData;
    let member = {
      full_name: data[FULL_NAME],
      mobile_number: data[MOBILE_NUMNER],
      alternate_mobile_number: data[ALTERNATE_MOBILE_NUMBER],
      aadhaar_number: data[AADHAAR_NUMBER],
      pancard_number: data[PANCARD_NUMBER],
      address: data[ADDRESS],
      date_of_birth: data[DATE_OF_BIRTH],
      gender: data[GENDER].includes("Female") ? "FEMALE" : "MALE",
      pincode: data[PINCODE],
      yearly_quota: "10000",
      balance_amount: "10000",
      language: "ENGLISH",
      modules: [
        "HEALTH",
        data[BENEFIT_SELECTED]?.includes("Education")
          ? "EDUCATION"
          : "HOUSEHOLD",
      ],

      registered_member_of_film_union: data[REGISTERED_UNION_MEMBER].includes(
        "Yes"
      )
        ? true
        : false,
      active_saathi_member_till_2022: data[SAATHI_MEMBER_TILL_2022].includes(
        "Yes"
      )
        ? true
        : false,
      monthly_salary_range: data[MONTHLY_SALARY_RANGE],
      retired_person: data[RETIRED_PERSON].includes("Yes") ? true : false,
      disabled: data[DISABLED_PERSON].includes("Yes") ? true : false,
      disability: data[DISABILITY],
    };

    member_object.push(member);
  });

  return member_object;
};
