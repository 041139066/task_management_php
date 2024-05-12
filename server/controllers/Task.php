<?php

class Task extends Database
{
  protected $taskTbl = "Tasks";
  public function addTask($data)
  {
    $due = $data['due'] ?? null ? $data['due'] : null;
    return $this->execute(
      "INSERT INTO {$this->taskTbl}
      (title, description, due, user_id) 
      VALUES (?, ?, ?, ?)",
      ["sssd", $data['title'], $data['description'], $due, $this->userId]
    );
  }
  public function updateTaskById($data)
  {
    $due = $data['due'] ?? null ? $data['due'] : null;
    return $this->execute(
      "UPDATE {$this->taskTbl} 
      SET title = ?, status = ?, due = ?, description = ?
      WHERE id = ?",
      ["ssssd", $data['title'], $data['status'], $due, $data['description'], $data['id']]
    );
  }
  public function getTasks($data)
  {
    // remove any spaces and convert keywords string into an array
    $keywords = trim($data['keywords'] ?? '');
    $keywords = $keywords ? preg_split('/\s+/', $keywords) : [];
    // if status is not set, all types of status is fetched
    $status = in_array($data['status'] ?? null, ['1', '2', '3', '4']) ? $data['status'] : null;
    // default order is order by created time and from the newest to the oldest
    $order = $data['order'] ?? 'created';
    $direction = $data['direction'] ?? 'DESC';
    // default to catch the first 10 tasks
    $limit = $data['limit'] ?? 10;
    $offset = $data['offset'] ?? 0;
    // the base query
    $query = "SELECT * FROM " . $this->taskTbl . " WHERE user_id = " . $this->userId;
    if ($keywords) {
      $conditions = array_map(function ($keyword) {
        return "title LIKE '%" . $keyword . "%' OR description LIKE '%" . $keyword . "%'";
      }, $keywords);
      $keywordClause = "(" . implode(" OR ", $conditions) . ")";
      $query .= " AND " . $keywordClause;
    }
    if ($status) {
      $query .= $status === '4' ? " AND (status = '1') AND (due < NOW())" : " AND (status = '" . $status . "')";
    }
    $total = count($this->execute($query));
    $query .= " ORDER BY " . $order . " " . $direction . " LIMIT " . $limit . " OFFSET " . $offset;
    return ['total' => $total, 'query' => $query, 'records' => $this->execute($query)];
  }
  public function getTaskById($data)
  {
    return $this->execute(
      "SELECT * FROM {$this->taskTbl} WHERE id = ?",
      ["d", $data['id']]
    );
  }
  public function deleteTaskById($data)
  {
    return $this->execute(
      "DELETE FROM {$this->taskTbl} WHERE id = ?",
      ["d", $data['id']]
    );
  }

}