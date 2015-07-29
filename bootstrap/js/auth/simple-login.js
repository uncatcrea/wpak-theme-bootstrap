define( [ 'jquery', 'core/theme-app', 'core/modules/authentication' ], function( $, App, Auth ) {

	$( '<div class="clearfix"><div class="clearfix pull-right" id="user-info"></div></div>' ).insertAfter( '#feedback' );

	var $user_info = $('#user-info');

	var update_login_info = function() {
		
		var current_user = Auth.getCurrentUser();
		
		if ( current_user ) {
			$user_info.html( 'Logged in as <a href="#user-page">'+ current_user.login +'</a> <button type="button" class="btn btn-danger" id="logout">Log out</button>');
		} else {
			$user_info.html( 'No user connected <button type="button" class="btn btn-info" id="login">Log in</button>' );
		}
		
	};

	App.on( 'info', function( info ) {
		switch( info.event ) {
			case 'auth:user-login':
			case 'auth:user-logout':
				update_login_info();
				break;
		}
	} );
	
	update_login_info();

	$( $user_info ).on( 'click', '#login', function( e ) {
		e.preventDefault();
		$user_info.html( 
			'<input id="userlogin" placeholder="Login" type="text" >' +
			'<input id="userpass" placeholder="Password" type="password" >' +
			'<button type="button" class="btn btn-info" id="go-login">Log in</button>'
		);
	} );
	
	$( $user_info ).on( 'click', '#go-login', function( e ) {
		e.preventDefault();
		Auth.logUserIn( 
			$('#userlogin').val(), 
			$('#userpass').val()
		);
	} );
	
	$( $user_info ).on( 'click', '#logout', function( e ) {
		e.preventDefault();
		Auth.logUserOut();
	} );

} );




