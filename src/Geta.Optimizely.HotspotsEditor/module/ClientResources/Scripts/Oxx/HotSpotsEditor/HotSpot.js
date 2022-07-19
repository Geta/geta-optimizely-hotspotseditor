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
		hotSpot: {
			top: 0,
			left: 0,
			width: 0,
			height: 0
		},
		link: undefined,
		area: {
			top: 0,
			left: 0,
			width: 0,
			height: 0
		}
	};

	//********************************************************************************
	//*CONSTRUCTOR********************************************************************
	//********************************************************************************


	/**
	 * Movable HotSpot and Area
	 *
	 * Events:
	 *		change - triggers when the HotSpot is changed
	 *		select - triggers when the area or the HotSpot is active
	 *
	 * @param {jQuery} $container - the HotSpots container
	 * @param {jQuery} $image - is used to calculate percentages
	 * @param {object} options
	 */
	Oxx.HotSpotsEditor.HotSpot = function ($container, $image, options) {

		/** @type {jQuery} */
		this._$container = $container;

		/** @type {jQuery} */
		this._$image = $image;

		/** @type {jQuery} */
		this._$el = undefined;

		/** @type {Object}*/
		this._settings = {};
		/** @type {Object}*/
		this._settings.options = Oxx.ObjectUtils.createOptionsObject(defaultOptions, options);

		/** @type {jQuery} */
		this._$hotSpot = undefined;

		/** £type {object}*/
		this._hotSpotCenterOffset = {
			top: 0,
			left: 0
		};

		/** @type {boolean} */
		this._movedToTrash = false;

		/** @type {jQuery} */
		this._$imageMapArea = undefined;



		this.init();
	};

	//********************************************************************************
	//*PROTOTYPE/PUBLIC FUNCTIONS*****************************************************
	//********************************************************************************

	Oxx.HotSpotsEditor.HotSpot.prototype = {

		constructor: Oxx.HotSpotsEditor.HotSpot,

		//********************************************************************************

		init: function () {

			this._createDOMElements();

			// events for marking this HotSpot as active within the container
			this._$hotSpot.on('mousedown', this._onHotSpotMouseDown.bind(this));
			this._$imageMapArea.on('mousedown', this._onImageMapAreaMouseDown.bind(this));

			this._enableHotSpotDragging();
			this._enableImageMapAreaResizing();

		},

		//********************************************************************************

		/**
		 * Get the settings to save
		 *
		 * @return {object}
		 */
		getValue: function() {
			var imageWidth = this._$image.width(),
				imageHeight = this._$image.height();

			// save the center position of the HotSpot
			return {
				hotSpot: {
					top: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.hotSpot.top + this._hotSpotCenterOffset.top, imageHeight),
					left: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.hotSpot.left + this._hotSpotCenterOffset.left, imageWidth),
					width: this._settings.options.hotSpot.width,
					height: this._settings.options.hotSpot.height
				},
				link: this._settings.options.link,
				area: {
					top: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.area.top, imageHeight),
					left: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.area.left, imageWidth),
					width: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.area.width, imageWidth),
					height: Oxx.HotSpotsEditor.pixelsToPercent(this._settings.options.area.height, imageHeight)
				}
			};
		},

		//********************************************************************************

		/**
		 * Set this HotSpot as the active hotspot
		 */
		setActive: function() {
			// set all other HotSpots in the container to inactive
			this._$container.find('.hotspot-wrapper').removeClass('active');

			this._$el.addClass('active');

			if(!this._movedToTrash) {
				$(this).trigger('select');
			}
		},

		//********************************************************************************

		/**
		 * Triggers the change event
		 */
		saveChanges: function() {
			if(!this._movedToTrash) {
				$(this).trigger('change');
			}
		},

		//********************************************************************************

		/**
		 * Mark as being deleted, and remove from DOM
		 *
		 * @returns {jQuery}
		 */
		trash: function() {
			this._movedToTrash = true;
			this._$el.remove();
		},

		//********************************************************************************

		/**
		 *
		 * @returns {boolean}
		 */
		hasLink: function() {
			return typeof(this._settings.options.link) !== 'undefined' &&
				this._settings.options.link !== null &&
				this._settings.options.link !== '';
		},

		//********************************************************************************

		/**
		 *
		 * @param link
		 */
		setLink: function(link) {
			this._settings.options.link = link;
		},

		//********************************************************************************

		/**
		 *
		 */
		getLink: function() {
			return this._settings.options.link;
		},

		//********************************************************************************
		//*PRIVATE OBJECT METHODS ********************************************************
		//********************************************************************************

		/**
		 * Create the DOM elements and add the HotSpot to the HotSpotContainer
		 *
		 * @private
		 */
		_createDOMElements: function() {
			this._$el = $('<div class="hotspot-wrapper"><a class="hotspot"></a><div class="image-map-area"></div></div>');
			this._$container.append(this._$el);

			this._$el.get(0).HotSpot = this; // reference to self from the DOM

			this._$hotSpot = this._$el.find('.hotspot');
			this._$imageMapArea = this._$el.find('.image-map-area');

			this._setPositions();
			this._setAreaPositions();

			this._hotSpotCenterOffset = {
				top: parseInt(this._settings.options.hotSpot.height / 2, 10),
				left: parseInt(this._settings.options.hotSpot.width / 2, 10)
			};
		},

		//********************************************************************************

		/**
		 * Update the position of the HotSpot
		 *
		 * @private
		 */
		_setPositions: function() {
			this._$hotSpot.css('top', this._settings.options.hotSpot.top + 'px')
				.css('left', this._settings.options.hotSpot.left + 'px');
		},

		//********************************************************************************

		/**
		 * Update the position of the Image map area
		 *
		 * @private
		 */
		_setAreaPositions: function() {
			this._$imageMapArea.css('top', this._settings.options.area.top + 'px')
				.css('left', this._settings.options.area.left + 'px')
				.css('width', this._settings.options.area.width + 'px')
				.css('height', this._settings.options.area.height + 'px');
		},

		//********************************************************************************

		/**
		 * Enable resizing of the image map area
		 */
		_enableImageMapAreaResizing: function () {
			this._$imageMapArea.resizable({
				handles: 'n, e, s, w, ne, se, sw, nw',
				stop: this._onImageMapAreaResize.bind(this)
			}).draggable({
				revert: false,
				containment: this._$container,
				scroll: false,
				stop: this._onImageMapAreaDragged.bind(this)
			});
		},

		//********************************************************************************

		/**
		 * Make the hotspot movable
		 *
		 * @private
		 */
		_enableHotSpotDragging: function() {

			this._$hotSpot.draggable({
				revert: false,
				containment: this._$container.parents('.hotspotseditor'),
				scroll: false,
				stop: this._onHotSpotDragged.bind(this)
			});

		},

		//********************************************************************************
		//*CALLBACK METHODS **************************************************************
		//********************************************************************************


		//********************************************************************************
		//*EVENT METHODS******************************************************************
		//********************************************************************************

		/**
		 * Click on the HotSpot  (Select)
		 *
		 * @param event
		 *
		 * @private
		 */
		_onHotSpotMouseDown: function(event) {
			event.preventDefault();
			event.stopPropagation();

			this.setActive();
		},

		//********************************************************************************

		/**
		 * Click on the HotSpot (Select)
		 *
		 * @param event
		 *
		 * @private
		 */
		_onImageMapAreaMouseDown:function(event) {
			event.preventDefault();
			event.stopPropagation();

			this.setActive();
		},

		//********************************************************************************

		/**
		 * Event for when the HotSpot is moved
		 *
		 * @param event
		 * @param ui
		 *
		 * @private
		 */
		_onHotSpotDragged: function(event, ui) {

			this._settings.options.hotSpot.top = ui.position.top;
			this._settings.options.hotSpot.left = ui.position.left;

			this._setPositions();
			this.saveChanges();
		},

		//********************************************************************************

		/**
		 * Event for when image map area is resize
		 *
		 * @param {event} event
		 * @param {object} ui - jQuery resizable ui event object
		 *
		 * @private
		 */
		_onImageMapAreaResize: function (event, ui) {
			event.stopPropagation(); // prevent this from bubbling up to window resize

			this._settings.options.area = {
				top: ui.position.top,
				left: ui.position.left,
				width: ui.size.width,
				height: ui.size.height
			};

			this._setAreaPositions();
			this.saveChanges();

			return false;
		 },

		//********************************************************************************

		/**
		 * Event for when image map area is moved
		 *
		 * @param {event} event
		 * @param {object} ui - jQuery draggable ui event object
		 *
		 * @private
		 */
		_onImageMapAreaDragged: function (event, ui) {

			this._settings.options.area.top = ui.position.top;
			this._settings.options.area.left = ui.position.left;

			this._setAreaPositions();
			this.saveChanges();

		 }
	};


	//********************************************************************************
	//*PRIVATE STATIC METHODS ********************************************************
	//********************************************************************************


})(jQuery, window.Oxx);