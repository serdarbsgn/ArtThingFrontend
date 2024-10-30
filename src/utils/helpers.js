import axios from 'axios';
import { backendMainAppAddress } from '@/config';
import { backendLayersAppAddress } from '@/config';
export async function getUserinfo() {
  const storedUsername = sessionStorage.getItem('username');
  const storedProfilePicture = sessionStorage.getItem('picture');

  if (storedUsername && storedProfilePicture) {
    return {
      username: storedUsername,
      picture: storedProfilePicture
    };
  }

  try {
    const token = sessionStorage.getItem('loginJwt');
    if (!token) {
      return null;
    }

    const config = {
      headers: {
        Authorization: `${token}`,
      },
    };
    const userInfoResponse = await axios.get(`${backendMainAppAddress}/userinfo`, config);

    const username = userInfoResponse.data.username;
    const picture = `${backendMainAppAddress}/profile-picture/${userInfoResponse.data.picture}`;

    sessionStorage.setItem('username', username);
    sessionStorage.setItem('picture', picture);
    return {
      username,
      picture
    };
  } catch (error) {
    if(error.status === 401){
        removeUserinfo();
        removeUserstats();
        sessionStorage.removeItem('loginJwt');
    }
    return null;
  }
}

export function removeUserinfo(){
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('picture');
}

export async function getUserStats() {
    const statsKey = 'userStats';
    const timestampKey = 'userStatsTimestamp';
  
    const storedStats = JSON.parse(sessionStorage.getItem(statsKey));
    const storedTimestamp = sessionStorage.getItem(timestampKey);

    const isDataExpired = !storedTimestamp || (Date.now() - parseInt(storedTimestamp, 10)) > 180000;
  
    if (storedStats && !isDataExpired) {
      return storedStats;
    } else {
      try {
        const token = sessionStorage.getItem('loginJwt');
        if (!token) {
          return null;
        }
    
        const config = {
          headers: {
            Authorization: `${token}`,
          },
        };
        const response = await axios.get(`${backendLayersAppAddress}/userstats`, config);
        
        const statsData = {
          projectCount: response.data.projectCount,
          projectKarmaTotal: response.data.projectKarmaTotal,
          projectCommentCount: response.data.projectCommentCount,
          projectCommentKarmaTotal: response.data.projectCommentKarmaTotal,
        };
        sessionStorage.setItem(statsKey, JSON.stringify(statsData));
        sessionStorage.setItem(timestampKey, Date.now().toString());
        return statsData;
      } catch (error) {
        if(error.status === 401){
            removeUserinfo();
            removeUserstats();
            sessionStorage.removeItem('loginJwt');
        }
        return null;
      }
    }
  }
export function removeUserstats(){
    sessionStorage.removeItem('userStats');
    sessionStorage.removeItem('userStatsTimestamp');
}