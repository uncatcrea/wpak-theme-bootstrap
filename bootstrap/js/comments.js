define( [ 'jquery', 'core/theme-app', 'core/modules/comments' ], function( $, App, Comments ) {

	$( '#app-content-wrapper' ).on( 'submit', '#comment-form', function( e ) {
		e.preventDefault();
		var comment = {
			content : $( '#comment-content' ).val()
		};
		Comments.postComment( 
			comment,
			function( data ) {
				console.log( 'Fini', data );
			},
			function( error ) {
				console.log( 'ERREUR', error );
			}
		);
	} );
	
	App.filter( 'theme-event-message', function( message, event_data ) {
		
		if ( event_data.subtype == 'comment-error' ) {
				
			switch ( event_data.event ) {
				case 'comment:content-empty':
					message = "Comment content is empty!";
					break;
				default:
					message = "Comment error :(";
					break;
			}
			
		}
		
		return message;
	} );
			
} );


