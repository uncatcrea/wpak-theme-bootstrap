define( [ 'jquery', 'core/theme-app', 'core/modules/comments' ], function( $, App, Comments ) {

	/**
	 * Theme module example that implements a post commenting feature.
	 * 
	 * The comment form HTML is in the comments.html template (form#comment-form).
	 * 
	 * Here we gather comment content and post ID from this comment form and
	 * submit it to WP server using the WP-AppKit Comments API.
	 */

	/**
	 * On comment form submit, we retrieve comment content and post ID from the
	 * form and use Comments.postComment() to submit it to the server.
	 * 
	 * Internally, if the comment query is successful the new comment is automatically added
	 * to the post comment list, so here we just have to rerender the comment screen,
	 * to make the new comment appear in the comment list.
	 */
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
				
				//Scroll top so that we can see the following feedback message: 
				window.scrollTo( 0, 0 );
				
				//Display a happiness message :
				var message = !comment_data.waiting_approval ? 'Comment added successfully :)' : 'Your comment is awaiting moderation';
				$( '#feedback' ).removeClass( 'error' ).html( message ).slideDown();
			},
			function( error ) {
				//Reset submit button :
				$submit_button.removeAttr( 'disabled' ).text( 'Submit comment' );
				
				//Scroll top so that we can see the feedback message that comes up through theme error handling. 
				window.scrollTo( 0, 0 );
				
				//Nothing else here as we choosed to handle error messages via events :
				//they're displayed in the feedback div using the following "theme-event-message" filter.
			}
		);

	} );
	
	/**
	 * Intercept error messages that are related to comments so that
	 * we can display our custom messages when the comment posting fails.
	 */
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
	 * via App.on( 'info' ) in auth/simple-login.js.
	 * 
	 * So we stop those comment theme events from being trigerred :
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


