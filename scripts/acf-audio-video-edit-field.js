/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	'use strict';
	
	var $ = jQuery;
	
	$(document).ready(function () {
	  var loadedContent = void 0;
	  var modal = new wp.media.view.Modal({
	    controller: { trigger: function trigger() {} },
	    attributes: { id: 'acf-audio-video-return-format-help' }
	  });
	  var ModalContentView = wp.Backbone.View.extend({
	    initialize: function initialize() {
	      if (!loadedContent) this.templateFetch = new Promise(function (fulfill) {
	        return $.post(ajaxurl, {
	          action: 'get_acf_audio_video_return_format_help'
	        }, function (content) {
	          loadedContent = content;
	          fulfill(content);
	        });
	      });
	    },
	    render: function render() {
	      var view = this;
	
	      if (loadedContent) view.$el.html(loadedContent);else {
	        view.$el.html('<div class="loading"><div class="spinner is-active"></div></div>');
	        this.templateFetch.then(function (content) {
	          return view.$el.html(content);
	        });
	      }
	    }
	  });
	
	  $(document).on('click', '#acf-audio-video-return-format-help-btn', function () {
	    modal.content(new ModalContentView());
	    modal.open();
	  });
	});

/***/ })
/******/ ]);
//# sourceMappingURL=acf-audio-video-edit-field.js.map