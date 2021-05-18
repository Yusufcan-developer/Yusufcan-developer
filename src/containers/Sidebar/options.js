export default {
  sideBarMenu: {
    Admin: [
      {
        key: "dashboard/mainForm",
        label: "sidebar.mainForm",
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
            key: "reports/productOrders/",
            label: "sidebar.orderProduct",
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
          {
            key: 'plan/distribution',
            label: 'sidebar.planDistributions',
            leftIcon: 'ion-android-mail',
          },
          {
            key: 'reports/salesGoals',
            label: 'sidebar.salesGoals',
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
            key: 'admin/products/photos',
            label: 'sidebar.uploadingPhotos',
          },
          {
            key: 'admin/carts',
            label: 'sidebar.carts',
          },
          {
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
          {
            key: 'admin/logs',
            label: 'sidebar.logs',
          },
          // {
          //   key: 'admin/gauges',
          //   label: 'sidebar.logs',
          // },
          // {
          //   key: 'user/DealerUserList',
          //   label: 'sidebar.userList',
          // },
        ],
      },
    ],
    FieldManager: [
      {
        key: "dashboard/mainForm",
        label: "sidebar.mainForm",
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
            key: "reports/productOrders/",
            label: "sidebar.orderProduct",
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
          {
            key: 'plan/distribution',
            label: 'sidebar.planDistributions',
            leftIcon: 'ion-android-mail',
          },
          {
            key: 'reports/salesGoals',
            label: 'sidebar.salesGoals',
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
            key: 'admin/carts',
            label: 'sidebar.carts',
          },
          {
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
        ],
      },

    ],
    RegionManager: [
      {
        key: "dashboard/mainForm",
        label: "sidebar.mainForm",
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
            key: "reports/productOrders/",
            label: "sidebar.orderProduct",
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
          {
            key: 'plan/distribution',
            label: 'sidebar.planDistributions',
            leftIcon: 'ion-android-mail',
          },
          {
            key: 'reports/salesGoals',
            label: 'sidebar.salesGoals',
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
            key: 'admin/carts',
            label: 'sidebar.carts',
          },
          {
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
        ],
      },
    ],
    Support: [
      {
        key: "dashboard/mainForm",
        label: "sidebar.mainForm",
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
            key: "reports/productOrders/",
            label: "sidebar.orderProduct",
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
          {
            key: 'plan/distribution',
            label: 'sidebar.planDistributions',
            leftIcon: 'ion-android-mail',
          },
          {
            key: 'reports/salesTarget',
            label: 'sidebar.salesTarget',
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
            key: 'admin/carts',
            label: 'sidebar.carts',
          },
          {
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
        ],
      },
    ],
    Director:
      [
        {
          key: "dashboard/mainForm",
          label: "sidebar.mainForm",
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
              key: "reports/productOrders/",
              label: "sidebar.orderProduct",
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
            {
              key: 'plan/distribution',
              label: 'sidebar.planDistributions',
              leftIcon: 'ion-android-mail',
            },
            {
              key: 'reports/salesGoals',
              label: 'sidebar.salesGoals',
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
              key: 'admin/carts',
              label: 'sidebar.carts',
            },
            {
              key: 'admin/notification',
              label: 'sidebar.notifications',
            },
          ],
        },
      ],
    Dealersv:
      [
        {
          key: "dashboard/mainForm",
          label: "sidebar.mainForm",
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
              key: "reports/productOrders/",
              label: "sidebar.orderProduct",
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
              key: 'plan/distribution',
              label: 'sidebar.planDistributions',
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
              key: 'admin/notification',
              label: 'sidebar.notifications',
            },
            {
              key: 'dealer/users',
              label: 'sidebar.userList',
            },
          ],
        },
      ],
    Dealerwhouse: [
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
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
        ],
      },
    ],
    Dealerlimited: [
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
            key: "reports/productOrders/",
            label: "sidebar.orderProduct",
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
            key: 'admin/notification',
            label: 'sidebar.notifications',
          },
        ],
      },
    ],
  }

}