const express = require('express');
const router = express.Router();
const usercontroller=require('../controller/usercontroller')
const categorycontroller=require('../controller/categorycontroller')
const { upload } = require('../middleware/imageupload');
const companyController=require('../controller/companycontroller')

router.post('/register',usercontroller.registerUser);
router.post('/login',usercontroller.loginUser)

router.post('/add-category',upload,categorycontroller.addCategory)
router.get('/get-category',categorycontroller.CategoryList)

router.post('/add-company',companyController.addCompany)
router.get('/get-company',companyController.getCompanyList)

module.exports = router;