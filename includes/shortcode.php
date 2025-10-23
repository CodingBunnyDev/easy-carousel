<?php

if (!defined('ABSPATH')) {
    exit;
}

function deic_image_carousel_shortcode() {
    $carousel_images = get_option('deic_carousel_images', []);

    if (!is_array($carousel_images) && !empty($carousel_images)) {
        $carousel_images = json_decode($carousel_images, true);
        if (!is_array($carousel_images)) {
            $carousel_images = [];
        }
    }

    if (empty($carousel_images)) {
        return '<p>No images selected for the carousel.</p>';
    }

    $carousel_id = 'deic-carousel-' . wp_rand();

    $images_data = [];
    foreach ($carousel_images as $image_id) {
        if (wp_attachment_is_image($image_id)) {
            $image_url = wp_get_attachment_image_src($image_id, 'large')[0];
            $images_data[] = [
                'id' => $image_id,
                'url' => $image_url
            ];
        }
    }

    if (empty($images_data)) {
        return '<p>No valid images found for the carousel.</p>';
    }

    wp_enqueue_script('jquery');

    ob_start();

    echo '<link rel="preload" href="' . esc_url($images_data[0]['url']) . '" as="image">';
    ?>
    <div id="<?php echo esc_attr($carousel_id); ?>" class="deic-slideshow" tabindex="0">
        <div class="deic-slideshow-container">
            <div class="deic-slide-item active"></div>
            <div class="deic-slide-item next"></div>
        </div>
    </div>

    <style>
        html, body {
            width: 100vw;
            height: 100vh;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
        }
        #<?php echo esc_attr($carousel_id); ?> {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            margin: 0 !important;
            padding: 0;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            background: #000;
        }
        #<?php echo esc_attr($carousel_id); ?> .deic-slideshow-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            flex-grow: 1;
            touch-action: pan-y;
            margin: 0;
            padding: 0;
        }
        #<?php echo esc_attr($carousel_id); ?> .deic-slide-item {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            opacity: 0;
            z-index: 1;
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
            transition:
                opacity 1500ms cubic-bezier(0.4, 0.0, 0.2, 1),
                transform 1500ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        #<?php echo esc_attr($carousel_id); ?> .deic-slide-item.active {
            opacity: 1;
            transform: scale(1);
            z-index: 2;
        }
        #<?php echo esc_attr($carousel_id); ?> .deic-slide-item:first-child {
            position: relative;
        }
    </style>

    <script>
        window.carouselImages = window.carouselImages || {};
        window.carouselImages['<?php echo esc_js($carousel_id); ?>'] = <?php echo json_encode($images_data); ?>;

        (function($) {
            $(document).ready(function() {
                var carouselId = '<?php echo esc_js($carousel_id); ?>';
                var $carousel = $('#' + carouselId);
                var $slideContainer = $carousel.find('.deic-slideshow-container');
                var $activeSlide = $carousel.find('.deic-slide-item.active');
                var $nextSlide = $carousel.find('.deic-slide-item.next');

                var images = window.carouselImages[carouselId];
                var imageCount = images.length;
                var currentIndex = 0;
                var transitionTime = 1500;
                var isAnimating = false;
                var autoScrollTimer = null;
                var animationTimer = null;
                var autoScrollDelay = 8000;

                if (imageCount <= 0) return;

                function initCarousel() {
                    updateSlide($activeSlide, images[0]);
                    if (imageCount > 1) {
                        preloadImage(images[1].url);
                        startAutoScroll();
                    }
                }

                function startAutoScroll() {
                    clearInterval(autoScrollTimer);
                    autoScrollTimer = setInterval(nextSlide, autoScrollDelay);
                }
                function pauseAutoScroll() {
                    clearInterval(autoScrollTimer);
                }
                function resumeAutoScroll() {
                    if (imageCount > 1) {
                        startAutoScroll();
                    }
                }
                function updateSlide($slide, imageData) {
                    $slide.css('background-image', 'url(' + imageData.url + ')');
                }
                function preloadImage(url) {
                    var img = new Image();
                    img.src = url;
                }
                function nextSlide() {
                    if (imageCount <= 1) return;
                    if (isAnimating) {
                        $activeSlide.stop(true, true);
                        $nextSlide.stop(true, true);
                        clearTimeout(animationTimer);
                    }
                    isAnimating = true;
                    var nextIndex = (currentIndex + 1) % imageCount;
                    var nextNextIndex = (nextIndex + 1) % imageCount;
                    preloadImage(images[nextNextIndex].url);
                    updateSlide($nextSlide, images[nextIndex]);
                    $activeSlide.removeClass('active');
                    $nextSlide.addClass('active');
                    var temp = $activeSlide;
                    $activeSlide = $nextSlide;
                    $nextSlide = temp;
                    currentIndex = nextIndex;
                    animationTimer = setTimeout(function() {
                        isAnimating = false;
                    }, transitionTime);
                }

                initCarousel();
            });
        })(jQuery);
    </script>

    <?php
    return ob_get_clean();
}
add_shortcode('image_carousel', 'deic_image_carousel_shortcode');