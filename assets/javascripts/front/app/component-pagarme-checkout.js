MONSTER( 'Pagarme.Components.PagarmeCheckout', function(Model, $, utils) {

	window.Pagarme2Cards = 0;

    window.pagarmeQrCodeCopy = function(){
        const qrCodeElement = document.getElementById("pagarme-qr-code");

        if (!qrCodeElement){
            return;
        }

        const rawCode = qrCodeElement.getAttribute("rawCode");

        const input =document.createElement('input');
        document.body.appendChild(input)
        input.value = rawCode;
        input.select();
        document.execCommand('copy',false);
        input.remove();

        alert("Código copiado.");

    }

	Model.fn.start = function() {
		this.script           = $( '[data-pagarmecheckout-app-id]' );
		this.form             = $( '[data-pagarmecheckout-form]' );
		this.suffix           = this.$el.data( 'pagarmecheckoutSuffix' ) || 1;
		this.creditCardNumber = this.$el.find( '[data-pagarmecheckout-element="number"]' );
		this.creditCardBrand  = this.$el.find( '[data-pagarmecheckout-element="brand"]' );
		this.brandInput       = this.$el.find( '[data-pagarmecheckout-element="brand-input"]' );
		this.chooseCreditCard = this.$el.closest( 'fieldset' ).find( '[data-element="choose-credit-card"]' );
		this.cvv              = this.$el.find( '[data-pagarmecheckout-element="cvv"]' );
		this.appId            = this.script.data( 'pagarmecheckoutAppId' );
		this.apiURL           = 'https://api.mundipagg.com/core/v1/tokens?appId=' + this.appId;

		this.addEventListener();
	};

	Model.fn.addEventListener = function() {
		this.creditCardNumber.on( 'keyup', this.keyEventHandlerCard.bind(this) );
		$('body').on( 'onPagarmeSubmit', this.onSubmit.bind(this) );
	};

	Model.fn.hasCardId = function() {
		if ( this.chooseCreditCard === undefined || this.chooseCreditCard.length === 0 ) {
			return false;
		}
		return this.chooseCreditCard.val().trim() !== '';
	};

	Model.fn.createCheckoutObj = function (fields) {
		var obj = {},
			i = 0,
			length = fields.length,
			prop, key;
		obj['type'] = 'credit_card';
		for (i = 0; i < length; i += 1) {
			if (fields[i].getAttribute('data-pagarmecheckout-element') === 'exp_date') {
				var sep = fields[i].getAttribute('data-pagarmecheckout-separator') ? fields[i].getAttribute('data-pagarmecheckout-separator') : '/';
				var values = fields[i].value.split(sep);
				obj['exp_month'] = values[0];
				obj['exp_year'] = values[1];
			} else {
				prop = fields[i].getAttribute('data-pagarmecheckout-element');
				key = fields[i].value;

				if ( prop == 'brand' ) {
					key = fields[i].getAttribute('data-pagarmecheckout-brand' );
				}
			}
			obj[prop] = key;
		}
		return obj;
	};

	Model.fn.disableFields = function (fields) {
		for (var i = 0; i < fields.length; i += 1) {
			fields[i].setAttribute('disabled', 'disabled');
		}
	};

	Model.fn.enableFields = function (fields) {
		for (var i = 0; i < fields.length; i += 1) {
			fields[i].removeAttribute('disabled');
		}
	};

	Model.fn.getAPIData = function (url, data, success, fail) {
		var xhr    = new XMLHttpRequest();
		var suffix = this.suffix;

		xhr.open('POST', url);
		xhr.onreadystatechange = function () {
			if (xhr.readyState < 4) {
				return;
			}
			if (xhr.status == 200) {
				success.call(null, xhr.responseText, suffix);
			} else {
				var errorObj = {};
				if (xhr.response) {
					errorObj = JSON.parse(xhr.response);
					errorObj.statusCode = xhr.status;
				} else {
					errorObj.statusCode = 503;
				}

				fail.call(null, errorObj, suffix);
			}
		};

		xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		xhr.send(JSON.stringify({
			card: data
		}));

		return xhr;
	};

	Model.fn.getBrand = function (types, bin) {
		var oldPrefix = '';
		var currentBrand;
		for (var i = 0; i < types.length; i += 1) {
			var current_type = types[i];
			for (var j = 0; j < current_type.prefixes.length; j += 1) {
				var prefix = current_type.prefixes[j].toString();
				if (bin.indexOf(prefix) === 0 && oldPrefix.length < prefix.length) {
					oldPrefix = prefix;
					currentBrand = current_type.brand;
				}
			}
		}
		return currentBrand;
	};

	Model.fn.changeBrand = function (brand, cardNumberLength) {
		var $brand = this.creditCardBrand.get(0);
		var wrapper = this.creditCardBrand.closest( 'fieldset' );
		var imageSrc = 'https://cdn.mundipagg.com/assets/images/logos/brands/png/';
		var $img = $('img', $brand)[0];
		var src;

		$brand.setAttribute('data-pagarmecheckout-brand', brand);
		this.brandInput.val( brand );

		jQuery('body').trigger( 'pagarmeChangeBrand', [brand, cardNumberLength, wrapper] );

		if (brand === '') {
			$brand.innerHTML = '';
		} else {
			if ($brand.getAttribute('data-pagarmecheckout-brand-image') !== null) {
				src = imageSrc + brand + '.png';
				if (!$img) {
					var $newImg = document.createElement('img');
					$newImg.setAttribute('src', src);
					$newImg.setAttribute('style', 'float: right;\n' +
						'border: 0;\n' +
						'padding: 0;\n' +
						'max-height: 1.618em;');
					$brand.appendChild($newImg);
				} else {
					$img.setAttribute('src', src);
				}
			}
		}
	};

	Model.fn.keyEventHandlerCard = function (event) {
		var elem = event.currentTarget;
		var cardNumber = elem.value.replace(/\s/g, '');
		var bin = cardNumber.substr(0, 6);
		var types = this.getCardTypes();
		var brand;
		if (cardNumber.length >= 6) {
			brand = this.getBrand(types, bin);
			if (brand) {
				this.changeBrand(brand, cardNumber.length);
			} else {
				this.changeBrand('', cardNumber.length);
			}
		} else {
			this.changeBrand('', cardNumber.length);
		}
	};

	Model.fn.serialize = function(obj) {
		var str = [];
		for (var p in obj) {
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
		}
		return str.join("&");
	};

	Model.fn.getCardTypes = function() {
		return [{
			brand: 'vr',
			brandName: 'VR',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [637036, 627416, 636350, 637037]
		}, {
			brand: 'mais',
			brandName: 'Mais',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [628028]
		}, {
			brand: 'paqueta',
			brandName: 'Paqueta',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [960371]
		}, {
			brand: 'sodexo',
			brandName: 'Sodexo',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [603389, 606071, 606069, 600818, 606070, 606068]
		}, {
			brand: 'hipercard',
			brandName: 'Hipercard',
			gaps: [4, 8, 12],
			lenghts: [13, 16, 19],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [384100, 384140, 384160, 60, 606282, 637095, 637568, 637599, 637609, 637612, 637600]
		}, {
			brand: 'discover',
			brandName: 'Discover',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 4,
			prefixes: [6011, 622, 64, 65]
		}, {
			brand: 'diners',
			brandName: 'Diners',
			gaps: [4, 8, 12],
			lenghts: [14, 16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [300, 301, 302, 303, 304, 305, 36, 38]
		}, {
			brand: 'amex',
			brandName: 'Amex',
			gaps: [4, 10],
			lenghts: [15],
			mask: '/(\\d{1,4})(\\d{1,6})?(\\d{1,5})?/g',
			cvv: 4,
			prefixes: [34, 37]
		}, {
			brand: 'aura',
			brandName: 'Aura',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [50]
		}, {
			brand: 'jcb',
			brandName: 'JCB',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [35, 2131, 1800]
		}, {
			brand: 'visa',
			brandName: 'Visa',
			gaps: [4, 8, 12],
			lenghts: [13, 16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [4]
		}, {
			brand: 'mastercard',
			brandName: 'Mastercard',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [5, 2]
		}, {
			brand: 'elo',
			brandName: 'Elo',
			gaps: [4, 8, 12],
			lenghts: [16],
			mask: '/(\\d{1,4})/g',
			cvv: 3,
			prefixes: [401178, 401179, 431274, 438935, 451416, 457393, 457631, 457632, 498405, 498410, 498411, 498412, 498418, 498419, 498420, 498421, 498422, 498427, 498428, 498429, 498432, 498433, 498472, 498473, 498487, 498493, 498494, 498497, 498498, 504175, 506699, 506700, 506701, 506702, 506703, 506704, 506705, 506706, 506707, 506708, 506709, 506710, 506711, 506712, 506713, 506714, 506715, 506716, 506717, 506718, 506719, 506720, 506721, 506722, 506723, 506724, 506725, 506726, 506727, 506728, 506729, 506730, 506731, 506732, 506733, 506734, 506735, 506736, 506737, 506738, 506739, 506740, 506741, 506742, 506743, 506744, 506745, 506746, 506747, 506748, 506749, 506750, 506751, 506752, 506753, 506754, 506755, 506756, 506757, 506758, 506759, 506760, 506761, 506762, 506763, 506764, 506765, 506766, 506767, 506768, 506769, 506770, 506771, 506772, 506773, 506774, 506775, 506776, 506777, 506778, 509000, 509001, 509002, 509003, 509004, 509005, 509006, 509007, 509008, 509009, 509010, 509011, 509012, 509013, 509014, 509015, 509016, 509017, 509018, 509019, 509020, 509021, 509022, 509023, 509024, 509025, 509026, 509027, 509028, 509029, 509030, 509031, 509032, 509033, 509034, 509035, 509036, 509037, 509038, 509039, 509040, 509041, 509042, 509043, 509044, 509045, 509046, 509047, 509048, 509049, 509050, 509051, 509052, 509053, 509054, 509055, 509056, 509057, 509058, 509059, 509060, 509061, 509062, 509063, 509064, 509065, 509066, 509067, 509068, 509069, 509070, 509071, 509072, 509073, 509074, 509075, 509076, 509077, 509078, 509079, 509080, 509081, 509082, 509083, 509084, 509085, 509086, 509087, 509088, 509089, 509090, 509091, 509092, 509093, 509094, 509095, 509096, 509097, 509098, 509099, 509100, 509101, 509102, 509103, 509104, 509105, 509106, 509107, 509108, 509109, 509110, 509111, 509112, 509113, 509114, 509115, 509116, 509117, 509118, 509119, 509120, 509121, 509122, 509123, 509124, 509125, 509126, 509127, 509128, 509129, 509130, 509131, 509132, 509133, 509134, 509135, 509136, 509137, 509138, 509139, 509140, 509141, 509142, 509143, 509144, 509145, 509146, 509147, 509148, 509149, 509150, 509151, 509152, 509153, 509154, 509155, 509156, 509157, 509158, 509159, 509160, 509161, 509162, 509163, 509164, 509165, 509166, 509167, 509168, 509169, 509170, 509171, 509172, 509173, 509174, 509175, 509176, 509177, 509178, 509179, 509180, 509181, 509182, 509183, 509184, 509185, 509186, 509187, 509188, 509189, 509190, 509191, 509192, 509193, 509194, 509195, 509196, 509197, 509198, 509199, 509200, 509201, 509202, 509203, 509204, 509205, 509206, 509207, 509208, 509209, 509210, 509211, 509212, 509213, 509214, 509215, 509216, 509217, 509218, 509219, 509220, 509221, 509222, 509223, 509224, 509225, 509226, 509227, 509228, 509229, 509230, 509231, 509232, 509233, 509234, 509235, 509236, 509237, 509238, 509239, 509240, 509241, 509242, 509243, 509244, 509245, 509246, 509247, 509248, 509249, 509250, 509251, 509252, 509253, 509254, 509255, 509256, 509257, 509258, 509259, 509260, 509261, 509262, 509263, 509264, 509265, 509266, 509267, 509268, 509269, 509270, 509271, 509272, 509273, 509274, 509275, 509276, 509277, 509278, 509279, 509280, 509281, 509282, 509283, 509284, 509285, 509286, 509287, 509288, 509289, 509290, 509291, 509292, 509293, 509294, 509295, 509296, 509297, 509298, 509299, 509300, 509301, 509302, 509303, 509304, 509305, 509306, 509307, 509308, 509309, 509310, 509311, 509312, 509313, 509314, 509315, 509316, 509317, 509318, 509319, 509320, 509321, 509322, 509323, 509324, 509325, 509326, 509327, 509328, 509329, 509330, 509331, 509332, 509333, 509334, 509335, 509336, 509337, 509338, 509339, 509340, 509341, 509342, 509343, 509344, 509345, 509346, 509347, 509348, 509349, 509350, 509351, 509352, 509353, 509354, 509355, 509356, 509357, 509358, 509359, 509360, 509361, 509362, 509363, 509364, 509365, 509366, 509367, 509368, 509369, 509370, 509371, 509372, 509373, 509374, 509375, 509376, 509377, 509378, 509379, 509380, 509381, 509382, 509383, 509384, 509385, 509386, 509387, 509388, 509389, 509390, 509391, 509392, 509393, 509394, 509395, 509396, 509397, 509398, 509399, 509400, 509401, 509402, 509403, 509404, 509405, 509406, 509407, 509408, 509409, 509410, 509411, 509412, 509413, 509414, 509415, 509416, 509417, 509418, 509419, 509420, 509421, 509422, 509423, 509424, 509425, 509426, 509427, 509428, 509429, 509430, 509431, 509432, 509433, 509434, 509435, 509436, 509437, 509438, 509439, 509440, 509441, 509442, 509443, 509444, 509445, 509446, 509447, 509448, 509449, 509450, 509451, 509452, 509453, 509454, 509455, 509456, 509457, 509458, 509459, 509460, 509461, 509462, 509463, 509464, 509465, 509466, 509467, 509468, 509469, 509470, 509471, 509472, 509473, 509474, 509475, 509476, 509477, 509478, 509479, 509480, 509481, 509482, 509483, 509484, 509485, 509486, 509487, 509488, 509489, 509490, 509491, 509492, 509493, 509494, 509495, 509496, 509497, 509498, 509499, 509500, 509501, 509502, 509503, 509504, 509505, 509506, 509507, 509508, 509509, 509510, 509511, 509512, 509513, 509514, 509515, 509516, 509517, 509518, 509519, 509520, 509521, 509522, 509523, 509524, 509525, 509526, 509527, 509528, 509529, 509530, 509531, 509532, 509533, 509534, 509535, 509536, 509537, 509538, 509539, 509540, 509541, 509542, 509543, 509544, 509545, 509546, 509547, 509548, 509549, 509550, 509551, 509552, 509553, 509554, 509555, 509556, 509557, 509558, 509559, 509560, 509561, 509562, 509563, 509564, 509565, 509566, 509567, 509568, 509569, 509570, 509571, 509572, 509573, 509574, 509575, 509576, 509577, 509578, 509579, 509580, 509581, 509582, 509583, 509584, 509585, 509586, 509587, 509588, 509589, 509590, 509591, 509592, 509593, 509594, 509595, 509596, 509597, 509598, 509599, 509600, 509601, 509602, 509603, 509604, 509605, 509606, 509607, 509608, 509609, 509610, 509611, 509612, 509613, 509614, 509615, 509616, 509617, 509618, 509619, 509620, 509621, 509622, 509623, 509624, 509625, 509626, 509627, 509628, 509629, 509630, 509631, 509632, 509633, 509634, 509635, 509636, 509637, 509638, 509639, 509640, 509641, 509642, 509643, 509644, 509645, 509646, 509647, 509648, 509649, 509650, 509651, 509652, 509653, 509654, 509655, 509656, 509657, 509658, 509659, 509660, 509661, 509662, 509663, 509664, 509665, 509666, 509667, 509668, 509669, 509670, 509671, 509672, 509673, 509674, 509675, 509676, 509677, 509678, 509679, 509680, 509681, 509682, 509683, 509684, 509685, 509686, 509687, 509688, 509689, 509690, 509691, 509692, 509693, 509694, 509695, 509696, 509697, 509698, 509699, 509700, 509701, 509702, 509703, 509704, 509705, 509706, 509707, 509708, 509709, 509710, 509711, 509712, 509713, 509714, 509715, 509716, 509717, 509718, 509719, 509720, 509721, 509722, 509723, 509724, 509725, 509726, 509727, 509728, 509729, 509730, 509731, 509732, 509733, 509734, 509735, 509736, 509737, 509738, 509739, 509740, 509741, 509742, 509743, 509744, 509745, 509746, 509747, 509748, 509749, 509750, 509751, 509752, 509753, 509754, 509755, 509756, 509757, 509758, 509759, 509760, 509761, 509762, 509763, 509764, 509765, 509766, 509767, 509768, 509769, 509770, 509771, 509772, 509773, 509774, 509775, 509776, 509777, 509778, 509779, 509780, 509781, 509782, 509783, 509784, 509785, 509786, 509787, 509788, 509789, 509790, 509791, 509792, 509793, 509794, 509795, 509796, 509797, 509798, 509799, 509800, 509801, 509802, 509803, 509804, 509805, 509806, 509807, 509808, 509809, 509810, 509811, 509812, 509813, 509814, 509815, 509816, 509817, 509818, 509819, 509820, 509821, 509822, 509823, 509824, 509825, 509826, 509827, 509828, 509829, 509830, 509831, 509832, 509833, 509834, 509835, 509836, 509837, 509838, 509839, 509840, 509841, 509842, 509843, 509844, 509845, 509846, 509847, 509848, 509849, 509850, 509851, 509852, 509853, 509854, 509855, 509856, 509857, 509858, 509859, 509860, 509861, 509862, 509863, 509864, 509865, 509866, 509867, 509868, 509869, 509870, 509871, 509872, 509873, 509874, 509875, 509876, 509877, 509878, 509879, 509880, 509881, 509882, 509883, 509884, 509885, 509886, 509887, 509888, 509889, 509890, 509891, 509892, 509893, 509894, 509895, 509896, 509897, 509898, 509899, 509900, 509901, 509902, 509903, 509904, 509905, 509906, 509907, 509908, 509909, 509910, 509911, 509912, 509913, 509914, 509915, 509916, 509917, 509918, 509919, 509920, 509921, 509922, 509923, 509924, 509925, 509926, 509927, 509928, 509929, 509930, 509931, 509932, 509933, 509934, 509935, 509936, 509937, 509938, 509939, 509940, 509941, 509942, 509943, 509944, 509945, 509946, 509947, 509948, 509949, 509950, 509951, 509952, 509953, 509954, 509955, 509956, 509957, 509958, 509959, 509960, 509961, 509962, 509963, 509964, 509965, 509966, 509967, 509968, 509969, 509970, 509971, 509972, 509973, 509974, 509975, 509976, 509977, 509978, 509979, 509980, 509981, 509982, 509983, 509984, 509985, 509986, 509987, 509988, 509989, 509990, 509991, 509992, 509993, 509994, 509995, 509996, 509997, 509998, 509999, 627780, 636297, 636368, 650031, 650032, 650033, 650035, 650036, 650037, 650038, 650039, 650040, 650041, 650042, 650043, 650044, 650045, 650046, 650047, 650048, 650049, 650050, 650051, 650405, 650406, 650407, 650408, 650409, 650410, 650411, 650412, 650413, 650414, 650415, 650416, 650417, 650418, 650419, 650420, 650421, 650422, 650423, 650424, 650425, 650426, 650427, 650428, 650429, 650430, 650431, 650432, 650433, 650434, 650435, 650436, 650437, 650438, 650439, 650485, 650486, 650487, 650488, 650489, 650490, 650491, 650492, 650493, 650494, 650495, 650496, 650497, 650498, 650499, 650500, 650501, 650502, 650503, 650504, 650505, 650506, 650507, 650508, 650509, 650510, 650511, 650512, 650513, 650514, 650515, 650516, 650517, 650518, 650519, 650520, 650521, 650522, 650523, 650524, 650525, 650526, 650527, 650528, 650529, 650530, 650531, 650532, 650533, 650534, 650535, 650536, 650537, 650538, 650541, 650542, 650543, 650544, 650545, 650546, 650547, 650548, 650549, 650550, 650551, 650552, 650553, 650554, 650555, 650556, 650557, 650558, 650559, 650560, 650561, 650562, 650563, 650564, 650565, 650566, 650567, 650568, 650569, 650570, 650571, 650572, 650573, 650574, 650575, 650576, 650577, 650578, 650579, 650580, 650581, 650582, 650583, 650584, 650585, 650586, 650587, 650588, 650589, 650590, 650591, 650592, 650593, 650594, 650595, 650596, 650597, 650598, 650700, 650701, 650702, 650703, 650704, 650705, 650706, 650707, 650708, 650709, 650710, 650711, 650712, 650713, 650714, 650715, 650716, 650717, 650718, 650720, 650721, 650722, 650723, 650724, 650725, 650726, 650727, 650901, 650902, 650903, 650904, 650905, 650906, 650907, 650908, 650909, 650910, 650911, 650912, 650913, 650914, 650915, 650916, 650917, 650918, 650919, 650920, 651652, 651653, 651654, 651655, 651656, 651657, 651658, 651659, 651660, 651661, 651662, 651663, 651664, 651665, 651666, 651667, 651668, 651669, 651670, 651671, 651672, 651673, 651674, 651675, 651676, 651677, 651678, 651679, 655000, 655001, 655002, 655003, 655004, 655005, 655006, 655007, 655008, 655009, 655010, 655011, 655012, 655013, 655014, 655015, 655016, 655017, 655018, 655019, 655021, 655022, 655023, 655024, 655025, 655026, 655027, 655028, 655029, 655030, 655031, 655032, 655033, 655034, 655035, 655036, 655037, 655038, 655039, 655040, 655041, 655042, 655043, 655044, 655045, 655046, 655047, 655048, 655049, 655050, 655051, 655052, 655053, 655054, 655055, 655056, 655057, 655058, 637095, 650921, 650978]
		}];
	};

	Model.fn.onSubmit = function(e) {
		if ( this.hasCardId() ) {
			$( 'body' ).trigger( 'onPagarmeCheckoutDone' );

			if ( $( 'input[name=payment_method]' ).val() == '2_cards' ) {
				window.Pagarme2Cards = window.Pagarme2Cards + 1;
				if ( window.Pagarme2Cards === 2 ) {
					$( 'body' ).trigger( 'onPagarme2CardsDone' );
				}
			}
			return;
		}

		var $this = this;
		var markedInputs = this.$el.find( '[data-pagarmecheckout-element]' );
		var notMarkedInputs = this.$el.find( 'input:not([data-pagarmecheckout-element])' );
		var checkoutObj = this.createCheckoutObj(markedInputs);
		var callbackObj = {};
		var $hidden = this.$el.find( '[name="pagarmetoken' + this.suffix + '"]' );
		var cb;

		if ( $hidden ) {
			$hidden.remove();
		}

		e.preventDefault();

		swal.close();

		swal({
			title: '',
			text: 'Gerando transação segura...',
			allowOutsideClick: false
		});

		swal.showLoading();

		this.getAPIData(
			this.apiURL,
			checkoutObj,
			function (data, suffix) {
				var objJSON = JSON.parse(data);

				$hidden = document.createElement('input');
				$hidden.setAttribute('type', 'hidden');
				$hidden.setAttribute('name', 'pagarmetoken' + $this.suffix );
				$hidden.setAttribute('value', objJSON.id);
				$hidden.setAttribute('data-pagarmetoken', $this.suffix );

				$this.$el.append($hidden);

				for (var i = 0; i < notMarkedInputs.length; i += 1) {
					callbackObj[notMarkedInputs[i]['name']] = notMarkedInputs[i]['value'];
				}

				callbackObj['pagarmetoken'] = objJSON.id;
				cb = $this._onDone.call(null, callbackObj, suffix);

				if ( typeof cb === 'boolean' && !cb ) {
					$this.enableFields(markedInputs);
					return;
				}

			},
			function (error, suffix) {
				swal.close();
				if (error.statusCode == 503) {
					swal({
						type: 'error',
						html: 'Não foi possível gerar a transação segura. Serviço indisponível.'
					});
				} else {
					$this._onFail(error, suffix);
				}

			}
		);
	};

	Model.fn._onFail = function(error, suffix) {
		$( 'body' ).trigger( 'onPagarmeCheckoutFail', [ error ] );
	};

	Model.fn._onDone = function(data, suffix) {
		$( 'body' ).trigger( 'onPagarmeCheckoutDone', [ data ] );

		if ( $( 'input[name=payment_method]' ).val() == '2_cards' ) {
			window.Pagarme2Cards = window.Pagarme2Cards + 1;
			if ( window.Pagarme2Cards === 2 ) {
				$( 'body' ).trigger( 'onPagarme2CardsDone' );
			}
		}
	};

});
