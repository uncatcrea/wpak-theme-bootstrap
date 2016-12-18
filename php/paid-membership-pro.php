<?php
/**
 * Defines hooks that allow to check Paid Membership Pro memberships at user log in
 * and to add some membership level info to post and user objects sent to the app.
 */

/**
 * Refuse user log in if he has not the right membership level.
 * 
 * @param bool  $permissions_ok    Return true if user permissions are ok, false otherwise
 * @param array $user_permissions  Array of user permissions (including modifications made in 'wpak_auth_user_permissions' filter)
 * @param int   $user_id           User Id to check permissions for
 * @return type
 */
function check_user_membership( $permissions_ok, $user_permissions, $user_id ) {
	
	$allowed_membership_level_id = 1; //ID of the Paid Membership Pro's membership required to see app content
	
	$user_membership = pmpro_getMembershipLevelForUser( $user_id );
	
	$now = current_time( 'timestamp' );
	
	$permissions_ok = !empty( $user_membership ) 
					  && $user_membership->ID == $allowed_membership_level_id
					  && $user_membership->startdate <= $now
					  && $user_membership->enddate >= $now;
	
	return $permissions_ok;
}
add_filter( 'wpak_auth_user_permissions_ok', 'check_user_membership', 10, 3 );


/***************************************************************************
 * The following is not used in our case because we check user memberships
 * only on server side using the 'wpak_auth_user_permissions_ok' hook.
 * 
 * It can be useful if you want to:
 * - add membership data for each post passed to the web service.
 * - add membership data to the user permissions sent back to the app at user log in,
 *   so that you can handle memberships checks on app side.
 */

/**
 * Retrieve Paid Membership Pro memberships associated to the given post
 * Code extracted from pmpro_has_membership_access() function, as PMP has
 * no native function to retrieve a post's memberships!
 * 
 * @param  int|object   $post   Post ID or post object
 * @return array Post's memberships ( array of objects containing membership id and name )
 */
function get_pmp_post_memberships( $post ) {
	global $wpdb;
	
	$post_memberships = array();
			
	$post = get_post( $post );
	
	if ( $post ) {
	
		//EXTRACTION FROM PMP CODE - START
		if(isset($post->post_type) && $post->post_type == "post")
		{
			$post_categories = wp_get_post_categories($post->ID);

			if(!$post_categories)
			{
				//just check for entries in the memberships_pages table
				$sqlQuery = "SELECT m.id, m.name FROM $wpdb->pmpro_memberships_pages mp LEFT JOIN $wpdb->pmpro_membership_levels m ON mp.membership_id = m.id WHERE mp.page_id = '" . $post->ID . "'";
			}
			else
			{
				//are any of the post categories associated with membership levels? also check the memberships_pages table
				$sqlQuery = "(SELECT m.id, m.name FROM $wpdb->pmpro_memberships_categories mc LEFT JOIN $wpdb->pmpro_membership_levels m ON mc.membership_id = m.id WHERE mc.category_id IN(" . implode(",", $post_categories) . ") AND m.id IS NOT NULL) UNION (SELECT m.id, m.name FROM $wpdb->pmpro_memberships_pages mp LEFT JOIN $wpdb->pmpro_membership_levels m ON mp.membership_id = m.id WHERE mp.page_id = '" . $post->ID . "')";
			}
		}
		else
		{
			//are any membership levels associated with this page?
			$sqlQuery = "SELECT m.id, m.name FROM $wpdb->pmpro_memberships_pages mp LEFT JOIN $wpdb->pmpro_membership_levels m ON mp.membership_id = m.id WHERE mp.page_id = '" . $post->ID . "'";
		}
		
		$post_memberships = $wpdb->get_results($sqlQuery);
		//EXTRACTION FROM PMP CODE - STOP
	}
	
	return $post_memberships;
}

/**
 * Add membership data to web service for each post
 */
function wpak_add_membership_data_to_posts( $post_data, $post ) {
	
	$post_data['memberships'] = get_pmp_post_memberships( $post );
	
	return $post_data;
}
add_filter( 'wpak_post_data', 'wpak_add_membership_data_to_posts', 10, 2 );

/**
 * Add user membership level to user data returned at authentication
 */
function add_membership_data_to_user_data( $user_permissions, $user_id ) {
	
	$user_membership = pmpro_getMembershipLevelForUser( $user_id );
	
	$user_permissions['membership'] = !empty( $user_membership ) ? array( 'id' => $user_membership->ID, 'name' => $user_membership->name ) : false;
	
	//Then, on app side, check if user.permissions.membership.id is in post.memberships
	
	return $user_permissions;
}
add_filter( 'wpak_auth_user_permissions', 'add_membership_data_to_user_data', 10, 2 );
