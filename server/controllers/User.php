<?php

class User extends Database
{
  private $userTbl = "Users";
  private $avatarTbl = "Avatars";

  public function getAllUsers()
  {
    return $this->execute("SELECT * FROM {$this->userTbl}");
  }
  public function getUsers($data)
  {
    $sort = $data['sort'] ?? 'name';
    $order = $data['order'] ?? 'ASC';
    $limit = $data['count'] ?? 10;
    $offset = $data['page'] ?? 1;
    return $this->execute(
      "SELECT * FROM {$this->userTbl}
      ORDER BY ? {$order}
      LIMIT ? OFFSET ?",
      ["sii", $sort, $limit, $offset - 1]
    );
  }
  public function getUserById($data)
  {
    $id = $data['id'];
    return $this->execute("SELECT * FROM {$this->userTbl} WHERE id = ?", ["i", $id]);
  }
  public function getUserByKeyword($data)
  {
    $keyword = '%' . $data['keyword'] . '%';
    return $this->execute(
      "SELECT * FROM {$this->userTbl}
        WHERE LOWER(name) LIKE LOWER(?) 
          OR LOWER(email) LIKE LOWER(?)",
      ["ss", $keyword, $keyword]
    );
  }

  public function updateUserById($data)
  {
    $result = null;
    $password = $data['password'] ?? null;
    if ($password) {
      $password = password_hash($password, PASSWORD_DEFAULT);
      $result = $this->execute(
        "UPDATE {$this->userTbl} 
        SET email = ?, password = ?
        WHERE id = ?",
        ["ssi", $data['email'], $password, $this->userId]
      );
    } else {
      $result = $this->execute(
        "UPDATE {$this->userTbl} 
        SET email = ?
        WHERE id = ?",
        ["si", $data['email'], $this->userId]
      );
    }
    if ($result > 0) {
      $user = $this->execute("SELECT * FROM " . $this->userTbl . " WHERE id = ?", ["i", $this->userId]);
      if (count($user) === 1) {
        $user = $user[0];
        return [
          'token' => $this->generateToken($user),
          'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email']
          ]
        ];
      }
    } elseif ($result===0){
      throw new Exception("User information is not updated!");
    }else {
      throw new Exception("Fail to update the user information!");
    }
  }
  public function addUser($data)
  {
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    return $this->execute(
      "INSERT INTO {$this->userTbl}
      (name, email, password) 
      VALUES (?, ?, ?)",
      ["sss", $data['name'], $data['email'] ?? null, $password]
    );
  }
  public function deleteUserById($data)
  {
    $id = $data['id'];
    return $this->execute("DELETE FROM {$this->userTbl} WHERE id = {$id}");
  }
  public function signUp($data)
  {
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    return $this->execute(
      "INSERT INTO {$this->userTbl} 
      (name, password) 
      VALUES (?, ?)",
      ["ss", $data['name'], $password]
    );
  }

  public function login($data)
  {
    $user = $this->execute(
      "SELECT * FROM {$this->userTbl}
      WHERE name = ? OR email = ?",
      ["ss", $data['account'], $data['account']]
    );
    if (count($user) === 1) {
      $result = $user[0];
      $valid = password_verify($data['password'], $result['password']);
      if ($valid) {
        $result = [
          'token' => $this->generateToken($result),
          'avatar' => $this->getAvatar($result['id']),
          'user' => [
            'id' => $result['id'],
            'name' => $result['name'],
            'email' => $result['email']
          ]
        ];
        return $result;
      } else {
        throw new Exception('Incorrect password!');
      }
    } else {
      throw new Exception('Incorrect user name or email!');
    }
  }
  // get the user information with its profile image of the currently loggied user
  public function getUserInfo()
  {
    $user = $this->getUserById(['id' => $this->userId]);
    if (count($user) === 1) {
      $result = $user[0];
      $result = [
        'avatar' => $this->getAvatar($result['id']),
        'user' => [
          'id' => $result['id'],
          'name' => $result['name'],
          'email' => $result['email']
        ]
      ];
      return $result;
    } else {
      throw new Exception('Fail to get user information!');
    }
  }
  // change avatar
  public function uploadAvatar($data)
  {
    $avatar = $data['files']['avatar'];
    $path = __DIR__ . "\..\..\assets\images\\" . uniqid() . $avatar['name'];
    if (move_uploaded_file($avatar['tmp_name'], $path)) {
      $result = $this->execute(
        "INSERT INTO {$this->avatarTbl}
        (name, type, path, user_id) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          type = VALUES(type),
          path = VALUES(path),
          user_id = VALUES(user_id)",
        ["sssi", $avatar['name'], $avatar['type'], $path, $this->userId]
      );
      if ($result > -1) {
        return $this->getAvatar($this->userId);
      }
    }
  }
  // download the profile image as binary file
  public function downloadAvatar()
  {
    $avatar = $this->execute("SELECT * FROM {$this->avatarTbl} WHERE user_id = ?", ["i", $this->userId]);
    if (count($avatar) === 1) {
      list('name' => $name, 'path' => $path) = $avatar[0];
      header('Content-Type: application/octet-stream');
      header('Content-Disposition: attachment; filename="' . $name . '"');
      readfile($path);
    }
  }
  // get the profile as object url
  public function getAvatar($id)
  {
    $avatar = $this->execute("SELECT * FROM {$this->avatarTbl} WHERE user_id = ?", ["i", $id]);
    if (count($avatar) === 1) {
      list('type' => $type, 'path' => $path) = $avatar[0];
      $img = file_get_contents($path);
      $base64Img = base64_encode($img);
      if ($base64Img) {
        $dataURL = 'data:' . $type . ';base64,' . $base64Img;
        return $dataURL;
      }
    }
  }

}