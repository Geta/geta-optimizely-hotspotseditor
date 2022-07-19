define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "epi-cms/_ContentContextMixin",
    "epi-cms/widget/ContentSelector",
    "epi/i18n!epi/cms/nls/geta.clientresources.hotspotseditor",
    "epi/i18n!epi/cms/nls/shell.cms.externallinks.details",
    'dojo/text!./Templates/HotspotsEditor.html'
], function (declare, lang, _WidgetBase, _TemplatedMixin, _ContentContextMixin, ContentSelector, localizations, externallinksResources, template) {

    return declare("hotspots/editors/HotspotsEditor",
        [_WidgetBase, _TemplatedMixin, _ContentContextMixin], {
            templateString: template,

            _resources: lang.mixin(localizations, externallinksResources),

            //********************************************************************************
            //*PROTOTYPE/PUBLIC FUNCTIONS*****************************************************
            //********************************************************************************

            postCreate: function () {

                this.set('value', this.value);

                this.activeHotSpot = undefined;

                this.HotSpotsEditor = new Oxx.HotSpotsEditor(this.domNode);
                this.HotSpotsEditor.setValue(this.value);


                this._attachEventListeners();

            },

            //********************************************************************************
            //*PRIVATE OBJECT METHODS ********************************************************
            //********************************************************************************

            /**
            * Attach events here
            *
            * @private
            */
            _attachEventListeners: function () {
                jQuery(this.HotSpotsEditor).on('change', jQuery.proxy(this._onChange, this));
                jQuery(this.HotSpotsEditor).on('select', jQuery.proxy(this._onHotSpotSelected, this));
                jQuery(this.HotSpotsEditor).on('deselect', jQuery.proxy(this._onHotSpotDeSelected, this));

            },

            //********************************************************************************

		    /**
			 * Recreates the product selector with an initial value so that we don't trigger
			 * the change event
			 *
			 * @param value
			 * @private
			 */
            _createProductSelector: function (value) {

                $(this.linkToProduct).empty();

                this.productSelector = new ContentSelector({
                    value: value,
                    cultureSpecific: false,
                    allowedTypes: this.allowedTypes != null ? this.allowedTypes : ["episerver.core.icontentdata"],
                    roots: this.roots != null ? this.roots : ["-1073741823__CatalogContent"],
                    label: this._resources.content,
                    allowedDndTypes: this.allowedDndTypes != null ? this.allowedDndTypes : ["episerver.core.icontentdata.reference"]
                });

                $(this.linkToProduct).append(this.productSelector.domNode);

                this.productSelector.on('change', jQuery.proxy(this._onLinkToProductChange, this));
            },

            //********************************************************************************

            /**
	            * Called on init to load the value from database and set on the control
	            * @param value
	            * @private
	            */
            _setValueAttr: function (value) {
                this.hotspots = value;
                this._set('value', value);

                if (!this.HotSpotsEditor) return;
                this.HotSpotsEditor.setValue(value);
            },

            //********************************************************************************
            //*EVENT METHODS******************************************************************
            //********************************************************************************

            /**
            * When any HotSpots are modified, save the changes
            * @param event
            * @private
            */
            _onChange: function (event) {
                var value = event.target.getValue();
                if (this.value !== value) {

                    // this will trigger the save event on object, giving the option to publish the content
                    this.parent.editing = true;
                    this._set('value', value);
                    this.onChange(value);

                    this.parent.editing = false;
                }
            },

            //********************************************************************************

		    /**
			 * Updates the value of the linkToProduct control when a HotSpot is selected
			 *
			 * @param event
			 * @param hotSpot
			 * @private
			 */
            _onHotSpotSelected: function (event, hotSpot) {

                this.activeHotSpot = hotSpot;

                var link = this.activeHotSpot.getLink();

                this._createProductSelector(link);

            },

            //********************************************************************************

		    /**
			 *
			 * @param event
			 * @private
			 */
            _onHotSpotDeSelected: function (event) {
                this.activeHotSpot = undefined;
            },

            //********************************************************************************

		    /**
			 * When a product is selected or deselected update the product link on the HotSpot
			 *
			 * @param event
			 * @private
			 */
            _onLinkToProductChange: function (event) {

                if (this.activeHotSpot) {
                    this.activeHotSpot.setLink(this.productSelector.value);
                    this.activeHotSpot.saveChanges();
                }

            }


        });
});
