// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

contract TodoList {
    uint public taskCount = 0;

    struct Task {
        uint id;
        string content;
        string status;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, string status);

    event TaskOnChange(uint id, string content, string status);

    // string [] taskes;

    constructor() {
        createTask("start testing Binance Test Chain");
        createTask("start testing");
        createTask("start");
    }

    function getTaskes()public view returns( string [] memory){
        string[] memory taskes = new string[](taskCount);

        // for (uint i = 1; i < taskCount; i++) {
        //     taskes[i] = tasks[i].content;
        // }
        taskes[0] = tasks[2].content;
        taskes[1] = tasks[3].content;
        taskes[2] = tasks[4].content;


        return taskes;
    }

    function getTasks() public view returns (Task[] memory){
      Task[] memory id = new Task[](taskCount);
      for (uint i = 1; i < taskCount; i++) {
          id[i] = tasks[i];
      }
      return id;
    }

    function getTasksUnstructed() public view returns (uint[] memory , string[] memory, string[] memory){
      uint[] memory id = new uint[](taskCount);
      string[] memory content = new string[](taskCount);
      string[] memory status = new string[](taskCount);

    //   for (uint i = 0; i < taskCount; i++) {
    //       id[i] = tasks[i+1].id;
    //       content[i] = tasks[i+1].content;
    //       status[i] = tasks[i+1].status;
    //   }

        id[0] = tasks[0].id;
        content[0] = tasks[0].content;
        status[0] = tasks[0].status;

      return (id, content, status);
    }

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, "pending");
        emit TaskCreated(taskCount, _content, "pending");
    }

    function toogleTask(uint _id, string memory _status) public {
        Task memory _task = tasks[_id];
        _task.status = _status;
        tasks[_id] = _task;

        emit TaskOnChange(_id, _task.content, _status);
    }
}