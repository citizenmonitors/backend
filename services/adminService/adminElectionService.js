import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js"
import DailyTraffic from "../../models/DailyTraffic/dailyTraffic.js";
import MontlyActiveUsers from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";


export const getDashboardDataService = async () => {
    try {
        const [
          totalRegisteresUSers,
          totalObserverUsers,
          totalActiveUsers,
          totalResultsUploaded,
          dailyTraffic,
        ] = await Promise.all([
          CompletedUser.countDocuments(),
          CompletedUser.countDocuments({ role: "observer" }),
          MontlyActiveUsers.find(),
          ElectionData.countDocuments(),
          DailyTraffic.find(),

        ]);

        // Get user info
        const maleCount = await CompletedUser.countDocuments({gender: 'male'});
        const femaleCount= await CompletedUser.countDocuments({gender: 'female'});
        const observerCount = await CompletedUser.countDocuments({role: 'observer'});
        const volunteerCount = await CompletedUser.countDocuments({role: 'volunteer'});
        
        const userInfo = {
            gender:{
                male: maleCount,
                female: femaleCount,
            },
            role:{
                observer: observerCount,
                volunteer: volunteerCount,
            },
        };

        return {
          totalRegisteresUSers,
          totalObserverUsers,
          totalActiveUsers,
          totalResultsUploaded,
          userInfo,
          dailyTraffic,
        };
    } catch (error) {
        console.error("Error fetching dashboard data", error);
        throw new Error("Failed to fetch dashboard data");
    }
}
// export const getTotalRegistredUsersService = async () => {
//     return await CompletedUser.countDocuments();

// }

// export const getTotalVolunteerUsersService = async () => {
//   return await CompletedUser.countDocuments({ role: "observer" });
// };

// export const getTotalActiveUsersService = async () =>{
//     // const oneMonthAgo = moment().subtract(1, "month").toDate();
//     // return await CompletedUser.countDocuments({ lastLogin: {$gte: oneMonthAgo}})
//     return await MonthlyActiveUsers.find();
// }

// export const getTotalResultsUploadedService = async () =>{
//     return await ElectionData.countDocuments();
// }

// export const getUserInfoService = async () =>{
//     const users = await CompletedUser.find().select('gender role')
//     const userInfo = {
//         gender: {
//             male: 0,
//             female: 0,
//         },
//         role: {
//             volunteer: 0,
//             observer: 0,
//         },
//     };

//     users.forEach((user) => {
//         if(user.gender === 'male') userInfo.gender.male++;
//         else if(user.gender === 'female') userInfo.gender.female++;
//         else return null;

//         if(user.role === 'volunteer') userInfo.role.volunteer++;
//         else if(user.role === 'observer') userInfo.role.observer++;
//         else return null;
//     });
//     return userInfo;
// }

export const getAllAdminService = async () =>{
    return await CompletedUser.find({role: 'admin'}).select('firstName lastName email image');
}

// export const getDailyTrafficService = async () =>{
//     return await DailyTraffic.find();
// }