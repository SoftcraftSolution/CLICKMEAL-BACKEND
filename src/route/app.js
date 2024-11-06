const express = require('express');
const router = express.Router();
const usercontroller=require('../controller/usercontroller')
const categorycontroller=require('../controller/categorycontroller')
const { upload } = require('../middleware/imageupload');
const companyController=require('../controller/companycontroller')
const itemController=require('../controller/itemcontroller')
const cartController=require('../controller/cartcontroller')
const bannerController=require('../controller/bannercontroller')
const orderController=require('../controller/ordercontroller')
const feedbackController=require('../controller/feedbackcontroller')
const coupanController=require('../controller/coupancontroller')

router.post('/register',usercontroller.registerUser);
router.post('/login',usercontroller.loginUser)
router.get('/employee-list',usercontroller.getAllUsers)

router.post('/add-category',categorycontroller.addCategory)
router.post('/add-subcategory', upload,categorycontroller.addSubcategory)
router.get('/get-category',categorycontroller.CategoryList)
router.get('/get-categorybyId',categorycontroller.getMenuItemsByCategory)
router.get('/subcategory-list',categorycontroller.subcategoryList)


router.post('/add-company',companyController.addCompany)
router.get('/get-company',companyController.getCompanyList)
router.post('/add-item',upload,itemController.createMenuItem)
router.get('/get-all-item',itemController.getAllMenuItems)

router.post('/add-cart',cartController.addMultipleToCart)
router.get('/my-cart',cartController.getCartByUserId)


router.post('/add-banner', upload,bannerController.addBanner)
router.get('/get-banner',bannerController.bannerList)

router.post('/order-place',orderController.createOrder)
router.get('/order-list',orderController.orderList)

router.post('/feedback',feedbackController.Feedback)
router.get('/feedback-list',feedbackController.feedbackList)

router.post('/coupan-generate',coupanController.createCoupon)




module.exports = router;