define( [ 'core/theme-app', 'core/modules/authentication' ], function( App, Auth ) {

	/**
	 * User authentication theme module example that implements a "Premium posts" 
	 * feature, meaning that the user can read posts only if he's connected.
	 * 
	 * User permissions management is handled with the WP-AppKit Authentication API.
	 */

	/**
	 * To memorize the screen that the user wanted to see before being redirected
	 * to the login page because he's not logged in.
	 */
	var asked_fragment = '';

	/**
	 * Redirect the user to the login page if he tries to access a reserved content
	 * (reserved content are everything except post lists in this example).
	 * The screen the user wanted to reach is memorized so that we redirect him
	 * to it when he logged in ok.
	 * 
	 * Also redirect login page to user page if the user is connected.
	 */
	App.filter( 'redirect', function( redirect, queried_screen, current_screen ) {
		
		var user = Auth.getCurrentUser();
		
		if ( queried_screen.item_id != 'login-page' ) {
			//Memorize asked screen to redirect to it after login.
			asked_fragment = '';
		}
		
		if ( !user && queried_screen.screen_type != 'list' 
			 && queried_screen.item_id != 'login-page' 
			 && queried_screen.item_id != 'user-page' ) {
			
			asked_fragment = queried_screen.fragment;
			App.navigate( 'login-page' );
			redirect = true;
				
		} else if ( user && queried_screen.item_id == 'login-page' ) {
			
			App.navigate( 'user-page' );
			redirect = true;
			
		}
		
		return redirect;
	} );
	
	/**
	 * Intercept login an logout to :
	 * - redirect to the asked screen on login
	 * - reload the current screen on logout : this allows to check if the user
	 *   can still see the screen he was on before logout. For example, if the user
	 *   logs out on a post screen, he will be redirected to the login page, as
	 *   defined in the previous App.filter( 'redirect' ).
	 */
	App.on( 'info', function( info ) {
		switch( info.event ) {
			case 'auth:user-login':
				if ( asked_fragment.length ) {
					App.navigate( asked_fragment );
				}
				break;
			case 'auth:user-logout':
				App.reloadCurrentScreen();
				break;
		}
	} );

} );




