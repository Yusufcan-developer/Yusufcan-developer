import React, { lazy, Suspense } from 'react';
import { Route, useRouteMatch, Switch } from 'react-router-dom';
import Loader from '@iso/components/utility/loader';
import { stripTrailingSlash } from '@iso/lib/helpers/utility';

const routes = [
  {
    path: '',
    component: lazy(() => import('@iso/containers/Widgets/Widgets')),
    exact: true,
  },
  
 
  {
    path: 'menu',
    component: lazy(() => import('@iso/containers/Navigation/NavigationMenu')),
  },
  {
    path: 'ReactChart2',
    component: lazy(() =>
      import('@iso/containers/Charts/ReactChart2/ReactChart2')
    ),
  },
  {
    path: 'cart',
    component: lazy(() => import('@iso/containers/Ecommerce/Cart/Cart')),
  },
  {
    path: 'orderPartial',
    component: lazy(() => import('@iso/containers/Ecommerce/Cart/OrderPartial')),
  },
  {
    path: 'admin/carts',
    component: lazy(() => import('@iso/containers/Ecommerce/Cart/CartList')),
  },
  {
    path: 'checkout',
    component: lazy(() =>
      import('@iso/containers/Ecommerce/Checkout/Checkout')
    ),
  },
 
  {
    path: 'invoice/:invoiceId',
    component: lazy(() => import('@iso/containers/Invoice/SingleInvoice')),
  },
  {
    path: 'invoice',
    component: lazy(() => import('@iso/containers/Invoice/Invoices')),
  },
  {
    path: 'dashboard/mainForm',
    component: lazy(() => import('@iso/containers/Dashboard/MainForm')),
  },
  {
    path: 'reports/accounts/transactions/',
    component: lazy(() => import('@iso/containers/Reports/AccountTransactions')),
  },
  {
    path: 'reports/cheques/',
    component: lazy(() => import('@iso/containers/Reports/Cheques')),
  },
  {
    path: 'reports/deliveries/',
    component: lazy(() => import('@iso/containers/Reports/Deliveries')),
  },
  {
    path: 'reports/letters/',
    component: lazy(() => import('@iso/containers/Reports/Letters')),
  },
  {
    path: 'reports/orders/',
    component: lazy(() => import('@iso/containers/Reports/Orders')),
  },
  {
    path: 'reports/accounts/',
    component: lazy(() => import('@iso/containers/Reports/Accounts')),
  },
  {
    path: 'reports/distributions',
    component: lazy(() => import('@iso/containers/Reports/Distributions')),
  },
  {
    path: 'blank_page',
    component: lazy(() => import('@iso/containers/Products/Search')),
  },
  {
    path: 'products/search',
    component: lazy(() => import('@iso/containers/Products/Search')),
  },
  {
    path: 'products/detail/:productId',
    component: lazy(() => import('@iso/containers/Products/ProductDetail')),
    exact: false
  },
  {
    path: 'products/categories',
    component: lazy(() => import('@iso/containers/Products/Categories')),
  },
  {
    path: 'admin/products/photos',
    component: lazy(() => import('@iso/containers/User/ImageUpload')),
  },
  {
    path: 'admin/users',
    component: lazy(() => import('@iso/containers/User/UserList')),
  },
  {
    path: 'admin/logs',
    component: lazy(() => import('@iso/containers/User/Logs')),
  },
  {
    path: 'admin/notification',
    component: lazy(() => import('@iso/containers/Notification/Notification')),
  },
  {
    path: 'dealer/users',
    component: lazy(() => import('@iso/containers/User/DealerUserList')),
  },
];

export default function AppRouter() {
  let { url } = useRouteMatch();
  url = stripTrailingSlash(url);  
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        {routes.map((route, idx) => (
          <Route exact={route.exact} key={idx} path={`${url}/${route.path}`}>
            <route.component />
          </Route>
        ))}
      </Switch>
    </Suspense>
  );
}
