import express from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { menuRouter } from './modules/menu/menu.routes';
import { tablesRouter } from './modules/tables/tables.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { billingRouter } from './modules/billing/billing.routes';
import { kitchenRouter } from './modules/kitchen/kitchen.routes';
import { inventoryRouter } from './modules/inventory/inventory.routes';
import { reportsRouter } from './modules/reports/reports.routes';

const app = express.Router();

app.use('/auth', authRouter);
app.use('/staff', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/menu', menuRouter);
app.use('/tables', tablesRouter);
app.use('/orders', ordersRouter);
app.use('/billing', billingRouter);
app.use('/kitchen', kitchenRouter);
app.use('/inventory', inventoryRouter);
app.use('/analytics', reportsRouter);

// Error handler middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export const apiRouter = app;
