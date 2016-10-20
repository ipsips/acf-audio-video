<?php
/*
Plugin Name: Advanced Custom Fields: Audio/Video Field
Plugin URI:  https://developer.wordpress.org/plugins/acf-audio-video/
Description: Select an audio or video from the Media Library.
Version:     1.0.0
Author:      ips.re
Author URI:  http://ips.re/
License:     Apache License 2.0
License URI: https://www.apache.org/licenses/LICENSE-2.0.txt
Text Domain: acf-audio-video
Domain Path: /languages
*/

if (!defined('ABSPATH'))
  exit;

class ACF_Plugin_AudioVideo {
  function __construct() {
    $this->settings = [
      'version' => '1.0.0',
      'url' => plugin_dir_url(__FILE__),
      'path' => plugin_dir_path(__FILE__)
    ];
    
    /**
     * @todo
     */
    load_plugin_textdomain('acf-audio-video', false, plugin_basename(dirname(__FILE__)).'/languages' ); 

    add_action('acf/include_field_types', [$this, 'include_field_type']);
    add_filter('acf_drop_files_on_fields/field_types', [$this, 'register_as_drop_target']);
    add_filter('wp_handle_upload_prefilter', [$this, 'upload_prefilter']);
  }

  function include_field_type() {
    include_once('acf-audio-video-field.php');
  }

  function register_as_drop_target($field_types) {
    $field_types['audioVideo'] = __('Audio/Video', 'acf-audio-video');

    return $field_types;
  }

  function upload_prefilter($file) {
    if (!empty($_POST['allowed_extensions']) && !empty($file['name'])) {
      $allowed_extensions = array_map('trim', explode(',', $_POST['allowed_extensions']));
      $filename = pathinfo($file['name']);

      if (!in_array($filename['extension'], $allowed_extensions))
        $file['error'] = __('Sorry, you cannot upload this file type for this field.', 'acf-audio-video');
    }
    
    return $file;
  }
}
new ACF_Plugin_AudioVideo();