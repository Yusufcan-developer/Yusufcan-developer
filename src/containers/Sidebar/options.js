const options = [
  {
    key: "dashboard",
    label: "sidebar.dashboard",
    leftIcon: "ion-clipboard"
  },
  {
    key: "reportTable",
    label: "sidebar.reportTable",
    leftIcon: "ion-ios-paper",
    children: [
     
      {
        key: "orderFollowUp",
        label: "sidebar.orderFollowUp",
        leftIcon: "ion-android-mail"
      },
      {
        key: "shipping",
        label: "sidebar.shipping",
        leftIcon: "ion-android-mail"
      },
      {
        key: "customerRecords",
        label: "sidebar.customerRecords",
        leftIcon: "ion-android-mail"
      },
      {
        key: "checkingReports",
        label: "sidebar.checkingReports",
        leftIcon: "ion-android-mail"
      },
      {
        key: "lettersOfGuarantee",
        label: "sidebar.lettersOfGuarantee",
        leftIcon: "ion-android-mail"
      },
      {
        key: 'customerList',
        label: 'sidebar.customerList',
        leftIcon: 'ion-android-mail',
      },
      {
        key: 'distributions',
        label: 'sidebar.distributions',
        leftIcon: 'ion-android-mail',
      },
    ]
  },
  {
    key: "productGroupList",
    label: "sidebar.productsList",
    leftIcon: "ion-bag"
  },
  {
    key: 'systemAdministrator',
    label: 'sidebar.administrator',
    leftIcon: 'ion-document-text',
    children: [  
      {
        key: 'uppy',
        label: 'sidebar.uploadingPhotos',
      },  
      {
        key: 'userList',
        label: 'sidebar.userList',
      },    
      
      {
        key: 'signup',
        label: 'sidebar.signUp',
        withoutDashboard: true,
      },
      
      {
        key: 'resetpassword',
        label: 'sidebar.resetPw',
        withoutDashboard: true,
      },
    ],
  },   
];
export default options;
