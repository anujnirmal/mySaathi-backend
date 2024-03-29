const { GoogleSpreadsheet } = require("google-spreadsheet");
const db = require("../../models");
const prisma = db.prisma; // Creating an instance of the databse

// Use this function to generate ycf id
const generate_ycf_id = () => {
  let ycf_id = "YCF";
  var min = 1;
  var max = 99999;
  var ycf_number = Math.floor(Math.random() * (max - min + 1)) + min;
  if (ycf_number.toString().length < 5) {
    let ycf_number_with_zeros = "";
    for (let i = 0; i < (5 - ycf_number.toString().length); i++) {
      ycf_number_with_zeros += "0"
    }
    return ycf_id += ycf_number_with_zeros + ycf_number;
  }else {
    return ycf_id += ycf_number;
  }
} 

// use this function to generate a unique id
const get_unique_ycf_id = (member_ycf_id_list) => {
  let ycf_id = generate_ycf_id();
  console.log("the length is " + member_ycf_id_list.length);
  for (let i = 0; i < member_ycf_id_list.length; i++) {
    console.log(member_ycf_id_list[i].ycf_id);
    if (ycf_id === member_ycf_id_list[i].ycf_id) {
      get_unique_ycf_id(member_ycf_id_list);
      return;
    }
  }
  return ycf_id;
}

// index of the column starting from 0 = 1
const FULL_NAME = 0;
const REVISED_NAME = 1;
const YCF_ID = 2
const GENDER = 3;
const MOBILE_NUMNER = 4;
const ALTERNATE_MOBILE_NUMBER = 5;
const DATE_OF_BIRTH = 6;
const ADDRESS = 7;
const PINCODE = 8;
const REGISTERED_UNION_MEMBER = 9;
const SAATHI_MEMBER_TILL_2022 = 10;
const AADHAAR_NUMBER = 11;
const PANCARD_NUMBER = 12;
const BANK_NAME = 13;
const BANK_ACCOUNT_NUMBER = 14;
const BANK_IFSC_CODE = 15;
const BANK_BRANCH_NAME = 16;
const MONTHLY_SALARY_RANGE = 17;
const RETIRED_PERSON = 18;
const DISABLED_PERSON = 19;
const DISABILITY = 20;
const BENEFIT_SELECTED = 21;

exports.onboard_member_google_sheet = async (req, res) => {

  let admin_name;
  let admin_id;

  if(req.body !== undefined){
    console.log("inside");
    console.log(req.body);
    admin_name = req.body.admin_name;
    admin_id = req.body.admin_id;
  }
    
  // Sheet name as it is on the google sheet
  const SHEET_TITLE = "411 Ration";
  const GOOGLE_SHEET_ID = "1F1AIQY8msuibgr4qHNBOEyPI_8G_Y_Og9Iz5hXmlFOg"; 

  // Initialize google sheet with the sheet id
  let spread_sheet = new GoogleSpreadsheet(
    GOOGLE_SHEET_ID
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
  let member_object = await create_seeding_member_object(rows);

  // Capture all the dublicate entries
  let dublicate_entries = "";
  // rows that has been processed
  let row_completed_processing = [];
  // Capture the error
  let errLog = "";

  // Before starting seeding add the data in seeding_data tables
  let seeding_data_entry_object = {};
  if(req.body === undefined) {
    seeding_data_entry_object = {
      admin_name: "server",
      date: new Date(),
      status: "seeding",
    }
  } else {
    seeding_data_entry_object = {
      admin_name: admin_name,
      date: new Date(),
      status: "seeding",
    }
  }

  // This holds the current seeding id and other data
  let seeding_data_pointer;
  
  await prisma.seeding_data.create({
    data: seeding_data_entry_object
  }).then((result) => {
    console.log("result " + result);
    seeding_data_pointer = result;
  })
  .catch((err) => {
    if(req.body !== undefined) return res.status(500).json({message: "Internal Server Error"}).send();
    console.log(err);
  })


  const seed_data = new Promise((resolve, reject) => {
    // If there is not member object then imediatle resolve it
    if (member_object.length === 0) {
      resolve();
    }

    member_object.forEach(async (member, index, array) => {
      // let percentage_completed = (member_object.length / (member_object.length - index) ) * 100;
      console.log(member);
      await prisma.members
        .create({
          data: member.data,
        })
        .then((result) => {
          let success_object = {
            row_number: member.row_number,
            ycf_id: member?.data?.ycf_id,
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
          errLog = "newError " + errLog + " " + err + "\n" 
          if (err.code === "P2002") {
            dublicate_entries = "newDublicateEntry " +  dublicate_entries + " " + member + "\n";
          }
        });

      if (index === array.length - 1) resolve();
    });
  });

  seed_data.then(async () => {

    // Once the data has been inserted
    await prisma.seeding_data.update({
      where: {
        id: seeding_data_pointer.id,
      },
      data: {
        percentage: "0",
        error_logs: errLog,
        dublicate_error_logs: dublicate_entries,
      }
    }).catch((err) => {
      if(req.body !== undefined) return res.status(500).json({message: "Internal Server Error"}).send();
      console.log(err);
    })

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
            GOOGLE_SHEET_ID
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

          if (row_completed_processing.length <= 50) {
            loop_times = row_completed_processing.length;
          } else {
            if (
              i ===
              row_completed_processing.length -
                (row_completed_processing.length % 50)
            ) {
              loop_times = i + (row_completed_processing.length % 50);
            } else {
              loop_times = 50 + i;
            }
          }

          console.log("Time to loop " + loop_times);

          for (let j = i; j < loop_times; j++) {
            console.log(JSON.stringify(row_completed_processing));
            let row_number = row_completed_processing[j]?.row_number - 2;
            console.log("Row Number " + row_number);
            if (row_completed_processing[j].status === "success") {
              rows[row_number].Seeded = "Yes";
              rows[row_number]['YCF ID NO'] = row_completed_processing[j].ycf_id;
              await rows[row_number].save();
            } else {
              rows[row_number].Seeded = "No";
              await rows[row_number].save();
            }
          }

          //TODO: Update the percentage in db
          let percentage_completed =
            ((loop_times) / row_completed_processing.length) * 100;
          console.log(percentage_completed);

          let seeding_data_to_update;

          if(percentage_completed === 100){
             seeding_data_to_update = {
              percentage: Math.floor(percentage_completed).toString(),
              status: "done"
            }
          }else {
            seeding_data_to_update = {
              percentage: Math.floor(percentage_completed).toString(),
            }
          }

          // Update the seeding_data to be displayed on dashboard
          await prisma.seeding_data.update({
            where: {
              id: seeding_data_pointer.id
            },
            data:seeding_data_to_update
          })

          // If the lenght of the rows to process is greater then 50
          // Then sleep for 1 min to make next set of request
          if (percentage_completed !== 100) {
            console.log("called sleep");
            await sleep(100000);
          }
        }

        console.log("Resolved");
        resolve();
      });

      update_sheet.then((result) => {
        console.log("completed");
        if(req.body === undefined) return;
        return res
          .status(201)
          .json({
            message: "success",
            rows_completed: row_completed_processing,
          })
          .send();
      });
    } catch (err) {
      console.log(err);
      if(req.body === undefined) return;
      return res.status(500).json({ message: "Internal Server Error" }).send();
    }
  });
};

const create_seeding_member_object = async (rows) => {
  let member_object = [];

  let master_ycf_id_list = await prisma.members.findMany({
    select: {
      ycf_id: true,
    }
  })

  rows.forEach((row) => {
    let ycf_id = get_unique_ycf_id(master_ycf_id_list);
    // once we get ycf id we update in the master ycf id collection
    master_ycf_id_list.push({
      ycf_id: ycf_id
    })

    console.log("Result is here " + ycf_id);

    let data = row._rawData;
    let member = {};
    if (row._rawData[22] !== "Yes") {
      member = {
        row_number: row._rowNumber,
        data: {
          full_name: data[FULL_NAME],
          ycf_id: ycf_id,// check here before seeding
          revised_name: data[REVISED_NAME],
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
