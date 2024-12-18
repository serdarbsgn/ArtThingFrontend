// helpers.js
import { ref, watch } from 'vue';
import axios from 'axios';
import { backendMainAppAddress } from '@/config';
import { backendLayersAppAddress } from '@/config';
// Define reactive variables
export const username = ref(sessionStorage.getItem('username') || '');
export const picture = ref(sessionStorage.getItem('picture') || '');
export const dropdownLoginVisible = ref(false);
// Function to get user info and set reactive variables
export async function getUserinfo() {
  const storedUsername = sessionStorage.getItem('username');
  const storedProfilePicture = sessionStorage.getItem('picture');

  if (storedUsername && storedProfilePicture) {
    username.value = storedUsername;
    picture.value = storedProfilePicture;
    return { username: storedUsername, picture: storedProfilePicture };
  }

  try {
    const token = sessionStorage.getItem('loginJwt');
    if (!token) return null;

    const config = { headers: { Authorization: `${token}` } };
    const userInfoResponse = await axios.get(`${backendMainAppAddress}/userinfo`, config);

    username.value = userInfoResponse.data.username;
    picture.value = `${backendMainAppAddress}/profile-picture/${userInfoResponse.data.picture}`;

    sessionStorage.setItem('username', username.value);
    sessionStorage.setItem('picture', picture.value);

    return { username: username.value, picture: picture.value };
  } catch (error) {
    if (error.response?.status === 401) {
      removeUserinfo();
      sessionStorage.removeItem('loginJwt');
    }
    return null;
  }
}

// Function to clear user info
export function removeUserinfo() {
  username.value = '';
  picture.value = '';
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('picture');
}

export function logout(){
    sessionStorage.removeItem('loginJwt');
    removeUserinfo();
}

// Watch reactive variables and sync with sessionStorage
watch(username, (newVal) => sessionStorage.setItem('username', newVal));
watch(picture, (newVal) => sessionStorage.setItem('picture', newVal));

export async function getUserProjectStats() {
    const statsKey = 'userProjectStats';
    const timestampKey = 'userProjectStatsTimestamp';
  
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
            removeUserProjectstats();
            sessionStorage.removeItem('loginJwt');
        }
        return null;
      }
    }
  }
export function removeUserProjectstats(){
    sessionStorage.removeItem('userProjectStats');
    sessionStorage.removeItem('userProjectStatsTimestamp');
}