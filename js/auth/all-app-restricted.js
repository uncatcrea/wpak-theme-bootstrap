/**
 * Handles a full app content restriction based on Paid Membership Pro memberships.
 * App content is available only to authenticated users with the right membership level.
 */
define( [ 'core/theme-app', 'core/modules/authentication' ], function( App, Auth ) {

	//Don't refresh content at app launch as we check user permissions before showing any content:
	App.setParam('refresh-at-app-launch',false);

	/**
	 * Check user authentication before launching app router, so that no content is displayed
	 * before authentication check
	 */
	App.action( 'pre-start-router', function ( launch_route, app_stats, $deferred ) {

		Auth.checkUserAuthenticationFromRemote(
			function () {
				//User is still logged in ok, with right membership level.
				$deferred.resolve();
			},
			function () {
				//User not logged in anymore, certainly because its membership level expired. 
				//Log out has already been triggered internally, and messages are customized in auth-pages.js
				//(see 'theme-event-message')
				$deferred.resolve();
			}
		);

	} );

	/**
	 * Redirect the user to the login page if he tries to access any content without beeing authenticated.
	 * Also redirect login page to user page if the user is connected.
	 */
	App.filter( 'redirect', function( redirect, queried_screen, current_screen ) {
		
		var user = Auth.getCurrentUser();
		
		//Use current_user_ok() if you want to check user membership level on app side.
		//Here, we do membership check on server side using the 'wpak_auth_user_permissions_ok' hook,
		//so we just have to check that the user is authenticated, no need to check its membership here.
		var user_ok = user; //current_user_ok(); 
		
		if ( !user_ok
			 && queried_screen.item_id != 'login-page' 
			 && queried_screen.item_id != 'user-page' ) {
			
			App.navigate( 'login-page' );
			redirect = true;
				
		} else if ( user_ok && queried_screen.item_id == 'login-page' ) {
			
			App.navigate( 'user-page' );
			redirect = true;
			
		}
		
		return redirect;
	} );
	
	/**
	 * Go to default page after login, and to login page after logout
	 */
	App.on( 'info', function( info ) {
		switch( info.event ) {
			case 'auth:user-login':
				App.navigate( '#' );
				break;
			case 'auth:user-logout':
				App.navigate( 'login-page' );
				break;
		}
	} );
	
	
	/*******************************************************************************
	 * Functions that allow to check user membership on app side.
	 * Those are not used in this case because we do membership check on server
	 * side using the 'wpak_auth_user_permissions_ok' hook, when the user logs in
	 * (see php/paid-membership-pro.php).
	 */
	
	var required_membership_id = 1;
	
	/**
	 * Check if the current user has the given membership
	 */
	function current_user_has_membership( membership_id ) {
		var user = Auth.getCurrentUser();
		return user && user.permissions.membership && user.permissions.membership.id == membership_id;
	}
	
	/**
	 * Check if current user has 
	 */
	function current_user_ok() {
		return current_user_has_membership( required_membership_id );
	}

} );