<?php

if (!defined('ABSPATH')) {
    exit;
}

function deic_admin_page() {
    $carousel_images = get_option('deic_carousel_images', []);

    if (!is_array($carousel_images) && !empty($carousel_images)) {
        $carousel_images = json_decode($carousel_images, true);
        if (!is_array($carousel_images)) {
            $carousel_images = [];
        }
    }
    ?>
    <div class="wrap">
        <h1>Easy Images Carousel</h1>
        <div id="deic_message_box"></div>
        <form method="post" id="deic_form">
            <?php settings_fields('deic_settings_group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">Images</th>
                    <td>
                        <input type="hidden" id="deic_carousel_images" name="deic_carousel_images" value='<?php echo esc_attr(json_encode($carousel_images)); ?>'>
                        <button type="button" class="button button-primary" id="deic_select_images">Select Images</button>
                        <div style="margin-top: 15px; display: flex; align-items: center; gap: 15px;">
                            <div id="deic_image_count" style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">
                                <?php echo count($carousel_images); ?> images selected
                            </div>
                        </div>

                        <div id="deic_image_preview" style="margin-top: 20px; display: flex; flex-wrap: wrap;">
                            <?php
                            if (!empty($carousel_images)) {
                                foreach ($carousel_images as $image_id) {
                                    if (wp_attachment_is_image($image_id)) {
                                        $image_url = wp_get_attachment_image_src($image_id, 'thumbnail')[0];
                                        $image_title = get_the_title($image_id);
                                        $filename = basename(get_attached_file($image_id));
                                        echo '<div class="deic-preview-item" data-id="' . esc_attr($image_id) . '" data-title="' . esc_attr($image_title) . '" style="margin: 5px; position: relative;">
                                            <img src="' . esc_url($image_url) . '" style="max-width: 120px; height: auto; display: block; border: 1px solid #ddd; padding: 5px;">
                                        <div class="deic-filename" style="text-align: left; font-size: 10px; margin-top: 5px; word-break: break-word; max-width: 120px;">' . esc_html($filename) . '</div>
                                        </div>';
                                    }
                                }
                            }
                            ?>
                        </div>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <button type="button" id="deic_save_button" class="button button-primary">Save Settings</button>
            </p>
            <p>
                Shortcode: [image_carousel]
            </p>
        </form>
    </div>
    <?php
}