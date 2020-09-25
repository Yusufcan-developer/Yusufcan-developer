import history from '@iso/lib/helpers/history';
import { message } from "antd";
export const apiStatusManagement = response => {
  debugger
  try {
    switch (response.status) {
      case 200:
        return response.json();
        break;
      case 401:
        return history.push('/');
        break;
      case 404:
        return message.error('Veritabanından bilgiler getirilemiyor sistem yöneticinize başvurunuz.');
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