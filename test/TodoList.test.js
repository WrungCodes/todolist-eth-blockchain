const { assert } = require("chai")
const _deploy_contracts = require("../migrations/2_deploy_contracts")

const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
    before(async () => {
        this.todoList = await TodoList.deployed()
    })

    it('deployed successfully', async () => {
        const address = await this.todoList.address
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
        assert.notEqual(address, '')
        assert.notEqual(address, 0x0)
    })

    it('list tasks', async () => {
        const taskCount = await this.todoList.taskCount()
        const task = await this.todoList.tasks(taskCount)
        assert.equal(task.id.toNumber(), taskCount.toNumber())
    })

    it('create tasks', async () => {
        const result = await this.todoList.createTask('A new Task')
        const taskCount = await this.todoList.taskCount()
        assert.equal(taskCount, 4)

        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), 4)
        assert.equal(event.content, 'A new Task')
        assert.equal(event.status, 'pending')
    })

    it('toggle tasks', async () => {
        const result = await this.todoList.toogleTask(1, 'finished')

        const event = result.logs[0].args
        assert.equal(event.status, 'finished')
    })
})