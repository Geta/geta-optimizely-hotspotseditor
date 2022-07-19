/* jshint -W099 */
/* global jQuery:false */

(function ($, Oxx) {

	"use strict";

	//********************************************************************************
	//*NAMESPACES ********************************************************************
	//********************************************************************************

	Oxx = window.Oxx = (!Oxx) ? {} : Oxx;

	//********************************************************************************
	//*CLASS VARIABLES****************************************************************
	//********************************************************************************

	var defaultOptions = {
		hotSpotImageWidth: 0,
		hotSpotImageHeight: 0,
		hotSpotAreaDefaultSize: 40
	};

	//********************************************************************************
	//*CONSTRUCTOR********************************************************************
	//********************************************************************************

	/**
	 * HotSpots editor
	 *
	 * Events:
	 *		change - triggers when any HotSpots has been changed
	 *		select - triggers when any HotSpot has been selected
	 *		deselect - triggers when any HotSpot has deselected
	 *
	 * @param {HTMLElement} container
	 * @param {object} options
	 */
	Oxx.HotSpotsEditor = function (container, options) {

		/** @type {jQuery} */
		this._$el = $(container);

		/** @type {Object}*/
		this._settings = {};
		/** @type {Object}*/
		this._settings.options = Oxx.ObjectUtils.createOptionsObject(defaultOptions, options);

		/** @type {jQuery} */
		this._$toolbar = this._$el.find('.toolbar');

		/** @type {jQuery} */
		this._$newHotSpotButton = this._$toolbar.find('.new');

		/** @type {jQuery} */
        this._$value = this._$el.find('.value');

		/** @type {Array} array of Oxx.HotSpotsEditor.HotSpot */
		this._hotSpots = [];

		/** @type {jQuery} */
		this._$hotSpotsContainer = this._$el.find('.hotspots');

		/** @type {jQuery} */
		this._$imageContainer = this._$el.find('.image');

		/** @type {jQuery} */
		this._$image = this._$imageContainer.find('img');

		this._imageWidth = this._$image.width();

		/** @type {object} */
		this._newHotSpotsOffsets = {
			top: 0,
			left: 0
        };

	    /** @type {object} */
	    this._value;

		/** @type {jQuery} */
		this._$trash = this._$toolbar.find('.trash');

		/** @type {number} */
		this._timerWindowResize = undefined;

		/** @type {jQuery} */
		this._$linkToProduct = this._$toolbar.find('.link-to-product');


		// check if optional hotspot image size is defined
		if(this._settings.options.hotSpotImageWidth === 0) {
			var me = this;
			setTimeout(function() {
			    me._$newHotSpotButton.getBackgroundSize(me._callbackHotSpotImageSizeReturned.bind(me));
			}, 100);
		} else {
			this.init();
		}
	};


	//********************************************************************************
	//*PUBLIC STATIC FUNCTIONS********************************************************
	//********************************************************************************

	/**
	 * Convert position pixel value into percent
	 *
	 * @param {int} position - top or left position
	 * @param {int} imageSize - width or height of the background image
	 * @return {string} - percent with two decimals
	 */
	Oxx.HotSpotsEditor.pixelsToPercent = function (position, imageSize) {
		return (position * 100.0 / imageSize).toFixed(2);
	};

	//********************************************************************************

	/**
	 * Convert percent position to pixel value
	 *
	 * @param {string} position - top or left position in percent
	 * @param {int} imageSize - width or height of the background image
	 * @return {int} - top or left position in pixels
	 */
    Oxx.HotSpotsEditor.percentToPixels = function (position, imageSize) {

        var number;
        if (typeof (position) === 'string') {
            number = parseFloat(position.replace('%', ''));
        } else {
            number = position;
        }

		return Math.round(number * imageSize / 100);
	};

	//********************************************************************************

	/**
	 * Check if a value is within min and max. Set to min or max of outside the boundary
	 *
	 * @param {int} value
	 * @param {int} min
	 * @param {int} max
	 * @return {int}
	 */
	Oxx.HotSpotsEditor.checkValue = function(value, min, max) {
		if(value < min) {
			value = min;
		} else if(value > max) {
			value = max;
		}
		return value;
	};

	//********************************************************************************
	//*PROTOTYPE/PUBLIC FUNCTIONS*****************************************************
	//********************************************************************************

	Oxx.HotSpotsEditor.prototype = {

		constructor: Oxx.HotSpotsEditor,

		//********************************************************************************

		init: function () {

			// enable draggable on the new HotSpot button
			this._$newHotSpotButton.draggable({
				helper: 'clone',
				containment: this._$el
			});

			// enable droppable on the imageContainer
			this._$imageContainer.droppable({
				accept: '.hotspot.new',
				tolerance: 'pointer',
				drop: this._onNewHotSpotDropped.bind(this)
			});

			// calculate offsets from toolbar button
			this._newHotSpotsOffsets = {
				top: this._$newHotSpotButton.offset().top - this._$hotSpotsContainer.offset().top,
				left: this._$newHotSpotButton.offset().left - this._$hotSpotsContainer.offset().left
			};

			// enable drop on trash
			this._$trash.droppable({
				accept: '.hotspot',
				tolerance: 'pointer',
				drop: this._onHotSpotDroppedInTrash.bind(this)
			});

			// Wait for the image to load before calculating image width and height
			if(this._$image[0].complete && this._$image[0].naturalWidth !== undefined) {
				this._onImageLoaded();
				setTimeout(this._loadFromValue.bind(this), 2000);
			} else {
			    this._$image.on('load', this._onImageLoaded.bind(this));
			}

			// Listen to the window resize event
			$(window).on('resize', this._onWindowResize.bind(this));

			setInterval(this._changedImageSize.bind(this), 2000);
		},

		//********************************************************************************

		/**
		 * Get the value from internal store 
		 *
		 * @returns {string}
		 */
        getValue: function () {
            return this._value;
			//return this._$value.val();
		},

		/**
           * Set the value from internal store 
           *
           * @returns {string}
           */
        setValue: function(value) {
            this._value = value;
        },

		//********************************************************************************
		//*PRIVATE OBJECT METHODS ********************************************************
		//********************************************************************************

		/**
		 * Load the HotSpots from the config value
		 *
		 * @private
		 */
		_loadFromValue: function() {
			// clear out any existing HotSpot just to be sure
			this._$hotSpotsContainer.empty();
			this._hotSpots = [];

			// get value from the hidden textbox
            //var value = this._$value.val();
		    var value = this.getValue();

			// check if there is something to do
			if(typeof(value) === 'undefined' || value === '') {
				return;
			}

			// parse the JSON data if the value is invalid
            var hotSpots = [];

            if (value) {
                if (typeof (value) === 'object') {
                    hotSpots = value;
                }
                else {
                    try {
                        var parsed = JSON.parse(this._$value.val());
                        hotSpots = parsed;
                    }
                    catch (ex) {
                        window.console && window.console.warn(ex);
                    }
                }
            }
            
            if (hotSpots.length > 0)
            {
				var imageWidth = this._$image.width(),
					imageHeight = this._$image.height();

				for(var i = 0; i < hotSpots.length; i++) {
					var hotSpotData = hotSpots[i],
						hotSpotCenterOffset = {
							top: parseInt(hotSpotData.hotSpot.height / 2, 10),
							left: parseInt(hotSpotData.hotSpot.width / 2, 10)
						};
					var hotSpot = new Oxx.HotSpotsEditor.HotSpot(this._$hotSpotsContainer, this._$image, {
						hotSpot: {
							top: Oxx.HotSpotsEditor.checkValue(Oxx.HotSpotsEditor.percentToPixels(hotSpotData.hotSpot.top, imageHeight) - hotSpotCenterOffset.top, 0, imageHeight),
							left: Oxx.HotSpotsEditor.checkValue(Oxx.HotSpotsEditor.percentToPixels(hotSpotData.hotSpot.left, imageWidth) - hotSpotCenterOffset.left, 0, imageWidth),
							width: hotSpotData.hotSpot.width,
							height: hotSpotData.hotSpot.height
						},
						link: hotSpotData.link,
						area: {
							top: Oxx.HotSpotsEditor.checkValue(Oxx.HotSpotsEditor.percentToPixels(hotSpotData.area.top, imageHeight), 0, imageHeight),
							left: Oxx.HotSpotsEditor.checkValue(Oxx.HotSpotsEditor.percentToPixels(hotSpotData.area.left, imageWidth), 0, imageWidth),
							width: Oxx.HotSpotsEditor.percentToPixels(hotSpotData.area.width, imageWidth),
							height: Oxx.HotSpotsEditor.percentToPixels(hotSpotData.area.height, imageHeight)
						}
					});
					this._addHotSpotEvents(hotSpot);
					this._hotSpots.push(hotSpot);
				}
			}

		},

		//********************************************************************************

		/**
		 * Add events listeners to a HotSpot
		 *
		 * @param hotSpot
		 * @private
		 */
		_addHotSpotEvents: function(hotSpot) {
		    $(hotSpot).on('change', this._onHotSpotChanged.bind(this));
			$(hotSpot).on('select', this._onHotSpotSelected.bind(this));
		},

		//********************************************************************************

		/**
		 * Save the HotSpots
		 *
		 * @private
		 */
		_saveChanges: function() {
			var originalValue = this.getValue(), //this._$value.val(),
				hotSpots = [];


			for(var i = 0; i < this._hotSpots.length; i++) {
				hotSpots.push(this._hotSpots[i].getValue());
			}

			//var newValue = JSON.stringify(hotSpots);

			// Fire the change event if the value is changed
            if (originalValue !== hotSpots) {
                this.setValue(hotSpots);
				$(this).trigger('change');
			}
		},

		//********************************************************************************
		//*CALLBACK METHODS **************************************************************
		//********************************************************************************

		/**
		 * Callback for when the background image size is returned from the new HotSpot button
		 *
		 * @param imageSizes
		 * @private
		 */
		_callbackHotSpotImageSizeReturned: function (imageSizes) {

			this._settings.options.hotSpotImageWidth = imageSizes.width;
			this._settings.options.hotSpotImageHeight = imageSizes.height;

			this.init();
		},

		//********************************************************************************

		/**
		 * Window has changed size, update positions based on the new image size
		 *
		 * @private
		 */
		_callbackWindowResize: function() {

			this._loadFromValue();
		},

		//********************************************************************************
		//*EVENT METHODS******************************************************************
		//********************************************************************************

		/**
		 * Event for when a hotspot is dropped onto the image
		 *
		 * @param {event} event
		 * @param {object} ui - jQuery droppable ui event object
		 */
		_onNewHotSpotDropped: function (event, ui) {

			var positions = ui.position,
				imageWidth = this._$image.width(),
				imageHeight = this._$image.height();


			var positionTop = positions.top + this._newHotSpotsOffsets.top,
				positionLeft = positions.left + this._newHotSpotsOffsets.left,
				hotSpot = new Oxx.HotSpotsEditor.HotSpot(this._$hotSpotsContainer, this._$image, {
				hotSpot: {
					top: Oxx.HotSpotsEditor.checkValue(positionTop, 0, imageHeight),
					left: Oxx.HotSpotsEditor.checkValue(positionLeft, 0, imageWidth),
					width: this._settings.options.hotSpotImageWidth,
					height: this._settings.options.hotSpotImageHeight
				},
				area: {
					top: Oxx.HotSpotsEditor.checkValue(positionTop - this._settings.options.hotSpotAreaDefaultSize, 0, imageHeight),
					left: Oxx.HotSpotsEditor.checkValue(positionLeft - this._settings.options.hotSpotAreaDefaultSize, 0, imageWidth),
					width: this._settings.options.hotSpotImageWidth + (this._settings.options.hotSpotAreaDefaultSize * 2),
					height: this._settings.options.hotSpotImageHeight + (this._settings.options.hotSpotAreaDefaultSize * 2)
				}
			});
			this._addHotSpotEvents(hotSpot);
			this._hotSpots.push(hotSpot);


			hotSpot.setActive();
			hotSpot.saveChanges();


			return false;
		},

		//********************************************************************************

		/**
		 * Event for when HotSpot is dropped on the trash
		 *
		 * @param event
		 * @param {object} ui
		 * @private
		 */
		_onHotSpotDroppedInTrash: function(event, ui) {

			var hotSpot = ui.draggable.parent().get(0).HotSpot;

			hotSpot.trash();

			var i = $.inArray(hotSpot, this._hotSpots);
			if(i >= 0) {
				this._hotSpots.splice(i, 1);
			}

			this._saveChanges();

			this._$linkToProduct.addClass('hidden');

			$(this).trigger('deselect');
		},

		//********************************************************************************

		/**
		 * Event for when the Image has been loaded
		 *
		 * @param event
		 * @private
		 */
		_onImageLoaded: function(event) {
			this._loadFromValue();
		},

		//********************************************************************************

		/**
		 * Event for when a HotSpot is changed
		 *
		 * @param event
		 * @private
		 */
		_onHotSpotChanged: function(event) {
			this._saveChanges();
		},

		//********************************************************************************

		/**
		 * Event for when a HotSpot is selected
		 *
		 * @param event
		 * @private
		 */
		_onHotSpotSelected: function(event) {

			// make the link to product button visible
			this._$linkToProduct.removeClass('hidden');

			var hotSpot = event.target;
			if(hotSpot.hasLink()) {
				this._$linkToProduct.find('.icon.ok').removeClass('hidden');
			} else {
				this._$linkToProduct.find('.icon.ok').addClass('hidden');
			}

			$(this).trigger('select', hotSpot);

		},


		//********************************************************************************

		/**
		 * Event for when the window resize is making the Image change size
		 *
		 * @param event
		 * @private
		 */
		_onWindowResize: function(event) {

			// workaround
			if (!$(event.target).hasClass('ui-resizable')) {
				if (this._timerWindowResize) {
					clearTimeout(this._timerWindowResize);
				}
				this._timerWindowResize = setTimeout(this._callbackWindowResize.bind(this), 300);
			}
		},

		_changedImageSize: function () {
		    if (this._$image.width() > 0 && this._$image.width() !== this._imageWidth) {
		        this._imageWidth = this._$image.width();
		        this._loadFromValue();
		    }
		}
	};

	//********************************************************************************
	//*PRIVATE STATIC METHODS ********************************************************
	//********************************************************************************


})(jQuery, window.Oxx);
