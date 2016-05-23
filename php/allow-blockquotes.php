<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_bloq_tag', 10, 2);
function wpak_allow_bloq_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<blockquote>';
  return $allowed_tags;
}
?>