<!--
Theme Name: Bootstrap - User Login demo theme
Description: WP-AppKit demo theme to illustrate the User Login feature
Version: 0.3
Theme URI: https://github.com/uncatcrea/wpak-bootstrap-themes/tree/feature-user-login
Author: UncatCrea			
Author URI: http://uncategorized-creations.com	
WP-AppKit Version Required: >= 0.5	
-->

# Wpak Bootstrap Theme - User Login Feature Demo

This WP-AppKit theme adds the "User Login" and "Comment posting" features to the <a href="https://github.com/uncatcrea/wpak-theme-bootstrap">default Bootstrap theme</a>.

##Implements

* *User login feature* : user can log in securely with their WordPress user credentials
* *Premium posts feature* : users can see posts only if they are logged in
* *Commenting posts* : user can comment posts when they are logged in
* *User and login page creation* : shows how to create custom pages directly from the theme to display user info and a login page

**Implementation details and comments of those features can be found in :**

* js/auth/simple-login.js : simple login form implementation
* js/auth/auth-page.js : user and login pages creation
* js/auth/premium-posts.js : premium posts feature implementation
* js/comments.js : comments implementation

##Requires

* WP-AppKit version >= 0.5
* That a valid RSA private key is set for the app in WordPress Back Office, under the "Authentication Settings" section
