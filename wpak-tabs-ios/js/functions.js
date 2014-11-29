define(['jquery','core/theme-app','core/lib/storage','core/theme-tpl-tags','theme/js/jquery.velocity.min'],function($,App,Storage,TplTags){

	/* App Events */

    // Refresh process begins
    App.on('refresh:start',function(){

        // the refresh button begins to spin
        $("#refresh-button").removeClass("refresh-off").addClass("refresh-on");

    });

    // Refresh process ends
    App.on('refresh:end',function(result){

		// Reset scroll position
        scrollTop();
        Storage.clear('scroll-pos'); 
        
		// Stop spinnning for the refresh button
        $("#refresh-button").removeClass("refresh-on").addClass("refresh-off");

		// Display if the refresh process has worked or not
        // TODO : if an errors occurs we should not reset scroll position
        if ( result.ok ) {
			showMessage("Content updated successfully :)");            
		}else{
			showMessage(result.message);
		}

	});

	// Error occurs
    App.on('error',function(error){

        // Display error message
        showMessage(error.message);

    });

	// A new screen is displayed
    App.on('screen:showed',function(current_screen,view){
        //current_screen.screen_type can be 'list','single','page','comments'
        
		// iOS back button support
        if (TplTags.displayBackButton()) {
			
            // Display iOS back button
            $("#back-button").css("display","block");
		
        } else {
			
            // Display the menu button as iOS back button is not supported
            $("#back-button").css("display","none");

        }

		// A post or a page is displayed
        if (current_screen.screen_type=="single"||current_screen.screen_type=="page") {
			
            // Hide Tab bar
            hideTabBar();
            
            // Prepare <img> tags for styling
            cleanImgTag();
            
            // Redirect all hyperlinks clicks
            $("#app-layout").on("click",".single-template a",openInBrowser);

        }

		// A post list is displayed
        if( current_screen.screen_type == "list" ){
			
            // Display tab bar
            displayTabBar();
            
            // Retrieve any memorized scroll position
            // If a position has been memorized, scroll to it
            // If not, scroll to the top of the screen
            var pos = Storage.get("scroll-pos",current_screen.fragment);
			if( pos !== null ){
				$("#content").scrollTop(pos);
            }else{
				scrollTop();
			}
		}else{
			scrollTop();
		}
        
	});

    // About to change the current screen
	App.on('screen:leave',function(current_screen,queried_screen,view){
		//current_screen.screen_type can be 'list','single','page','comments'
		
        // If the current screen is a list
        // Memorize the current scroll position
        if( current_screen.screen_type == "list" ){
			Storage.set("scroll-pos",current_screen.fragment,$("#content").scrollTop());
		}
        
	});
    
    /* PhoneGap Plugins Support */
    
    // Status Bar
     try {
        StatusBar.overlaysWebView(false);
        StatusBar.styleDefault();
        StatusBar.backgroundColorByHexString("#F8F8F8");
    } catch(e) {
        console.log("StatusBar plugin not available");
        // https://build.phonegap.com/plugins/715
    }

    // InApp Browser
    
	/* UI Events */
    
    // Event bindings

	$("#app-layout").on("touchstart","#refresh-button",refreshTapOn);
	$("#app-layout").on("touchend","#refresh-button",refreshTapOff);

	$("#app-layout").on("touchstart","#back-button",backButtonTapOn);
    $("#app-layout").on("touchend","#back-button",backButtonTapOff);

    $("#app-layout").on("click","#tab-bar .tab",tabTap);
    
	$("#app-layout").on("click","#content .content-item a",contentItemTap);
    
    /* Functions */

	// Finger presses an item in a list
    function contentItemTap() {

        // Change the current screen
        App.navigate($(this).attr("href"));
		return false;
	}

	// Display success/failure message
    function showMessage(msgText) {
		$("#refresh-message").html(msgText);
		$("#refresh-message").removeClass("message-off").addClass("message-on");
		setTimeout(hideMessage,3000);
	}

	// Hide success/failure message
    function hideMessage() {
		$("#refresh-message").removeClass("message-on").addClass("message-off");	
		$("#refresh-message").html("");
	}

	// Finger presses refresh button (1/2)
    function refreshTapOn() {
		$("#refresh-button").removeClass("button-touch-off").addClass("button-touch-on");
	}

	// Finger unpresses refresh button (2/2)
    function refreshTapOff() {
		
        // TODO : give the ability to stop the refresh manually
        
        // Check if app's refreshing
        if (!App.isRefreshing()) {
			$("#refresh-button").removeClass("button-touch-on").addClass("button-touch-off");
			$("#refresh-button").removeClass("refresh-off").addClass("refresh-on");
			
            // Start the refresh process
            App.refresh();
		}
	
    }

	// Stop refresh button animation when refresh ends
    function stopRefresh() {
		$("#refresh-button").removeClass("refresh-on").addClass("refresh-off");	
	}

	// Finger presses iOS back button (1/2)
    function backButtonTapOn() {
		$("#back-button").removeClass("button-tap-off").addClass("button-tap-on");
	}

	// Finger unpresses iOS back button (2/2)
    function backButtonTapOff() {
		$("#back-button").removeClass("button-tap-on").addClass("button-tap-off");
		
        // Go back to the previous screen
        App.navigate(TplTags.getPreviousScreenLink());
	}

    function tabTap(event){
        event.stopPropagation();
        
        resetTabIcons();
        setActiveTab($(this));
        
        App.navigate($(this).attr("href"));
    }
    
    // Scroll to the top of the screen
    function scrollTop(){
		window.scrollTo(0,0);
	}
    
    // Prepare <img> tags for proper styling (responsive)
	function cleanImgTag() {
		$(".single-template img").removeAttr("width height");
		$(".single-template .wp-caption").removeAttr("style");
		$(".single-template .wp-caption a").removeAttr("href");
	}
    
    // Hyperlinks clicks handler
    // Relies on the InApp Browser PhoneGap Plugin
    function openInBrowser(e) {
        window.open(e.target.href,"_blank","location=yes");
        e.preventDefault();
    }
    
    // Display tab bar
    function displayTabBar(){
        $("#tab-bar").css("display","table");
        $("#content").css("bottom","50px");
    }
    
    // Hide tab bar
    function hideTabBar(){
        $("#tab-bar").css("display","none");
        $("#content").css("bottom","0px");        
    }
    
    function resetTabIcons(){

        var menuItems = $(".tab");
        var tabClassName = "";
        var tabOrder = 0;

        //debugger;

        for (i=0;i<5;i++){
            
            if ($(menuItems[i]).attr("class").indexOf("-on-") != -1) {
                
                tabOrder = i + 1;
                tabClassName = "tab-" + tabOrder + "-icon";
                
                $(menuItems[i]).removeClass(tabClassName + "-on-").addClass(tabClassName + "-off-");
            
            }
            
        }
        
    }
    
    function setActiveTab(tabToBeActivated) {
    
        var tabOrder = tabToBeActivated.attr("id").substr(4,1);
        var tabClassName = "tab-" + tabOrder + "-icon";
        tabToBeActivated.removeClass(tabClassName + "-off-").addClass(tabClassName + "-on-");
        
    }
    
});