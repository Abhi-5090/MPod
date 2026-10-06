const express = require("express");
const Tenant = require("../controllers/TenantController");
const Credit = require("../controllers/CreditController");
const { requireStaff } = require("../middlewares/auth");
const { CAN } = require("../config/roles");

const Router = express.Router();
const manage = requireStaff(CAN.manageTenants);

Router.get("/api/get-tenants", manage, Tenant.getTenants);
Router.post("/api/add-tenant", manage, Tenant.addTenant);
Router.get("/api/get-tenant/:id", requireStaff(CAN.viewCredits), Tenant.getTenantById); // own college for tenant admins
Router.put("/api/update-tenant/:id", manage, Tenant.updateTenant);
Router.delete("/api/delete-tenant/:id", manage, Tenant.deleteTenant);

// Credit ledger
Router.post("/api/tenants/:id/credits", requireStaff(CAN.manageCredits), Credit.addCredits);
Router.get("/api/tenants/:id/credit-transactions", requireStaff(CAN.viewCredits), Credit.listTransactions);

module.exports = Router;
