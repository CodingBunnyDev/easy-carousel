<?php

/**
 * Plugin Name: Easy Images Carousel
 * Description: A simple image carousel for large collections.
 * Version: 1.1.0
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * Author: Matteo De Maria
 * Author URI: https://www.dmmwebdesign.it 
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DEIC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DEIC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DEIC_VERSION', '1.1.0');

require_once DEIC_PLUGIN_DIR . 'includes/functions.php';
require_once DEIC_PLUGIN_DIR . 'includes/admin-page.php';
require_once DEIC_PLUGIN_DIR . 'includes/shortcode.php';

function deic_add_admin_menu() {
    add_menu_page(
        'Easy Images Carousel',
        'Image Carousel',
        'manage_options',
        'easy-images-carousel',
        'deic_admin_page',
        'dashicons-images-alt2',
        11
    );
}
add_action('admin_menu', 'deic_add_admin_menu');

function deic_register_settings() {
    register_setting('deic_settings_group', 'deic_carousel_images');
}
add_action('admin_init', 'deic_register_settings');

function deic_admin_scripts($hook) {
    if ($hook !== 'toplevel_page_easy-images-carousel') {
        return;
    }

    wp_enqueue_media();
    
    $version = time();
    
    wp_register_script('deic-admin-script', DEIC_PLUGIN_URL . 'assets/js/scripts.js', ['jquery'], $version, true);
    
    wp_localize_script('deic-admin-script', 'deicData', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('deic_nonce'),
    ]);
    
    wp_enqueue_script('deic-admin-script');
    
    wp_add_inline_style('wp-admin', '
        #deic_image_preview .deic-preview-item {
            transition: all 0.2s ease;
        }
        #deic_image_preview .deic-preview-item:hover {
            transform: scale(1.05);
        }
    ');
}
add_action('admin_enqueue_scripts', 'deic_admin_scripts');

function deic_save_settings() {
    check_ajax_referer('deic_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'You do not have permission to save settings.']);
        return;
    }
    
    $images = isset($_POST['images']) ? json_decode(stripslashes($_POST['images']), true) : [];
    
    if (json_last_error() === JSON_ERROR_NONE) {
        update_option('deic_carousel_images', $images);
        wp_send_json_success(['message' => 'Settings saved successfully!']);
    } else {
        wp_send_json_error(['message' => 'Error in data format.']);
    }
    
    wp_die();
}
add_action('wp_ajax_deic_save_images', 'deic_save_settings');