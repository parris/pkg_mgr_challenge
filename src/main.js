const packageManager = require('./package_manager');

const input = require('./input');

let graph = packageManager.createDependencyGraph();
let installation = packageManager.createInstallation();

input.split('\n').forEach((line) => {
    const args = line.split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'depend':
            graph = packageManager[command](graph, args.shift(), args);
            break;
        case 'list':
            console.log(packageManager[command](installation));
            break;
        case 'install':
            console.log(`Installing ${args[0]}`);
            installation = packageManager[command](installation, graph, args.shift());
            break;
        case 'remove':
            try {
                installation = packageManager[command](installation, graph, args[0]);
                console.log(`Removing ${args[0]}`);
            } catch(e) {
                console.log(`${args[0]} is still needed.`);
            }
            break;
        case 'end':
            process.exit();
            break;
        default:
            break;
    }
});
