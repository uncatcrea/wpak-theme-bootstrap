define( [ 'jquery', 'core/theme-app', 'core/modules/authentication' ], function( $, App, Auth ) {

	/**
	 * User authentication theme module example that handles :
	 * - a user page, where user data can be displayed, using the user-page.html template
	 * - a login page, where the login form is implemented, using the login-page.html template
	 * - authentication feedback messages customization
	 * - user authentication validation on app launch
	 * 
	 * Login and authentication validation are handled with the WP-AppKit Authentication API.
	 */

	/**************************************************************************
	 * User page
	 */

	/**
	 * Create the "User page" custom route : 
	 * tells the app that #user-page will lead to the user page, using the "user-page.html" template
	 */
	App.addCustomRoute( 'user-page', 'user-page' );
	
	/**
	 * If we try to go to the user page without being connected, we
	 * redirect to the homepage.
	 */
	App.filter( 'redirect', function( redirect, queried_screen ) {
		if ( queried_screen.item_id == 'user-page' ) {
			var user = Auth.getCurrentUser();
			if ( !user ) {
				App.navigate( '#' );
				redirect = true;
			}
		}
		return redirect;
	} );
	
	/**
	 * Set the data that we want to be available in the user-page.html template :
	 * user login, role and capabilities.
	 */
	App.filter( 'template-args', function( template_args, view_type, view_template ) {
		if ( view_template == 'user-page' ) {
			var current_user = Auth.getCurrentUser();
			if ( current_user ) {
				template_args.user = {
					login: current_user.login,
					role: current_user.permissions.roles[0],
					capabilities: current_user.permissions.capabilities
				};
			}
		}
		return template_args;
	} );
	
	/**************************************************************************
	 * Login page
	 */
	
	/**
	 * Create the "Login page" custom route : 
	 * tells the app that #login-page will lead to the login page, using the "login-page.html" template
	 */
	App.addCustomRoute( 'login-page', 'login-page' ); 
	
	/**
	 * Login page form submit : log the user in when submitting the login form,
	 * calling Auth.logUserIn(login, pass) with login and password entered by
	 * the user in the login form.
	 */
	$( '#app-content-wrapper' ).on( 'click', '#login-page button', function( e ) {
		e.preventDefault();
		Auth.logUserIn( 
			$('#user-login').val(), 
			$('#user-pass').val()
		);
	} );
	
	
	/**************************************************************************
	 * Customize authentication feedback messages and errors
	 */
	
	/**
	 * Display logout info messages in feedback div
	 */
	App.on( 'info', function( info ) {
		switch( info.event ) {
			case 'auth:user-logout':
				if ( info.message && info.message.length ) {
					$( '#feedback' ).removeClass( 'error' ).html( info.message ).slideDown();
				}
				break;
		}
	} );

	/**
	 * Intercept error and info messages that are related to authentication so that
	 * we can display our custom messages when the login fails.
	 */
	App.filter( 'theme-event-message', function( message, event_data ) {
		
		if ( event_data.subtype == 'authentication-error' ) {
				
			//Custom messages for log in error events :
			switch ( event_data.event ) {
				case 'auth:empty-user':
					message = "User login is empty";
					break;
				case 'auth:wrong-user':
					message = "User not found";
					break;
				case 'auth:wrong-pass':
					message = "User name and password do not match";
					break;
				case 'auth:wrong-permissions':
					message = "Wrong user permissions or user permissions expired.";
					break;
				default:
					message = "User authentication failed :(";
					break;
			}
			
		} else if ( event_data.subtype == 'authentication-info' ) {
			
			//Custom messages for log out info events :
			if ( event_data.event == 'auth:user-logout' ) {
				
				switch ( event_data.core_data.logout_type ) {
					case 'user-connection-expired':
						message = 'Your connection has expired. Please log in again!';
						break;
					case 'user-not-authenticated':
						message = "Your connection has been reseted. Please log in again!";
						break;
					case 'user-wrong-permissions':
						message = "Your user permissions expired.";
						break;
				} 
				
			}
			
		}
		
		return message;
	} );
	
} );




