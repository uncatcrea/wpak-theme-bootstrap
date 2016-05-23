<!--
Theme Name: Bootstrap demo theme
Description: WP-AppKit demo theme using Bootstrap Front End Framework
Version: 0.3.1
Theme URI: https://github.com/uncatcrea/wpak-bootstrap-themes
Author: UncatCrea			
Author URI: http://uncategorized-creations.com	
WP-AppKit Version Required: >= 0.5
License: GPL-2.0+
License URI: http://www.gnu.org/licenses/gpl-2.0.txt
Copyright: 2013-2016 Uncategorized Creations	
-->

# Wpak Bootstrap Demo Theme v0.3.1
Bootstrap Demo Theme is a <a href="http://getwpappkit.com">WP-AppKit</a> theme based on the <a href="http://getbootstrap.com/">Bootstrap</a> Front End Framework.

Its main purpose is to illustrate the different WP-AppKit features and how to implement them in a 
theme using the <a href="http://uncategorized-creations.com/wp-appkit/doc/">WP-AppKit Theme JS API</a>.

Specific WP-AppKit features implementation examples such as the "User Login" feature can be found in the feature-* branches of this repository. For example see the <a href="https://github.com/uncatcrea/wpak-theme-bootstrap/tree/feature-user-login">feature-user-login branch</a>.

# Installation
**WP-AppKit plugin install**

* Download WP-AppKit: https://github.com/uncatcrea/wp-appkit (As of v0.3, Bootstrap theme requires WP-AppKit >= 0.5)
* Install WP-AppKit as you would do for any other WordPress plugins (ie. drop the plugin folder in */wp-content/plugins*)
* Activate WP-AppKit using the _Plugins_ WordPress admin panel. (Browse the *Installed Plugins* list and click the *Activate* link of WP-AppKit.)
* Now you should have a brand new */wp-content/themes-wp-appkit* folder (yes, this is where app themes are stored)

**Bootstrap theme install**

* Create a new folder "boostrap" in the */wp-content/themes-wp-appkit* directory
* Download the Bootstrap theme from this repository and drop the source files to your "bootstrap" folder
* **OR** clone this repository in your "bootstrap" folder : "git clone https://github.com/uncatcrea/wpak-theme-bootstrap ." (don't forget the final dot so that it's not cloned in a subfolder!)
* In WordPress, use the *WP-AppKit* admin panel to create a new app and choose the Bootstrap theme in the *Appearance* box
* From there you're free to test in your browser (using the Chrome's Emulation Mode) or directly try to compile

If new to WP-AppKit, you might want to read this <a href="http://www.uncategorized-creations.com/1212/compiling-app-using-wp-appkit-phonegap-build/">article about compiling WP-AppKit apps with PhoneGap Build</a>.

# Theme's Overview

##What's implemented

At the moment, Bootstrap theme implements:

* Archive template (eg. post list)
* Infinite post list (A "Get more post" button at the bottom of post lists)
* Single template (eg. a post)
* Comments template (comment list for a post)
* Bootstrap's dropdown menu 
* Content refresh process
* Offline cache (meaning that you can read loaded posts offline)
* Back button
* Responsive interface handled by Bootstrap

## For iOS and Android
The Bootstrap theme is the same for iOS and Android.

## Cordova Plugins
WP-AppKit themes rely on Cordova plugins to:

* Customize the iOS status bar: https://build.phonegap.com/plugins/505
* Handle properly whether hyperlinks open an in app browser (iOS) or not (Android): https://build.phonegap.com/plugins/1169

WP-AppKit export function adds these plugins automatically to your *config.xml* file. If you don't use the export, make sure to add them in order the themes to be able to work properly.

