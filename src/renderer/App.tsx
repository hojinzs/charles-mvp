import React from 'react';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from './routes/root';
import { MonitoringPage } from './routes/index';
import { HistoryPage } from './routes/history';

// 1. Create Route Tree
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MonitoringPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([indexRoute, historyRoute]);

// 2. Create Router
const router = createRouter({ routeTree });

// 3. Register Reference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
