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
const rewardController=require('../controller/rewardcontroller')
const admincontroller=require('../controller/admincontroller')
const qrcontroller=require('../controller/qrcontroller')
const customizemealController=require('../controller/customizemealcontroller')

router.post('/register',usercontroller.registerUser);
router.post('/login',usercontroller.loginUser)
router.get('/employee-list',usercontroller.getAllUsers)
router.delete('/delete-user',usercontroller.deleteUser)

router.post('/add-category',categorycontroller.addCategory)
router.post('/add-subcategory', upload,categorycontroller.addSubcategory)
router.get('/get-category',categorycontroller.CategoryList)
router.get('/get-categorybyId',categorycontroller.getMenuItemsByCategoryId)
router.get('/subcategory-list',categorycontroller.subcategoryList)


router.post('/add-company',companyController.addCompany)
router.get('/get-company',companyController.getCompanyList)
router.post('/add-item',upload,itemController.createMenuItem)
router.get('/get-all-item',itemController.getAllMenuItems)
router.get('/item-by-id',itemController.getMenuItemById)

router.post('/add-cart',cartController.addMultipleToCart)
router.get('/my-cart',cartController.getCartByUserId)


router.post('/add-banner', upload,bannerController.addBanner)
router.get('/get-banner',bannerController.bannerList)

router.post('/order-place',orderController.createOrder)
router.get('/order-list',orderController.orderList)
router.get('/order-insight',orderController.orderInsight)
router.get('/my-order',orderController.myOrder)

router.post('/feedback',feedbackController.Feedback)
router.get('/feedback-list',feedbackController.feedbackList)

router.post('/coupan-generate',coupanController.createCoupon)
router.get('/coupan-list',coupanController.getCoupons)

router.post('/add-reward',upload,rewardController.createReward)
router.get('/reward-list',rewardController.getAllRewards)

router.post('/admin-login',admincontroller.login)
router.post('/admin-forgot-password',admincontroller.forgotPassword)
router.post('/admin-verify-code',admincontroller.verifyCode)
router.post('/admin-reset-password',admincontroller.resetPassword)

router.post('/qr-send-email',qrcontroller.createAndSendQRCode)

router.post('/add-customize-meal',upload,customizemealController.createCustomizeMeal)
router.get('/get-customize-meal',customizemealController.getAllCustomizeMeals)




module.exports = router;