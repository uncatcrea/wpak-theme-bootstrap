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
			
} );


