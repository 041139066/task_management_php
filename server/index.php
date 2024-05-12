<?php
require_once "config.php";
require_once 'controllers/Database.php';
require_once 'controllers/User.php';
require_once 'controllers/Task.php';
require_once 'controllers/Controller.php';

try {
  $controller = new Controller();
  $controller->dispatch();
} catch(Exception $e) {
  echo "Error: ".$e->getMessage();
}


