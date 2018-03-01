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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _SelectFrame = __webpack_require__(1);
	
	var _SelectFrame2 = _interopRequireDefault(_SelectFrame);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	var $ = jQuery;
	
	acf.fields.audioVideo = acf.field.extend({
	  type: 'audioVideo',
	  $el: null,
	  actions: {
	    'ready': 'initialize',
	    'append': 'initialize'
	  },
	  events: {
	    'click a[data-name="add"]': 'add',
	    'click a[data-name="edit"]': 'edit',
	    'click a[data-name="remove"]': 'remove'
	  },
	  focus: function focus() {
	    this.$el = this.$field.find('.acf-audio-video-uploader');
	    this.$inputContainer = this.$el.find('.acf-hidden');
	    this.$playerContainer = this.$el.find('.player-container');
	    this.o = acf.get_data(this.$el);
	    this.allowedTypes = this.o.allowed_types.split(',').map(function (t) {
	      return t.trim();
	    });
	    this.selectFrameType = !this.o.general_type || this.o.general_type == 'both' ? ['audio', 'video'] : this.o.general_type;
	    this.inputName = this.__getInputName();
	  },
	  __getInputName: function __getInputName() {
	    return this.$inputContainer.children(':first').attr('name');
	  },
	  initialize: function initialize() {
	    /* noop */
	  },
	  __getTag: function __getTag(attributes) {
	    if (typeof attributes === 'undefined') {
	      return this.o.general_type;
	    }
	    return this.o.general_type && this.o.general_type !== 'both' ? this.o.general_type : this.__guessTag(attributes);
	  },
	  __guessTag: function __guessTag(attributes) {
	    for (var i = 0; i < this.allowedTypes.length; i++) {
	      if (attributes[this.allowedTypes[i]]) {
	        return this.o.audio_types.indexOf(this.allowedTypes[i]) > -1 ? 'audio' : 'video';
	      }
	    }return 'video';
	  },
	  render: function render(_ref) {
	    var _this = this;
	
	    var tag = _ref.tag,
	        nextAttributes = _ref.nextAttributes,
	        prevAttributes = _ref.prevAttributes;
	
	    var sources = tag && tag != undefined ? this.__getSources(tag, nextAttributes) : [];
	
	    this.$playerContainer.empty().removeClass('audio video');
	    this.$inputContainer.empty();
	    if (sources.length) {
	      var $mediaElement = this.$playerContainer.addClass(tag).html(this.__getPlayerMarkup(tag, nextAttributes, sources)).find(tag);
	
	      new MediaElementPlayer($mediaElement[0]);
	
	      Object.keys(nextAttributes).forEach(function (name) {
	        return _this.__insertHiddenInput(name, nextAttributes[name]);
	      });
	      this.$el.addClass('has-value');
	    } else {
	      this.__insertHiddenInput();
	      this.$el.removeClass('has-value');
	    }
	
	    this.__triggerChange(prevAttributes, nextAttributes);
	  },
	  __getSources: function __getSources(tag, attributes) {
	    var _this2 = this;
	
	    return this.allowedTypes.reduce(function (sources, ext) {
	      return attributes[ext] ? sources.concat({
	        type: _this2.__getMime(tag, ext),
	        src: attributes[ext]
	      }) : sources;
	    }, []);
	  },
	  __getMime: function __getMime(tag, ext) {
	    switch (ext) {
	      case 'mp3':
	        return 'audio/mpeg';
	      case 'wav':
	        return 'audio/wav';
	      case 'mp4':
	      case 'm4v':
	        return 'video/mp4';
	      case 'webm':
	        return 'video/webm';
	      case 'ogv':
	        return 'video/ogg';
	      case 'ogg':
	        return tag + '/ogg';
	      case 'flv':
	        return 'video/flv';
	      default:
	        return tag + '/' + ext;
	    }
	  },
	  __getPlayerMarkup: function __getPlayerMarkup(tag, attributes, sources) {
	    var atts = this.__getTagAtts(tag, attributes);
	    var height = tag == 'video' ? 'height="360"' : '';
	
	    return '<div class="wp-' + tag + '">\n      <!--[if lt IE 9]><script>document.createElement(\'' + tag + '\');</script><![endif]-->\n      <' + tag + ' class="wp-' + tag + '-shortcode" width="640" ' + height + ' ' + atts + ' controls>\n        ' + sources.map(function (_ref2) {
	      var type = _ref2.type,
	          src = _ref2.src;
	      return '<source type="' + type + '" src="' + src + '?_=1"/>';
	    }) + '\n      </' + tag + '>\n    </div>';
	  },
	  __getTagAtts: function __getTagAtts(tag, attributes) {
	    var defaults = this.o.playerDefaults[tag];
	
	    return Object.keys(defaults).concat('poster').reduce(function (atts, name) {
	      return attributes.hasOwnProperty(name) ? atts + ' ' + name + '="' + attributes[name] + '"' : atts;
	    }, '');
	  },
	  __insertHiddenInput: function __insertHiddenInput(attName, value) {
	    var _$field$data = this.$field.data(),
	        key = _$field$data.key;
	
	    var name = !attName ? this.inputName : this.inputName + '[' + attName + ']';
	
	    $('<input type="hidden">').attr({ name: name, value: value }).appendTo(this.$inputContainer);
	  },
	  __triggerChange: function __triggerChange(prevAttributes, nextAttributes) {
	    /* register unsaved changes */
	    if (!prevAttributes || !_.isEqual(prevAttributes, nextAttributes)) this.$inputContainer.children(':first').trigger('change');
	  },
	  add: function add() {
	    var _this3 = this;
	
	    var $field = this.$field;
	    var $repeater = acf.get_closest_field($field, 'repeater');
	    var multiple = $repeater.exists();
	    this.selectFrame = new _SelectFrame2.default({
	      title: acf._e('audioVideo', 'select'),
	      mode: 'select',
	      type: this.selectFrameType,
	      field: $field.data('key'),
	      multiple: multiple,
	      library: this.o.library,
	      mime_types: this.o.allowed_types,
	      select: function select(attachment, idx) {
	        /* Populate subsequent fields of this kind
	         * if this field is in a repeater field and
	         * user has selected multiple files.
	         */
	        var $row = multiple && $field.closest('.acf-row');
	
	        if (idx > 0) {
	          var key = $field.data('key');
	
	          $field = false;
	
	          // find next field
	          $row.nextAll('.acf-row:visible').each(function (idx, el) {
	            $field = acf.get_field(key, $(el));
	
	            if (!$field) return;
	
	            // bail early if next file uploader has value
	            if ($field.find('.acf-file-uploader.has-value').exists()) {
	              $field = false;
	              return;
	            }
	
	            // end loop if $next is found
	            return false;
	          });
	
	          // add extra row if next is not found
	          if (!$field) {
	            $row = acf.fields.repeater.doFocus($repeater).add();
	
	            // bail early if no $row (maximum rows hit)
	            if (!$row) return false;
	
	            // get next $field
	            $field = acf.get_field(key, $row);
	          }
	        }
	
	        var ext = attachment.attributes.url.toLowerCase().split('.').pop();
	        var nextAttributes = _defineProperty({}, ext, attachment.attributes.url);
	        var tag = _this3.__getTag(nextAttributes);
	
	        if (attachment.attributes.image && attachment.attributes.image.src && !/wp-includes\/images\/media\/(audio|video).png$/.test(attachment.attributes.image.src)) nextAttributes.poster = attachment.attributes.image.src;
	
	        var args = { tag: tag, nextAttributes: nextAttributes };
	
	        _this3.set('$field', $field).render(args);
	      }
	    }).open();
	  },
	  edit: function edit() {
	    var _this4 = this;
	
	    var prevAttributes = this.__getAttributesFromInputs();
	    var tag = this.__getTag(prevAttributes);
	    var shortcode = this.__getShortcode(tag, prevAttributes);
	
	    if (shortcode) {
	      var editFrame = wp.media[tag].edit(shortcode).open();
	
	      editFrame.on('close', function () {
	        var nextAttributes = _this4.__getNextAttributes(tag, editFrame.media.attributes);
	        var $repeater = acf.get_closest_field(_this4.$field, 'repeater');
	        var args = { tag: tag, nextAttributes: nextAttributes, prevAttributes: prevAttributes };
	
	        _this4.render(args);
	        editFrame.detach();
	      });
	    }
	  },
	  __getAttributesFromInputs: function __getAttributesFromInputs() {
	    return this.$inputContainer.children().toArray().reduce(function (attributes, el) {
	      var name = el.getAttribute('name').replace(/.*\[(.*)\]$/, '$1');
	      var value = el.getAttribute('value');
	
	      return _extends({}, attributes, _defineProperty({}, name, value));
	    }, {});
	  },
	  __getShortcode: function __getShortcode(tag, attributes) {
	    var atts = Object.keys(attributes).reduce(function (atts, name) {
	      return atts + ' ' + name + '="' + attributes[name] + '"';
	    }, '');
	
	    return atts && '[' + tag + ' ' + atts + '][/' + tag + ']';
	  },
	  __getNextAttributes: function __getNextAttributes(tag, frameAttributes) {
	    var defaults = this.o.playerDefaults[tag];
	    var nextAttributes = {};
	
	    if (frameAttributes.poster) nextAttributes.poster = frameAttributes.poster;
	
	    Object.keys(defaults).forEach(function (name) {
	      if (frameAttributes[name] != defaults[name]) nextAttributes[name] = frameAttributes[name];
	    });
	
	    this.allowedTypes.forEach(function (ext) {
	      if (frameAttributes[ext]) nextAttributes[ext] = frameAttributes[ext];
	    });
	
	    return nextAttributes;
	  },
	  remove: function remove() {
	    this.render({});
	  }
	});
	
	/* auto-bind context to custom helper methods */
	Object.keys(acf.fields.audioVideo).forEach(function (prop) {
	  if (/^__/.test(prop)) acf.fields.audioVideo[prop] = acf.fields.audioVideo[prop].bind(acf.fields.audioVideo);
	});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var $ = jQuery;
	
	var SelectFrame = function SelectFrame(settings) {
	  var _this = this;
	
	  _classCallCheck(this, SelectFrame);
	
	  this.createFrame = function () {
	    var attributes = acf.media._get_media_frame_settings({
	      title: _this.settings.title,
	      multiple: _this.settings.multiple,
	      library: {},
	      states: []
	    }, _this.settings);
	
	    if (_this.settings.hasOwnProperty('mime_types')) attributes.library.type = _this._getLibraryTypes();
	
	    var Query = wp.media.query(attributes.library);
	
	    if (acf.isset(Query, 'mirroring', 'args')) Query.mirroring.args._acfuploader = _this.settings.field;
	
	    attributes.states = [new wp.media.controller.Library({
	      library: Query,
	      multiple: attributes.multiple,
	      title: attributes.title,
	      priority: 20,
	      filterable: 'all',
	      editable: true,
	      allowLocalEdits: true
	    })];
	
	    if (acf.isset(wp, 'media', 'controller', 'EditImage')) attributes.states.push(new wp.media.controller.EditImage());
	
	    _this.frame = wp.media(attributes);
	    _this.frame.uploader.options.uploader.params.allowed_extensions = _this.settings.mime_types;
	    _this.frame.acf = _this.settings;
	    _this.addEvents();
	    _this.frame = acf.media._add_media_frame_events(_this.frame, _this.settings);
	  };
	
	  this.addEvents = function () {
	    _this.frame.on('content:activate:browse', function () {
	      var toolbar = _this.frame.content.get().toolbar;
	      var filters = toolbar.get('filters');
	
	      filters.filters.all.text = acf._e('audioVideo', 'all');
	
	      delete filters.filters.uploaded;
	      delete filters.filters.audio;
	      delete filters.filters.video;
	      delete filters.filters.image;
	
	      $.each(filters.filters, function (k, filter) {
	        if (filter.props.type === null) filter.props.type = _this.settings.type;
	      });
	    });
	  };
	
	  this.open = function () {
	    setTimeout(function () {
	      return _this.frame.open();
	    });
	
	    return _this;
	  };
	
	  this._getLibraryTypes = function () {
	    var allowedTypes = _this.settings.mime_types.split(',').map(function (t) {
	      return t.trim();
	    });
	    var generalType = _this.settings.type instanceof String ? _this.settings.type : 'video';
	
	    var libraryTypes = allowedTypes.map(function (ext) {
	      return acf.fields.audioVideo.__getMime(generalType, ext);
	    });
	
	    /* allow both audio/ogg and video/ogg */
	    if (_this.settings.type instanceof Array && allowedTypes.indexOf('ogg') > -1) libraryTypes.push('audio/ogg');
	
	    return libraryTypes;
	  };
	
	  var postId = acf.get('post_id');
	
	  if (!$.isNumeric(postId)) postId = 0;
	
	  this.settings = _extends({
	    mode: 'select', // 'select', 'edit'
	    title: '', // 'Upload Image'
	    button: '', // 'Select Image'
	    type: '', // 'image', ''
	    field: '', // 'field_123'
	    mime_types: '', // 'pdf, etc'
	    library: 'all', // 'all', 'uploadedTo'
	    multiple: false, // false, true, 'add'
	    attachment: 0, // the attachment to edit
	    post_id: postId, // the post being edited
	    select: function select() {}
	  }, settings);
	
	  if (this.settings.id) this.settings.attachment = this.settings.id;
	
	  this.createFrame();
	
	  acf.media.frames.push(this.frame);
	
	  return this;
	};
	
	exports.default = SelectFrame;

/***/ })
/******/ ]);
//# sourceMappingURL=acf-audio-video-field.js.map