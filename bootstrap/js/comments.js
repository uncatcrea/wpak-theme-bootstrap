define( [ 'jquery', 'core/theme-app', 'core/modules/comments', 'core/modules/authentication' ], function( $, App, Comments, Auth ) {

	$( '#app-content-wrapper' ).on( 'submit', '#comment-form', function( e ) {
		e.preventDefault();
		
		var $submit_button = $( '#comment-form [type="submit"]' );
		$submit_button.attr( 'disabled', 'disabled' ).text( 'Sending...' );
		
		var comment = {
			content : $( '#comment-form [name="content"]' ).val(),
			post : $( '#comment-form [name="post"]' ).val()
		};
		
		Comments.postComment( 
			comment,
			function( comment_data ) {
				//Comment created OK!
				
				//Reset submit button :
				$submit_button.removeAttr( 'disabled' );
				
				//Empty comment edition :
				$( '#comment-form [name="content"]' ).val('');
				
				//Re-display current view (comments view) to display the new comment in the list :
				App.rerenderCurrentScreen();
				
				//Scroll top : 
				window.scrollTo( 0, 0 );
				
				//Display a happiness message :
				var message = !comment_data.waiting_approval ? 'Comment added successfully :)' : 'Your comment is awaiting moderation';
				$( '#feedback' ).removeClass( 'error' ).html( message ).slideDown();
			},
			function( error ) {
				//Reset submit button :
				$submit_button.removeAttr( 'disabled' ).text( 'Submit comment' );
				
				//Scroll top : 
				window.scrollTo( 0, 0 );
				
				//Nothing else here as we choosed to handle error messages via events :
				//they're displayed in the feedback div using the following "theme-event-message" filter.
			}
		);

	} );
	
	App.filter( 'theme-event-message', function( message, event_data ) {
		
		if ( event_data.subtype == 'comment-error' ) {
				
			switch ( event_data.event ) {
				case 'comment:content-empty':
					message = "Comment content is empty!";
					break;
				case 'comment:already-said-that':
					message = "Comment already posted.";
					break;
				default:
					message = "Comment error :(";
					break;
			}
			
		}
		
		return message;
	} );
	
	/**
	 * We don't want to display an error when the user connection expired,
	 * because the "connection expiration" information is already handled
	 * via App.on( 'info' ) in auth/simple-login.js
	 */
	App.filter( 'stop-theme-event', function( stop, event_data ) {
		
		if ( event_data.subtype == 'comment-error' ) {
				
			switch ( event_data.event ) {
				case 'comment:user-connection-expired':
				case 'comment:user-not-authenticated':
					stop = true;
					break;
			}
			
		}
		
		return stop;
	} );
			
} );


