<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_lists_tag', 10, 2);
function wpak_allow_lists_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<ul>,<li>,<ol>';
  return $allowed_tags;
}
?>