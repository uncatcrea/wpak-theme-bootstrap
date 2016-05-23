<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_ita_tag', 10, 2);
function wpak_allow_ita_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<em>';
  return $allowed_tags;
}
?>