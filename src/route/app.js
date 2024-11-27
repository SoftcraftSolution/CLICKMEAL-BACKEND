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
const extramealController=require('../controller/extramealcontroller')

router.post('/register',usercontroller.registerUser);
router.post('/login',usercontroller.loginUser)
router.get('/employee-list',usercontroller.getAllUsers)
router.delete('/delete-user',usercontroller.deleteUser)
router.get('/export-users', usercontroller.exportUsersToExcel);

router.post('/add-category',categorycontroller.addCategory)
router.post('/add-subcategory', upload,categorycontroller.addSubcategory)
router.get('/get-category',categorycontroller.CategoryList)
router.get('/get-categorybyId',categorycontroller.getMenuItemsByCategoryId)
router.get('/subcategory-list',categorycontroller.subcategoryList)


router.post('/add-company',companyController.addCompany)
router.get('/get-company',companyController.getCompanyList)
router.delete('/delete-company',companyController.deleteCompany)
router.post('/add-item',upload,itemController.createMenuItem)
router.get('/get-all-item',itemController.getAllMenuItems)
router.get('/item-by-id',itemController.getMenuItemById)
router.delete('/delete-item',itemController.deleteMenuItemById)

router.post('/add-cart',cartController.addMultipleToCart)
router.get('/my-cart',cartController.getCartByUserId)
router.delete('/remove-cart',cartController.removeFromCart)


router.post('/add-banner', upload,bannerController.addBanner)
router.get('/get-banner',bannerController.bannerList)

router.post('/order-place',orderController.createOrder)
router.get('/order-list',orderController.orderList)
router.get('/order-insight',orderController.orderInsight)
router.get('/my-order',orderController.myOrder)
router.get('/get-order-by-company',orderController.getAllCompaniesWithOrderCount)
router.get('/export-orders', orderController.exportOrders  );
router.get('/deliverydate', orderController.getOrderCountByDeliveryDate);
router.post('/order-status', orderController.updateOrderStatusByCompanyAndDate);


router.post('/feedback',feedbackController.Feedback)
router.get('/feedback-list',feedbackController.feedbackList)

router.post('/coupan-generate',coupanController.createCoupon)
router.get('/coupan-list',coupanController.getCoupons)
router.delete('/delete-coupan',coupanController.deleteCoupon)

router.post('/add-reward',upload,rewardController.createReward)
router.get('/reward-list',rewardController.getAllRewards)
router.delete('/delete-reward',rewardController.deleteReward)

router.post('/admin-login',admincontroller.login)
router.post('/admin-forgot-password',admincontroller.forgotPassword)
router.post('/admin-verify-code',admincontroller.verifyCode)
router.post('/admin-reset-password',admincontroller.resetPassword)

router.post('/qr-send-email',qrcontroller.createAndSendQRCode)

router.post('/add-customize-meal',upload,customizemealController.createCustomizeMeal)
router.get('/get-customize-meal',customizemealController.getAllCustomizeMeals)
router.delete('/delete-customize-meal',customizemealController.deleteCustomizeMeal)
router.get('/get-customizemeal-by-companyId',customizemealController.getCustomizeMealsByCompany)

router.post('/add-extrameal',upload,extramealController.addExtraMeal)
router.get('/get-extrameal',extramealController.getExtraMeals)




module.exports = router;