<?php
header( 'Content-Type: application/json');

$post_obj = array(
  "type" => "h-entry",
  "properties" => array(
    "published" =>  array("2016-02-21T12:50:53-08:00"),
    "content" =>  array("Hello World"),
    "category" => array(
      "foo", 
      "bar"
    )
  ),
);


if(isset($_GET['properties'])){
	$result_properties=array();
	foreach($_GET['properties'] as $prop){
		if(isset($post_obj['properties'][$prop])){
			$result_properties[$prop] = $post_obj['properties'][$prop];	
		}
	}
	$post_obj = array('properties' => $result_properties);
}

echo json_encode($post_obj);
