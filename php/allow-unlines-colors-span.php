<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_span_tag', 10, 2);
function wpak_allow_span_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<span>';
  return $allowed_tags;
}
?>