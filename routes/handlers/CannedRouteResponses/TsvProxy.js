//import SDK from 'sdk-core-lib'
import RQ from 'request'
import CandyLand from './Candyland'
var debug = require('debug')('vending-app-gui:tsv-proxy')

var Candyland = CandyLand({

	// canned data sets:
	candy: {

		prods: [
				{"productID":1000,"sku":"SKU-1000","productName":"Living On... Reese's Cookies","description":"Hand-made just like grandma used to! Each cookie packs a big 20mg of THC. 2 per pack.","price":10.00,"imagePath":"/gfx/DemoProducts/kris-cookies.jpg","productCategoryID":11},
				{"productID":1001,"sku":"SKU-1001","productName":"Living On... Brownie Bites","description":"Chocolate decadence in each bite. Each brownie packs a big 20mg of THC. 2 per pack.","price":10.00,"imagePath":"/gfx/DemoProducts/kris-brownies.jpg","productCategoryID":11},
				{"productID":1002,"sku":"SKU-1002","productName":"Living On... Star Gummies","description":"Super sour and fruity, these yummy gummies will do you right. 150mg THC per pack","price":25.00,"imagePath":"/gfx/DemoProducts/kris-star-gummies.jpg","productCategoryID":11},
				{"productID":1003,"sku":"SKU-1003","productName":"Living On... Lolly Pops","description":"Great for keeping cannabis in your pocket! 4 suckers per pack, 10mg THC each.","price":10.00,"imagePath":"/gfx/DemoProducts/kris-suckers.jpg","productCategoryID":11},
				{"productID":1004,"sku":"SKU-1004","productName":"Beyond Blue Dream","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/beyond-blue-dream_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1005,"sku":"SKU-1005","productName":"God's Gift","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/gods-gift_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1006,"sku":"SKU-1006","productName":"Girl Scout Cookies","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/gsc_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1007,"sku":"SKU-1007","productName":"Holy Grail","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/holy-grail-og_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1008,"sku":"SKU-1008","productName":"Maui Waui","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/maui-waui_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1009,"sku":"SKU-1009","productName":"Paris OG","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/paris-og_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1010,"sku":"SKU-1010","productName":"Sour Lemon OG","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/sour-lemon-og_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1011,"sku":"SKU-1011","productName":"Tahoe OG","description":"Highest quality Cannabis flower in the province. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/tahoe-og_EIGHTH_900x900.jpg","productCategoryID":10},
				{"productID":1012,"sku":"SKU-1012","productName":"Blue City Diesel - Factory Packed","description":"Stay-fresh packs for the busy stoner. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/factory-bluecitydiesel_900x900.png","productCategoryID":10},
				{"productID":1013,"sku":"SKU-1013","productName":"Jack Frost - Factory Packed","description":"Stay-fresh packs for the busy stoner. 1/8","price":45.00,"imagePath":"/gfx/DemoProducts/factory-jackfrost_900x900.png","productCategoryID":10},
				{"productID":1014,"sku":"SKU-1014","productName":"Bhang Bar - Fire Chocolate","description":"Stay-fresh packs for the busy stoner. 1/8","price":13.00,"imagePath":"/gfx/DemoProducts/bhang-chocolate-front.png","productCategoryID":11},
				{"productID":1015,"sku":"SKU-1015","productName":"Bubble Hash","description":"Lorem ipsum. Please halp.","price":13.00,"imagePath":"/gfx/DemoProducts/OGbubbleHash-extracts.jpg","productCategoryID":13},
				{"productID":1016,"sku":"SKU-1016","productName":"Shatter","description":"Lorem ipsum. Please halp.","price":13.00,"imagePath":"/gfx/DemoProducts/shatter-extracts.jpg","productCategoryID":13},
				{"productID":1015,"sku":"SKU-1015","productName":"Wax","description":"Lorem ipsum. Please halp.","price":13.00,"imagePath":"/gfx/DemoProducts/wax-extracts.jpg","productCategoryID":13}
			]
	
		, prodExtras: { "stockCount": 30, "inventoryCount": 30, "isEmpty": false, "coilNumber": "N/A", "productCategory": null, "productType": "PRODUCT_RECORD", "Attributes": {} }

		, cats: [
				{"categoryID":10,"parentCategoryID":0,"categoryName":"Flower","categoryDescription":"Cannabis flower products","imagePath":"/gfx/Categories/"},
				{"categoryID":11,"parentCategoryID":0,"categoryName":"Edibles","categoryDescription":"Edible cannabis","imagePath":"/gfx/Categories/"},
				{"categoryID":12,"parentCategoryID":0,"categoryName":"CBD","categoryDescription":"Medical CBD - non psychoactive","imagePath":"/gfx/Categories/"},
				{"categoryID":13,"parentCategoryID":0,"categoryName":"Extracts","categoryDescription":"Wax, shatter, bubble hash, etc.","imagePath":"/gfx/Categories/"},
				{"categoryID":14,"parentCategoryID":0,"categoryName":"Vapor","categoryDescription":"E-Vapes and other similar products","imagePath":"/gfx/Categories/"},
			]

			/*
			// AVT default stuff:
			//, prods = [{"sku":"977","productName":"Deja Blue Water","description":"Deja Blue Water","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":30,"inventoryCount":30,"isEmpty":false,"productID":6615,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5047","productName":"PowerAde Fruit Punch","description":"PowerAde Fruit Punch","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":4,"inventoryCount":4,"isEmpty":false,"productID":6643,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5183","productName":"Muscle Milk Chocolate 11oz","description":"Muscle Milk Chocolate 11oz","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":5,"inventoryCount":5,"isEmpty":false,"productID":6644,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"976","productName":"Dasani","description":"Dasani","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":41,"inventoryCount":41,"isEmpty":false,"productID":6645,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"996","productName":"Fiji Water","description":"","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":18,"inventoryCount":18,"isEmpty":false,"productID":6646,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5180","productName":"Muscle Milk Vanilla","description":"Muscle Milk Vanilla","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":4,"inventoryCount":4,"isEmpty":false,"productID":6650,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"957","productName":"G2 Fruit Punch","description":"G2 Fruit Punch","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":3,"inventoryCount":3,"isEmpty":false,"productID":6686,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"955","productName":"Gatorade Fruit Punch","description":"Gatorade Fruit Punch","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":3,"inventoryCount":3,"isEmpty":false,"productID":6689,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"952","productName":"Gatorade Lemon Lime","description":"Gatorade Lemon Lime","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":4,"inventoryCount":4,"isEmpty":false,"productID":6690,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"951","productName":"Gatorade Orange","description":"Gatorade Orange","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":1,"inventoryCount":1,"isEmpty":false,"productID":6691,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"960","productName":"Powerade Lemon Lime","description":"Powerade Lemon Lime","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":5,"inventoryCount":5,"isEmpty":false,"productID":6693,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"966","productName":"Powerade Strawberry Lemonade","description":"Powerade Strawberry Lemonade","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":3,"inventoryCount":3,"isEmpty":false,"productID":6695,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5190","productName":"Premier Protein Chocolate","description":"Premier Protein Chocolate","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":6,"inventoryCount":6,"isEmpty":false,"productID":6696,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5192","productName":"Premier Protein Strawberry","description":"Premier Protein Strawberry","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":5,"inventoryCount":5,"isEmpty":false,"productID":6697,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5191","productName":"Premier Protein Vanilla","description":"Premier Protein Vanilla","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":5,"inventoryCount":5,"isEmpty":false,"productID":6698,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"932","productName":"Monster White Zero","description":"Monster White Zero","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":3,"inventoryCount":3,"isEmpty":false,"productID":6786,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"926","productName":"Red Bull","description":"Red Bull","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":9,"inventoryCount":9,"isEmpty":false,"productID":6794,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5177","productName":"Muscle Milk 100 cal Chocolate 8.25 oz","description":"Muscle Milk 100 cal Chocolate 8.25 oz\nSugar Free","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":7,"inventoryCount":7,"isEmpty":false,"productID":6817,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"5178","productName":"Muscle Milk 100 cal Van. Cream 8.25oz","description":"Muscle Milk 100 cal Van. Cream 8.25oz","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":5,"inventoryCount":5,"isEmpty":false,"productID":6818,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"954","productName":"Gatorade Blue Cherry","description":"Gatorade Blue Cherry","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":3,"inventoryCount":3,"isEmpty":false,"productID":6875,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Resource Water with Electolytes","description":"Resource Water with Electolytes","price":0.01,"imagePath":"/gfx/Products/ProductImageNotFound.png","stockCount":20,"inventoryCount":20,"isEmpty":false,"productID":6949,"coilNumber":"N/A","productCategory":null,"productCategoryID":-1,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Aquafina","description":"","price":2,"imagePath":"/gfx/Products/10430_Image1.png","stockCount":12,"inventoryCount":12,"isEmpty":false,"productID":10430,"coilNumber":"N/A","productCategory":"Drinks","productCategoryID":618,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Arizona Green Tea","description":"","price":2,"imagePath":"/gfx/Products/10431_Image1.png","stockCount":6,"inventoryCount":6,"isEmpty":false,"productID":10431,"coilNumber":"N/A","productCategory":"Drinks","productCategoryID":618,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Monster","description":"","price":3,"imagePath":"/gfx/Products/10432_Image1.png","stockCount":6,"inventoryCount":6,"isEmpty":false,"productID":10432,"coilNumber":"N/A","productCategory":"Drinks","productCategoryID":618,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Bai 5 Lemonade","description":"","price":3,"imagePath":"/gfx/Products/10433_Image1.png","stockCount":7,"inventoryCount":7,"isEmpty":false,"productID":10433,"coilNumber":"N/A","productCategory":"Drinks","productCategoryID":618,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Rice Krispies Treats","description":"Rice Krispies Treats","price":2,"imagePath":"/gfx/Products/10434_Image1.png","stockCount":6,"inventoryCount":6,"isEmpty":false,"productID":10434,"coilNumber":"N/A","productCategory":"Snacks","productCategoryID":619,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"BelVita Blueberry","description":"BelVita Blueberry","price":2,"imagePath":"/gfx/Products/10435_Image1.JPG","stockCount":10,"inventoryCount":10,"isEmpty":false,"productID":10435,"coilNumber":"N/A","productCategory":"Snacks","productCategoryID":619,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Nature Valley Sweet and Salty Granola Bar","description":"Nature Valley Sweet and Salty Granola Bar","price":1.25,"imagePath":"/gfx/Products/10436_Image1.png","stockCount":8,"inventoryCount":8,"isEmpty":false,"productID":10436,"coilNumber":"N/A","productCategory":"Snacks","productCategoryID":619,"productType":"PRODUCT_RECORD","Attributes":{}},{"sku":"","productName":"Nature Valley Almond Cashew and Sea Salt","description":"Nature Valley Almond Cashew and Sea Salt","price":1.25,"imagePath":"/gfx/Products/10437_Image1.jpg","stockCount":4,"inventoryCount":4,"isEmpty":false,"productID":10437,"coilNumber":"N/A","productCategory":"Snacks","productCategoryID":619,"productType":"PRODUCT_RECORD","Attributes":{}}]
			//, cats = [{"categoryID":618,"parentCategoryID":0,"categoryName":"Drinks","categoryDescription":"Drinks","imagePath":"/gfx/Categories/618_CategoryImage1.jpg"},{"categoryID":619,"parentCategoryID":0,"categoryName":"Snacks","categoryDescription":"snack","imagePath":"/gfx/Categories/619_CategoryImage1.jpg"}]
	
			// cart with a product (note the details):
			{"summary":{"discount":0,"discount1":0,"netDiscount":0,"subTotalPrice":2,"netSubTotalPrice":0,"TotalPrice":2,"netTotalPrice":0,"salesTaxRate":0,"salesTaxAmount":0,"netSalesTaxAmount":0,"shippingAmount":0,"vendItemCount":1,"dropshipItemCount":0,"maxItemCount":1,"maxDollarValue":10000,"vendFailCount":0},"detail":[
			{"sku":"","productName":"Aquafina","description":"","imagePath":"http://localhost:8085/Images/Products/10430_Image1.png","price":2,"stockCount":11,"productID":10430,"productCategory":"Drinks","machineID":0,"coilNumber":"12","serialNumber":"N/A","insertRef":0,"vendResult":"VEND_PENDING","itemRecordType":2,"qtyInCart":1,"Attributes":{}}]}
			*/

		, default_cart: {"summary":{"discount":0,"discount1":0,"netDiscount":0,"subTotalPrice":0,"netSubTotalPrice":0,"TotalPrice":0,"netTotalPrice":0,"salesTaxRate":0,"salesTaxAmount":0,"netSalesTaxAmount":0,"shippingAmount":0,"vendItemCount":0,"dropshipItemCount":0,"maxItemCount":1,"maxDollarValue":10000,"vendFailCount":0},"detail":[]}
		// moved this to snakes
		//	, test_cart = request.yar.get('test-shopping-cart') || default_cart

	},

	// data manipulation at load:
	stripes: [

		//		ORDER OF STRIPES IS IMPORTANT!!!!:
		// 		can do some pretty serious property shuffling if you pay attention.
		// also, stripes ONLY GET CALLED at the init phase
		// 	(snakes get called at request/runtime)
		// add the extra properties to Kent's demo products that are specific to the machine / inventory etc
		{
			source: 'prods',
			target: 'prodExtras',
			striper: (config, source, target) => {
				var SOURCE = config.candy[source]
					, MODIFIER = config.candy[target]
					;
				SOURCE.forEach( P => {
					Object.keys(MODIFIER).forEach( KEY => {
						P[KEY] = MODIFIER[KEY];
					});
				});

			}
		},
	],
	
	// request runtime... plays all snakes
	snakes: {
		test_cart: (config, request, reply) => {
			config.candy.test_cart = request.yar.get('test-shopping-cart') || config.candy.default_cart
		}
	},
	
	// what methods to override, if any (should be at least one!)
	slides: {
		
		__activate: () => {
			return {"result":0,"resultCode":"ERROR","errorMessage":"NOT IMPLEMENTED: Activate()"};
		}
		
		, disablePaymentDevice: (config, request, reply) => {
			request.yar.set('emulatorInsertedCash', 0);
		}

		, fetchAllCustomSettings: () => {
			// "txtIdleScene": can be ['CATEGORY_SEARCH', 'PAGE_IDLE', 'COIL_KEYPAD']
			// added: STOREFRONT
			return {"TxtBxForeColor":"16777164","TxtBxFontColor":"0","ButtonFontColor":"16777215","ButtonColor":"15510099,15510099,15510099,15510099","ShowProductDetailPage":"true","HasCreditCard":"true","HasBillCoin":"false","IDLE_ROW1":"Welcome To Silo","bgColor":"0,0","ScreenWidth":"768","ScreenHeight":"1024","expTempThresholdDegC":"10","expTempDurationMin":"60","expTempAction":"","heartbeatTimer":"","ediblesMachineAttached":"false","CouponRequestEmailAddress":"milana@avtinconline.com","MySQLPath":"C:\\Program Files (x86)\\MySQL\\MySQL Workbench 5.2 OSS","FreeVend":"True","MDBCOMPort":"","MDBCashlessAddress":"","txtLayoutType":"AR_WALL","txtIdleScene":"STOREFRONT","txtSearchScene":"COIL_KEYPAD","bAddAdminStockOnly":"false","bCategoryView":"false","bHideStoryBoardTitle":"false","galleryCgryTitleFontColor":"0xFFFFFF","galleryCgryPriceFontColor":"0xFFFFFF","galleryProdTitleFontColor":"0xFFFFFF","galleryProdPriceFontColor":"0xFFFFFF","bHasAgeRequirement":"false","ageRequirement":"21","bHasMoreTimeMsg":"false","bgFontColor":"0xFFFFFF","adminIdleTimeout":"60000","thankyouPageTimeout":"10000","generalPageTimeout":"60000","paymentPageTimeout":"65000","bHasAgeStatement":"true","bHasShoppingCart":"false","bHasCouponCodes":"false","yScreenCoord":"0","bExactChangeOnly":"false","txtExactChangeMsg":"Exact Change Only!                                                            ","CameraOnCardAuth":"false","idleImageURL":"Images/TSV_Idle.png","bgImageURL":"Images/TSV_Bg.png","txtThankyouMessage":"www.knightvending.com","bCamOnVend":"false","bShowBg":"false","bShowCustomSWF":"false","txtCustomSwfURL":"basic_ticker_as3.swf","txtCustomSwfX":"550","txtCustomSwfY":"790","txtCustomSwfWidth":"350","txtCustomSwfHeight":"350","bIncNutritionFacts":"false","productDetailZoom":"false","galleryCgryTitleFontSize":"20","galleryProdTitleFontSize":"20","bShowOutline":"false","txtProductDetailTitleFontsize":"32","txtCustomPayoutFailMsg":" ","bCanPayoutOnVendFail":"true","bAskForReceipt":"false","bHasCodeQRorSMSorNFC":"false","txtNutritionFactsImgCoordX":"-1","txtNutritionFactsImgCoordY":"-1","txtNutritionFactsImageSize":"300","txtNutritionFactsImageSizeX":"300","txtNutritionFactsImageSizeY":"300","txtProductDetailDescFontsize":"26","bTellWhichMachine":"false","bAskForZipCodeCVV":"false","bForDemo":"true","buttonRadius":"20","xScreenCoord":"0","checkoutImageUrl":"Images/checkout.png","prevPageImageUrl":"Images/prevPage.png","customizedButtonSize":"300","prdDetailShowLabel":"false","prdDescYoffset":"200","cancelImageUrl":"Images/cancel.png","thankyouPageUrl":"Images/Marley_ThankYou.png","cgryAndprdShowTitle":"true","vendingImageUrl":"Images/vending.f4v","keypadHideButton":"false","language1OverwriteXML":"en_8INCH","language2OverwriteXML":"","layoutOverwriteXML":"Layout_768_1024_8INCH.xml","showCreditFlag":"false","bJustForAdmin":"false","bUseClockAdmin":"false","ageVerifyFirst":"true","auxiliarySwfURL":"","customizedButtonSizeX":"150","customizedButtonSizeY":"150","galleryParentCgryTitleFontColor":"0xFFFFFF","projectName":"Android","prdDescXoffset":"-1","txtProductDetailImageOffsetX":"600","txtProductDetailImageOffsetY":"-1","txtProductDetailImageSizeX":"300","txtProductDetailImageSizeY":"300","galleryParentCgryTitleFontSize":"20","addToCartImageUrl":"","viewCartImageUrl":"","shopMoreImageUrl":"","ageVerificationPageUrl":"","facebookUrl":"","twitterUrl":"","txtProductDetailImageSize":"300","vendPropertySwfURL":"Untitled-1.swf","adminInventoryFontSize":"25","adminInventoryFontColor":"0xFFFFFF","renderCrossProducts":"false","shoppingCartFontColor":"0xFFFFFF","bAskForReceiveDeals":"false","bAddOutOfStockImgOnGallery":"false","bCardCheckoutAnytime":"false","bUseCustomizedNumberBtns":"true","bRenderCrossProducts":"false","bAgeVerifyFirst":"true","bKeypadHideButton":"false","bPrdDetailShowLabel":"true","bShowCreditFlag":"true","bCgryAndprdShowTitle":"true","bProductDetailImageZoom":"false","bDebugging":"false","bGesturing":"true","txtTouchEventTimeGap":"0","bPlayVendingMusic":"false","bADA":"false","bEnterEmailHasBackBtn":"false","bShowCusomizedCardTransactionMsg":"false","bCrossProductIsCategories":"false","txtEmbeddedFont":"Arial","faqImageUrl":"","bJustShowPriceOnPrdDetail":"false","shippingAmount":"0","errorPageTimeout":"12000","txtCsShim":"150","bJustValidateZip":"false","bChangePlanogram":"false","bIpadStyleAdmin":"true","bActivateSounds":"false","turnOnKeypadForCgrySearch":"true","timeStamp":"2000","adminHitAreaXoffset":"-50","adminHitAreaYoffset":"-50","txtCsShimX":"70","txtCsShimYtop":"150","txtCsShimYbottom":"30","galleryProdDescFontColor":"0","bAddPolicyLink":"false","bUseMultiImg":"false","bUseCustomizedKeyboard":"true","bPrdDetailUseImgForDesc":"false","bPrdDetailUseTabs":"false","bRenderFilterOnPrdGallery":"false","bRenderPreLoadedPrdGallery":"false","bDisplayCustomizedPrdGallery":"false","bCgrySort":"false","bButtonUseDropShadow":"false","bUseCustomizedMsgBoxBg":"false","videoBgColor":"0","bActivateClickSounds":"false","bRefreshMemory":"false","bHasStylistCodes":"false","bDisplaySceneType":"false","bDemoForCardVending":"false","bPlayVendVideoFromXML":"false","idleVideoResetTimeout":"0","promoProductCoil":"0","bFetchIPAddress":"true","BrowserEventTimeGap":"0","machineCount":"2","vesselTimeout":"0","GUIposition":"0"};
		}
		
		, fetchAllMachineSettings: () => {
			return {"ActivationKey":"f801","AdminPassword":"1111","BluKeyDevice":"","CCMerchantID":"7777778292","CCMerchantKey":"A9SBRHEZZD7M9WSX","CCProcessor":"TransFirst","CCProcessorConfigFilePath":"C:\\AVT INC\\MCM_DLL_EMV_Std_Call_4_2_9_build16\\cctag.dat","CCProcessorMode":"Certification","CCProcessorTimeout":"35","CCReaderType":"MAGTEKINSERT","CCTerminalComPort":"2","CurrentCoreVersion":"","CurrentCustomVersion":"","DEXDevice":"","DoKeyVerificationOnRAM5000":"False","DropSensorAttached":"TestVMC.0=20000","DropShipOrderEmailAddress":"darin@sdkcore.com","DummyCC":"true","EmailReceiptFromAddress":"darin@sdkcore.com","FetchProductQuick":"false","FlashFilePath":"","FreeVend":"false","HasVesselSensor":"false","HeartbeatInterval":"6","ImagePath":"C:\\projects\\AVT\\NetTSV\\TSVSite\\Images","LastDownloadedCoreVersion":"","LastDownloadedCustomVersion":"","LastVersionUpdateID":"","MachineCount":"1","MachineSerialNumber":"SDKCoreCorp0001","MagicInventory":"true","NetTsvBase":"http://localhost:8085/","NetTsvListeners":"http://*:8085/","PrintReceipt":"false","ReceiptLogoPath":"C:\\Users\\peterk\\Documents\\Visual Studio 2008\\Projects\\TSV 4000\\TSV 4000\\bin\\Debug\\Pokemon Receipt Logo.bmp","ReceiptPathCash":"C:\\AVT INC\\TSV\\Receipts\\VendingDesign2.rpt","ReceiptPathCreditCard":"C:\\AVT INC\\TSV\\Receipts\\VendingDesign2.rpt","ReceiptPrinterName":"CUSTOM TG2460-H","ReceiptPrinterType":"VKP80IICustomPrinter","ReceiptTerms":"These are the receipt terms. Read them. All of them. ","ReportSaleToVMS":"True","RiskApproveTimeout":"60","RiskApproveUnder":"0","SalesTaxRate":"0","SendEnterKeyOnRAM4000":"True","ShoppingCartMaxDollarValue":"10000.00","ShoppingCartMaxItemCount":"1","SimulateSwipe":"false","SmtpPassword":"Avtc$2016","SmtpServer":"secure.emailsrvr.com","SmtpUser":"helpdesk@avtinconline.com","StableVesselMsecs":"0","TsvBaseDir":"C:\\projects\\AVT\\NetTSV","VendFailAction":"SecondSpin","VendorEmailReceiptTo":"darin@sdkcore.com","VMCControlCOMPort":"COM1","VMCPlatform":"TestVMC","VMS2":"True","VmsCompatLevel":"6","VMSManaged":"True"};
		}

		, fetchMachineIds: () => {
			return [0];
		}
		
		, fetchConfig: () => {
			return {"productMenuScreenTimeout":10,"productDetailScreenTimeout":10,"creditCardDeclineScreenTimeout":10,"creditCardErrorScreenTimeout":10,"postVendScreenTimeout":10,"purchaseScreenTimeout":10,"shoppingCartMaxItemCount":1};
		}

		, fetchProduct: (config) => {
			return config.candy.prods;
		}
		
		, fetchProductQuick: (config) => {
			return config.candy.prods;
		}
		
		, adminValidateProductByCoil: (config) => {
			var p = config.candy.prods[0];
			return {
				"result":0,
				"resultCode":
				"SUCCESS",
				"errorMessage":"SUCCESS",
				imagePath: p.imagePath,
				productName: p.productName,
				inventoryCount: p.inventoryCount
			};
		}
		
		, fetchProductByCategory: (config, request, reply) => {
			let method = config.bag.method
				, payload = config.bag.payload
				, response
				;
			if (method !== undefined) {
				console.log('well, lettuce get some prods by category ID = ' + payload[1]);
				var subprods = [];
				config.candy.prods.map( PROD => {
					if (PROD.productCategoryID === payload[1]) {
						subprods.push(PROD);
					}
				});
				response = subprods;
			} else {
				response = {"result":0,"resultCode":"ERROR","errorMessage":"Exception has been thrown by the target of an invocation."};
			}
			return response;
		}
		
		, checkActivation: () => {
			return {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"};
		}
		
		, validateAdminPassword: (config) => {
			let payload = config.bag.payload;
			if (payload[1] == 1234) {
				response = {"result":'VALID',"resultCode":"SUCCESS","errorMessage":"Success"};
			} else {
				response = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"};
			}
			return response;
		}

		, fetchProductCategories: (config, request, reply) => {
			return config.slides.__fetchProdCats(config, request, reply)
		}
		
		, fetchProductCategoriesByParentCategoryID: (config, request, reply) => {
			return config.slides.__fetchProdCats(config, request, reply)
		}
		
		, __fetchProdCats: (config, request, reply) => {
			let response
				, payload = config.bag.payload
				;
			if (payload[1] !== undefined) {
				console.log('well, lettuce get some cats by parent ID = '+payload[1]);
				var subcats = []
					, cats = config.candy.cats
					;
				cats.map( CAT => {
					if (CAT.parentCategoryID === payload[1]) {
						subcats.push(CAT);
					}
				});
				response = subcats;
			} else {
				response = cats;
			}
			return response;
		}

		, fetchShoppingCart2: (config) => {
			return config.candy.test_cart;
		}
		
		// why are we not clearing test_cart here? because we init it every time? think so... (THUS: SNAKES)
		, emptyCart: (config, request) => {
			//response = default_cart;
			config.candy.test_cart = config.candy.default_cart;
			request.yar.set('test-shopping-cart', config.candy.test_cart);
			debug(' ---------------------------------- DID we empty the dang cart???');
		}
		
		, addToCartByProductID: (config, request, reply) => {
			let response
				, payload = config.bag.payload
				;

			if (payload[1] !== undefined) {
				var product = config.candy.prods.filter( P => { return P.productID === payload[1]; });
				if (product && product.length == 1) {
					// drop reference:
					product = JSON.parse(JSON.stringify(product.pop()));
					var cartItem = config.candy.test_cart.detail.filter( ITEM => {
						return ITEM.productID === product.productID;
					});

					if (cartItem && cartItem.length == 1) {
						cartItem = cartItem.pop();
						if (cartItem.stockCount > 1) {
							cartItem.stockCount -= 1;
							cartItem.qtyInCart += 1;
						}

					} else {
						if (product.stockCount > 0) {
							product.vendResult = "VEND_PENDING";
							product.itemRecordType = 2;
							product.qtyInCart = 1;
							product.coilNumber = product.productID; // STRICTLY for testing here, as the cart emulation DOES NOT carry coil numbers.
							config.candy.test_cart.detail.push(product);
						}
					}
				}
				config.candy.test_cart.summary.TotalPrice = 0;
				config.candy.test_cart.detail.forEach( P => {
					config.candy.test_cart.summary.TotalPrice += P.price * P.qtyInCart;
					config.candy.test_cart.summary.vendItemCount += P.qtyInCart;
				});
				request.yar.set('test-shopping-cart', config.candy.test_cart);
			}
			response = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"};
			response.shoppingCart = config.candy.test_cart;
			return response;
		}
		
		, addToCartByCoil: (config, request, reply) => {
			let response
				, payload = config.bag.payload
				;
			if (payload[1] !== undefined) {
				var cartItem = config.candy.test_cart.detail.filter( ITEM => {
					return ITEM.productID === payload[1];
				});

				if (cartItem && cartItem.length == 1) {
					cartItem = cartItem.pop();
					if (cartItem.stockCount > 0) {
						cartItem.stockCount -= 1;
						cartItem.qtyInCart += 1;
					}
				}

				config.candy.test_cart.summary.TotalPrice = 0;
				config.candy.test_cart.detail.forEach( P => {
					config.candy.test_cart.summary.TotalPrice += P.price * P.qtyInCart;
					config.candy.test_cart.summary.vendItemCount += P.qtyInCart;
				});
				request.yar.set('test-shopping-cart', config.candy.test_cart);
			}
			response = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"};
			response.shoppingCart = config.candy.test_cart;
			return response;
		}

		, removeFromCartByCoilNo: (config, request, reply) => {
			let response
				, payload = config.bag.payload
				;
			if (payload[1] !== undefined) {
				var cartItem = config.candy.test_cart.detail.filter( ITEM => {
					return ITEM.productID === payload[1];
				});

				if (cartItem && cartItem.length == 1) {
					cartItem = cartItem.pop();
					if (cartItem.qtyInCart > 1) {
						cartItem.stockCount += 1;
						cartItem.qtyInCart -= 1;
					} else {
						// only one more, remove from list entirely
						config.candy.test_cart.detail = config.candy.test_cart.detail.filter( ITEM => {
							return ITEM.productID !== payload[1];
						});
					}
				}

				config.candy.test_cart.summary.TotalPrice = 0;
				config.candy.test_cart.detail.forEach( P => {
					config.candy.test_cart.summary.TotalPrice += P.price * P.qtyInCart;
					config.candy.test_cart.summary.vendItemCount += P.qtyInCart;
				});
				request.yar.set('test-shopping-cart', config.candy.test_cart);
			}
			response = {"result":0,"resultCode":"SUCCESS","errorMessage":"Success"};
			response.shoppingCart = config.candy.test_cart;
			return response;
		}

	}

});

export function getPayload(request, reply) {

	// payload is ALWAYS an array, first node is the action call
	var payload = request.payload;
	if (payload && payload instanceof Array && payload.length) {
		return payload;
	}
	if (reply) {
		reply({ status: 'err', msg: 'bad payload', payload }).code(500);
	}
	return false;
}

export function shouldCan(request) { //, reply) {
	var payload = getPayload(request)
		, method = payload ? payload[0] : false
		;
	return !!(payload && method && Candyland.Can(method));
}

export function generateCannedApiResponse(request, reply) {
	var payload = getPayload(request, reply)
		, method = payload ? payload[0] : false
		;

	if (payload) {
		debug(payload);
		if (Candyland.Can(method)) {
			return Candyland.Do(method, payload, request, reply);
		}
		return null;

	}
}

export function cannedApiResponse(request, reply) {

	var payload = getPayload(request, reply)
		, method = payload ? payload[0] : false
		;

	if (payload) {
		/*
		// maybe?
		if (!reply) {
			return generateCannedApiResponse(request, reply);
		}
		*/

		if (Candyland.Can(method)) {
			var response = Candyland.Do(method, payload, request, reply);
			/*
			if (payload[0]) {
				debug(response);
			}
			*/
			return reply( response ).code(200);
		}
		return reply({ status: 'err', msg: 'canned API response called for, no method Can Do it' }).code(500);

	}
}
