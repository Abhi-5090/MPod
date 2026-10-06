const Company = require('../models/companies');
const mongoose = require('mongoose')
const AddCompany = async (req, res, next) => {
    const { company_name, added_date, update_date, added_by, status } = req.body;
    let company;
    try {
        company = new Company({
            company_name,
            added_date,
            update_date,
            added_by,
            status,
        });
        await company.save().then(() => {
            return res.status(201).json(company)
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "Failed to add Company...!!!"
        });
    }
    if (!company) {
        return res.status(500).json({ message: "Company adding failed" })
    }
    //    return res.status(201).json({ message:topic })
}

const getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({}).select('_id company_name');
        return res.status(200).json(companies);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "No Companies found" });
    }
};


const getCompanyById = async (req, res, next) => {
    const id = req.params.id;
    let company;
    try {
        company = await Company.findById(id);
        return res.status(200).json(company)
    } catch (err) {
        console.log(err)
    }
}

const updateCompany = async (req, res, next) => {

    const id = req.params.id;
    let { company_name, added_date, update_date, added_by, status } = req.body;
    let company;
    try {
        company = await Company.findByIdAndUpdate(id, { company_name, added_date, update_date, added_by, status });
        company = await company.save()
        return res.status(200).json({ message: "Company updated successfully" })
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Company not updated" })

    }
}



const deleteCompany = async (req, res, next) => {
    let company;
    const id = req.params.id;

    try {
        company = await Company.findByIdAndRemove(id)
        return res.status(200).json(company)
    } catch (err) {
        console.log(err)
        return res.status(400).json({ message: "Company not Deleted" })
    }
}
const getCompaniesNames = async (req, res, next) => {
    const companiesId = req.body.companies;
  
    try {
      const companies = await Company.aggregate([
        {
          $match: {
            _id: { $in: companiesId.map(id => new mongoose.Types.ObjectId(id)) }
          }
        },
        // {
        //   $project: {
        //     _id: 0,
        //     company_name: 1,
            
        //   }
        // }
      ]);
  
      const companyNames = companies.map(company => company.company_name);
  
      return res.status(200).json(companies);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

exports.AddCompany = AddCompany;
exports.getCompanies = getCompanies;
exports.deleteCompany = deleteCompany
exports.updateCompany = updateCompany;
exports.getCompanyById = getCompanyById;
exports.getCompaniesNames =getCompaniesNames;