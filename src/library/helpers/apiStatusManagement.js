import history from '@iso/lib/helpers/history';
import { message } from "antd";
export const apiStatusManagement = (response, notShowMessage) => {
  try {
    switch (response.status) {
      case 401:
        localStorage.removeItem('id_token'); history.push('/');
        break;
      case 404:
        if (notShowMessage) {
          { return 'Unauthorized1' }
        }
        else {
          return response.json();;
        }
      case 500:
        return history.push('/');
      default:
        return response.json();
    }
  }
  catch (err) {
    return 'Unauthorized1';
  }
};