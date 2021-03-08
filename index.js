require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const validator = require('express-validator')
const cors = require('cors')
const HDWalletProvider = require('@truffle/hdwallet-provider');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(validator());


const Web3 = require('web3')
const contract = require('truffle-contract')
const todoList = require('./build/contracts/TodoList.json');

const network = process.env.NETWORK +  process.env.INFURA_PROECT_ID
const mnemonic = process.env.MNEMONIC

// const provider = new Web3.providers.HttpProvider(network);
const provider = new HDWalletProvider(mnemonic, network);

let web3 = new Web3(provider);
let accounts = null

web3.eth.getAccounts(function(error, accs) {
    if (error != null) {
      return_server_error("There was an error fetching your accounts.", error)
      return;
    }

    if (accs.length == 0) {
      return_server_error("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.", null)
      return;
    }

    accounts = accs
});

// Default to here on home route
app.get('/', (req, res) => {
    return res.status(200).json(
        {
            status: 200,
            data: {
                message: 'Welcome to TODO LIST API'
            }
        }
    );
});

var TodoListDeployed;

(async () => {
    const TodoList = contract(todoList)
    TodoList.setProvider(web3.currentProvider); 

    TodoList.deployed().then(function(instance) {
        TodoListDeployed = instance;
    }).catch(function(e) {
        console.log(e);
    });
  })();

app.get('/list', async (req, res) => {
    TodoListDeployed.getTaskes().then( result => {
        console.log(result);

        return res.status(200).json(
            {
                status: 200,
                data: {
                    message: 'Task Gotten Successfully',
                    task: {
                        id: result[0].toNumber(),
                        desc: result[1],
                        status: result[2],
                    }
                }
            }
        );
    }).catch( error => {
        return_server_error('tasks retrival failed', error)
    })
});

app.get('/listall/:count', async (req, res) => {

    var count = await TodoListDeployed.taskCount();

    const promises = [];

    var num = req.params.count > count.toNumber() ? count.toNumber() : req.params.count;

    for (let i = 1; i <= num; i++) {
        promises.push(
            (async () => {
                var result = await TodoListDeployed.tasks(i);
                return {
                    id: result[0].toNumber(),
                    desc: result[1],
                    status: result[2],
                }
              })()
        );
    }
 
    const tasks = await Promise.all(promises);

    return res.status(200).json(
        {
            status: 200,
            data: {
                message: 'Task Gotten Successfully',
                task: tasks
            }
        }
    );
});

app.get('/count', async (req, res) => {
    TodoListDeployed.taskCount().then( result => {
        return res.status(200).json(
            {
                status: 200,
                data: {
                    message: 'Tasks Count Gotten Successfully',
                    taskCount: result.toNumber()
                }
            }
        );
    }).catch( error => {
        return_server_error('tasks count retrival failed', error)
    })
});

app.get('/list/:id', async (req, res) => {
    TodoListDeployed.tasks(req.params.id).then(result => {
        if(result[0].toNumber() == 0){
            return res.status(404).json(
                {
                    status: 404,
                    data: {
                        message: `No task with id ${req.params.id}`
                    }
                }
            );
        }

        return res.status(200).json(
            {
                status: 200,
                data: {
                    message: 'Task Gotten Successfully',
                    task: {
                        id: result[0].toNumber(),
                        desc: result[1],
                        status: result[2],
                    }
                }
            }
        );
    }).catch( error => {
        return_server_error('task retrival failed', error)
    })
});

app.post('/toggle/:id', async (req, res) => {
    TodoListDeployed.toogleTask(req.params.id, req.body.status, {from: accounts[0]}).then( result => {

        if(req.body.status != 'pending' && req.body.status != 'finished'){
            return res.status(400).json(
                {
                    status: 400,
                    data: {
                        message: `invalid status type`
                    }
                }
            );
        }

        TodoListDeployed.tasks(req.params.id).then( _result => {
            if(_result[0].toNumber() == 0){
                return res.status(404).json(
                    {
                        status: 404,
                        data: {
                            message: `No task with id ${req.params.id}`
                        }
                    }
                );
            }else{
                return res.status(200).json(
                    {
                        status: 200,
                        data: {
                            message: 'Task Toggled Successfully',
                            task: {
                                id: result.logs[0].args.id.toNumber(),
                                desc: result.logs[0].args.content,
                                status: result.logs[0].args.status,
                            }
                        }
                    }
                );
            }
        });
    }).catch( error => {
        return_server_error('task toggling failed', error)
    })
});

app.post('/create', async (req, res) => {
    TodoListDeployed.createTask(req.body.desc, {from: accounts[0]}).then( result => {
        return res.status(200).json(
            {
                status: 200,
                data: {
                    message: 'Task Created Successfully',
                    task: {
                        id: result.logs[0].args.id.toNumber(),
                        desc: result.logs[0].args.content,
                        status: result.logs[0].args.status,
                    }
                }
            }
        );
    }).catch( error => {
        return_server_error('task creation failed', error)
    })
});

app.use('/*', (req, res) => {
    return res.status(404).json(
        {
            status: 404,
            data: {
                message: 'Endpoint does not exist'
            }
        }
    );
});

function return_server_error(message, error) {
    return res.status(500).json(
        {
            status: 500,
            data: {
                message: message,
                error: error
            }
        }
    );
 }

app.listen(PORT, () => {
    console.log(`API live on port =>: ${PORT}`);
});