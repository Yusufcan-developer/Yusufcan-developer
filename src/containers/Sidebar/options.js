const options = [
  {
    key: "orderCreate",
    label: "sidebar.orderCreate",
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
    key: "productsList",
    label: "sidebar.productsList",
    leftIcon: "ion-bag"
  }
];
export default options;
