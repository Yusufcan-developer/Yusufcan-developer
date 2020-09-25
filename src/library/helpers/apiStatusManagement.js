import history from '@iso/lib/helpers/history';
export const apiStatusManagement = response => {
    try {
        switch (response.status) {
            case 200:
              return response.json();
              break;
            case 401:
            return  true ;//history.push('/');
              break;
            case 404: 
            return  true //history.push('/');             
              break;
            case 500:
             return history.push('/');
              // Serveur Error redirect to 500
              break;
            default:
              break;
          }
      }
     catch (err) {
      return undefined;
    }
  };