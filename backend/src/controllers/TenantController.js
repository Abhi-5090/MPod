
// const Tenant = require("../models/tenant");

// const getTenants = async (req, res, next) => {
//   let tenants;
//   try {
//     tenants = await Tenant.find()
    
//     return res.status(200).json(tenants)
//   } catch (err) {
//     console.log(err)
//     return res.status(500).json({ message: "something went wrong" })
//   }
// }


// module.exports = {
//   getTenants
// }

const Tenant = require("../models/tenant");

// ===================== Add Tenant =====================
const addTenant = async (req, res) => {
  try {
    const {
      organization_name,
      contact_person,
      email,
      assigned_credits,
      status,
      interview_duration_minutes,
      organization_code
    } = req.body;

    if (!organization_name || !email || !assigned_credits) {
      return res.status(400).json({ message: "Organization name, email, and assigned credits are required" });
    }

    // Check duplicate email
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant with this email already exists" });
    }

    // Parse assigned_credits
    let creditsArray = [];
    if (Array.isArray(assigned_credits)) {
      creditsArray = assigned_credits.map(Number);
    } else if (typeof assigned_credits === "string") {
      creditsArray = assigned_credits.split(",").map(num => Number(num.trim()));
    } else if (typeof assigned_credits === "number") {
      creditsArray = [assigned_credits];
    } else {
      return res.status(400).json({ message: "Invalid assigned_credits format" });
    }

    const totalActiveCredits = creditsArray.reduce((sum, val) => sum + val, 0);

    const tenant = new Tenant({
      organization_name,
      contact_person,
      email,
      assigned_credits: creditsArray,
      active_credits: totalActiveCredits,
      status: status || 1,
      interview_duration_minutes: interview_duration_minutes || 30,
      organization_code: organization_code || ""
    });

    const savedTenant = await tenant.save();

    return res.status(201).json({
      message: "Tenant created successfully",
      data: savedTenant,
    });

  } catch (error) {
    console.error("Error creating tenant:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// ===================== Get All Tenants =====================
const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    return res.status(200).json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// ===================== Get Tenant By ID =====================
const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    return res.status(200).json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// ===================== Update Tenant =====================
const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      organization_name,
      contact_person,
      email,
      assigned_credits,
      status,
      interview_duration_minutes,
      organization_code
    } = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update fields if provided
    if (organization_name) tenant.organization_name = organization_name;
    if (contact_person) tenant.contact_person = contact_person;
    if (email) tenant.email = email;
    if (status !== undefined) tenant.status = status;
    if (interview_duration_minutes) tenant.interview_duration_minutes = interview_duration_minutes;
    if (organization_code) tenant.organization_code = organization_code;

    if (assigned_credits) {
      // Parse assigned_credits
      let creditsArray = [];
      if (Array.isArray(assigned_credits)) {
        creditsArray = assigned_credits.map(Number);
      } else if (typeof assigned_credits === "string") {
        creditsArray = assigned_credits.split(",").map(num => Number(num.trim()));
      } else if (typeof assigned_credits === "number") {
        creditsArray = [assigned_credits];
      }

      tenant.assigned_credits = creditsArray;
      // Update active_credits based on total assigned credits
      tenant.active_credits = creditsArray.reduce((sum, val) => sum + val, 0);
    }

    const updatedTenant = await tenant.save();
    return res.status(200).json({
      message: "Tenant updated successfully",
      data: updatedTenant
    });

  } catch (error) {
    console.error("Error updating tenant:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// ===================== Delete Tenant =====================
const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    await Tenant.deleteOne({ _id: id });
    return res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

module.exports = {
  addTenant,
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant
};
