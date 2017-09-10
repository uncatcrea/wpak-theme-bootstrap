define( [ 'jquery', 'core/theme-app', 'core/theme-tpl-tags', 'core/modules/storage', 
	'theme/photoswipe/photoswipe.min',
    'theme/photoswipe/photoswipe-ui-default.min',
		  'theme/js/bootstrap.min', 'theme/js/auth/auth-pages', 'theme/js/auth/simple-login', 
		  'theme/js/auth/premium-posts', 'theme/js/comments' 
		], 
		function( $, App, TemplateTags, Storage,PhotoSwipe,PhotoSwipeUI_Default ) {

	/**************************************************************************
	 * START PHOTOSWIPE
	 */

	var photoswipe_element = $( '.pswp' )[0]; //Memorize PhotoSwipe gallery HTML layout element
	var photoswipe_instance = null; //PhotoSwipe JS Object that we will instanciate
	var img_dragging = false;

	$( "#app-layout" ).on( "touchstart", ".single-content img", function() {
		img_dragging = false; //Reinit image dragging when starting to touch an image
	} );

	$( "#app-layout" ).on( "touchmove", ".single-content img", function() {
		img_dragging = true; //Activate image dragging when starting to swipe on the image to make post content scroll
	});

	/**
	 * Opens the given image (or list of images) with PhotoSwipe
	 */
	function open_with_photoswipe( $images, index ) {

		index = index || 0;

		var photoswipe_items = [];
		
		//For each image, create the corresponding PhotoSwipe item by retrieving
		//the full size information in data attributes set on server side:
		$images.each( function() {
			var $image = $( this );

			//Retrieve image caption if any:
			var $caption = $( this ).closest('.gallery-item,.wp-caption').find( '.wp-caption-text' );

			//Add PhotoSwipe item corresponding to
			photoswipe_items.push({
				src: $image.data( 'full-img' ), //Data attribute that was added by modifying the webservice earlier
				w: $image.data( 'width' ),
				h: $image.data( 'height' ),
				title: $caption.length ? $caption.text() : ''
			});
		} );

		//Lots of PhotoSwipe options can be found here for customization:
		//http://photoswipe.com/documentation/options.html
		var photoswipe_options = {
			index: index, //start gallery at the image we clicked on (used for image galleries)
			shareEl: false //don't display Share element
		};

		//Open the given images with PhotoSwipe:
		photoswipe_instance = new PhotoSwipe( photoswipe_element, PhotoSwipeUI_Default, photoswipe_items, photoswipe_options);
		photoswipe_instance.init();
	}
	
	$( "#app-layout" ).on( "touchend", ".single-content img", function() {
		
		//Don't open image if currently dragging it:
		if ( img_dragging ) {
			return;
		}
		
		//Open PhotoSwipe for the image we just touched:
		open_with_photoswipe( $( this ) );
	});
	
	/**
	 * END PHOTOSWIPE
	 **************************************************************************/


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
	 * Allow to click anywhere on post list <li> to go to post detail :
	 */
	$( '#container' ).on( 'click', 'li.media', function( e ) {
		e.preventDefault();
		var navigate_to = $( 'a', this ).attr( 'href' );
		App.navigate( navigate_to );
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
	$( "#container" ).on( "click", ".single-content a, .page-content a", function( e ) {
		e.preventDefault();
		openWithInAppBrowser( e.target.href );
	} );

	$( "#container" ).on( "click", ".comments", function( e ) {
		e.preventDefault();
		
		$('#waiting').show();
		
		App.displayPostComments( 
			$(this).attr( 'data-post-id' ),
			function( comments, post, item_global ) {
				//Do something when comments display is ok
				//We hide the waiting panel in 'screen:showed'
			},
			function( error ){
				//Do something when comments display fail (note that an app error is triggered automatically)
				$('#waiting').hide();
			}
		);
	} );

	/**
	 * "Get more" button in post lists
	 */
	$( '#container' ).on( 'click', '.get-more', function( e ) {
		e.preventDefault();
		
		var $this = $( this );
		
		var text_memory = $this.text();
		$this.attr( 'disabled', 'disabled' ).text( 'Loading...' );

		App.getMoreComponentItems( 
			function() {
				//If something is needed once items are retrieved, do it here.
				//Note : if the "get more" link is included in the archive.html template (which is recommended),
				//it will be automatically refreshed.
				$this.removeAttr( 'disabled' );
			},
			function( error, get_more_link_data ) {
				$this.removeAttr( 'disabled' ).text( text_memory );
			}
		);
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
		
		if ( current_screen.screen_type == 'comments' ) {
			$('#waiting').hide();
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

} );