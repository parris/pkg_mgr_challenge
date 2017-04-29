const { Map, Set } = require('immutable');

function createDependencyGraph() {
    return new Map();
}

function getDependencies(graph, pkg) {
    return graph.get(pkg);
}

function depend(graph, package, newDependencies) {
    let dependencies = graph.get(package);
    if (!dependencies) {
        dependencies = new Set();
    }
    return graph.set(package, dependencies.union(newDependencies));
}

function createInstallation() {
    return new Map({
        referenceCounter: new Map(),
        allPackages: new Set(),
        installed: new Set(),
    });
}

function install(installation, graph, pkg) {
    // if already installed
    if (installation.getIn(['allPackages', pkg])) {
        // TODO: account for packages that were previously installed implicitl
        // and are now installed explicitly.
        return installation;
    }

    const deps = graph.get(pkg) || [];

    let newInstall = installation
        .updateIn(['installed'], (set) => set.add(pkg))
        .updateIn(['allPackages'], (set) => set.add(pkg));

    deps.forEach((dep) => {
        let count = newInstall.getIn(['referenceCounter', dep]) || 0;
        newInstall = newInstall.setIn(['referenceCounter', dep], count + 1);
        newInstall = newInstall.updateIn(['allPackages'], (set) => set.add(dep));
    });

    return newInstall;
}

function remove(installation, graph, pkg) {
    // If this package is implicitly installed, don't uninstall it.
    // Obviously another package needs it.
    if (!installation.getIn(['installed', pkg]) ) {
        throw new Error('No can do');
    }

    const deps = graph.get(pkg);

    // remove from explcit install list
    let newInstall = installation.updateIn(['installed'], (set) => set.delete(pkg));
    // if there is no reference count for this package, it is safe to remove it from
    // allPackages as well.
    if (!newInstall.getIn(['referenceCounter', pkg])) {
        newInstall = newInstall.updateIn(['allPackages'], (set) => set.delete(pkg))
    }

    deps.forEach((dep) => {
        let count = newInstall.getIn(['referenceCounter', dep]) || 0;
        newInstall = newInstall.setIn(['referenceCounter', dep], count - 1);
        if (count - 1 < 1) {
            newInstall = newInstall.updateIn(['allPackages'], (set) => set.delete(dep));
        }
    });

    return newInstall;
}

function list(installation) {
    return installation.get('allPackages');
}

module.exports = {
    createDependencyGraph,
    createInstallation,
    getDependencies,
    depend,
    install,
    list,
    remove,
};
