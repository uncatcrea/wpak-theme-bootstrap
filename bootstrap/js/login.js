define( [ 'jquery', 'core/modules/authentication' ], function( $, Auth ) {

	var $user_info = $('#user-info');

	var update_login_info = function() {
		
		var current_user = Auth.getCurrentUser();
		
		if ( current_user ) {
			$user_info.html( 'Logged in as '+ current_user.login +' <button type="button" class="btn btn-danger" id="logout">Log out</button>');
		} else {
			$user_info.html( '<button type="button" class="btn btn-info" id="login">Log in</button>' );
		}
		
	};

	update_login_info();

	$( $user_info ).on( 'click', '#login', function( e ) {
		e.preventDefault();
		$user_info.html( 
			'<label for="userlogin">Login : </label><input id="userlogin" type="text" style="width:7em; margin-right:1em" >' +
			'<label for="userpass">Password : </label><input id="userpass" type="password" style="width:7em; margin-right:1em" >' +
			'<button type="button" class="btn btn-info" id="go-login">Log in</button>'
		);
	} );
	
	$( $user_info ).on( 'click', '#go-login', function( e ) {
		e.preventDefault();
		Auth.logUserIn( 
			$('#userlogin').val(), 
			$('#userpass').val(),
			function( auth_data ) { //Went ok
				update_login_info();
			},
			function( error ) { //Error
				
			}
		);
	} );
	
	$( $user_info ).on( 'click', '#logout', function( e ) {
		e.preventDefault();
		Auth.logUserOut();
		update_login_info();
	} );

} );




