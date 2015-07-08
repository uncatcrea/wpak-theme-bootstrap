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

} );




