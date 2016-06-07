<?php

/**
 * Basic search & filter on post lists.
 * Shows how to implement a search by string and category.
 * Replace "category/categories" by any custom taxonomy of yours to extend this code 
 * to your own content types.
 * 
 * Requires that the corresponding js/my-search.js file is included in app's theme.
 */

/**
 * Add search params sent by the app to the default component's query.
 */
add_filter( 'wpak_posts_list_query_args', 'search_component_query', 10, 2 );
function search_component_query( $query_args, $component ) {

	$my_search_filters = WpakWebServiceContext::getClientAppParam( 'my_search_filters' );
	if ( !empty( $my_search_filters ) ) {

		if ( !empty( $my_search_filters[ 'search_string' ] ) ) {
			$query_args[ 's' ] = $my_search_filters[ 'search_string' ];
		}

		if ( !empty( $my_search_filters[ 'category_slug' ] ) ) {
			$query_args[ 'tax_query' ][ 'relation' ] = 'AND';
			$query_args[ 'tax_query' ][] = array(
				'taxonomy' => 'category',
				'field' => 'slug',
				'terms' => $my_search_filters[ 'category_slug' ]
			);
		}

		//Note : default WP ordering for searchs is : 
		// ORDER BY wp_posts.post_title LIKE '%search_string%' DESC, wp_posts.post_date DESC 
		//which is not compatible with the default "Get more posts" feature that requires ordering by date.
		//Note: As of WP-AppKit 0.6, if you want to keep WP Search ordering, you can use the 
		//'use-standard-pagination' filter on app side (which will switch back to standard WP pagination),
		//and comment the following line.
		$query_args[ 'orderby' ] = 'date';
		
	}

	return $query_args;
}

/**
 * Add site's categories to app options (that are passed via the config.js file), 
 * so that the app can display the categories select in its search form.
 */
add_filter( 'wpak_default_options', 'add_taxonomies_to_app_config', 10 );
function add_taxonomies_to_app_config( $options ) {
	
	$options['categories'] = array();
	$categories = get_terms( 'category' );
	foreach( $categories as $category ) {
		$options['categories'][] = array( 'slug' => $category->slug, 'name' => $category->name );
	}
	
	return $options;
}