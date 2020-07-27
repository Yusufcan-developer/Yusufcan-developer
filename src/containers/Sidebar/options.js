const options = [
  {
    key: "dashboard",
    label: "sidebar.dashboard",
    leftIcon: "ion-clipboard"
  },
  {
    key: "products/categories",
    label: "sidebar.productsList",
    leftIcon: "ion-bag"
  },
  {
    key: "reportTable",
    label: "sidebar.reportTable",
    leftIcon: "ion-ios-paper",
    children: [
     
      {
        key: "reports/orders/",
        label: "sidebar.orderFollowUp",
        leftIcon: "ion-android-mail"
      },
      {
        key: "reports/deliveries/",
        label: "sidebar.shipping",
        leftIcon: "ion-android-mail"
      },
      {
        key: "reports/accounts/transactions/",
        label: "sidebar.customerRecords",
        leftIcon: "ion-android-mail"
      },
      {
        key: "reports/cheques/",
        label: "sidebar.checkingReports",
        leftIcon: "ion-android-mail"
      },
      {
        key: "reports/letters/",
        label: "sidebar.lettersOfGuarantee",
        leftIcon: "ion-android-mail"
      },
      {
        key: 'reports/accounts/',
        label: 'sidebar.customerList',
        leftIcon: 'ion-android-mail',
      },
      {
        key: 'reports/distributions',
        label: 'sidebar.distributions',
        leftIcon: 'ion-android-mail',
      },
    ]
  },
  {
    key: 'systemAdministrator',
    label: 'sidebar.administrator',
    leftIcon: 'ion-document-text',
    children: [  
      {
        key: 'admin/users',
        label: 'sidebar.userList',
      },    
      {
        key: 'admin/photos/upload',
        label: 'sidebar.uploadingPhotos',
      },
      {
        key: 'admin/saveUser',
        label: 'sidebar.signUp',
        withoutDashboard: true,
      },
      
      {
        key: 'resetpassword',
        label: 'sidebar.resetPw',
        withoutDashboard: false,
      },
    ],
  },   
];
export default options;
