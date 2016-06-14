<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_htag_tag', 10, 2);
function wpak_allow_htag_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<h1>,<h2>,<h3>,<h4>,<h5>';
  return $allowed_tags;
}
?>