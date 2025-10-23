jQuery(document).ready(function($) {
	console.log('DEIC Admin Script Loaded');

	let mediaFrame = null;
	let audioFrame = null;

	function getMediaFrame() {
		if (mediaFrame) {
			return mediaFrame;
		}

		mediaFrame = wp.media({
			title: 'Select Images for Carousel',
			button: {
				text: 'Use these images'
			},
			multiple: 'add',
			library: {
				type: 'image'
			}
		});

		mediaFrame.on('open', function() {
			const selection = mediaFrame.state().get('selection');

			selection.reset();

			const existingImageIds = JSON.parse($('#deic_carousel_images').val() || '[]');

			existingImageIds.forEach(function(id) {
				const attachment = wp.media.attachment(id);

				if (!attachment.get('url')) {
					attachment.fetch();
				}

				selection.add(attachment);
			});
		});

		mediaFrame.on('select', function() {
			const selection = mediaFrame.state().get('selection');
			const attachments = selection.toJSON();
			const imageIds = attachments.map(attachment => attachment.id);

			console.log('Selected images:', imageIds);

			const sortedAttachments = sortAttachments(attachments);

			const sortedIds = sortedAttachments.map(attachment => attachment.id);

			$('#deic_carousel_images').val(JSON.stringify(sortedIds));

			updateImagePreview(sortedAttachments);

			updateImageCount(sortedIds.length);
		});

		return mediaFrame;
	}

	function getAudioFrame() {
		if (audioFrame) {
			return audioFrame;
		}

		audioFrame = wp.media({
			title: 'Select Audio Tracks for Carousel',
			button: {
				text: 'Use these audio tracks'
			},
			multiple: 'add',
			library: {
				type: 'audio'
			}
		});

		audioFrame.on('open', function() {
			const selection = audioFrame.state().get('selection');

			selection.reset();

			const existingAudioIds = JSON.parse($('#deic_carousel_audio').val() || '[]');

			existingAudioIds.forEach(function(id) {
				const attachment = wp.media.attachment(id);

				if (!attachment.get('url')) {
					attachment.fetch();
				}

				selection.add(attachment);
			});
		});

		audioFrame.on('select', function() {
			const selection = audioFrame.state().get('selection');
			const attachments = selection.toJSON();
			const audioIds = attachments.map(attachment => attachment.id);

			console.log('Selected audio tracks:', audioIds);

			const sortedAttachments = sortAudioAttachments(attachments);

			const sortedIds = sortedAttachments.map(attachment => attachment.id);

			$('#deic_carousel_audio').val(JSON.stringify(sortedIds));

			updateAudioPreview(sortedAttachments);

			updateAudioCount(sortedIds.length);
		});

		return audioFrame;
	}

	function sortAttachments(attachments) {
    return [...attachments].sort(function(a, b) {
        const nameA = getFileName(a.url).toLowerCase();
        const nameB = getFileName(b.url).toLowerCase();
        return nameA.localeCompare(nameB);
    });
}

	function sortAudioAttachments(attachments) {
		return [...attachments].sort(function(a, b) {
			const nameA = (a.title || getFileName(a.url)).toLowerCase();
			const nameB = (b.title || getFileName(b.url)).toLowerCase();
			return nameA.localeCompare(nameB);
		});
	}

	$('#deic_select_images').on('click', function(e) {
		e.preventDefault();
		console.log('Select Images button clicked');

		const frame = getMediaFrame();
		frame.open();
	});

	$('#deic_select_audio').on('click', function(e) {
		e.preventDefault();
		console.log('Select Audio button clicked');

		const frame = getAudioFrame();
		frame.open();
	});

	function getFileName(url) {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.split('/').pop();
}

	function updateImagePreview(attachments) {
		const previewContainer = $('#deic_image_preview');
		previewContainer.empty();

		attachments.forEach(function(attachment) {
			const imgUrl = attachment.sizes && attachment.sizes.thumbnail ? 
			attachment.sizes.thumbnail.url : attachment.url;

			const fileName = attachment.filename || getFileName(attachment.url);

			const previewItem = $('<div class="deic-preview-item"></div>')
			.attr({
				'data-id': attachment.id,
				'data-title': attachment.title || ''
			})
			.css({
				margin: '10px',
				position: 'relative',
				display: 'inline-block',
				textAlign: 'center'
			});

			const img = $('<img>').attr('src', imgUrl).css({
				maxWidth: '120px',
				maxHeight: '120px',
				width: 'auto',
				height: 'auto',
				display: 'block',
				margin: '0 auto',
				border: '1px solid #ddd',
				padding: '3px'
			});

			const fileNameElement = $('<div class="image-filename"></div>')
			.text(fileName)
			.css({
				fontSize: '10px',
				marginTop: '4px',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				width: '120px',
				whiteSpace: 'nowrap'
			});

			previewItem.append(img).append(fileNameElement);
			previewContainer.append(previewItem);
		});
	}

	function updateAudioPreview(attachments) {
		const previewContainer = $('#deic_audio_preview');
		previewContainer.empty();

		attachments.forEach(function(attachment) {
			const audioUrl = attachment.url;
			const audioTitle = attachment.title || '';
			const fileName = attachment.filename || getFileName(attachment.url);

			const audioItem = $('<div class="deic-audio-item"></div>')
				.attr({
					'data-id': attachment.id,
					'data-title': audioTitle
				})
				.css({
					margin: '5px',
					position: 'relative',
					width: '300px',
					background: '#f9f9f9',
					padding: '10px',
					borderRadius: '4px'
				});

			const titleElement = $('<div class="deic-audio-title"></div>')
				.text(audioTitle)
				.css({
					fontWeight: 'bold',
					marginBottom: '5px'
				});

			const fileNameElement = $('<div class="deic-filename"></div>')
				.text(fileName)
				.css({
					fontSize: '10px',
					marginBottom: '8px'
				});

			const audioElement = $('<audio controls></audio>')
				.css({
					width: '100%'
				})
				.append($('<source>').attr({
					src: audioUrl,
					type: 'audio/mpeg'
				}))
				.append('Your browser does not support the audio element.');

			const removeButton = $('<button type="button" class="button deic-remove-audio">Remove</button>')
				.css({
					marginTop: '5px'
				});

			audioItem.append(titleElement)
				.append(fileNameElement)
				.append(audioElement)
				.append(removeButton);

			previewContainer.append(audioItem);
		});

		// Attach click event to remove buttons
		$('.deic-remove-audio').on('click', function() {
			const audioItem = $(this).closest('.deic-audio-item');
			const audioId = audioItem.data('id');
			
			// Remove from hidden input value
			const currentAudioIds = JSON.parse($('#deic_carousel_audio').val() || '[]');
			const updatedAudioIds = currentAudioIds.filter(id => id !== audioId);
			$('#deic_carousel_audio').val(JSON.stringify(updatedAudioIds));
			
			// Remove from preview
			audioItem.remove();
			
			// Update count
			updateAudioCount(updatedAudioIds.length);
		});
	}

	function updateImageCount(count) {
		$('#deic_image_count').text(count + ' images selected');
	}

	function updateAudioCount(count) {
		$('#deic_audio_count').text(count + ' audio tracks selected');
	}

	function updateHiddenField() {
		const imageIds = [];
		$('.deic-preview-item').each(function() {
			imageIds.push($(this).data('id'));
		});

		$('#deic_carousel_images').val(JSON.stringify(imageIds));
		
		const audioIds = [];
		$('.deic-audio-item').each(function() {
			audioIds.push($(this).data('id'));
		});

		$('#deic_carousel_audio').val(JSON.stringify(audioIds));
	}

	(function initializePreview() {
		const existingImageIds = JSON.parse($('#deic_carousel_images').val() || '[]');

		if (existingImageIds.length > 0) {
			$('#deic_image_preview').css('visibility', 'hidden');

			const attachments = [];
			let loaded = 0;
			let failed = 0;

			existingImageIds.forEach(function(id) {
				const attachment = wp.media.attachment(id);

				attachment.fetch({
					success: function() {
						attachments.push(attachment.toJSON());
						loaded++;
						checkAllProcessed();
					},
					error: function() {
						console.warn('Failed to load image with ID:', id);
						failed++;
						checkAllProcessed();
					}
				});
			});

			setTimeout(function() {
				if ($('#deic_image_preview').css('visibility') === 'hidden') {
					console.warn('Image loading timeout reached, showing UI anyway');
					processAttachments();
				}
			}, 5000);

			function checkAllProcessed() {
				if (loaded + failed === existingImageIds.length) {
					processAttachments();
				}
			}

			function processAttachments() {
				const validImageIds = attachments.map(attachment => attachment.id);

				if (validImageIds.length !== existingImageIds.length) {
					$('#deic_carousel_images').val(JSON.stringify(validImageIds));

					$('#deic_message_box').html(
						'<div class="notice notice-warning">' +
						'<p>Some previously selected images were not found in the media library and have been removed.</p>' +
						'</div>'
					);
				}

				const sortedAttachments = sortAttachments(attachments);
				const sortedIds = sortedAttachments.map(attachment => attachment.id);

				$('#deic_carousel_images').val(JSON.stringify(sortedIds));
				updateImagePreview(sortedAttachments);
				updateImageCount(sortedIds.length);
				$('#deic_image_preview').css('visibility', 'visible');
			}
		}
		
		// Initialize audio preview
		const existingAudioIds = JSON.parse($('#deic_carousel_audio').val() || '[]');

		if (existingAudioIds.length > 0) {
			$('#deic_audio_preview').css('visibility', 'hidden');

			const audioAttachments = [];
			let audioLoaded = 0;
			let audioFailed = 0;

			existingAudioIds.forEach(function(id) {
				const attachment = wp.media.attachment(id);

				attachment.fetch({
					success: function() {
						audioAttachments.push(attachment.toJSON());
						audioLoaded++;
						checkAllAudioProcessed();
					},
					error: function() {
						console.warn('Failed to load audio with ID:', id);
						audioFailed++;
						checkAllAudioProcessed();
					}
				});
			});

			setTimeout(function() {
				if ($('#deic_audio_preview').css('visibility') === 'hidden') {
					console.warn('Audio loading timeout reached, showing UI anyway');
					processAudioAttachments();
				}
			}, 5000);

			function checkAllAudioProcessed() {
				if (audioLoaded + audioFailed === existingAudioIds.length) {
					processAudioAttachments();
				}
			}

			function processAudioAttachments() {
				const validAudioIds = audioAttachments.map(attachment => attachment.id);

				if (validAudioIds.length !== existingAudioIds.length) {
					$('#deic_carousel_audio').val(JSON.stringify(validAudioIds));

					$('#deic_message_box').append(
						'<div class="notice notice-warning">' +
						'<p>Some previously selected audio tracks were not found in the media library and have been removed.</p>' +
						'</div>'
					);
				}

				const sortedAttachments = sortAudioAttachments(audioAttachments);
				const sortedIds = sortedAttachments.map(attachment => attachment.id);

				$('#deic_carousel_audio').val(JSON.stringify(sortedIds));
				updateAudioPreview(sortedAttachments);
				updateAudioCount(sortedIds.length);
				$('#deic_audio_preview').css('visibility', 'visible');
			}
		}
	})();

	$('#deic_save_button').on('click', function(e) {
		e.preventDefault();
		console.log('Save button clicked');

		const imageData = $('#deic_carousel_images').val();
		const audioData = $('#deic_carousel_audio').val();
		
		console.log('Image data to save:', imageData);
		console.log('Audio data to save:', audioData);

		$.ajax({
			url: deicData.ajaxurl,
			type: 'POST',
			data: {
				action: 'deic_save_images',
				nonce: deicData.nonce,
				images: imageData,
				audio: audioData,
				sort_order: 'asc'
			},
			beforeSend: function() {
				$('#deic_message_box').html('<div class="notice notice-info"><p>Saving in progress...</p></div>');
			},
			success: function(response) {
				console.log('AJAX response:', response);

				if (response.success) {
					$('#deic_message_box').html('<div class="notice notice-success"><p>' + response.data.message + '</p></div>');
				} else {
					$('#deic_message_box').html('<div class="notice notice-error"><p>Error saving settings: ' + response.data.message + '</p></div>');
				}
			},
			error: function(xhr, status, error) {
				console.error('AJAX error:', error);

				$('#deic_message_box').html('<div class="notice notice-error"><p>Error saving settings. Please try again.</p></div>');
			}
		});
	});
});

(function($) {
	$(document).ready(function() {
		$('.deic-slideshow').on('contextmenu', function(e) {
			e.preventDefault();
			return false;
		});
	});
})(jQuery);