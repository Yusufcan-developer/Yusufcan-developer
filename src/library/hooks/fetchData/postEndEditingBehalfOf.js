
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import history from '@iso/lib/helpers/history';
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');

export async function postEndEditingBehalfOf(accountNo) {
  
  let notificationData;  
  try {
    const reqBody ={};
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    let newEndBehalfOfUrl = siteConfig.api.carts.postEndEditingBehalfOf.replace('{accountNo}', accountNo);
    await fetch(`${newEndBehalfOfUrl}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data !== undefined) {
          return notificationData;
        }
      })
      .catch(notificationData = undefined);
  }
  catch (err) {
    console.log(err);
  }
};