const cluster = require('cluster')
const os = require('os')

const numWorkers = process.env.NODE_ENV === 'development' ? 1 : os.cpus().length
//console.log(process.env.NODE_ENV);

if (cluster.isMaster) {
  //console.log(`Master is running with process ID: ${process.pid}`);
  // Fork Workers
  for (let i = 0; i < numWorkers; i += 1) {
    cluster.fork()
  }
  cluster.on('exit', (/* worker, code, signal */) => {
    //console.log(`Worker is died with process ID: ${process.pid}`);
    cluster.fork()
  })
} else {
  const { Server } = require('./server')
  console.info(`Worker started with process ID: ${process.pid}`)
}

process.stdin.resume()

function exitHandler(options, err) {
  //console.log('EXITING WITH WORKER ID: ', process.pid);
  if (options.cleanup) //console.log('clean');
    if (err) console.error('EXIT HANDLER ERROR >', err)
  if (options.exit) process.exit()
}

// Do something when app is closing
process.on(
  'exit',
  exitHandler.bind(null, {
    cleanup: true
  })
)
//catches ctrl+c event
process.on(
  'SIGINT',
  exitHandler.bind(null, {
    exit: true
  })
)
// catches 'kill pid' (for example: nodemon restart)
process.on(
  'SIGUSR1',
  exitHandler.bind(null, {
    exit: true
  })
)
process.on(
  'SIGUSR2',
  exitHandler.bind(null, {
    exit: true
  })
)
//catches uncaught exceptions
process.on(
  'uncaughtException',
  exitHandler.bind(null, {
    exit: false
  })
)
process.on(
  'unhandledRejection',
  exitHandler.bind(null, {
    exit: false
  })
)
