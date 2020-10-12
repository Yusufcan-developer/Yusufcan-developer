
import { useState, useEffect } from "react";
import _ from 'underscore';
import { apiStatusManagement } from '@iso/lib/helpers/apiStatusManagement';
import history from '@iso/lib/helpers/history';
import { message } from "antd";
import siteConfig from "@iso/config/site.config";
var jwtDecode = require('jwt-decode');

export async function postSaveLog(selectedLogSource,selectedLogType,description,searchUrl) { 
  //Account No gelecek
  let logData;
  const activeUser = localStorage.getItem("activeUser");
  const token = jwtDecode(localStorage.getItem("id_token"));
  if(token===undefined){return  history.replace('/');}
  let accountNo = token.uname;
  if (activeUser != undefined) { accountNo = activeUser }
  try {
    const reqBody ={ "logSource": selectedLogSource, "logType": selectedLogType, "accountNo": 'B141009', "description": description }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("id_token") || undefined
      },
      body: JSON.stringify(reqBody)
    };
    await fetch(`${siteConfig.api.security.postSaveLog}`, requestOptions)
      .then(response => {
        const status = apiStatusManagement(response);
        return status;
      })
      .then(data => {
        if (data !== undefined) {

          return logData;
        }
      })
      .catch(logData = undefined);
  }
  catch (err) {
    console.log(err);
  }
};