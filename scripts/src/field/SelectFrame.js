const $ = jQuery

export default class SelectFrame {
  constructor(settings) {
    let postId = acf.get('post_id')
    
    if (!$.isNumeric(postId))
      postId = 0

    this.settings = {
      mode: 'select',   // 'select', 'edit'
      title: '',        // 'Upload Image'
      button: '',       // 'Select Image'
      type: '',         // 'image', ''
      field: '',        // 'field_123'
      mime_types: '',   // 'pdf, etc'
      library: 'all',   // 'all', 'uploadedTo'
      multiple: false,  // false, true, 'add'
      attachment: 0,    // the attachment to edit
      post_id: postId,  // the post being edited
      select: function () {},
      ...settings
    }
    
    if (this.settings.id)
      this.settings.attachment = this.settings.id
    
    this.createFrame()
    
    acf.media.frames.push(this.frame)

    return this
  }
  createFrame = () => {
    const attributes = acf.media._get_media_frame_settings({
      title: this.settings.title,
      multiple: this.settings.multiple,
      library: {},
      states: [],
    }, this.settings)

    if (this.settings.hasOwnProperty('mime_types'))
      attributes.library.type = this._getLibraryTypes()

    const Query = wp.media.query(attributes.library)
    
    if (acf.isset(Query, 'mirroring', 'args'))
      Query.mirroring.args._acfuploader = this.settings.field
    
    attributes.states = [
      new wp.media.controller.Library({
        library: Query,
        multiple: attributes.multiple,
        title: attributes.title,
        priority: 20,
        filterable: 'all',
        editable: true,
        allowLocalEdits: true
      })
    ]
    
    if (acf.isset(wp, 'media', 'controller', 'EditImage'))
      attributes.states.push(new wp.media.controller.EditImage())
    
    this.frame = wp.media(attributes)
    this.frame.uploader.options.uploader.params.allowed_extensions = this.settings.mime_types
    this.frame.acf = this.settings
    this.addEvents()
    this.frame = acf.media._add_media_frame_events(this.frame, this.settings)
  }
  addEvents = () => {
    this.frame.on('content:activate:browse', () => {
      const toolbar = this.frame.content.get().toolbar
      const filters = toolbar.get('filters')
      
      filters.filters.all.text = acf._e('audioVideo', 'all')

      delete filters.filters.uploaded
      delete filters.filters.audio
      delete filters.filters.video
      delete filters.filters.image
      
      $.each(filters.filters, (k, filter) => {
        if (filter.props.type === null)
          filter.props.type = this.settings.type
      })
    })
  }
  open = () => {
    setTimeout(() =>
      this.frame.open()
    )

    return this
  }
  _getLibraryTypes = () => {
    const allowedTypes = this.settings.mime_types.split(',').map(t => t.trim())
    const generalType = this.settings.type instanceof String
      ? this.settings.type
      : 'video'

    const libraryTypes = allowedTypes.map(ext =>
      acf.fields.audioVideo.__getMime(generalType, ext)
    )

    /* allow both audio/ogg and video/ogg */
    if (this.settings.type instanceof Array && allowedTypes.indexOf('ogg') > -1)
      libraryTypes.push('audio/ogg')

    return libraryTypes
  }
}