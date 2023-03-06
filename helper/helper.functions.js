const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

exports.converToUTCToDate = (news, data) => {
    for (let i = 0; i < news.length; i++) {
      let createdUTCDate = news[i].created_at;
      let updatedOnUTCDate = news[i].updated_at;
  
      let createdDate =
        createdUTCDate.getDate() +
        "/" +
        months[createdUTCDate.getMonth()] +
        "/" +
        createdUTCDate.getFullYear();
      let updatedOnDate =
        updatedOnUTCDate.getDate() +
        "/" +
        updatedOnUTCDate.getMonth() +
        "/" +
        updatedOnUTCDate.getFullYear();
  
      data[i].created_at = createdDate;
      data[i].updated_at = updatedOnDate;
    }
  };