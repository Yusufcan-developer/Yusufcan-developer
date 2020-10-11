import history from '@iso/lib/helpers/history';
import { message } from "antd";
export const apiStatusManagement = (response,notShowMessage) => {
  try {
    switch (response.status) {
      case 200:
        return response.json();
        break;
      case 401:
        localStorage.removeItem('id_token');history.push('/');
        break;
      case 404:
        debugger
        if (notShowMessage) {
          { return 'Unauthorized1' }
        }
        else {
          return message.error('Veritabanından bilgiler getirilemiyor sistem yöneticinize başvurunuz.');
        }
        break;
      case 500:
        return history.push('/');
        break;
      default:
        break;
    }
  }
  catch (err) {
    return undefined;
  }
};