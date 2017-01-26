require( ["core/theme-app", "core/modules/deep-link"], function ( App, DeepLink ) {

    /**
     * For now liveQuery (in its automated mode) needs a component to download a post
     * (we should probably change that in the future to allow download a post outside any component).
     * Note that it will download the post even if the post does not really
     * belongs to the given component. It's just that a component has to be there
     * or liveQuery won't return anything.
     */
    var DEEPLINK_POSTS_COMPONENT_SLUG = 'my-component'; //Set one of your "post list" app component's slug

    App.action( 'pre-start-router', deeplinkRoute );

    function deeplinkRoute( launch_route, stats, deferred ) {

	var deep_link = DeepLink.getLaunchRoute();

	// No deep link requested, so nothing to do
	if ( !deep_link.length ) {
	    deferred.resolve();
	    return;
	}

	// Not a single
	if ( deep_link.indexOf( 'single' ) == -1 ) {
	    deferred.resolve();
	    return;
	}

	// Parse the route
	var splitted = deep_link.replace( "#", "" ).split( '/' );

	var item_global = splitted[1];
	var item_id = splitted[2];

	var post = App.getItem( item_id, item_global );
	if ( post ) {
	    // Post exists, it will display automatically
	    console.log( 'Deeplink post found in localstorage' );
	    deferred.resolve();
	} else {
	    // Post doesn't exist: donwload it
	    console.log( 'Deeplink post NOT found in localstorage: download it' );
	    downloadPost( item_id, DEEPLINK_POSTS_COMPONENT_SLUG, {
		success: function () {
		    //Post downloaded, resume core process to display it:
		    deferred.resolve();
		},
		error: function () {
		    //Post could not be downloaded :(
		    //TODO: see if we do something special here: for now it just displays the home screen
		    deferred.resolve();
		}
	    } );
	}

    }

    /**
     * Download post and save it to local storage
     */
    function downloadPost( post_id, component_slug, options ) {

	options = options || { };

	var liveQueryArgs = {
	    wpak_component_slug: component_slug,
	    wpak_query_action: 'get-items',
	    wpak_items_ids: post_id
	};

	App.liveQuery(
		liveQueryArgs,
		{
		    success: function ( answer ) {
			console.log( 'downloadPost success', answer );
			if ( options.success ) {
			    options.success( answer );
			}
		    },
		    error: function ( error_data ) {
			console.log( 'downloadPost error :(', error_data );
			if ( options.error ) {
			    options.error( error_data );
			}
		    },
		    type: 'update', //To merge downloaded post into existing ones
		    persistent: true //To persist the post in local storage
		}
	);

    }

} );