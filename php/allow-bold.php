<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_bold_tag', 10, 2);
function wpak_allow_bold_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<strong>';
  return $allowed_tags;
}
?>