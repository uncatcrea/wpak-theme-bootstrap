define( [ 'jquery', 'core/theme-app', 'core/theme-tpl-tags', 'core/modules/storage', 'core/addons', 'theme/js/bootstrap.min' ], function( $, App, TemplateTags, Storage, Addons ) {

	var $refresh_button = $( '#refresh-button' );

	/**
	 * Launch app contents refresh when clicking the refresh button :
	 */
	$refresh_button.click( function( e ) {
		e.preventDefault();
		closeMenu();
		App.refresh();
	} );

	/**
	 * Animate refresh button when the app starts refreshing
	 */
	App.on( 'refresh:start', function() {
		$refresh_button.addClass( 'refreshing' );
	} );

	/**
	 * When the app stops refreshing :
	 * - scroll to top
	 * - stop refresh button animation
	 * - display success or error message
	 *
	 * Callback param : result : object {
	 *		ok: boolean : true if refresh is successful,
	 *		message: string : empty if success, error message if refresh fails,
	 *		data: object : empty if success, error object if refresh fails :
	 *					   use result.data to get more info about the error
	 *					   if needed.
	 * }
	 */
	App.on( 'refresh:end', function( result ) {
		scrollTop();
		Storage.clear( 'scroll-pos' );
		$refresh_button.removeClass( 'refreshing' );
		if ( result.ok ) {
			$( '#feedback' ).removeClass( 'error' ).html( 'Content updated successfully :)' ).slideDown();
		} else {
			$( '#feedback' ).addClass( 'error' ).html( result.message ).slideDown();
		}
	} );

	/**
	 * When an error occurs, display it in the feedback box
	 */
	App.on( 'error', function( error ) {
		$( '#feedback' ).addClass( 'error' ).html( error.message ).slideDown();
	} );

	/**
	 * Hide the feedback box when clicking anywhere in the body
	 */
	$( 'body' ).click( function( e ) {
		$( '#feedback' ).slideUp();
	} );

	/**
	 * Back button 
	 */
	var $back_button = $( '#go-back' );
	
	//Show/Hide back button (in place of refresh button) according to current screen:
	App.on( 'screen:showed', function () {
		var display = App.getBackButtonDisplay();
		if ( display === 'show' ) {
			$refresh_button.hide();
			$back_button.show();
		} else if ( display === 'hide' ) {
			$back_button.hide();
			$refresh_button.show();
		}
	} );

	//Go to previous screen when clicking back button:
	$back_button.click( function ( e ) {
		e.preventDefault();
		App.navigateToPreviousScreen();
	} );

	/**
	 * Close menu when we click a link inside it.
	 * The menu can be dynamically refreshed, so we use "on" on parent div (which is always here):
	 */
	$( '#navbar-collapse' ).on( 'click', 'a', function( e ) {
		closeMenu();
	} );

	/**
	 * Open all links inside single content with the inAppBrowser
	 */
	$( "#container" ).on( "click", "#single-content a, .page-content", function( e ) {
		e.preventDefault();
		openWithInAppBrowser( e.target.href );
	} );

	/**
	 * "Get more" button in post lists
	 */
	$( '#container' ).on( 'click', '.get-more', function( e ) {
		e.preventDefault();
		$( this ).attr( 'disabled', 'disabled' ).text( 'Loading...' );
		App.getMoreComponentItems( function() {
			//If something is needed once items are retrieved, do it here.
			//Note : if the "get more" link is included in the archive.html template (which is recommended),
			//it will be automatically refreshed.
			$( this ).removeAttr( 'disabled' );
		} );
	} );

	/**
	 * Do something before leaving a screen.
	 * Here, if we're leaving a post list, we memorize the current scroll position, to
	 * get back to it when coming back to this list.
	 */
	App.on( 'screen:leave', function( current_screen, queried_screen, view ) {
		//current_screen.screen_type can be 'list','single','page','comments'
		if ( current_screen.screen_type == 'list' ) {
			Storage.set( 'scroll-pos', current_screen.fragment, $( 'body' ).scrollTop() );
		}
	} );

	/**
	 * Do something when a new screen is showed.
	 * Here, if we arrive on a post list, we resore the scroll position
	 */
	App.on( 'screen:showed', function( current_screen, view ) {
		//current_screen.screen_type can be 'list','single','page','comments'
		if ( current_screen.screen_type == 'list' ) {
			var pos = Storage.get( 'scroll-pos', current_screen.fragment );
			if ( pos !== null ) {
				$( 'body' ).scrollTop( pos );
			} else {
				scrollTop();
			}
		} else {
			scrollTop();
		}
	} );

	/**
	 * Example of how to react to network state changes :
	 */
	/*
	 App.on( 'network:online', function(event) {
	 $( '#feedback' ).removeClass( 'error' ).html( "Internet connexion ok :)" ).slideDown();
	 } );

	 App.on( 'network:offline', function(event) {
	 $( '#feedback' ).addClass( 'error' ).html( "Internet connexion lost :(" ).slideDown();
	 } );
	 */

	/**
	 * Manually close the bootstrap navbar
	 */
	function closeMenu() {
		var navbar_toggle_button = $( ".navbar-toggle" ).eq( 0 );
		if ( !navbar_toggle_button.hasClass( 'collapsed' ) ) {
			navbar_toggle_button.click();
		}
	}

	/**
	 * Get back to the top of the screen
	 */
	function scrollTop() {
		window.scrollTo( 0, 0 );
	}

	/**
	 * Opens the given url using the inAppBrowser
	 */
	function openWithInAppBrowser( url ) {
		window.open( url, "_blank", "location=yes" );
	}

	//
	// Addon specific requirements: don't include an addon file if it hasn't been activated for the current app
	//  1. check whether the addon is active or not
	//  2. require the addon module
	//  3. use this module to enhance the current theme with a feature provided by the addon
	//

	if( Addons.isActive( 'wpak-addon-favorites' ) ) {
		require( [ 'addons/wpak-addon-favorites/js/wpak-favorites' ], function( WpakFavorites ) {
			/**
			 * Toggle the display for both 'add' and 'remove' favorites links.
			 * Called after a post has been added or removed to favorites list, so that the user can have a visual feedback.
			 *
			 * @param 	bool 	saved 		True or false whether the favorites list update has been made or not.
			 * @param 	int 	post_id 	ID of the post that has been added or removed from the favorites list.
			 */
			function toggleFavoriteLinks( saved, post_id ) {
				if ( saved ) {
					if ( WpakFavorites.isFavorite( post_id ) ) {
						$( '.post-' + post_id + ' .favorite.add' ).addClass( 'hidden' );
						$( '.post-' + post_id + ' .favorite.remove' ).removeClass( 'hidden' );
					}
					else {
						$( '.post-' + post_id + ' .favorite.remove' ).addClass( 'hidden' );
						$( '.post-' + post_id + ' .favorite.add' ).removeClass( 'hidden' );
					}
				}
			}

			/**
			 * Remove a favorite post from the DOM.
			 * Called after a post has been removed from favorites list, so that the user can have a visual feedback.
			 *
			 * @param 	bool 	saved 		True or false whether the favorites list update has been made or not.
			 * @param 	int 	post_id 	ID of the post that has been removed from the favorites list.
			 */
			function removeFavorite( saved, post_id ) {
				if( !saved ) {
					return;
				}

				$( '.post-' + post_id ).remove();
			}

			/**
			 * Add/Remove from favorites buttons
			 */
			$( '#container' ).on( 'click', '.favorite', function( e ) {
				e.preventDefault();
				var $link = $( this );
				var id = $link.data( 'id' );
				var global = $link.data( 'global' );

				if ( WpakFavorites.isFavorite( id ) ) {
					var current_screen = TemplateTags.getCurrentScreen();
					var callback = toggleFavoriteLinks;

					// Uncomment the following lines if you want to directly hide the post from the favorites list when clicking "Remove from favorite" link

					// if( current_screen.component_id.length ) {
					// 	var component = TemplateTags.getComponent( current_screen.component_id );
					// 	if( 'favorites' === component.type ) {
					// 		callback = removeFavorite;
					// 	}
					// }

					WpakFavorites.removeFromFavorites( id, callback );
				}
				else {
					WpakFavorites.addToFavorites( id, toggleFavoriteLinks, global );
				}
			} );

			/**
			 * Reset favorites button
			 */
			$( '#container' ).on( 'click', '.favorite-reset', function( e ) {
				e.preventDefault();
				WpakFavorites.resetFavorites( function() {
					// @TODO: Refresh the archive view, but how?
				} );
			} );
		});
	}

} );