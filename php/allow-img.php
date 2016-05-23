<?php

add_filter( 'wpak_post_content_allowed_tags', 'wpak_allow_img_tag', 10, 2);
function wpak_allow_img_tag( $allowed_tags, $post ) {
  $allowed_tags .= '<img>';
  return $allowed_tags;
}
?>