<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_par_tag', 10, 2);
function wpak_allow_par_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<p>';
  return $allowed_tags;
}
?>