<?php

if (!defined('ABSPATH')) {
    exit;
}

function deic_get_carousel_images() {
    $carousel_images = get_option('deic_carousel_images', []);
    
    if (!is_array($carousel_images) && !empty($carousel_images)) {
        $carousel_images = json_decode($carousel_images, true);
        if (!is_array($carousel_images)) {
            $carousel_images = [];
        }
    }
    
    return $carousel_images;
}

function deic_get_image_data($image_id, $size = 'large') {
    if (!wp_attachment_is_image($image_id)) {
        return false;
    }
    
    $image_url = wp_get_attachment_image_src($image_id, $size);
    if (!$image_url) {
        return false;
    }
    
    return [
        'id' => $image_id,
        'url' => $image_url[0],
        'width' => $image_url[1],
        'height' => $image_url[2],
        'caption' => wp_get_attachment_caption($image_id)
    ];
}