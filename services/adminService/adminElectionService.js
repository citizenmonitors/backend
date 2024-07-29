import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js"
import DailyTraffic from "../../models/DailyTraffic/dailyTraffic.js";
import MontlyActiveUsers from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";

export const getTotalRegistredUsersService = async () => {
    return await CompletedUser.countDocuments();
}

export const getTotalVolunteerUsersService = async () => {
  return await CompletedUser.countDocuments({ role: "volunteer" });
};

export const getTotalActiveUsersService = async () =>{
    // const oneMonthAgo = moment().subtract(1, "month").toDate();
    // return await CompletedUser.countDocuments({ lastLogin: {$gte: oneMonthAgo}})
    return await MontlyActiveUsers.find();
}

export const getTotalResultsUploadedService = async () =>{
    return await ElectionData.countDocuments();
}

export const getUserInfoService = async () =>{
    const users = await CompletedUser.find().select('gender role')
    const userInfo = {
        gender: {
            male: 0,
            female: 0,
        },
        role: {
            volunteer: 0,
            observer: 0,
        },
    };

    users.forEach((user) => {
        if(user.gender === 'male') userInfo.gender.male++;
        else if(user.gender === 'female') userInfo.gender.female++;
        else return null;

        if(user.role === 'volunteer') userInfo.role.volunteer++;
        else if(user.role === 'observer') userInfo.role.observer++;
        else return null;
    });
    return userInfo;
}

export const getAllAdminService = async () =>{
    return await CompletedUser.find({role: 'admin'}).select('firstName lastName email');
}

export const getDailyTrafficService = async () =>{
    return await DailyTraffic.find();
}