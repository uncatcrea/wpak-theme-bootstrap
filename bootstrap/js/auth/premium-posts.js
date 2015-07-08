define( [ 'core/theme-app', 'core/modules/authentication' ], function( App, Auth ) {

	var asked_fragment = '';

	App.filter( 'redirect', function( redirect, queried_screen, current_screen ) {
		
		if ( queried_screen.screen_type == 'single' ) {
			
			var user = Auth.getCurrentUser();
			
			if ( !user ) {
				asked_fragment = queried_screen.fragment;
				App.navigate( 'login-page' );
				redirect = true;
			}
			
		} else if ( queried_screen.item_id != 'login-page' ) {
			asked_fragment = '';
		}
		
		return redirect;
	} );
	
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




