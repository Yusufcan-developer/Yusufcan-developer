
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import history from '@iso/lib/helpers/history';
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');

export async function postStartEditingBehalfOf() {
  
  let notificationData;
  const activeUser = localStorage.getItem("activeUser");
  const token = jwtDecode(localStorage.getItem("id_token"));
  if(token===undefined){return  history.replace('/');}
  let accountNo = undefined;
  if (activeUser != undefined) { accountNo = activeUser }
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
    let newStartBehalfOfUrl = siteConfig.api.carts.postStartEditingBehalfOf.replace('{accountNo}', accountNo);
    await fetch(`${newStartBehalfOfUrl}`, requestOptions)
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