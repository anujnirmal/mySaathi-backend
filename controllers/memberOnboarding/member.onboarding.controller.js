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
  let spread_sheet = new GoogleSpreadsheet(
    "1bsucPaiwm87geFnfOm4jfhjkWSXd4TBSlyZqtDTRDz0"
  );

  await spread_sheet.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  //   Load all the sheet property
  await spread_sheet.loadInfo();

  //   Get the sheet to read data from
  let acceptedMemberSheet = await spread_sheet.sheetsByTitle[SHEET_TITLE];

  //   get all the rows
  let rows = await acceptedMemberSheet.getRows();

  // rows[0].Seeded = "No";
  // await rows[0].save();

  // List of all the member
  let member_object = create_seeding_member_object(rows);

  // Capture all the dublicate entries
  let dublicate_entries = [];
  // rows that has been processed
  let row_completed_processing = [];
  // Capture the error
  let errLog = [];

  const seed_data = new Promise((resolve, reject) => {
    // If there is not member object then imediatle resolve it
    if (member_object.length === 0) {
      resolve();
    }

    member_object.forEach(async (member, index, array) => {
      // let percentage_completed = (member_object.length / (member_object.length - index) ) * 100;
      await prisma.members
        .create({
          data: member.data,
        })
        .then((result) => {
          let success_object = {
            row_number: member.row_number,
            status: "success",
          };
          row_completed_processing.push(success_object);
        })
        .catch((err) => {
          let error_object = {
            row_number: member.row_number,
            status: "error",
          };
          row_completed_processing.push(error_object);
          // errLog.push(err);
          if (err.code === "P2002") {
            dublicate_entries.push(member);
          }
        });

      if (index === array.length - 1) resolve();
    });
  });

  seed_data.then(() => {
    // Send the response
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    try {
      const update_sheet = new Promise(async (resolve, reject) => {
        // If the lenght of the rows to process = 0 then immediatly resolve
        if (row_completed_processing.length === 0) resolve();

        for (let i = 0; i < row_completed_processing.length; i += 50) {
          spread_sheet = new GoogleSpreadsheet(
            "1bsucPaiwm87geFnfOm4jfhjkWSXd4TBSlyZqtDTRDz0"
          );

          await spread_sheet.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
          });

          //   Load all the sheet property
          await spread_sheet.loadInfo();

          //   Get the sheet to read data from
          const acceptedMemberSheet = await spread_sheet.sheetsByTitle[
            SHEET_TITLE
          ];

          //   get all the rows
          const rows = await acceptedMemberSheet.getRows();

          let loop_times;

          //
          if (row_completed_processing.length <= 50) {
            loop_times = row_completed_processing.length;
          } else {
            if (
              i ===
              row_completed_processing.length -
                (row_completed_processing.length % 50)
            ) {
              console.log("Hey there");
              loop_times = i + (row_completed_processing.length % 50);
            } else {
              console.log("else");
              loop_times = 50 + i;
            }
          }

          console.log("Time to loop " +loop_times);

          for (let j = i; j < loop_times; j++) {
            let row_number = row_completed_processing[j]?.row_number - 2;
            console.log("Row Number " + row_number);
            if (row_completed_processing[j].status === "success") {
              rows[row_number].Seeded = "Yes";
              await rows[row_number].save();
            } else {
              rows[row_number].Seeded = "Yes";
              await rows[row_number].save();
            }
          }

          //TODO: Update the percentage in db
          let percentage_completed =
            ((i + 50) / row_completed_processing.length) * 100;
          console.log(percentage_completed);

          // If the lenght of the rows to process is greater then 50
          // Then sleep for 1 min to make next set of request
          if (row_completed_processing.length > 50) {
            console.log("called sleep");
            await sleep(100000);
          }
        }

        console.log("Resolved");
        resolve();
      });

      update_sheet.then((result) => {
        console.log("completed");
        return res
          .status(201)
          .json({
            message: "success",
            rows_completed: row_completed_processing,
          })
          .send();
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" }).send();
    }
  });
};

const create_seeding_member_object = (rows) => {
  let member_object = [];

  rows.forEach((row) => {
    let data = row._rawData;
    let member = {};
    if (row._rawData[20] !== "Yes") {
      member = {
        row_number: row._rowNumber,
        data: {
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
          member_other_detail: {
            create: {
              registered_member_of_film_union: data[
                REGISTERED_UNION_MEMBER
              ].includes("Yes")
                ? true
                : false,
              active_saathi_member_till_2022: data[
                SAATHI_MEMBER_TILL_2022
              ].includes("Yes")
                ? true
                : false,
              monthly_salary_range: data[MONTHLY_SALARY_RANGE],
              retired_person: data[RETIRED_PERSON].includes("Yes")
                ? true
                : false,
              disabled: data[DISABLED_PERSON].includes("Yes") ? true : false,
              disability: data[DISABILITY],
            },
          },
          bank_detail: {
            create: {
              bank_name: data[BANK_NAME],
              bank_account_number: data[BANK_ACCOUNT_NUMBER],
              ifsc_code: data[BANK_IFSC_CODE],
              bank_branch_name: data[BANK_BRANCH_NAME],
            },
          },
        },
      };
    }
    // If member is not null then push it
    if (Object.keys(member).length !== 0) member_object.push(member);
  });

  return member_object;
};
