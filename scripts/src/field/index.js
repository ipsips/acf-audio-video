import SelectFrame from './SelectFrame'

const $ = jQuery

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
  focus: function () {
    this.$el = this.$field.find('.acf-audio-video-uploader')
    this.$inputContainer = this.$el.find('.acf-hidden')
    this.$playerContainer = this.$el.find('.player-container')
    this.o = acf.get_data(this.$el)
    this.allowedTypes = this.o.allowed_types.split(',').map(t => t.trim())
    this.selectFrameType = !this.o.general_type || this.o.general_type == 'both'
      ? ['audio', 'video']
      : this.o.general_type
    this.inputName = this.__getInputName()
  },
  __getInputName: function () {
    return this.$inputContainer.children(':first').attr('name')
  },
  initialize: function () {
    /* noop */
  },
  __getTag: function (attributes) {
    if (typeof attributes === 'undefined') { return this.o.general_type }
    return this.o.general_type && this.o.general_type !== 'both'
      ? this.o.general_type
      : this.__guessTag(attributes)
  },
  __guessTag: function (attributes) {
    for (let i = 0; i < this.allowedTypes.length; i++)
      if (attributes[this.allowedTypes[i]]) {
        return this.o.audio_types.indexOf(this.allowedTypes[i]) > -1
          ? 'audio'
          : 'video'
      }

    return 'video'
  },
  render: function ({ tag, nextAttributes, prevAttributes }) {
    const sources = ( tag && tag != undefined ) 
      ? this.__getSources(tag, nextAttributes)
      : []

    this.$playerContainer.empty().removeClass('audio video')
    this.$inputContainer.empty()
    if (sources.length) {
      const $mediaElement = this.$playerContainer
        .addClass(tag)
        .html(this.__getPlayerMarkup(tag, nextAttributes, sources))
        .find(tag)

      new MediaElementPlayer($mediaElement[0])
      
      Object.keys(nextAttributes).forEach(name =>
        this.__insertHiddenInput(name, nextAttributes[name])
      )
      this.$el.addClass('has-value')
    } else {
      this.__insertHiddenInput()
      this.$el.removeClass('has-value')
    }

    this.__triggerChange(prevAttributes, nextAttributes);
  },
  __getSources: function (tag, attributes) {
    return this.allowedTypes.reduce(
      (sources, ext) =>
        attributes[ext]
          ? sources.concat({
              type: this.__getMime(tag, ext),
              src: attributes[ext]
            })
          : sources,
      []
    )
  },
  __getMime: function (tag, ext) {
    switch(ext) {
      case 'mp3':
        return 'audio/mpeg'
      case 'wav':
        return 'audio/wav'
      case 'mp4':
      case 'm4v':
        return 'video/mp4'
      case 'webm':
        return 'video/webm'
      case 'ogv':
        return 'video/ogg'
      case 'ogg':
        return `${tag}/ogg`
      case 'flv':
        return 'video/flv'
      default:
        return `${tag}/${ext}`
    }
  },
  __getPlayerMarkup: function (tag, attributes, sources) {
    const atts = this.__getTagAtts(tag, attributes)
    const height = tag == 'video'
      ? 'height="360"'
      : ''

    return `<div class="wp-${tag}">
      <!--[if lt IE 9]><script>document.createElement('${tag}');</script><![endif]-->
      <${tag} class="wp-${tag}-shortcode" width="640" ${height} ${atts} controls>
        ${sources.map(({ type, src }) =>
          `<source type="${type}" src="${src}?_=1"/>`
        )}
      </${tag}>
    </div>`
  },
  __getTagAtts: function (tag, attributes) {
    const defaults = this.o.playerDefaults[tag]

    return Object
      .keys(defaults).concat('poster')
      .reduce(
        (atts, name) =>
          attributes.hasOwnProperty(name)
            ? `${atts} ${name}="${attributes[name]}"`
            : atts,
        ''
      )
  },
  __insertHiddenInput: function (attName, value) {
    const { key } = this.$field.data()
    const name = !attName
      ? this.inputName
      : `${this.inputName}[${attName}]`

    $('<input type="hidden">')
      .attr({ name, value })
      .appendTo(this.$inputContainer)
  },
  __triggerChange: function (prevAttributes, nextAttributes) {
    /* register unsaved changes */
    if (!prevAttributes || !_.isEqual(prevAttributes, nextAttributes))
      this.$inputContainer.children(':first').trigger('change')
  },
  add: function () {
    let $field = this.$field
    const $repeater = acf.get_closest_field($field, 'repeater')
    const multiple = $repeater.exists()
    this.selectFrame = new SelectFrame({
      title: acf._e('audioVideo', 'select'),
      mode: 'select',
      type: this.selectFrameType,
      field: $field.data('key'),
      multiple,
      library: this.o.library,
      mime_types: this.o.allowed_types,
      select: (attachment, idx) => {
        /* Populate subsequent fields of this kind
         * if this field is in a repeater field and
         * user has selected multiple files.
         */
        let $row = multiple && $field.closest('.acf-row')
        
        if (idx > 0) {
          const key = $field.data('key')
          
          $field = false

          // find next field
          $row.nextAll('.acf-row:visible').each((idx, el) => {
            $field = acf.get_field(key, $(el))
            
            if (!$field)
              return
            
            // bail early if next file uploader has value
            if ($field.find('.acf-file-uploader.has-value').exists()) {
              $field = false
              return
            } 
              
            // end loop if $next is found
            return false
          })
          
          // add extra row if next is not found
          if (!$field) {
            $row = acf.fields.repeater.doFocus($repeater).add()
            
            // bail early if no $row (maximum rows hit)
            if (!$row)
              return false
            
            // get next $field
            $field = acf.get_field(key, $row)
          }
        }

        const ext = attachment.attributes.url.toLowerCase().split('.').pop()
        const nextAttributes = { [ext]: attachment.attributes.url }
        const tag = this.__getTag(nextAttributes)
      
        if (
          attachment.attributes.image &&
          attachment.attributes.image.src &&
          !/wp-includes\/images\/media\/(audio|video).png$/.test(attachment.attributes.image.src)
        )
          nextAttributes.poster = attachment.attributes.image.src

        const args = { tag, nextAttributes }

        this.set('$field', $field).render(args)
      }
    }).open()
  },
  edit: function () {
    const prevAttributes = this.__getAttributesFromInputs()
    const tag = this.__getTag(prevAttributes)
    const shortcode = this.__getShortcode(tag, prevAttributes)

    if (shortcode) {
      const editFrame = wp.media[tag].edit(shortcode).open()

      editFrame.on('close', () => {
        const nextAttributes = this.__getNextAttributes(tag, editFrame.media.attributes)
        const $repeater = acf.get_closest_field(this.$field, 'repeater')
        const args = { tag, nextAttributes, prevAttributes }
        
        this.render(args)
        editFrame.detach()
      })
    }
  },
  __getAttributesFromInputs: function () {
    return this.$inputContainer
      .children()
      .toArray()
      .reduce((attributes, el) => {
        const name = el.getAttribute('name').replace(/.*\[(.*)\]$/, '$1')
        const value = el.getAttribute('value')

        return {
          ...attributes,
          [name]: value
        }
      }, {})
  },
  __getShortcode: function (tag, attributes) {
    const atts = Object
      .keys(attributes)
      .reduce(
        (atts, name) =>
          `${atts} ${name}="${attributes[name]}"`,
        ''
      )
      
    return atts && `[${tag} ${atts}][/${tag}]`
  },
  __getNextAttributes: function (tag, frameAttributes) {
    const defaults = this.o.playerDefaults[tag]
    const nextAttributes = {}

    if (frameAttributes.poster)
      nextAttributes.poster = frameAttributes.poster

    Object.keys(defaults).forEach(name => {
      if (frameAttributes[name] != defaults[name])
        nextAttributes[name] = frameAttributes[name]
    })

    this.allowedTypes.forEach(ext => {
      if (frameAttributes[ext])
        nextAttributes[ext] = frameAttributes[ext]
    })

    return nextAttributes
  },
  remove: function () {
    this.render({})
  }
})

/* auto-bind context to custom helper methods */
Object.keys(acf.fields.audioVideo).forEach(prop => {
  if (/^__/.test(prop))
    acf.fields.audioVideo[prop] = acf.fields.audioVideo[prop].bind(acf.fields.audioVideo)
})