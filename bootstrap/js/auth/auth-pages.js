define( [ 'jquery', 'core/theme-app', 'core/modules/authentication' ], function( $, App, Auth ) {

	App.addCustomRoute( 'user-page', 'user-page' );
	
	App.addCustomRoute( 'login-page', 'login-page' ); 
	
	$( '#app-content-wrapper' ).on( 'click', '#login-page button', function( e ) {
		e.preventDefault();
		Auth.logUserIn( 
			$('#user-login').val(), 
			$('#user-pass').val()
		);
	} );
	
	App.filter( 'theme-event-message', function( message, event, event_data ) {
		
		if ( event == 'error:auth:login-error' ) {
			
			switch ( event_data.data ) {
				case 'empty-user':
					message = "User login is empty";
					break;
				case 'wrong-user':
					message = "User not found";
					break;
				case 'wrong-pass':
					message = "User name and password do not match";
					break;
				default:
					message = "User authentication failed :(";
					break;
			}
			
		}
		
		return message;
	} );
	
	App.filter( 'template-args', function( template_args, view_type, view_template ) {
		if ( view_template == 'user-page' ) {
			var current_user = Auth.getCurrentUser();
			if ( current_user ) {
				template_args.user = {
					login: current_user.login,
					role: current_user.permissions.roles.pop(),
					capabilities: current_user.permissions.capabilities
				};
			}
		}
		return template_args;
	} );
	
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

} );




