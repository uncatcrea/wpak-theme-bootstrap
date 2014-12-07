<?php
// Strip WP Rocket lazy code
add_filter( 'do_rocket_lazyload', '__return_false');
?>