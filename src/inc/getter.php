<?php

function _s_get_request_handler() {
  // check_ajax_referer('nonce_get_request', 'nonce');

  if (empty($_POST['url'])) {
    echo json_encode(null);
    exit();
  }

  $url = filter_var($_POST['url'], FILTER_SANITIZE_URL);

  // Create GET request
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  // curl_setopt($ch, CURLOPT_USERAGENT, 'flip-app');
  // curl_setopt($ch, CURLOPT_HEADER, 0);

  // curl_setopt($ch, CURLOPT_POST, 1);
  // curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // follow Location: headers
  curl_setopt($ch, CURLOPT_MAXREDIRS, 2);

  // Execute GET
  $result = curl_exec($ch);

  // $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

  // Close connection
  curl_close($ch);

  // echo json_encode($result);
  echo $result;
  exit();
}

_s_get_request_handler();

?>
