<?php
/*
 * Applies to:  since WP-AppKit 0.1
 * Goal:        By default, iframes are stripped from post content when send to WP-AppKit apps.
 *              It removes iframes inserted by WordPress through the oEmbed mechanism like videos (https://codex.wordpress.org/Embeds).
 *              We'd like to let iframes pass to the app to display video embeds in apps.
 * Usage:       in the app's theme PHP folder or a separate plugin.
*/
add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_iframe_tag', 10, 2);
function wpak_allow_iframe_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<iframe>';
  return $allowed_tags;
}
?>