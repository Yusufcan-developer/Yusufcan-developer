export default {

    SiteMode:
    {
        Normal: 'Normal',
        DeliverysPoint: 'DeliveryToPoint',
    },
    status:
    {
        Priority: 'Priority',
        NotUrgent: 'NotUrgent',
    
    },
    ProductRelationTypestring:
    {   
        None: 'None',
        Dependent: 'Dependent',
        Related: 'Related',
    },
    SalesStatus:
    {
        All: 'All',
        OnlyPartials: 'OnlyPartials',
        OnlyWholes: 'OnlyWholes',
    },
    StockStatus:
    {
        None: 'None',
        GeneralInStock: 'GeneralInStock',
        GeneralNotInStock: 'GeneralNotInStock',
        TileUpTo10000: 'TileUpTo10000',
        Tile10000AndMore: 'Tile10000AndMore',
        TileNotInStock: 'TileNotInStock'
    },
    OrderLineItemStatus:
    {
        None: 'None',
        Pending: 'Pending',
        ReadyToDelivery: 'ReadyToDelivery',
        InDistribution: 'InDistribution'
    },
    LogTypes:
    {
        Export: 'Export',
        Add: 'Add',
        Browse: 'Browse',
        Update: 'Update',
        Delete: 'Delete',
    },
    LogSource:
    {
        General: 'General',
        Users: 'Users',
        Password: 'Password',
        ReportAccountTransactions: 'ReportAccountTransactions',
        ReportAccounts: 'ReportAccounts',
        ReportCheques: 'ReportCheques',
        ReportDistributions: 'ReportDistributions',
        ReportOrders: 'ReportOrders',
        ReportDeliveries: 'ReportDeliveries',
        ReportLetters: 'ReportLetters',
        Cart: 'Cart',
        Order: 'Order',
        ProductPhotos: 'ProductPhotos',
        Address: 'Address',
    },
    NotificationTypes:
    {
        LetterOfGuarantee: 'LetterOfGuarantee',
        CartUpdate: 'CartUpdate',
    }

};
