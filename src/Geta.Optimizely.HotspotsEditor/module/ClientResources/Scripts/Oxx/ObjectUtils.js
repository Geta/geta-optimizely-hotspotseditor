(function(Oxx){

	"use strict";

//********************************************************************************
//*NAMESPACES ********************************************************************
//********************************************************************************

	Oxx = window.Oxx = (!Oxx) ? {} : Oxx;

//********************************************************************************
//*STATIC CLASS VARIABLES*********************************************************
//********************************************************************************

    var DEFAULT_OPTIONS_ERROR = "Oxx.ObjectUtils.createOptionsObject - The value set on the options object is not valid when compared to the validValues array.";

//********************************************************************************

	Oxx.ObjectUtils = {

		/**
		 * Util method for creating an options object from an user object, and a default value object, and a
		 * validValues object.
		 *
		 * We define an object filled with default values and combine this with an options object.
		 *
		 * The value of a property will be copied from the options object if the property exist on this object, and
		 * the value of the property checks out against the validValues object. This test will be ignored if there is
		 * no validValues object, or if no property matching the name of the copied property exist.
		 *
		 * If there is no value on the options object the value from the default object will be used.
		 *
		 * @param   {Object}    defaultObject           - The default object containing default values for all wanted properties.
		 * @param   {Object}    [options]               - The object with some, or all properties set by the user.
		 * @param   {Object}    [validValues]           - An object with arrays of valid values for the different properties on
		 *                                                the options object.
		 * @param   {Object}    [optionNotValidErrors]  - Object of custom error strings if valid values fails.
		 *
		 * @return  {Object}                            - Combined object from options and default objects.
		 */

		createOptionsObject: function(defaultObject, options, validValues, optionNotValidErrors){
			var result = {};
			options = (options) ? options : {};

			for(var prop in defaultObject){
				if (Object.prototype.hasOwnProperty.call(defaultObject, prop)){
					var value = options[prop];

					if (typeof value !== "undefined"){
						if (validValues &&
							typeof validValues[prop] !== "undefined" &&
							validValues[prop].indexOf &&
							validValues[prop].indexOf(value) === -1){
							throw new Error(optionNotValidErrors && optionNotValidErrors[prop]) ? optionNotValidErrors[prop] : DEFAULT_OPTIONS_ERROR;
						}

						result[prop] = value;
					}
					else{
						result[prop] = defaultObject[prop];
					}
				}
			}

			return result;
		},

//********************************************************************************

		/**
		 * Static method for comparing a set of properties on two objects. The method returns false if the
		 * properties in the propertiesToCompare Array are missing, or if they are not equal.
		 *
		 * @param {Object}      object1             - Object we want to compare.
		 * @param {Object}      object2             - Object we want to compare.
		 * @param {String[]}    propertiesToCompare - Array of strings with names of the properties we want to compare.
		 *
		 * @returns {Boolean}
		 */

		compareObjectProperties: function(object1, object2, propertiesToCompare){
			var prop;

			if(!object1 || !object2 || Object.prototype.toString.call(propertiesToCompare) !== "[object Array]"){
				return false;
			}

			for(var i = 0, length = propertiesToCompare.length; i < length; ++i){
				prop = propertiesToCompare[i];

				if (!Object.prototype.hasOwnProperty.call(object1, prop) ||
					!Object.prototype.hasOwnProperty.call(object2, prop) ||
					object1[prop] !== object2[prop]){
					return false;
				}
			}

			return true;
		}
	};

}(window.Oxx));