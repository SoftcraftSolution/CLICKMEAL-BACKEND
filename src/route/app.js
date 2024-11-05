const express = require('express');
const router = express.Router();
const usercontroller=require('../controller/usercontroller')
const categorycontroller=require('../controller/categorycontroller')
const { upload } = require('../middleware/imageupload');
const companyController=require('../controller/companycontroller')
const itemController=require('../controller/itemcontroller')

router.post('/register',usercontroller.registerUser);
router.post('/login',usercontroller.loginUser)

router.post('/add-category',categorycontroller.addCategory)
router.post('/add-subcategory', upload,categorycontroller.addSubcategory)
router.get('/get-category',categorycontroller.CategoryList)
router.get('/get-categorybyId',categorycontroller.getMenuItemsByCategory)


router.post('/add-company',companyController.addCompany)
router.get('/get-company',companyController.getCompanyList)
router.post('/add-item',upload,itemController.createMenuItem)
router.get('/get-all-item',itemController.getAllMenuItems)


module.exports = router;