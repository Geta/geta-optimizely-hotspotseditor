/* jshint -W099 */
/* global jQuery:false */
(function($, Oxx){

	"use strict";

//********************************************************************************
//*NAMESPACES ********************************************************************
//********************************************************************************

	Oxx = window.Oxx = (!Oxx) ? {} : Oxx;

//********************************************************************************
//*STATIC CLASS VARIABLES*********************************************************
//********************************************************************************

	Oxx.AjaxUtils = {

		sitePath: '/',
		language: undefined,

		url: function(controller, action) {
			return this.sitePath + (this.language ? this.language + '/' : '') + controller + '/' + action;
		},

		ajax: function(url, data, onSuccess, method, returnType) {
			$.ajax(url, {
				data: data,
				type: method,
				dataType: returnType,
				success: onSuccess,
				error: this.failureResponse.bind(this)
			});
		},

		failureResponse: function(jqXHR, textStatus, errorThrown) {
			window.alert(jqXHR.statusText);
		}

	};


}(jQuery, window.Oxx));