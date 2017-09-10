<?php
/**
 * For every post sent in webservice, find all post images and add the following
 * HTML attributes to them:
 * - "data-full-img" = full size image url
 * - "data-with" = full size widht
 * - "data-height" = full size height
 */
add_filter( 'wpak_post_content_format', 'prepare_images_for_photoswipe', 11,2 );
function prepare_images_for_photoswipe( $content, $post ){

    libxml_use_internal_errors(true);

    // Create a DOM document from the post content
    $dom = new domDocument;
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content);

    // Get all images in the post content
    $images = $dom->getElementsByTagName("img");
    foreach( $images as $img ) {
		//Retrieve image attachment ID from img class:
		$classes = $img->getAttribute('class'); 
		if ( preg_match( '/wp-image-(\d+)/', $classes, $matches ) ) {
			$attachment_id = $matches[1];
			//Retrieve full size info and add them to the img as data attributes:
			$image_src_data = wp_get_attachment_image_src( $attachment_id, 'full' );
			$img->setAttribute( 'data-full-img', $image_src_data[0] );
			$img->setAttribute( 'data-width', $image_src_data[1] );
			$img->setAttribute( 'data-height', $image_src_data[2] );
		}
    }

	//Save new post content with modified img tags 
    $content = $dom->saveHTML();
    
    libxml_use_internal_errors(false);

    return $content; // Return modified post content
}

/**
 * Galleries images are inserted dynamically in post content by WordPress when it 
 * builds the post content. We need to add our full size image information at the 
 * moment WordPress is building the gallery's images tags.
 */
add_filter( 'wp_get_attachment_image_attributes', 'prepare_gallery_images_for_photoswipe', 10, 3 );
function prepare_gallery_images_for_photoswipe( $image_attributes, $attachment, $size ) {
	
	//If the image is retrieved for an app, add full width's data attributes to it:
	if ( wpak_is_app() ) {
		$image_src_data = wp_get_attachment_image_src( $attachment->ID, 'full' );
		$image_attributes['data-full-img'] = $image_src_data[0];
		$image_attributes['data-width'] = $image_src_data[1];
		$image_attributes['data-height'] = $image_src_data[2];
	}
	
	return $image_attributes;
}