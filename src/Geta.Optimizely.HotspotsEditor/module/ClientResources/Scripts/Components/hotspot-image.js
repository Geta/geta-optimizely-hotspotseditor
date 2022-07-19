window.Geta = window.Geta || {
    index: null,
    Components: {},
    Models: {},
    Utils: {}
};

Geta.Components.HotspotImage = function (element, options) {

    return {

        element: element,

        options: $.extend(
            {},
            {
                activeClass: "hotspot-image-spot--active",
                modalSpotClass: "hotspot-image-spot--modal"
            },
            options
        ),

        _activeSpot: null,

        _init: function() {
            this.element.find("[data-hotspot-image-spot]").each($.proxy(this._initSpot, this));
            return this;
        },

        _initSpot: function(i, el){
            var element = $(el);
            new Geta.Components.HotspotImage.Spot(element, {
                activeClass: this.options.activeClass,
                modalSpotClass: this.options.modalSpotClass,
                onShow: $.proxy(this._onShow, this),
                onHide: $.proxy(this._onHide, this)
            });
        },

        _onShow: function(spot){
            this._activeSpot && this._activeSpot.hide();
            this._activeSpot = spot;
            this._positionProduct(spot.element);
            this._productIsTooLarge(spot.element) && spot.showAsModal();
        },

        _onHide: function(spot){
            this._activeSpot = null;
        },

        _positionProduct: function(element){
            var button = element.find("[data-hotspot-image-button]");
            var product = element.find("[data-hotspot-image-product]");
            var containerRight = this.element.innerWidth();
            var containerBottom = this.element.innerHeight();
            var spotPosition = element.position();
            var buttonWidth = button.outerWidth(true);
            var buttonHeight = button.outerHeight(true);
            var productWidth = product.outerWidth(true);
            var productHeight = product.outerHeight(true);
            var productRight = spotPosition.left + buttonWidth + productWidth;
            var productBottom = spotPosition.top + buttonHeight + productHeight;
            var top = productBottom > containerBottom ? Math.min(0, containerBottom - spotPosition.top - productHeight) : 0;
            var left = productRight > containerRight ? -productWidth : buttonWidth;
            product.css({
                top: top,
                left: left
            });
        },

        _productIsTooLarge: function(spot) {
            var product = spot.find("[data-hotspot-image-product]");
            var elementOffset = this.element.parent().offset();
            var productOffset = product.offset();
            var left = productOffset.left - elementOffset.left;
            var top = productOffset.top - elementOffset.top;
            return left < 0 || top < 0;
        }

    }._init();
};

Geta.Components.HotspotImage.Spot = function(element, options) {

    return {

        element: element,

        options: $.extend(
            {},
            {
                modalSpotClass: null,
                activeClass: null,
                onShow: $.noop(),
                onHide: $.noop()
            },
            options
        ),

        _modal: null,

        _button: null,

        _isToggled: false,

        _init: function(){
            this._modal = new Geta.Components.HotspotImage.Modal(this.element, {
                modalSpotClass: this.options.modalSpotClass,
                onHide: $.proxy(this.hide, this)
            });
            this._button = this.element.find("[data-hotspot-image-button]");
            var product = this.element.find("[data-hotspot-image-product]");
            if (!!('ontouchstart' in window)) {
                this._button.click($.proxy(this._toggle, this));
            }
            else {
                this._button.mouseover($.proxy(this._toggle, this));
                product.mouseleave($.proxy(this._toggle, this));
            }
            return this;
        },

        _toggle: function (event) {
            if (!event.isDefaultPrevented()) {
                event && event.preventDefault();
                if (!this._isToggled) {
                    this.show();
                } else {
                    this.hide();
                }
            }
        },

        show: function(){
            this.element.addClass(this.options.activeClass);
            this._isToggled = true;
            this.options.onShow(this);
        },

        hide: function(){
            if(this._modal.active){
                this._modal.hide();
            }
            else {
                this.element.removeClass(this.options.activeClass);
            }
            this._isToggled = false;
            this.options.onHide(this);
        },

        showAsModal: function(){
            this._modal.show();
        }

    }._init();
};

Geta.Components.HotspotImage.Modal = function(element, options) {

    return {

        element: element,

        options: $.extend(
            {},
            {
                modalSpotClass: null,
                onHide: $.noop(),
                placeholderClass: "hotspot-image-placeholder"
            },
            options
        ),

        _parent: null,

        _button: null,

        _placeholder: null,

        active: false,

        _init: function(){
            this._parent = this.element.parent();
            this._button = this.element.find("[data-hotspot-image-button]");
            return this;
        },

        show: function(){
            var product = this.element.find("[data-hotspot-image-product]");
            this._createPlaceholder();
            this.element.addClass(this.options.modalSpotClass);
            this.element.addClass(this.options.modalSpotClass+"-in");
            this.element.appendTo("body");
            var buttonLeft = product.offset().left + product.width() - this._button.width();
            this._button.css("left", buttonLeft);
            this.element.on("click", $.proxy(this._onModalElementClick, this));
            this.active = true;
        },

        _createPlaceholder: function(){
            this._placeholder = $("<div></div>").addClass(this.options.placeholderClass);
            this._placeholder.css({
                top: this.element.css("top"),
                left: this.element.css("left")
            });
            this._placeholder.appendTo(this._parent);
        },

        _onModalElementClick: function(event){
            if(event.target == event.currentTarget){
                this.hide();
            }
        },

        hide: function(){
            this.element.off("click");
            this.element.removeClass(this.options.modalSpotClass+"-in");
            setTimeout($.proxy(function(){
                this.element.addClass(this.options.modalSpotClass+"-out");
            }, this), 0);
            setTimeout($.proxy(this._hideDelayed, this), 900);
            this.active = false;
        },

        _hideDelayed: function(){
            var button = this.element.find("[data-hotspot-image-button]");
            button.css("left", "");
            this.element
                .removeClass(this.options.modalSpotClass)
                .removeClass(this.options.modalSpotClass+"-in")
                .removeClass(this.options.modalSpotClass+"-out")
                .appendTo(this._parent);
            this._placeholder.remove();
            this.options.onHide();
        }

    }._init();
};

$(function () {
    var element = $('body');
    var selector = "[data-hotspot-image]";
    var elements = element.andSelf().find(selector);
    Geta.Components.HotspotImage(elements, {});
});