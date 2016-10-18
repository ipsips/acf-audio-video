const $ = jQuery

$(document).ready(() => {
  let loadedContent;
  const modal = new wp.media.view.Modal({
    controller: { trigger: () => {} },
    attributes: { id: 'acf-audio-video-return-format-help' }
  })
  const ModalContentView = wp.Backbone.View.extend({
    initialize: function () {
      if (!loadedContent)
        this.templateFetch = new Promise(fulfill =>
          $.post(ajaxurl, {
            action: 'get_acf_audio_video_return_format_help'
          }, content => {
            loadedContent = content
            fulfill(content)
          })
        )
    },
    render: function () {
      const view = this

      if (loadedContent)
        view.$el.html(loadedContent)
      else {
        view.$el.html('<div class="loading"><div class="spinner is-active"></div></div>')
        this.templateFetch.then(content =>
          view.$el.html(content)
        )
      }
    }
  })
  
  $(document).on('click', '#acf-audio-video-return-format-help-btn', () => {
    modal.content(new ModalContentView())
    modal.open()
  })
})