define( [ 'jquery', 'core/theme-app', 'core/modules/comments' ], function( $, App, Comments ) {

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
			function( data ) {
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
				$( '#feedback' ).removeClass( 'error' ).html( 'Comment added successfully :)' ).slideDown();
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
			
} );


