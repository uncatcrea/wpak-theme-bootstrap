/**
 * All JavaScript required for the theme has to be placed in this file
 * Use RequireJS define to import external JavaScript libraries
 * To be imported, a JavaScript has to be a module (AMD)
 * http://www.sitepoint.com/understanding-requirejs-for-effective-javascript-module-loading/
 * If this is not the case: place the path to the library at the end of the define array
 * Paths are relative to the app subfolder of the wp-app-kit plugin folder
 * You don't need to specify the .js extensions
    
 * (AMD) jQuery          available as    $
 * (AMD) Theme App Core  available as    App
 * (AMD) Local Storage   available as    Storage
 * (AMD) Template Tags   avaialble as    TplTags
 */
define(['jquery','core/theme-app','core/modules/storage','core/theme-tpl-tags'],function($,App,Storage,TplTags){
    
	/**
     * App Events
     */

    // @desc Refresh process begins
    App.on('refresh:start',function(){

        // The refresh icon begins to spin
        $("#refresh-button").removeClass("refresh-off").addClass("refresh-on");

    });

    /**
     * @desc Refresh process ends
     * @param result
     */
    App.on('refresh:end',function(result){

        scrollTop();                    // Scroll to the top of the screen
        Storage.clear('scroll-pos');    // Clear the previous memorized position in the local storage
        
		// The refresh icon stops to spin
        $("#refresh-button").removeClass("refresh-on").addClass("refresh-off");

		/**
         * Display if the refresh process is a success or not
         * @todo if an error occurs we should not reset scroll position
         * @todo messages should be centralized to ease translations
         */
        if ( result.ok ) {
			showMessage("Content updated successfully :)"); // Refresh is a success
		}else{
			showMessage(result.message); // Refresh has failed
		}

	});

	/**
     * @desc An error occurs
     * @param error
     */
    App.on('error',function(error){

        showMessage(error.message); // Display error message

    });

	/**
     * @desc A new screen is displayed
     * @param {object} current_screen - Screen types: list|single|page|comments
     * @param view
     */
    App.on('screen:showed',function(current_screen,view){
        
		// Check if iOS back button has to be displayed
        if (TplTags.displayBackButton()) {

            $("#back-button").css("display","block"); // Display iOS Back Button
		
        } else {

            $("#back-button").css("display","none"); // Hide iOS Back Button

        }

		// A Post or a Page is displayed
        if (current_screen.screen_type=="single"||current_screen.screen_type=="page") {
			
            hideTabBar(); // Hide Tab Bar
            cleanImgTag(); // Prepare <img> tags for styling
            $("#app-layout").on("click",".single-template a",openInBrowser); // Redirect all hyperlinks clicks

        }

		// A Post List is displayed
        if( current_screen.screen_type == "list" ){

            displayTabBar(); // Display Tab Bar
            
            /**
             * Retrieve any memorized scroll position from the local storage
             * If a position has been memorized, scroll to it
             * If not, scroll to the top of the screen
             */
            var pos = Storage.get("scroll-pos",current_screen.fragment);
			if( pos !== null ){
				$("#content").scrollTop(pos);
            }else{
				scrollTop();
			}
		}else{
			scrollTop(); // Scroll to the top of screen if we're not displaying a Post List (eg. a Post)
		}
        
	});

    /**
     * @desc About to leave the current screen
     * @param {object} current_screen - Screen types: list|single|page|comments
     * @param queried_screen
     * @param view
     */
	App.on('screen:leave',function(current_screen,queried_screen,view){
		
        // If the current screen is a Post List
        if( current_screen.screen_type == "list" ){
			Storage.set("scroll-pos",current_screen.fragment,$("#content").scrollTop()); // Memorize the current scroll position in local storage
		}
        
	});


    
	/**
     * UI Events
     */
    
    // Event bindings
    // All events are bound to #app-layout using event delegation as it is a permanent DOM element
    // They became available as soon as the target element is available in the DOM
	
    // Refresh Button events
    $("#app-layout").on("touchstart","#refresh-button",refreshTapOn);
	$("#app-layout").on("touchend","#refresh-button",refreshTapOff);
	
    // Back Button events
    $("#app-layout").on("touchstart","#back-button",backButtonTapOn);
    $("#app-layout").on("touchend","#back-button",backButtonTapOff);
    
    // Tab Bar events
    $("#app-layout").on("click","#tab-bar .tab",tabTap);
	
    // Post List events
    $("#app-layout").on("click","#content .content-item a",contentItemTap);

    
    
    /**
     * Functions
     */

    /**
     * @desc Finger presses an item in a list
     * @todo use e.preventDefault()
     */
    function contentItemTap() {

        App.navigate($(this).attr("href")); // Change the current screen
		return false;

    }

    /**
     * @desc Display success/failure message
     * @param {string} msgText - Message to be displayed
     * @todo rename the #refresh-message as #banner-message
     */
    function showMessage(msgText) {
		$("#refresh-message").html(msgText); // Fill the message banner with the text
		$("#refresh-message").removeClass("message-off").addClass("message-on"); // Display the message banner
		setTimeout(hideMessage,3000); // Hide the message banner after 3 sec
	}

    /**
     * @desc Hide success/failure message
     * @todo rename the #refresh-message as #banner-message
     */
    function hideMessage() {
		$("#refresh-message").removeClass("message-on").addClass("message-off"); // Hide the message banner
		$("#refresh-message").html(""); // Erase the message banner
	}

    /**
     * @desc Finger presses Refresh Button
     */
    function refreshTapOn() {
		$("#refresh-button").removeClass("button-touch-off").addClass("button-touch-on");
	}

    /**
     * @desc Finger unpresses Refresh Button
     * @todo Give the ability to stop the refresh manually
     */
    function refreshTapOff() {

        // Check if app's refreshing
        if (!App.isRefreshing()) {
		
            $("#refresh-button").removeClass("button-touch-on").addClass("button-touch-off");
			$("#refresh-button").removeClass("refresh-off").addClass("refresh-on");
            App.refresh(); // Start the refresh process
            
		}
	
    }

    /**
     * @desc Stop refresh button animation when refresh ends
     */
    function stopRefresh() {
        $("#refresh-button").removeClass("refresh-on").addClass("refresh-off");	
    }

    /**
     * @desc Finger presses iOS Back Button
     */
    function backButtonTapOn() {
        $("#back-button").removeClass("button-tap-off").addClass("button-tap-on");
    }

    /**
     * @desc Finger unpresses iOS back button
     */
    function backButtonTapOff() {

        $("#back-button").removeClass("button-tap-on").addClass("button-tap-off");
        App.navigate(TplTags.getPreviousScreenLink()); // Go back to the previous screen

    }

    /**
     * @desc Hyperlinks clicks handler
     * @desc Relies on the InAppBrowser PhoneGap Core Plugin / https://build.phonegap.com/plugins/233
     * @desc target _blank calls an in app browser
     * @desc target _system
     * @param {object} e
     * @todo harmonize ways of naming event object and preventDefault() position
     */
    function openInBrowser(e) {
        window.open(e.target.href,"_blank","location=yes");
        e.preventDefault();
    }

    /**
     * @desc A tab is tapped
     * @param {object} event
     */
    function tabTap(event) {
        
        event.stopPropagation();
        
        resetTabIcons(); // Switch all icons to off states
        setActiveTab($(this)); // Switch the icon of the tapped tab to on state
        App.navigate($(this).attr("href")); // Load the new screen
    
    }
        
    /**
     * @desc Display the Tab Bar
     */
    function displayTabBar(){
        $("#tab-bar").css("display","table");
        $("#content").css("bottom","50px");
    }
    
    /**
     * @desc Hide the Tab Bar
     */
    function hideTabBar(){
        $("#tab-bar").css("display","none");
        $("#content").css("bottom","0px");        
    }
    
    /**
     * @desc Switch all tab icons to off state
     * @todo Use the icon_slug instead of using tab index
     * @todo Use CSS sprites (if possible with SVG images or use inline SVG with dynamic CSS styling
     */
    function resetTabIcons(){

        var menuItems = $(".tab");
        var tabClassName = "";
        var tabOrder = 0;

        for (i=0;i<5;i++){
            
            if ($(menuItems[i]).attr("class").indexOf("-on-") != -1) {
                
                tabOrder = i + 1;
                tabClassName = "tab-" + tabOrder + "-icon";
                
                $(menuItems[i]).removeClass(tabClassName + "-on-").addClass(tabClassName + "-off-");
            
            }
            
        }
        
    }
    
    /**
     * @desc Switch a tapped tab icon to on state
     * @param {object} tabToBeActivated
     * @todo Use the icon_slug instead of using tab index
     * @todo Use CSS sprites (if possible with SVG images or use inline SVG with dynamic CSS styling
     */
    function setActiveTab(tabToBeActivated) {
    
        var tabOrder = tabToBeActivated.attr("id").substr(4,1);
        var tabClassName = "tab-" + tabOrder + "-icon";
        tabToBeActivated.removeClass(tabClassName + "-off-").addClass(tabClassName + "-on-");
        
    }

    /**
     * @desc Scroll to the top of the screen
     */
    function scrollTop(){
        $("#content").scrollTop(0);
        
	}

    /**
     * @desc Prepare <img> tags for proper styling (responsive)
     */
	function cleanImgTag() {
		$(".single-template img").removeAttr("width height"); // Remove all width and height attributes
		$(".single-template .wp-caption").removeAttr("style"); // Remove any style attributes
		$(".single-template .wp-caption a").removeAttr("href"); // Remove any hyperlinks attached to an image
	}
    
    /**
     * PhoneGap Plugins Support
     */

     // Customize the iOS7 status bar with the Status Bar plugin
     // https://build.phonegap.com/plugins/715
     try {
        StatusBar.overlaysWebView(false);
        StatusBar.styleDefault();
        StatusBar.backgroundColorByHexString("#F8F8F8");
    } catch(e) {
        console.log("StatusBar plugin not available");        
    }
    
});