<?php

if (!defined('ABSPATH'))
  exit;

class ACF_AudioVideo_Field extends acf_field {
  function __construct($settings) {
    $this->name = 'audioVideo';
    $this->label = __('Audio/Video', 'acf-audio-video');
    $this->category = 'content';
    $this->defaults = [
      'library' => 'all',
      'general_type' => 'both',
      'allowed_types' => '',
      'min_size' => 0,
      'max_size' => 0,
      'return_format' => 'html'
    ];
    /**
     * @see wp-includes/js/media-audiovideo.js
     */
    $this->playerDefaults = [
      'audio' => [
        'loop' => 0,
        'autoplay' => 0,
        'preload' => 'none'
      ],
      'video' => [
        'loop' => 0,
        'autoplay' => 0,
        'preload' => 'metadata'
      ]
    ];
    /**
     * See https://codex.wordpress.org/Function_Reference/wp_video_shortcode
     * and https://codex.wordpress.org/Function_Reference/wp_audio_shortcode
     * for WP default supported file extensions.
     *
     * Tested:
     * mp3: ✓
     * ogg: ✓
     * wma: ✗
     * m4a: ✗
     * wav: ✓
     * mp4: ✓
     * m4v: ✓
     * webm: ✓
     * ogv: ✓
     * wmv: ✗
     * flv: ✓
     */
    $this->types = [
      'audio' => 'mp3, ogg, wav', // 'mp3, ogg, wma, m4a, wav',
      'video' => 'mp4, m4v, webm, ogv, flv' // 'mp4, m4v, webm, ogv, wmv, flv'
    ];
    $this->l10n = [
      'all' => __('All audio/video files', 'acf-audio-video'),
      'edit' => __('Edit Audio/Video', 'acf-audio-video'),
      'select' => __('Select Audio/Video', 'acf-audio-video'),
      'update' => __('Update Audio/Video', 'acf-audio-video')
    ];
    $this->l10n_audio = [
      'all' => __('All audios', 'acf-audio-video'),
      'edit' => __('Edit Audio', 'acf-audio-video'),
      'select' => __('Select Audio', 'acf-audio-video'),
      'update' => __('Update Audio', 'acf-audio-video')
    ];
    $this->l10n_video = [
      'all' => __('All videos', 'acf-audio-video'),
      'edit' => __('Edit Video', 'acf-audio-video'),
      'select' => __('Select Video', 'acf-audio-video'),
      'update' => __('Update Video', 'acf-audio-video')
    ];
    $this->settings = $settings;
    $this->image_sizes = get_intermediate_image_sizes();
    $this->upload_dir_paths = wp_upload_dir();
    
    add_action('wp_ajax_get_acf_audio_video_return_format_help', [$this, 'get_return_format_help']);
    add_filter('get_media_item_args', [$this, 'get_media_item_args']);
    add_filter('wp_prepare_attachment_for_js', [$this, 'wp_prepare_attachment_for_js'], 10, 3);
    
    parent::__construct();
  }
  
  function render_field_settings($field) {
    /* clear numeric settings */
    $clear = ['min_size', 'max_size'];
    
    foreach ($clear as $k)
      if (empty($field[$k]))
        $field[$k] = '';
    
    /* library */
    acf_render_field_setting($field, [
      'label' => __('Library', 'acf-audio-video'),
      'instructions' => __('Limit the media library choice.', 'acf-audio-video'),
      'type' => 'radio',
      'name' => 'library',
      'layout' => 'horizontal',
      'choices' => [
        'all' => __('All', 'acf-audio-video'),
        'uploadedTo' => __('Uploaded to post', 'acf-audio-video')
      ]
    ]);

    /* type */
    acf_render_field_setting($field, [
      'label' => __('Type', 'acf-audio-video'),
      'type' => 'radio',
      'name' => 'general_type',
      'choices' => [
        'both' => __('Both', 'acf-audio-video'),
        'audio' => __('Audio', 'acf-audio-video'),
        'video' => __('Video', 'acf-audio-video')
      ],
      'layout' => 'horizontal'
    ]);

    /* allowed types */
    acf_render_field_setting($field, [
      'label' => __('Allowed file types', 'acf-audio-video'),
      'instructions' =>
        __('Comma separated list to further narrow the allowed file types. Leave blank to honour the general type setting above. Any non-media extension (not listed below) will be ignored.', 'acf-audio-video')
        .'<br><br>'.
        sprintf(
          __('Valid extensions are %s for audio and %s for video.', 'acf-audio-video'),
          implode(', ', array_map(function ($ext) { return "<code>$ext</code>"; }, explode(', ', $this->types['audio']))),
          implode(', ', array_map(function ($ext) { return "<code>$ext</code>"; }, explode(', ', $this->types['video'])))
        ),
      'instructions_placement' => 'field',
      'type' => 'text',
      'name' => 'allowed_types',
    ]);
    
    /* min */
    acf_render_field_setting($field, [
      'label' => __('Minimum', 'acf-audio-video'),
      'instructions' => __('Restrict which files can be uploaded.', 'acf-audio-video'),
      'type' => 'text',
      'name' => 'min_size',
      'prepend' => __('File size', 'acf-audio-video'),
      'append' => 'MB'
    ]);
    
    /* max */
    acf_render_field_setting($field, [
      'label' => __('Maximum', 'acf-audio-video'),
      'instructions' => __('Restrict which files can be uploaded.', 'acf-audio-video'),
      'type' => 'text',
      'name' => 'max_size',
      'prepend' => __('File size', 'acf-audio-video'),
      'append' => 'MB'
    ]);

    /* return_format */
    acf_render_field_setting($field, [
      'label' => __('Return Value', 'acf-audio-video'),
      'instructions' => __('Specify the returned value on front end.', 'acf-audio-video').' <i id="acf-audio-video-return-format-help-btn"></i>',
      'type' => 'radio',
      'name' => 'return_format',
      'layout' => 'horizontal',
      'choices' => [
        'html' => __('Player HTML', 'acf-audio-video'),
        'array' => __('Detailed Array', 'acf-audio-video'),
        'shortcode' => __('Shortcode', 'acf-audio-video')
      ]
    ]);
  }
  
  function render_field($field) {
    $general_type = !empty($field['general_type']) ? $field['general_type'] : $this->defaults['general_type'];
    $div = [
      'class'=> 'acf-audio-video-uploader acf-cf',
      'data-library' => $field['library'],
      'data-general_type' => $general_type,
      'data-audio_types' => $this->types['audio'],
      'data-video_types' => $this->types['video'],
      'data-allowed_types' => $this->_get_allowed_types($field),
      'data-player-defaults' => $this->playerDefaults,
      'data-uploader' => 'wp'
    ];
    $tag = '';

    if ($field['value'] && count($field['value'])) {
      $div['class'].= ' has-value';
      $tag = $this->_get_tag($field);
      $atts = $field['value'];
      unset($atts['autoplay']);
      $player = $tag == 'audio'
        ? '<div class="wp-audio">'.wp_audio_shortcode($atts).'</div>'
        : wp_video_shortcode($atts);
      $inputs = '';

      foreach ($field['value'] as $name => $value)
        $inputs.= acf_get_hidden_input([
          'name' => $field['name']."[$name]",
          'value' => $value
        ]);

    } else {
      $player = '';
      $inputs = acf_get_hidden_input([ 'name' => $field['name'] ]);
    }

    if ($general_type == 'both') {
      $label_none_selected = __('No audio/video selected', 'acf-audio-video');
      $label_add = __('Add Audio/Video', 'acf-audio-video');
    } else {
      $label_none_selected = sprintf(__('No %s selected', 'acf-audio-video'), $general_type);
      $label_add = sprintf(__('Add %s', 'acf-audio-video'), ucfirst($general_type));
      $this->l10n = $this->{"l10n_$general_type"};
    }
    acf_enqueue_uploader();

    ?>
      <div <?php acf_esc_attr_e($div); ?>>
        <div class="acf-hidden">
          <?php echo $inputs; ?>
        </div>
        <div class="view show-if-value acf-soh">
          <div class="player-container <?php echo $tag; ?>">
            <?php echo $player; ?>
          </div>
          <ul class="acf-hl acf-soh-target">
            <li><a class="acf-icon -pencil" data-name="edit" href="#" title="<?php _e('Edit', 'acf-audio-video'); ?>"></a></li>
            <li><a class="acf-icon -cancel" data-name="remove" href="#" title="<?php _e('Remove', 'acf-audio-video'); ?>"></a></li>
          </ul>
        </div>
        <div class="view hide-if-value">
          <p style="margin:0;"><?php echo $label_none_selected; ?>
            <a data-name="add" class="acf-button button" href="#"><?php echo $label_add; ?></a>
          </p>
        </div>
      </div>
    <?php
  }

  function _get_tag($field) {
    if (array_key_exists('general_type', $field) && $field['general_type'] != 'both')
      return $field['general_type'];

    if (array_key_exists('value', $field)) {
      $all_types = explode(', ', $this->types['audio'].', '.$this->types['video']);

      foreach ($all_types as $ext)
        if (array_key_exists($ext, $field['value'])) {
          if (strpos($this->types['audio'], $ext) !== false)
            return 'audio';
          else
            return 'video';
        }
    }

    return 'video';
  }

  function _get_allowed_types($field) {
    $is_general_type_specified = array_key_exists('general_type', $field) && $field['general_type'] != 'both';

    if (!empty($field['allowed_types'])) {
      $valid_allowed_types = array_filter(
        explode(',', $field['allowed_types']),
        function ($ext) use ($is_general_type_specified, $field) {
          $ext = trim($ext);

          if ($is_general_type_specified)
            return strpos($this->types[$field['general_type']], $ext) !== false;
          else
            return strpos($this->types['audio'], $ext) !== false
                || strpos($this->types['video'], $ext) !== false;
        }
      );

      if (!empty($valid_allowed_types))
        return implode(',', $valid_allowed_types);
    }

    if ($is_general_type_specified)
      return $this->types[$field['general_type']];

    return $this->types['audio'].', '.$this->types['video'];
  }

  function load_value($value, $post_id, $field) {
    if (!is_array($value) || !count($value))
      return $value;

    if (is_admin()) {
      $this->_pluck_deleted_sources($value);
      return $value;
    }

    $tag = $this->_get_tag(array_merge($field, ['value' => $value]));

    switch ($field['return_format']) {
      case 'html':
        $this->_pluck_deleted_sources($value);
        return call_user_func("wp_{$tag}_shortcode", $value);
      case 'shortcode':
        $this->_pluck_deleted_sources($value);
        return $this->_get_shortcode($tag, $value);
      case 'array':
        $value['tag'] = $tag;
        $tag_types = explode(', ', $this->types[$tag]);
        
        /* sources */
        $all_types = explode(', ', $this->types['audio'].', '.$this->types['video']);
        foreach ($all_types as $ext)
          if (array_key_exists($ext, $value)) {
            if (in_array($ext, $tag_types)) {
              $source_id = $this->_get_attachment_id_from_url($value[$ext]);

              if (!empty($source_id) && $this->_post_exists($source_id)) {
                $source = acf_get_attachment($source_id);
                unset($source['sizes']);
                $value['sources'][] = $source;
              }
            }
            
            unset($value[$ext]);
          }
        
        /* poster */
        if (array_key_exists('poster', $value)) {
          $poster_url = $value['poster'];
          $poster_id = $this->_get_attachment_id_from_url($poster_url);

          if (!empty($poster_id))
            $value['poster'] = acf_get_attachment($poster_id);
        }

        /* settings */
        foreach ($this->playerDefaults[$tag] as $setting => $default)
          if (array_key_exists($setting, $value))
            $value['settings'][$setting] = $value[$setting];
          else
            $value['settings'][$setting] = $default;

        return $value;
    }
  }

  function _pluck_deleted_sources(&$value) {
    $all_types = explode(', ', $this->types['audio'].', '.$this->types['video']);

    foreach ($all_types as $ext)
      if (array_key_exists($ext, $value)) {
        $source_id = $this->_get_attachment_id_from_url($value[$ext]);

        if (empty($source_id) || !$this->_post_exists($source_id))
          unset($value[$ext]);
      }
  }

  function _post_exists($id) {
    global $wpdb;
    return (bool) $wpdb->get_row("SELECT * FROM $wpdb->posts WHERE id = '$id'");
  }

  function _get_shortcode($tag, $value) {
    $shortcode = "[$tag";
    
    foreach ($value as $name => $val)
      $shortcode.= " $name=\"$val\"";

    return $shortcode.']';
  }

  /* @source philipnewcomer.net/2012/11/get-the-attachment-id-from-an-image-url-in-wordpress/ */
  public function _get_attachment_id_from_url($attachment_url = '') {
    global $wpdb;
   
    if (empty($attachment_url))
      return;
   
    /* Make sure the upload path base directory
     * exists in the attachment URL, to verify
     * that we're working with a media library image
     */
    if (false === strpos($attachment_url, $this->upload_dir_paths['baseurl']))
      return;
    
    /* If this is the URL of an auto-generated thumbnail, get the URL of the original image */
    $attachment_url = preg_replace('/-\d+x\d+(?=\.(jpg|jpeg|png|gif)$)/i', '', $attachment_url);
    /* Remove the upload path base directory from the attachment URL */
    $attachment_url = str_replace($this->upload_dir_paths['baseurl'].'/', '', $attachment_url);
    
    return $wpdb->get_var(
      $wpdb->prepare(
        "SELECT wposts.ID FROM $wpdb->posts wposts, $wpdb->postmeta wpostmeta WHERE wposts.ID = wpostmeta.post_id AND wpostmeta.meta_key = '_wp_attached_file' AND wpostmeta.meta_value = '%s' AND wposts.post_type = 'attachment'",
        $attachment_url
      )
    );
  }

  function get_media_item_args($vars) {
    $vars['send'] = true;
    return $vars;
  }
  
  function wp_prepare_attachment_for_js($response, $attachment, $meta) {
    $fs = '0 kb';
    
    /* supress PHP warnings caused by corrupt images */
    if ($i = @filesize(get_attached_file($attachment->ID)))
      $fs = size_format($i);
    
    $response['filesize'] = $fs;

    return $response;
  }

  function input_admin_enqueue_scripts() {
    $min = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';
    
    wp_enqueue_style('wp-mediaelement');
    wp_enqueue_script('backbone');
    wp_enqueue_style('acf-audio-video-field-style', "{$this->settings['url']}styles/acf-audio-video-field{$min}.css", ['acf-input'], $this->settings['version']);
    wp_enqueue_script('acf-audio-video-field', "{$this->settings['url']}scripts/acf-audio-video-field{$min}.js", ['jquery', 'wp-mediaelement', 'acf-input'], $this->settings['version']);
  }

  function field_group_admin_enqueue_scripts() {
    $min = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

    wp_enqueue_media();
    wp_enqueue_style('acf-audio-video-edit-field-style', "{$this->settings['url']}styles/acf-audio-video-edit-field{$min}.css", [], $this->settings['version']);
    wp_enqueue_script('acf-audio-video-edit-field', "{$this->settings['url']}scripts/acf-audio-video-edit-field{$min}.js", ['jquery'], $this->settings['version']);
  }

  function get_return_format_help() {
    ?>
      <div class="media-frame-title">
        <h1><?php _e('Return Format', 'acf-audio-video') ?></h1>
      </div>
      <div class="media-frame-content">
        <div>
          <h2><?php _e('Player HTML', 'acf-audio-video') ?></h2>
          <p><?php _e('Returns html code of the media player which you may echo directly in your front-end template. The media player will be automatically initiated (by Wordpress\' built-in mediaelement.js)', 'acf-audio-video') ?></p>
          <p>
            <pre><code><?php ob_start() ?>

              <div class="wp-video">
                <!--[if lt IE 9]><script>document.createElement('video');</script><![endif]-->
                <video class="wp-video-shortcode" id="video-61-1" poster="poster_image_url" preload="metadata" controls>
                  <source type="video/mp4" src="mp4_file_url" />
                  <a href="mp4_file_url">fallback link to mp4_file_url (visible only to old browsers that don't support mediaelement.js)</a>
                </video>
              </div>

              <?php echo $this->_outdent_code(ob_get_clean())
            ?></code></pre>
          </p>
          <h2><?php _e('Shortcode', 'acf-audio-video') ?></h2>
          <p><?php printf(
            __('Wordpress <code>[audio]</code> or <code>[video]</code> shortcode (which you may pass through %sdo_shortcode()%s function to get the player html).', 'acf-audio-video'),
            '<a href="https://developer.wordpress.org/reference/functions/do_shortcode/" target="_blank">',
            '</a>'
          ) ?></p>
          <p><code>[video mp4="mp4_file_url" poster="poster_file_url"][/video]</code></p>
          <h2><?php _e('Detailed Array', 'acf-audio-video') ?></h2>
          <p><?php _e('An associative array bearing all fine details. This adds some computational load so use with caution.', 'acf-audio-video') ?></p>
          <p>
            <pre><code><?php ob_start() ?>

              Array(
                [tag] => video
                [sources] => Array(
                  [0] => Array(
                    [ID] => 999
                    [id] => 999
                    [title] => Video Title
                    [filename] => video_file_name.mp4
                    [url] => http://domain.com/wp-content/uploads/2018/09/video_file_name.mp4
                    [alt] => 
                    [author] => 1
                    [description] => 
                    [caption] => 
                    [name] => video_file_name
                    [date] => 2018-09-16 09:53:00
                    [modified] => 2018-09-16 09:53:24
                    [mime_type] => video/mp4
                    [type] => video
                    [icon] => http://domain.com/wp-includes/images/media/video.png
                    [width] => 1280
                    [height] => 720
                  )
                  [1] => Array(
                    [ID] => 888
                    [id] => 888
                    [title] => Video Title
                    [filename] => video_alt_file_name.webm
                    [url] => http://domain.com/wp-content/uploads/2018/09/video_alt_file_name.webm
                    [alt] => 
                    [author] => 1
                    [description] => 
                    [caption] => 
                    [name] => video_alt_file_name
                    [date] => 2018-09-16 10:03:00
                    [modified] => 2018-09-16 10:03:24
                    [mime_type] => video/webm
                    [type] => video
                    [icon] => http://domain.com/wp-includes/images/media/video.png
                    [width] => 1280
                    [height] => 720
                  )
                )
                [poster] => Array(
                  [ID] => 777
                  [id] => 777
                  [title] => Poster Title
                  [filename] => poster_file_name.jpg
                  [url] => http://domain.com/wp-content/uploads/2018/09/poster_file_name.jpg
                  [alt] => 
                  [author] => 1
                  [description] => 
                  [caption] => 
                  [name] => poster_file_name-2
                  [date] => 2018-09-16 09:53:19
                  [modified] => 2018-09-16 09:53:19
                  [mime_type] => image/jpeg
                  [type] => image
                  [icon] => http://domain.com/wp-includes/images/media/default.png
                  [width] => 582
                  [height] => 327
                  [sizes] => Array(
                    [thumbnail] => http://domain.com/wp-content/uploads/2018/09/poster_file_name-128x72.jpg
                    [thumbnail-width] => 128
                    [thumbnail-height] => 72
                    [medium] => http://domain.com/wp-content/uploads/2018/09/poster_file_name-512x288.jpg
                    [medium-width] => 512
                    [medium-height] => 288
                    [medium_large] => http://domain.com/wp-content/uploads/2018/09/poster_file_name.jpg
                    [medium_large-width] => 582
                    [medium_large-height] => 327
                    [large] => http://domain.com/wp-content/uploads/2018/09/poster_file_name.jpg
                    [large-width] => 582
                    [large-height] => 327
                  )
                )
                [settings] => Array(
                  [loop] => 0
                  [autoplay] => 0
                  [preload] => metadata
                )
              )

              <?php echo $this->_outdent_code(ob_get_clean())
            ?></code></pre>
          </p>
        </div>
      </div>
    <?php
    wp_die();
  }

  function _outdent_code($code) {
    preg_match('/(\s*)\n([\t\s]*)/', $code, $matches);
    return htmlspecialchars(trim(preg_replace("/$matches[2]/", '', $code)));
  }
}

global $acf_audiovideo_field;

$acf_audiovideo_field = new ACF_AudioVideo_Field($this->settings);